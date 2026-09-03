const openai = require('../utils/openai');
const Attempt = require('../models/Attempt');
const {
  createInterviewSession,
  getInterviewSession,
  updateInterviewSession,
  refreshInterviewSession,
  deleteInterviewSession,
} = require('../services/interviewSession.service');
const { updateLeaderboardScore } = require('../services/leaderboard.service');
const { emitLeaderboard } = require('../socket/leaderboard.socket');

const model = process.env.GROQ_MODEL || 'openai/gpt-oss-120b';

const sessionError = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const generateInitialQuestion = async () => {
  const response = await openai.chat.completions.create({
    model,
    messages: [{
      role: 'system',
      content: 'You are ScaleForge, an expert system design interviewer. Generate a challenging system design interview question. Only return the question text.',
    }],
    max_tokens: 150,
  });
  return response.choices[0].message.content.trim();
};

const generateFollowUpQuestion = async (session) => {
  const response = await openai.chat.completions.create({
    model,
    messages: [
      {
        role: 'system',
        content: `You are a senior system design interviewer. Continue this interview about: ${session.question}. Ask one concise, probing follow-up question based on the conversation. Do not evaluate or answer the candidate.`,
      },
      ...session.conversation.map((message) => ({
        role: message.role === 'interviewer' ? 'assistant' : 'user',
        content: message.content,
      })),
    ],
    max_tokens: 180,
  });
  return response.choices[0].message.content.trim();
};

const generateFinalFeedback = async (session) => {
  const response = await openai.chat.completions.create({
    model,
    messages: [{
      role: 'system',
      content: `Evaluate this complete system design interview. Return JSON with exactly these keys: score (number out of 10), strengths (array of strings), missingPoints (array of strings), improvements (array of strings), idealAnswer (string). Question: ${session.question}. Conversation: ${JSON.stringify(session.conversation)}`,
    }],
    response_format: { type: 'json_object' },
  });
  return JSON.parse(response.choices[0].message.content);
};

// @desc    Generate a system design question
// @route   GET /api/v1/interview/generate
// @access  Private
const generateQuestion = async (req, res, next) => {
  try {
    res.json({ question: await generateInitialQuestion() });
  } catch (error) {
    console.error('GENERATE QUESTION ERROR:', error.message);
    if (error.response) {
      console.error('OPENAI ERROR RESPONSE:', error.response.data);
    }
    next(error);
  }
};

const startInterview = async (req, res, next) => {
  try {
    const question = await generateInitialQuestion();
    const session = await createInterviewSession({ userId: req.user._id, question });
    res.status(201).json({ sessionId: session.sessionId, question: session.question, currentRound: session.currentRound });
  } catch (error) {
    next(error);
  }
};

const startDemoInterview = async (req, res, next) => {
  try {
    const question = await generateInitialQuestion();
    const session = await createInterviewSession({
      userId: 'demo:guest',
      question,
      isDemo: true,
    });
    res.status(201).json({ sessionId: session.sessionId, question: session.question, currentRound: session.currentRound, isDemo: true });
  } catch (error) {
    next(error);
  }
};

const answerInterview = async (req, res, next) => {
  try {
    const { answer } = req.body;
    if (!answer?.trim()) throw sessionError(400, 'Answer is required');

    const session = await getInterviewSession(req.params.sessionId);
    if (!session) throw sessionError(404, 'Interview session has expired or does not exist');
    if (!session.isDemo && (!req.user || session.userId !== String(req.user._id))) throw sessionError(403, 'You cannot access this interview session');
    if (session.status !== 'active') throw sessionError(409, 'Interview session is no longer active');

    session.answers.push(answer.trim());
    session.conversation.push({ role: 'user', content: answer.trim() });
    const followUp = await generateFollowUpQuestion(session);
    session.conversation.push({ role: 'interviewer', content: followUp });
    session.interviewerQuestions.push(followUp);
    session.currentRound += 1;
    await updateInterviewSession(session);

    res.json({ question: followUp, currentRound: session.currentRound });
  } catch (error) {
    next(error);
  }
};

const answerDemoInterview = async (req, res, next) => {
  try {
    const { answer } = req.body;
    if (!answer?.trim()) throw sessionError(400, 'Answer is required');
    const session = await getInterviewSession(req.params.sessionId);
    if (!session || !session.isDemo) throw sessionError(404, 'Demo session has expired or does not exist');
    session.answers.push(answer.trim());
    session.conversation.push({ role: 'user', content: answer.trim() });
    const followUp = await generateFollowUpQuestion(session);
    session.conversation.push({ role: 'interviewer', content: followUp });
    session.interviewerQuestions.push(followUp);
    session.currentRound += 1;
    await updateInterviewSession(session);
    res.json({ question: followUp, currentRound: session.currentRound });
  } catch (error) {
    next(error);
  }
};

const completeInterview = async (req, res, next) => {
  let session;
  try {
    session = await getInterviewSession(req.params.sessionId);
    if (!session) throw sessionError(404, 'Interview session has expired or does not exist');
    if (!session.isDemo && (!req.user || session.userId !== String(req.user._id))) throw sessionError(403, 'You cannot access this interview session');
    if (session.status !== 'active') throw sessionError(409, 'Interview session is no longer active');
    if (!session.answers.length) throw sessionError(400, 'Submit at least one answer before completing');

    const feedback = await generateFinalFeedback(session);
    if (session.isDemo) {
      await deleteInterviewSession(session.sessionId);
      return res.status(200).json({ feedback, isDemo: true, persisted: false });
    }
    const attempt = await Attempt.create({
      user: req.user._id,
      question: session.question,
      userAnswer: session.answers.join('\n\n'),
      feedback,
    });

    session.status = 'completed';
    await deleteInterviewSession(session.sessionId);

    try {
      await updateLeaderboardScore(req.user._id);
      if (req.app.get('io')) await emitLeaderboard(req.app.get('io'));
    } catch (leaderboardError) {
      console.error('LEADERBOARD UPDATE ERROR:', leaderboardError.message);
    }

    res.status(201).json(attempt);
  } catch (error) {
    next(error);
  }
};

// @desc    Evaluate a system design answer
// @route   POST /api/v1/interview/evaluate
// @access  Private
const evaluateAnswer = async (req, res, next) => {
  const { question, answer } = req.body;

  try {
    const response = await openai.chat.completions.create({
      model,
      messages: [
        {
          role: 'system',
          content: `You are ScaleForge, an expert system design interviewer. Evaluate the candidate's answer for the following question.
          Return the evaluation in JSON format with exactly these keys:
          - score (number out of 10)
          - strengths (array of strings)
          - missingPoints (array of strings)
          - improvements (array of strings)
          - idealAnswer (string)
          
          Question: ${question}`,
        },
        {
          role: 'user',
          content: answer,
        },
      ],
      response_format: { type: 'json_object' },
    });

    const feedback = JSON.parse(response.choices[0].message.content);

    const attempt = await Attempt.create({
      user: req.user._id,
      question,
      userAnswer: answer,
      feedback,
    });

    res.status(201).json(attempt);
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's previous attempts
// @route   GET /api/v1/interview/history
// @access  Private
const getHistory = async (req, res, next) => {
  try {
    const query = Attempt.find({ user: req.user._id }).sort({ createdAt: -1 });

    if (req.query.summary === 'true') {
      query.select('question feedback.score feedback.strengths createdAt');
    }

    const attempts = await query.lean();
    res.json(attempts);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  generateQuestion,
  evaluateAnswer,
  getHistory,
  startInterview,
  startDemoInterview,
  answerInterview,
  completeInterview,
  answerDemoInterview,
  completeInterview,
  refreshInterviewSession,
};

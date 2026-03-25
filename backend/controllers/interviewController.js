const openai = require('../utils/openai');
const Attempt = require('../models/Attempt');

// @desc    Generate a system design question
// @route   GET /api/v1/interview/generate
// @access  Private
const generateQuestion = async (req, res, next) => {
  try {
    const response = await openai.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: 'You are ScaleForge, an expert system design interviewer. Generate a challenging System Design interview question. Only return the question text.',
        },
      ],
      max_tokens: 150,
    });

    const question = response.choices[0].message.content.trim();
    res.json({ question });
  } catch (error) {
    console.error('GENERATE QUESTION ERROR:', error.message);
    if (error.response) {
      console.error('OPENAI ERROR RESPONSE:', error.response.data);
    }
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
      model: 'llama-3.3-70b-versatile',
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
    const attempts = await Attempt.find({ user: req.user._id }).sort({
      createdAt: -1,
    });
    res.json(attempts);
  } catch (error) {
    next(error);
  }
};

module.exports = { generateQuestion, evaluateAnswer, getHistory };

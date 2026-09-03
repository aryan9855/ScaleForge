const { randomUUID } = require('crypto');
const { redisClient } = require('../config/redis');

const SESSION_TTL_SECONDS = 60 * 60;

const sessionKey = (sessionId) => `interview:session:${sessionId}`;

const ensureRedis = () => {
  if (!redisClient.isReady) {
    const error = new Error('Interview session storage is unavailable');
    error.statusCode = 503;
    throw error;
  }
};

const createInterviewSession = async ({ userId, question, isDemo = false }) => {
  ensureRedis();
  const sessionId = randomUUID();
  const session = {
    sessionId,
    userId: String(userId),
    isDemo,
    question,
    conversation: [{ role: 'interviewer', content: question }],
    answers: [],
    interviewerQuestions: [question],
    currentRound: 1,
    status: 'active',
    startedAt: new Date().toISOString(),
  };

  await redisClient.set(sessionKey(sessionId), JSON.stringify(session), {
    EX: SESSION_TTL_SECONDS,
  });
  return session;
};

const getInterviewSession = async (sessionId) => {
  ensureRedis();
  const rawSession = await redisClient.get(sessionKey(sessionId));
  return rawSession ? JSON.parse(rawSession) : null;
};

const updateInterviewSession = async (session) => {
  ensureRedis();
  await redisClient.set(sessionKey(session.sessionId), JSON.stringify(session), {
    EX: SESSION_TTL_SECONDS,
  });
  return session;
};

const refreshInterviewSession = async (sessionId) => {
  ensureRedis();
  await redisClient.expire(sessionKey(sessionId), SESSION_TTL_SECONDS);
};

const deleteInterviewSession = async (sessionId) => {
  ensureRedis();
  await redisClient.del(sessionKey(sessionId));
};

module.exports = {
  createInterviewSession,
  getInterviewSession,
  updateInterviewSession,
  refreshInterviewSession,
  deleteInterviewSession,
};
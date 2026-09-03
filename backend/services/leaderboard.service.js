const Attempt = require('../models/Attempt');
const User = require('../models/User');
const { redisClient } = require('../config/redis');

const LEADERBOARD_KEY = 'leaderboard:global';

const calculateUserScore = async (userId) => {
  const attempts = await Attempt.find({ user: userId })
    .sort({ createdAt: -1 })
    .limit(5)
    .select('feedback.score')
    .lean();

  if (!attempts.length) return 0;
  return attempts.reduce((total, attempt) => total + (attempt.feedback?.score || 0), 0) / attempts.length;
};

const updateLeaderboardScore = async (userId) => {
  if (!redisClient.isReady) throw new Error('Leaderboard storage is unavailable');
  const score = await calculateUserScore(userId);
  await redisClient.zAdd(LEADERBOARD_KEY, [{ score, value: String(userId) }]);
  return score;
};

const getLeaderboardEntries = async (start, stop) => {
  if (!redisClient.isReady) throw new Error('Leaderboard storage is unavailable');
  return redisClient.zRangeWithScores(LEADERBOARD_KEY, start, stop, { REV: true });
};

const hydrateEntries = async (entries) => {
  const users = await User.find({ _id: { $in: entries.map((entry) => entry.value) } })
    .select('name email')
    .lean();
  const userMap = new Map(users.map((user) => [String(user._id), user]));

  return entries.map((entry, index) => ({
    rank: index + 1,
    userId: entry.value,
    score: Number(entry.score.toFixed(2)),
    user: userMap.get(entry.value)
      ? { id: entry.value, name: userMap.get(entry.value).name }
      : null,
  })).filter((entry) => entry.user);
};

const getTopUsers = async (limit = 10) => hydrateEntries(await getLeaderboardEntries(0, limit - 1));

const getUserRank = async (userId) => {
  if (!redisClient.isReady) throw new Error('Leaderboard storage is unavailable');
  const member = String(userId);
  const [rank, score] = await Promise.all([
    redisClient.zRevRank(LEADERBOARD_KEY, member),
    redisClient.zScore(LEADERBOARD_KEY, member),
  ]);
  return rank === null ? null : { rank: rank + 1, score: Number(score.toFixed(2)) };
};

const rebuildLeaderboardIfNeeded = async () => {
  if (!redisClient.isReady) throw new Error('Leaderboard storage is unavailable');
  if (await redisClient.zCard(LEADERBOARD_KEY)) return;
  const users = await User.find().select('_id').lean();
  for (const user of users) {
    const score = await calculateUserScore(user._id);
    if (score > 0) await redisClient.zAdd(LEADERBOARD_KEY, [{ score, value: String(user._id) }]);
  }
};

module.exports = {
  updateLeaderboardScore,
  getTopUsers,
  getUserRank,
  rebuildLeaderboardIfNeeded,
};
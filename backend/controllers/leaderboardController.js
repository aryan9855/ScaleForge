const { getTopUsers, getUserRank, rebuildLeaderboardIfNeeded } = require('../services/leaderboard.service');

const getLeaderboard = async (req, res, next) => {
  try {
    await rebuildLeaderboardIfNeeded();
    res.json({ users: await getTopUsers(10) });
  } catch (error) {
    next(error);
  }
};

const getMyLeaderboardRank = async (req, res, next) => {
  try {
    await rebuildLeaderboardIfNeeded();
    res.json({ rank: await getUserRank(req.user._id) });
  } catch (error) {
    next(error);
  }
};

module.exports = { getLeaderboard, getMyLeaderboardRank };
const { getTopUsers } = require('../services/leaderboard.service');

const emitLeaderboard = async (io) => {
  try {
    io.emit('leaderboard:update', { users: await getTopUsers(10) });
  } catch (error) {
    console.error('LEADERBOARD BROADCAST ERROR:', error.message);
  }
};

const initializeLeaderboardSocket = (io) => {
  io.on('connection', async (socket) => {
    try {
      socket.emit('leaderboard:update', { users: await getTopUsers(10) });
    } catch (error) {
      socket.emit('leaderboard:error', { message: 'Leaderboard is temporarily unavailable' });
    }
    socket.on('disconnect', () => {});
  });
};

module.exports = { initializeLeaderboardSocket, emitLeaderboard };
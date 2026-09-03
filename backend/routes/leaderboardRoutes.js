const express = require('express');
const { getLeaderboard, getMyLeaderboardRank } = require('../controllers/leaderboardController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/', getLeaderboard);
router.get('/me', protect, getMyLeaderboardRank);

module.exports = router;
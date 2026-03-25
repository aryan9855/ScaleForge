const express = require('express');
const {
  generateQuestion,
  evaluateAnswer,
  getHistory,
} = require('../controllers/interviewController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/generate', protect, generateQuestion);
router.post('/evaluate', protect, evaluateAnswer);
router.get('/history', protect, getHistory);

module.exports = router;

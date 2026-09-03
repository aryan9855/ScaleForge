const express = require('express');
const {
  generateQuestion,
  evaluateAnswer,
  getHistory,
  startInterview,
  startDemoInterview,
  answerInterview,
  answerDemoInterview,
  completeInterview,
} = require('../controllers/interviewController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/generate', protect, generateQuestion);
router.post('/evaluate', protect, evaluateAnswer);
router.get('/history', protect, getHistory);
router.post('/start', protect, startInterview);
router.post('/demo/start', startDemoInterview);
router.post('/demo/:sessionId/answer', answerDemoInterview);
router.post('/demo/:sessionId/complete', completeInterview);
router.post('/:sessionId/answer', protect, answerInterview);
router.post('/:sessionId/complete', protect, completeInterview);

module.exports = router;

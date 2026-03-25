const mongoose = require('mongoose');

const attemptSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    question: {
      type: String,
      required: true,
    },
    userAnswer: {
      type: String,
      required: true,
    },
    feedback: {
      score: Number,
      strengths: [String],
      missingPoints: [String],
      improvements: [String],
      idealAnswer: String,
    },
  },
  {
    timestamps: true,
  }
);

const Attempt = mongoose.model('Attempt', attemptSchema);

module.exports = Attempt;

const mongoose = require('mongoose');

const exerciseSchema = new mongoose.Schema({
  language: { type: String, required: true },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], required: true },
  question: { type: String, required: true },
  options: [{
    text: { type: String, required: true },
    isCorrect: { type: Boolean, required: true },
  }],
});

const Exercise = mongoose.model('Exercise', exerciseSchema);

module.exports = Exercise;

const mongoose = require("mongoose");



const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: { type: String, required: true },
  role: {
    type: String,
  },
scores: {
    type: Map,
    of: Number,
    default: {}
  },
  currentLanguage: { type: String, default: null }, // Track the user's current language
});

const User = mongoose.model("User", userSchema);

module.exports = User;

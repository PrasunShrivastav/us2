const mongoose = require('mongoose');

// Check if the model is already compiled
const User = mongoose.models.User || mongoose.model('User', new mongoose.Schema({
    uid: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    constituency: { type: String, required: true },
    voterId: { type: String, required: true, unique: true },
    hasVoted: { type: Boolean, default: false },
}));

module.exports = User;

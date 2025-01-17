const mongoose = require('mongoose');

// Define the schema for voters
const userSchema = new mongoose.Schema({
    uid: { type: String, required: true, unique: true }, // Unique identifier for the voter
    password: { type: String, required: true },          // Hashed password
    name: { type: String, required: true },              // Voter's name
    constituency: { type: String, required: true },      // Constituency details
    voterId: { type: String, required: true, unique: true }, // Unique voter ID
    hasVoted: { type: Boolean, default: false }          // Whether the voter has already voted
});

// Create a Mongoose model
const User = mongoose.model('User', userSchema);

module.exports = User;

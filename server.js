// server.js
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const path = require('path');

const app = express();

// Middleware
app.use(express.json());
app.use(express.static('public'));
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: process.env.NODE_ENV === 'production' }
}));

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/voting_system', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// User Schema
const UserSchema = new mongoose.Schema({
    uid: { 
        type: String, 
        required: true, 
        unique: true 
    },
    password: { 
        type: String, 
        required: true 
    },
    hasVoted: { 
        type: Boolean, 
        default: false 
    },
    constituency: { 
        type: String, 
        required: true 
    }
});

// Vote Schema
const VoteSchema = new mongoose.Schema({
    candidateId: { 
        type: String, 
        required: true 
    },
    constituency: { 
        type: String, 
        required: true 
    },
    timestamp: { 
        type: Date, 
        default: Date.now 
    }
});

const User = mongoose.model('User', UserSchema);
const Vote = mongoose.model('Vote', VoteSchema);

// Routes
app.post('/api/login', async (req, res) => {
    try {
        const { uid, password } = req.body;
        
        // Find user
        const user = await User.findOne({ uid });
        if (!user) {
            return res.status(401).json({ message: 'Invalid UID or password' });
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ message: 'Invalid UID or password' });
        }

        // Check if user has already voted
        if (user.hasVoted) {
            return res.status(403).json({ message: 'You have already cast your vote' });
        }

        // Set session
        req.session.userId = user._id;
        req.session.constituency = user.constituency;

        res.json({ 
            message: 'Login successful',
            constituency: user.constituency 
        });

    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

app.post('/api/vote', async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.status(401).json({ message: 'Please login first' });
        }

        const { candidateId } = req.body;
        const user = await User.findById(req.session.userId);

        if (user.hasVoted) {
            return res.status(403).json({ message: 'You have already cast your vote' });
        }

        // Record the vote
        const vote = new Vote({
            candidateId,
            constituency: user.constituency
        });
        await vote.save();

        // Update user's voting status
        user.hasVoted = true;
        await user.save();

        // Clear session
        req.session.destroy();

        res.json({ message: 'Vote cast successfully' });

    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Serve the login page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Protected route for voting page
app.get('/vote', (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/');
    }
    res.sendFile(path.join(__dirname, 'public', 'us.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

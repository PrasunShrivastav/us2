// Add this to a separate file called addUser.js
const bcrypt = require('bcryptjs');
const User = require('./models/User');

async function addTestUser() {
    const hashedPassword = await bcrypt.hash('password123', 10);
    const user = new User({
        uid: '123456',
        password: hashedPassword,
        constituency: 'Thane'
    });
    await user.save();
}

const mongoose = require('mongoose');

// Define the User schema
const userSchema = new mongoose.Schema({
    username: String,
    password: String, // Add a password field
});

// Create the User model
const User = mongoose.model('User', userSchema);

module.exports = User;

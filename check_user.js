const express = require('express');
const mongoose = require('mongoose');
const User = require('./user_schema'); // Import the User model
const bcrypt = require('bcrypt');


const app = express();

// Connect to your MongoDB instance
mongoose.connect('mongodb://localhost:27017/domain_controller?family=4', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// Parse form data
app.use(express.urlencoded({ extended: true }));

// Serve the login page
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/login.html');
});

// Handle login POST request
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        // Check if a user with the provided username exists in the MongoDB collection
        const user = await User.findOne({ username }).exec();

        if (user) {
            // User exists, compare the hashed password
            const passwordMatch = await bcrypt.compare(password, user.password);

            if (passwordMatch) {
                // Password matches, redirect to their profile page
                res.redirect(`http://${username}.localhost:1337/profile`);
            } else {
                // Password doesn't match, show an error
                res.status(401).send('Invalid username or password');
            }
        } else {
            // User does not exist, show an error
            res.status(401).send('Invalid username or password');
        }
    } catch (err) {
        // Handle database errors
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
});


app.get('/logout', (req, res) => {
    // Perform any necessary logout logic (e.g., clearing session)
    // Then redirect back to the login page
    res.redirect('http://localhost:1337/');
});


// Serve the signup page
app.get('/signup', (req, res) => {
    res.sendFile(__dirname + '/signup.html');
});

// Handle signup POST request
app.post('/signup', async (req, res) => {
    const { username, password } = req.body;

    try {
        // Check if a user with the provided username already exists
        const existingUser = await User.findOne({ username }).exec();

        if (existingUser) {
            // User with this username already exists, show an error
            res.status(400).send('Username already taken');
        } else {
            // Hash the password before saving it
            const hashedPassword = await bcrypt.hash(password, 10); // 10 is the salt rounds, you can adjust it

            // Create a new user entry with the hashed password
            const newUser = new User({ username, password: hashedPassword });
            await newUser.save();

            // Redirect to the user's profile page
            res.redirect(`http://${username}.localhost:1337/profile`);
        }
    } catch (err) {
        // Handle database errors
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
});

// Serve the profile page
app.get('/profile', (req, res) => {
    res.sendFile(__dirname + '/profile.html');
});

app.listen(1337, () => console.log('Web Server running on port 1337'));

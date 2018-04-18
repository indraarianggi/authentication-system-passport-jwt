const express = require('express');
const mongoose = require('mongoose');

const app = express();

const bodyParser = require('body-parser');
const morgan = require('morgan');
const passport = require('passport');
const jwt = require('jsonwebtoken');

const config = require('./config/main');

const User = require('./app/models/user');

// Set port
let port = process.env.PORT || 3000;

// Use body-parser to get POST requests for API use
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Log requests to console
app.use(morgan('dev'));

// Initialize passport for use
app.use(passport.initialize());

// Connect to database
mongoose.connect(config.database);

// Bring in defined Passport Strategy
require('./config/passport')(passport);

const router = express.Router();

// Register new users
router.post('/register', function(req, res) {
    if (!req.body.email || !req.body.password) {
        res.json({ success: false, message: 'Please enter email and password.' });
    } else {
        let newUser = new User({
            email: req.body.email,
            password: req.body.password
        });

        // Attempt to save the user
        newUser.save(function(err) {
            if (err) return res.json({ success: false, message: 'That email address already exists.' });

            res.json({ success: true, message: 'Successfully created new user.' });
        });
    }
});

// Authenticate the user and get a JSON Web Token to include in the header of future requests.
router.post('/authenticate', function(req,res) { // login
    User.findOne({email: req.body.email}, function(err, user) {
        if (err) throw err;

        if (!user) {
            res.send({ success: false, message: 'Authentication failed. User not found.' });
        } else {
            // Check if password matches
            user.comparePassword(req.body.password, function(err, isMatch) {
                if (isMatch && !err) {
                    // Create token if the password matched and no error was thrown
                    let token = jwt.sign(
                        {user}, // payload
                        config.secret, // secret key
                        {expiresIn: 10080} // expired time
                    );
                    res.json({ success: true, token: 'JWT ' + token });
                } else {
                    res.json({ success: false, message: 'Authentication failed. Password did not match.' });
                }
            });
        }
    });
});

// Protect dashboard route with JWT
router.get('/dashboard', passport.authenticate('jwt', {session:false}), function(req, res) {
    res.send('It worked! User id is: ' + req.user._id + '.');
});

// Set url for API group routes
app.use('/api', router);

// Home route. We'll end up changing this to our main front end index later.
app.get('/', function(req, res) {
    res.send('Relax. We will put the home page here later.');
});

// Start the server
app.listen(port);
console.log(`Server start at port ${port}`);

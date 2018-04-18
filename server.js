const express = require('express');
const mongoose = require('mongoose');

const app = express();

const bodyParser = require('body-parser');
const morgan = require('morgan');
const passport = require('passport');
const jwt = require('jsonwebtoken');

const config = require('./config/main');

// Set port
let port = process.env.PORT || 3000;

// Use body-parser to get POST requests for API use
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Log requests to console
app.use(morgan('dev'));
// We will add a quick home page route so I can give a quick demonstration of what morgan does. Add this next.

// Home route. We'll end up changing this to our main front end index later.
app.get('/', function(req, res) {
    res.send('Relax. We will put the home page here later.');
});

// Start the server
app.listen(port);
console.log(`Server start at port ${port}`);

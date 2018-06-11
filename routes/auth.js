'use strict';

const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

const { JWT_SECRET, JWT_EXPIRY } = require('../config');

const passport = require('passport');



const options = {session: false, failWithError: true};

const localAuth = passport.authenticate('local', options);

router.post('/auth/login', localAuth, (req, res) => {
  const authToken = createAuthToken(req.user);
  res.json({ authToken });
});

const jwtAuth = passport.authenticate('jwt', options);

router.post('/auth/refresh', jwtAuth, (req, res) => {
  const authToken = createAuthToken(req.user);
  res.json({ authToken });
});

function createAuthToken (user) {
  return jwt.sign({ user }, JWT_SECRET, {
    subject: user.username,
    expiresIn: JWT_EXPIRY
  });
}
module.exports = router;
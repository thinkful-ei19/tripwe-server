'use strict';
const express = require('express');
const passport = require('passport');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const { knex } = require('../db-knex');
const { Strategy: LocalStrategy } = require('passport-local');
//const User = require('../models/user');
// does pg have models too??
const app = express();
app.use(express.static('public'));
app.use(bodyParser.json());

const localStrategy = new LocalStrategy((username, password, done) => {
   
  let user;
  knex.select()
    .from('users')
    .where('users.username', username)
    .first()
    .then(results => {
      user = results;
      if (!user) {
        throw new Error(`The username ${username} has not been registered.`);
        // Return rejected promise
        // return Promise.reject({
        //   reason: 'LoginError',
        //   message: 'Incorrect username',
        //   location: 'username'
        // });
      }
      return bcrypt.compare(password, user.password);
    })
    .then(isValid => {
      if (!isValid) {
        throw new Error('The password is incorrect, please try again.');
        // return Promise.reject({
        //     reason: 'LoginError',
        //     message: 'Incorrect password',
        //     location: 'password'
        // });
      }
      return done(null, user);
    })
    .catch(err => {
      if (err.reason === 'LoginError') {
        return done(null, false);
      }
      return done(err);
    });
});
module.exports = localStrategy;
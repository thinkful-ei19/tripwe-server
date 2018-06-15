'use strict';
const express = require('express');
const bcrypt = require('bcryptjs');
const { knex } = require('../db-knex');
const { getUserId } = require('../utils/getUserId');
//const User = require('../models/user');

const router = express.Router();


/* ========== POST/CREATE AN ITEM ========== */
router.post('/users', (req, res, next) => {
  const { fullname, email, username, password} = req.body;
  let userId;

  const requiredFields = ['username', 'password'];
  const missingField = requiredFields.find(field => !(field in req.body));

  if (missingField) {
    const err = new Error(`Missing '${missingField}' in request body`);
    err.status = 422;
    return next(err);
  }

  const stringFields = ['username', 'password', 'fullname'];
  const nonStringField = stringFields.find(
    field => field in req.body && typeof req.body[field] !== 'string'
  );

  if (nonStringField) {
    const err = new Error(`Field: '${nonStringField}' must be type String`);
    err.status = 422;
    return next(err);
  }

  // If the username and password aren't trimmed we give an error.  Users might
  // expect that these will work without trimming (i.e. they want the password
  // "foobar ", including the space at the end).  We need to reject such values
  // explicitly so the users know what's happening, rather than silently
  // trimming them and expecting the user to understand.
  // We'll silently trim the other fields, because they aren't credentials used
  // to log in, so it's less of a problem.
  const explicityTrimmedFields = ['username', 'password'];
  const nonTrimmedField = explicityTrimmedFields.find(
    field => req.body[field].trim() !== req.body[field]
  );

  if (nonTrimmedField) {
    const err = new Error(`Field: '${nonTrimmedField}' cannot start or end with whitespace`);
    err.status = 422;
    return next(err);
  }

  // bcrypt truncates after 72 characters, so let's not give the illusion
  // of security by storing extra **unused** info
  const sizedFields = {
    username: { min: 1 },
    password: { min: 8, max: 72 }
  };

  const tooSmallField = Object.keys(sizedFields).find(
    field => 'min' in sizedFields[field] &&
      req.body[field].trim().length < sizedFields[field].min
  );
  if (tooSmallField) {
    const min = sizedFields[tooSmallField].min;
    const err = new Error(`Field: '${tooSmallField}' must be at least ${min} characters long`);
    err.status = 422;
    return next(err);
  }

  const tooLargeField = Object.keys(sizedFields).find(
    field => 'max' in sizedFields[field] &&
      req.body[field].trim().length > sizedFields[field].max
  );

  if (tooLargeField) {
    const max = sizedFields[tooLargeField].max;
    const err = new Error(`Field: '${tooLargeField}' must be at most ${max} characters long`);
    err.status = 422;
    return next(err);
  }

 return bcrypt.hash(password, 10)
    .then(digest => {
      const newUser = {
        fullname: fullname,
        email: email,
        username: username,
        password: digest
      };
      return knex.insert(newUser)
        .into('users')
        .returning('id')
        .then(([id]) => {
          userId = id;
        });
    })
    .then(() => {
      return knex.select('users.fullname', 'users.username')
        .from('users')
        .where('users.id', userId)
        .first();
    })
    .then (user => {
      if (user) {
        res.location(`${req.originalUrl}/${userId}`).status(201).json(user);
      } else {
        next();
      }
    })
    .catch (err => {
      // console.log(err);
      if (err.code === '23505') {
        err = new Error('Sorry, this username already exists');
        err.status = 400;
      }
      next(err);
    });
});
router.get('/users/trips', (req, res, next) => {

  const userId = getUserId(req);

  knex
    .select('users.trips')
    //selecting from the users trips...
    .from('users')
    .where('users.id', userId)
    .then(result => {
      res.json(result);
    })
    .catch(err => {
      next(err);
    });
});
module.exports = router;

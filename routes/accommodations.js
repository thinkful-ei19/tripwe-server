'use strict';

const express = require('express');
const router = express.Router();
const { dbGet } = require('../db-knex');
const { getUserId } = require('../utils/getUserId');
const util = require('util');

const insertNewAccommodation = NewAccommodation => {
  const knex = dbGet();
  return knex.insert(NewAccommodation)
    .into('accommodations')
    .returning('id')
    .then(([id]) => id)
    .catch(e => {
      console.log('insertNewAccommodation:', e)
    })
}
const insertUserIntoAccommodation = (userId, accommodationId) => {
  const knex = dbGet();
  console.log(userId);
  console.log(accommodationId);
  return knex.insert({
    user_id: userId,
    accommodation_id: accommodationId,
  }).into("accommodations_users")
    .then(() => true)
    .catch(e => {
      console.error('insertNewAccomodation error: ', e)
      return false
    })
}
router.post('/trips/:id/accommodations', async (req, res, next) => {
  const knex = dbGet();
  const userId = 1;
  //getUserId(req);
  const { id } = req.params;

  const { name, refnum, checkin, checkout } = req.body;


  const newAccommodation = {
    trip_id: id,
    name: name,
    refnum: refnum,
    checkin: checkin,
    checkout: checkout,
  }

  let accommodationId;
  const NewAccommodationId = await insertNewAccommodation(newAccommodation);
  console.log(NewAccommodationId)
  const success = insertUserIntoAccommodation(userId, NewAccommodationId)

  if (success) {
    res.status(201).json();
  } else {
    res.status(500).json();
  }
});


module.exports = router;

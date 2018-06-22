'use strict';

const express = require('express');
const router = express.Router();
const { knex } = require('../db-knex');
const { getUserId } = require('../utils/getUserId');
const util = require('util');
const {
  editAccomodationById,
  deleteAccomodationById,
  // insertNewAccommodation,
  // insertUserIntoAccommodation
} = require('../models/accommodation');

const insertNewAccommodation = NewAccommodation => {
  console.log(NewAccommodation, 'insert info');
  return knex.insert(NewAccommodation)
    .into('accommodations')
    .returning('id')
    .then(([id]) => id)
    .catch(e => {
      console.log('insertNewAccommodation:', e)
    })
}
const insertUserIntoAccommodation = (userId, id, accommodationId) => {
  // console.log(userId);
  // console.log(accommodationId);
  return knex.insert({
    user_id: userId,
    trip_id: id,
    accommodation_id: accommodationId,
  }).into("accommodations_users")
    .then(() => true)
    .catch(e => {
      console.error('insertUserNewAccomodation error: ', e)
      return false
    })
}
router.post('/trips/:id/accommodations', async (req, res, next) => {
  const userId = getUserId(req);
  //getUserId(req);
  const { id } = req.params;

  const { name, address, reference, arrival, departure, phone } = req.body;

  const newAccommodation = {
    trip_id: id,
    name,
    address,
    reference,
    arrival,
    departure,
    phone
  };

  const NewAccommodationId = await insertNewAccommodation(newAccommodation);

  const success = await insertUserIntoAccommodation(userId, NewAccommodationId, id)

  if (success) {
    res.status(201).json();
  } else {
    res.status(500).json();
  }
});

router.put('/accommodations/:id', (req, res, next) => {
  const accommodationId = req.params.id;
  const { name, address, reference, arrival, departure, phone } = req.body;

  const updatedAccommodation = {
    name,
    address,
    reference,
    arrival,
    departure,
    phone
  };

  const success = editAccomodationById(accommodationId, updatedAccommodation)
  if (success) {
    res.status(201).json();
  } else {
    res.status(500).json();
  }
});

router.delete('/accommodations/:id', (req, res, next) => {
  const accommodationId = req.params.id;

  const success = deleteAccomodationById(accommodationId);
  console.log(success)

  if (success) {
    res.status(204).json();
  } else {
    res.status(500).json();
  }
})

module.exports = router;

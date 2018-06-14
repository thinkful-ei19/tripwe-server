'use strict';

const express = require('express');
const router = express.Router();
const { dbGet } = require('../db-knex');
const { getUserId } = require('../utils/getUserId');
const util = require('util');

const insertNewAccommodation= NewAccommodation =>{
  const knex = dbGet();
    return knex.insert(NewAccommodation)
        .into('accommodations')
        .returning('id')
        .then(([id]) => {
            return id;
    })
}
const insertUserIntoAccommodation =(userId, tripId, accommodationId)=> {
    const knex = dbGet();
    console.log(userId);
    console.log(accommodationId);
    return knex.insert({
       user_id: userId,
       accommodation_id: accommodationId,
       trip_id: tripId
    }).into("accommodations_users");
}
router.post('/accommodations', async (req, res, next) => {
  const knex = dbGet();
  const userId = 1;
  const tripId = 2;
  //getUserId(req);

  const { name, refnum, checkin, checkout } = req.body;


  const newAccommodation = {
    trip_id: tripId,
    name: name,
    refnum: refnum,
    checkin: checkin,
    checkout: checkout,
  }

    let accommodationId;
    const NewAccommodationId = await insertNewAccommodation(newAccommodation);
    console.log(NewAccommodationId)
    insertUserIntoAccommodation(userId, tripId, NewAccommodationId)
});


module.exports = router;
'use strict';

const express = require('express');
const router = express.Router();
const {dbGet} = require('../db-knex');
const { getUserId } = require('../utils/getUserId');
const util = require('util');
const inspect = data => util.inspect(data, { depth: null });

router.get('/trips/:id', async (req, res, next) => {
    const { id } = req.params;
    const trip = await getTripById(id);
    const group = await getUsersByTripId(id);
    const accommodations = await getAccommodationsByTripId(id);
    const plans = await getPlansByTripId(id);

    res.json({ trip, group, accommodations, plans })
})

const getTripById = id => {
const knex = dbGet();
  return knex.select(
    't.id',
    't.user_id',
    't.name',
    't.destination',
    't.description',
    't.arrival',
    't.departure'
  )
  .from('trips as t')
  .where({ id })
  .then(res => {
    // console.log('getTripsById res:', res)
    return res;
  })}

const getUsersByTripId = tripId => {
const knex = dbGet();
  return knex.select(
    // users
    'u.id',
    'u.fullname',
    'u.email',
    'u.username',
    'u.password',
    // Flights
    'f.id',
    'f.trip_id',
    'f.user_id',
    'f.incomingdeparturetime',
    'f.incomingarrivaltime',
    'f.incomingdepartureairport',
    'f.incomingarrivalairport',
    'f.incomingflightnum',
    'f.outgoingdeparturetime',
    'f.outgoingarrivaltime',
    'f.outgoingdepartureairport',
    'f.outgoingarrivalairport',
    'f.outgoingflightnum',
    // status
    'ut.status'
  )
  .from('users_trips as ut')
  .leftJoin('users as u', 'ut.user_id', 'u.id')
  .leftJoin('flights as f', 'ut.flight_id', 'f.id')
  .where('ut.trip_id', tripId)
  .then(res => {
    // console.log('getGroupByTripId res: ', res)
    return res;
  })}

// models/accommodation.js -----START-----
// accommodations[n]users prop
const getUsersByAccommodationId = accommodationId => {
  const knex = dbGet()
  return knex.select(
    // users
    'u.id',
    'u.fullname',
    'u.email',
    'u.username',
    'u.password'
  )
  .from('accommodations_users as au')
  .leftJoin('users as u', 'au.user_id', 'u.id')
  .where({ accommodation_id: accommodationId })
  .then(res => {
    // console.log('getGroupByTripId res: ', res)
    return res; // array of accommodation object
  })}

// accommodations[n]accommodation prop
const getAccommodationsByTripId = tripId => {
  const knex = dbGet()
  return knex.select(
    // accommodations
    'a.id',
    'a.trip_id',
    'a.name',
    'a.refnum',
    'a.checkin',
    'a.checkout'
  )
  .from('accommodations as a')
  .where({ trip_id: tripId })
  .then(accommodations => {
    // console.log('getaccommodationsByTripId res: ', accommodations)

    const promises = accommodations.map(async accom => {
      return {
        ...accom,
        users: await getUsersByAccommodationId(accom.id)
      }
    })

    return Promise.all(promises);
  })}
// models/accommodation.js ------END------


const getPlansByTripId = tripId => {
  const knex = dbGet()
  return knex.select(
    'p.id',
    'p.description',
    'p.date'
  )
  .from('plans as p')
  .where({ trip_id: tripId })
  .then(res => {
    // console.log('getPlansByTripId res: ', res)
    return res;
  })}
/*========POST TRIP========== */

const insertNewTrip = newTrip => {
  const knex = dbGet();
  return knex.insert(newTrip)
    .into('trips')
    .returning('id')
    .then(([id]) => id);
}
const insertUserIntoTrip = (userId, newTripId) => {
  const knex = dbGet();
    return knex.insert({user_id : userId, trip_id: newTripId})
      .into('users_trips')
      .then(() => true) 
      .catch(e => { 
        console.error('insertFlight error: ', e) 
        return false })
}

router.post('/trips', async (req,res,next) => {
  const userId = getUserId(req);
  const { name, destination, description, arrival, departure } = req.body;

  const newTrip = {
    user_id: userId,
    name,
    destination,
    description,
    arrival,
    departure,
  }
  const newTripId = await insertNewTrip(newTrip);
  const insertUsersSuccess = await insertUserIntoTrip(userId, newTripId);
  
  
  if (insertUsersSuccess) { 
    res.status(201).json(); 
  } else { 
    res.status(500).json(); 
  };
})


  

module.exports = router;

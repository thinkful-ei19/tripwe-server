'use strict';

const express = require('express');
const router = express.Router();
const { knex } = require('../db-knex');
const { getUserId } = require('../utils/getUserId');
const util = require('util');
const inspect = data => util.inspect(data, { depth: null });

const insertFlight = newFlight => {
  return knex.insert(newFlight)
    .into('flights')
    .returning('id')
    .then(([id]) => id)
    .catch(e => {
      console.error('insertFlight error: ', e)
    })
}

const insertFlightInTrips = (tripId, userId, flightId) => {
  return knex.insert({
    trip_id: tripId,
    user_id: userId,
    flight_id: flightId
  })
  .into('users_trips')
  .then(() => true)
  .catch(e => {
    console.error('insertFlight error: ', e)
    return false
  })
}

router.post('/trips/:id/flights', async (req, res, next) => {
  const userId = getUserId();
  const { id } = req.params;

  const {
    incomingDepartureTime,
    incomingArrivalTime,
    incomingDepartureAirport,
    incomingArrivalAirport,
    incomingFlightNum,
    outgoingDepartureTime,
    outgoingArrivalTime,
    outgoingDepartureAirport,
    outgoingArrivalAirport,
    outgoingFlightNum
  } = req.body;

  const newFlight = {
    user_id: userId,
    trip_id: id,
    incomingdeparturetime: incomingDepartureTime,
    incomingarrivaltime: incomingArrivalTime,
    incomingdepartureairport: incomingDepartureAirport,
    incomingarrivalairport: incomingArrivalAirport,
    incomingflightnum: incomingFlightNum,
    outgoingdeparturetime: outgoingDepartureTime,
    outgoingarrivaltime: outgoingArrivalTime,
    outgoingdepartureairport: outgoingDepartureAirport,
    outgoingarrivalairport: outgoingArrivalAirport,
    outgoingflightnum: outgoingFlightNum
  }

  const flightId = await insertFlight(newFlight)
  const success = await insertFlightInTrips(id, userId, flightId)

  if (success) {
    res.status(201).json();
  } else {
    res.status(500).json();
  }
})

router.delete('/trips/:id/flights/id', (req,res,next)=> {
  
  // knex('flights').where({ id: flightId }).del()
  // .catch(err => console.error(`[deleteFlightById] Error: ${err}`))
})

module.exports = router;

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
  return knex.raw(`
    UPDATE USERS_TRIPS
    SET FLIGHT_ID = ${flightId}
    WHERE TRIP_ID = ${tripId}
  `)
  .then(() => true)
  .catch(e => {
    console.error('insertFlight error: ', e)
    return false
  })
}

router.post('/trips/:id/flights', async (req, res, next) => {
  const userId = getUserId(req);
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

module.exports = router;

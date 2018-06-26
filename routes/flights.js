'use strict';

const express = require('express');
const router = express.Router();
const { knex } = require('../db-knex');
const { getUserId } = require('../utils/getUserId');
const util = require('util');
const { editFlightById, deleteFlightById, insertFlight, insertFlightInTrips } = require('../models/flight');
const inspect = data => util.inspect(data, { depth: null });

/*==========POST NEW FLIGHT ========== */
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
    outgoingFlightNum,
    incomingDepartureLatitude,
    incomingDepartureLongitude,
    incomingArrivalLatitude,
    incomingArrivalLongitude
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
    outgoingflightnum: outgoingFlightNum,
    incomingDepartureLatitude: incomingDepartureLatitude,
    incomingDepartureLongitude: incomingDepartureLongitude,
    incomingArrivalLatitude: incomingArrivalLatitude,
    incomingArrivalLongitude: incomingArrivalLongitude
  }

  const flightId = await insertFlight(newFlight)
  const success = await insertFlightInTrips(id, userId, flightId)

  if (success) {
    console.log('yaayay');
    res.status(201).json(flightId);
  } else {
    res.status(500).json();
  }
})
/* ========== PUT/UPDATE FLIGHT ========== */
router.put('/trips/:id/flights/:id', (req, res, next) => {
  const flightId = req.params.id;
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
  const updatedFlight = {
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
  const success = editFlightById(flightId, updatedFlight)
  if (success) {
    res.status(201).json();
  } else {
    res.status(500).json();
  }
});
/* ========= DELETE FLIGHT =========== */
router.delete('/trips/:id/flights/:id', (req, res, next) => {
  const { id } = req.params;
  const flightId = id;
  console.log(flightId);

  const success = deleteFlightById(flightId);
  if (success) {
    res.status(204).json();
  } else {
    res.status(500).json();
  }
})

module.exports = router;

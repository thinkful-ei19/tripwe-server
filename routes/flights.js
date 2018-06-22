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
    console.log('yaayay');
    res.status(201).json(flightId);
  } else {
    res.status(500).json();
  }
})
// router.put('/trips/:id/flights/:id', (req, res, next)=> {
//   const userId = getUserId();
//   const flightId = req.params.id;
//   const {
//     incomingDepartureTime,
//     incomingArrivalTime,
//     incomingDepartureAirport,
//     incomingArrivalAirport,
//     incomingFlightNum,
//     outgoingDepartureTime,
//     outgoingArrivalTime,
//     outgoingDepartureAirport,
//     outgoingArrivalAirport,
//     outgoingFlightNum
//   } = req.body;
//   const updateFlight = {
//     user_id: userId,
//     trip_id: id,
//     incomingdeparturetime: incomingDepartureTime,
//     incomingarrivaltime: incomingArrivalTime,
//     incomingdepartureairport: incomingDepartureAirport,
//     incomingarrivalairport: incomingArrivalAirport,
//     incomingflightnum: incomingFlightNum,
//     outgoingdeparturetime: outgoingDepartureTime,
//     outgoingarrivaltime: outgoingArrivalTime,
//     outgoingdepartureairport: outgoingDepartureAirport,
//     outgoingarrivalairport: outgoingArrivalAirport,
//     outgoingflightnum: outgoingFlightNum
//   }
//   knex.select('flight.id')
//     .from('flights')
//     .where('flight.id', flightId)
//     .andWhere('flight.user_id', userId)
//     .then(result => {
//       if(result && result.length > 0){
//         knex('flights')
//         .update(updateFlight)
//         .where('id', flightId)
//         .then(() => {
//         return knex.select(
//           'f.id', 
//           'f.user_id',
//           'f.trip_id', 
//           'f.incomingdeparturetime', 
//           'f.incomingarrivaltime', 
//           'f.incomingdepartureairport', 
//           'f.incomingarrivalairport', 
//           'f.incomingflightnum', 
//           'f.outgoingdeparturetime', 
//           'f.outgoingarrivaltime',
//           'f.outgoingdepartureairport',
//           'f.outgoingarrivalairport',
//           'f.outgoingflightnum')
//           .from('flights')
//           .leftJoin('users', 'flight.user_id', 'users.id')
//           .where('accommodation.id', accommodationId)
//           .andWhere('accommodation.user_id', userId)
//           .first()
//           .then(result => {
//             if (result) {
//               es.json(result);
//             }
//           });
//         });
//         } else {
//           next();
//         }
//               })
//               .catch(err => {
//                 next(err);
//               });
//       });
// });
router.delete('/trips/:id/flights/:id', (req, res, next) => {
  const { id } = req.params;
  const flightId = id;
  console.log(flightId);
  knex.select('flights')
    .where({ id: flightId })
    .del()
    .catch(err =>
      console.error(`[deleteFlightById] Error: ${err}`)
    );
})

module.exports = router;

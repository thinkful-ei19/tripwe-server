'use strict';

const express = require('express');
const router = express.Router();
const { knex } = require('../db-knex');
const util = require('util');
const { getUserId } = require('../utils/getUserId');
const { getTripById } = require('./trips')
const _ = require('lodash');
const inspect = data => util.inspect(data, { depth: null });

router.get('/dashboard', (req, res, next) => {
  const userId = getUserId(req);
  knex.select(
    't.id',
    't.user_id',
    't.name',
    't.destination',
    't.description',
    't.arrival',
    't.departure'
  )
<<<<<<< HEAD
    .from('trips as t')
    .where({ user_id: userId })
    .then(result => {
      // console.log("dashboard result: ", result);
      res.json(result);
    })
    .catch(err => {
      console.error('[trips] Error caught!', inspect(e), inspect(e.stack));
      next(err);
    });
});
=======
  .from('trips as t')
  .where({ user_id: userId })
  .then(async (trips) => {
    console.log(trips, "trips")
    const upcomingTrips =  await getFutureTrips(trips)
  console.log(upcomingTrips, "FUTRE")
    const previousTrips = await getPreviousTrips(trips)
    //console.log(previousTrips, "PREV")
    const closestTrip = await getTripById(upcomingTrips[0].id)
  //console.log(previousTrips, "PREV")
    res.json({ closestTrip, upcomingTrips, previousTrips });
  })
  .catch(e => {
      console.error("[trips] Error caught!", inspect(e), inspect(e.stack))
      next(e);
  });
})
>>>>>>> 360dbd35371c913994517d6c333175cff35a8e19

function getPreviousTrips(trips) {
  return _
    .chain(trips)
    .filter(trip => Date.now() > new Date(trip.arrival))
    .sortBy(['arrival'], 'desc')
    .value()
}

function getFutureTrips(trips) {
  return _
    .chain(trips)
    .filter(trip => Date.now() < new Date(trip.arrival))
    .sortBy(['arrival'])
    .value()
}

module.exports = router;

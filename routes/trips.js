'use strict';

const express = require('express');
const router = express.Router();
const { knex } = require('../db-knex');
const { getUserId } = require('../utils/getUserId');
const util = require('util');
const inspect = data => util.inspect(data, { depth: null });
const { getTotalBudgetByTripId } = require('../models/budget')
const { editTrip, insertNewTrip, insertUserIntoTrip, deleteTripById, getUsersByAccommodationId, findEmailInDB, getDestination, getArrival, addTripInvites } = require('../models/trip');
const sgMail = require('@sendgrid/mail');
const { SENDGRID_API_KEY } = require('../config');
const fs = require('fs');
const filename = 'invite-template.html';

router.get('/trips/:id', async (req, res, next) => {
  const { id } = req.params;
  const trip = await getTripById(id);
  res.json(trip);
})

async function getTripById(tripId) {
  const trip = await getTripInfoById(tripId);
  const group = await getUsersByTripId(tripId);
  const accommodations = await getAccommodationsByTripId(tripId);
  const plans = await getPlansByTripId(tripId);
  const budget = await getBudgetAndTransactionsByTripId(tripId)
  return { trip, group, accommodations, plans, budget }
}

const getTripInfoById = id => {

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
    .first()
}

const getUsersByTripId = tripId => {

  return knex
  .select(
    // users
    'u.id as userId',
    'u.fullname',
    'u.email',
    'u.username',
    // Flights
    'f.id as flightId',
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
    'f.incomingdeparturelatitude',
    'f.incomingdeparturelongitude',
    'f.incomingarrivallatitude',
    'f.incomingarrivallongitude',
    // status
    'ut.status'
  )
    .from('users as u')
    .leftJoin('users_trips as ut', 'ut.user_id', 'u.id')
    .leftJoin('flights as f', 'ut.flight_id', 'f.id')
    .where('ut.trip_id', tripId)
    .catch(err => {
      console.error(err)
    })
}

// models/accommodation.js -----START-----
// accommodations[n]users prop


// accommodations[n]accommodation prop
const getAccommodationsByTripId = tripId => {

  return knex.select(
    // accommodations
    'a.id',
    'a.trip_id',
    'a.name',
    'a.address',
    'a.reference',
    'a.arrival',
    'a.departure',
    'a.phone'
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
    })
}
// models/accommodation.js ------END------


const getPlansByTripId = tripId => {

  return knex.select(
    'p.id',
    'p.description',
    'p.date',
    'p.link'
  )
    .from('plans as p')
    .where({ trip_id: tripId })
    .then(res => {
      // console.log('getPlansByTripId res: ', res)
      return res;
    })
}

async function getBudgetAndTransactionsByTripId(tripId) {
  const total = await getTotalBudgetByTripId(tripId);
  const transactions = await getTransactionsByTripId(tripId);
  return { total, transactions };
}

const getBudgetByTripId = (tripId) => {
  return knex
    .select(
      'b.trip_id as tripId',
      'b.available'
    )
    .from('budgets as b')
    .where({ trip_id: tripId })
    .first()
    .catch(err => {
      console.error(`[getBudgetByTripId] Error: ${err}`)
      return null
    })
}

const getTransactionsByTripId = (tripId) => {
  return knex
    .select(
      't.id',
      't.trip_id as tripId',
      't.description',
      't.amount',
  )
    .from('transactions as t')
    .where({ trip_id: tripId })
    .orderBy('id', 'desc')
    .catch(err => {
      console.error(`[getTransactionsByTripId] Error: ${err}`)
      return null
    })
}

/*========POST TRIP========== */

router.post('/trips', async (req, res, next) => {
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
<<<<<<< HEAD
  //console.log(newTripId);
  const insertUsersSuccess = await insertUserIntoTrip(userId, newTripId);
  //console.log(insertUsersSuccess);
=======
  const insertUsersSuccess = await insertUserIntoTrip(userId, newTripId);
>>>>>>> 217ac3c03e3305354943348a1d79f7bafc9354e7

  if (insertUsersSuccess) {
    res.status(201).json(newTripId);
  } else {
    res.status(500).json();
  };
})
/* ==== PUT/UPDATE TRIP ==== */
router.put('/trips/:id', (req, res, next) => {
  const tripId = req.params.id;
  const { name, destination, description, arrival, departure } = req.body;

  const editedTrip = {
    name,
    destination,
    description,
    arrival,
    departure,
  }

  const success = editTrip(tripId, editedTrip);

  if (success) {
    res.status(201).json(editedTrip);
  } else {
    res.status(500).json();
  }
})

/* ========POST / INVITING USERS WITH SENDGRID ========= */

router.post('/trips/:id/group', (req, res, next) => {
  const { id } = req.params;
  const { emails } = req.body;
  const tripId = id;
  sgMail.setApiKey(SENDGRID_API_KEY)

  fs.readFile('./templates/email/invite-template-compiled.html', 'utf8', function (err,data) {
    let template = data;
    emails.forEach (async(email) => {
      const userId = await findEmailInDB(email);
      const destination = await getDestination(id);
      const arrival = await getArrival(id);
      const unregisteredMsg = {
        to: email,
        from: 'tripWe@tripwe.com',
        subject: 'Become a member!',
        html: template.replace(/{{tripId}}/g, id)
                      .replace(/{{destination}}/g, destination)
                      .replace(/{{arrival}}/g, arrival)
      };
      const msg = {
        to: email,
        from: 'tripWe@tripwe.com',
        subject: 'You are invited!',
        html: template.replace(/{{tripId}}/g, id)
                      .replace(/{{destination}}/g, destination)
                      .replace(/{{arrival}}/g, arrival)
      };
      if (userId === false) {
        sgMail.send(unregisteredMsg);
        const invite = await addTripInvites(email, id)
        //console.log("added to invite", invite);
        res.json(invite).status(201);
      } else {
        const insertUser = await insertUserIntoTrip(userId, tripId);
        sgMail.send(msg);
        res.json().status(201);
      };
    });
  });
});
/*=========DELETE TRIP============ */
router.delete('/trips/:id', (req, res, next) => {
  const tripId = req.params.id;

  const success = deleteTripById(tripId);

  if (success) {
    res.status(204).json();
  } else {
    res.status(500).json();
  }
});

//we should cascade and then delete and reseed

module.exports = {
  tripsRouter: router,
  getTripById,
  insertUserIntoTrip,
  addTripInvites
}

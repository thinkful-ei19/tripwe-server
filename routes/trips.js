'use strict';

const express = require('express');
const router = express.Router();
const { knex } = require('../db-knex');
const { getUserId } = require('../utils/getUserId');
const util = require('util');
const inspect = data => util.inspect(data, { depth: null });
const { getTotalBudgetByTripId } = require('../models/budget')
const { editTrip, insertNewTrip, insertUserIntoTrip, deleteTripById } = require('../models/trip');
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
    .then(res => {
      return res;
    })
}

const getUsersByTripId = tripId => {

  return knex.select(
    // users
    'u.id',
    'u.fullname',
    'u.email',
    'u.username',
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
    })
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
  console.log('getTotalBudgetByTripId: ', getTotalBudgetByTripId && getTotalBudgetByTripId.toString())
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
  const insertUsersSuccess = await insertUserIntoTrip(userId, newTripId);

  if (insertUsersSuccess) {
    res.status(201).json();
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
const findEmailInDB = email => {
  return knex('users')
    .select('id')
    .where({email})
    .then(([id]) => {
      return id.id
    })
    .catch(err => { console.log(err, 'findemail error'); });
}

router.post('/trips/:id/group', (req, res, next) => {
  const { id } = req.params;
  const { emails } = req.body;
  const tripId = id;
  console.log(emails);
  sgMail.setApiKey(SENDGRID_API_KEY)

  const template = fs.readFile('./templates/email/invite-template.html', 'utf8', function (err,data) {
    if (err) {
      return console.log(err);
    }
    res.status(201);
  });

  emails.forEach (async(email) => {
    console.log(email, 'email being passed');
    const userId = await findEmailInDB(email);
    console.log(userId);
    const unregisteredMsg = {
      to: email,
      from: 'tripWe@tripwe.com',
      subject: 'Become a member!',
      text: `Register at <a href="/users/?tripId=${id}">`,
      html: '<strong>TripWe Registration Page</strong>',
    };
    const msg = {
      to: email,
      from: 'tripWe@tripwe.com',
      subject: 'You are invited!',
      text: `View the trip at tripwe.com/trips/${id}`,
      html: template,
    };

    if (findEmailInDB !== undefined) {
      const insertUser = await insertUserIntoTrip(userId, tripId);
      sgMail.send(msg);
      res.json(msg).status(201);
    } else {
      sgMail.send(unregisteredMsg);
      res.json(unregisteredMsg).status(201);
    };
  });

  //fs.readFile('./templates/email/invite-template', 'utf8', err => console.log(err)));


  //fs.readFile('./templates/email/invite-template', 'utf8', err => console.log(err)));


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
})

//we should cascade and then delete and reseed

module.exports = {
  tripsRouter: router,
  getTripById,
  insertUserIntoTrip
}

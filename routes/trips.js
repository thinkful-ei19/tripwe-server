'use strict';

const express = require('express');
const router = express.Router();
const { knex } = require('../db-knex');
const { getUserId } = require('../utils/getUserId');
const util = require('util');
const inspect = data => util.inspect(data, { depth: null });
const sgMail = require('@sendgrid/mail');
const { SENDGRID_API_KEY } = require('../config');
const fs = require('fs')
const filename =  'invite-template.html'


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
      console.log('getTripsById res:', res)
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
const getUsersByAccommodationId = accommodationId => {

  return knex.select(
    // users
    'u.id',
    'u.fullname',
    'u.email',
    'u.username'
  )

    .from('accommodations_users as au')
    .leftJoin('users as u', 'au.user_id', 'u.id')
    .where({ accommodation_id: accommodationId })
    .then(res => {
      // console.log('getGroupByTripId res: ', res)
      return res; // array of accommodation object
    })
    .catch(err => {
      console.error(err)
    })
}

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
  const trip = await getBudgetByTripId(tripId);
  const transactions = await getTransactionsByTripId(tripId);
  return { ...trip, transactions };
}

const getBudgetByTripId = (tripId) => {
  return knex
    .select(
      'b.trip_id as tripId',
      'b.available'
    )
    .from('budgets as b')
    .where({ trip_id: tripId })
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

const insertNewTrip = newTrip => {

  return knex.insert(newTrip)
    .into('trips')
    .returning('id')
    .then(([id]) => id);
}
const insertUserIntoTrip = (userId, newTripId) => {

  return knex.insert({ user_id: userId, trip_id: newTripId })
    .into('users_trips')
    .then(() => true)
    .catch(e => {
      console.error('insertFlight error: ', e)
      return false
    })
}

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

/* ========POST / INVITING USERS WITH SENDGRID ========= */
const findEmailInDB = email => {
  knex.select(
    'u.id',
    'u.fullname',
    'u.email',
    'u.username'
  )
    .from('users as u')
    .where('email', email)
    .returning('id')
    .then(([id]) => (id));
}

router.post('/trips/:id/group', (req, res, next) => {
  const { id } = req.params;
  const { email } = req.body;
  const tripId = id;
  const userId = findEmailInDB(email);
  const insertUser = insertUserIntoTrip(userId, tripId);

  //insert into users into users_trips select will happen
  //
  sgMail.setApiKey(SENDGRID_API_KEY)
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
    text: `View the trip at  <a href="/trips/${id}">`,
    html: `<strong>TripWe Join Trip <a href="/trips/${id}"></strong>`,
  };
  //fs.readFile('./templates/email/invite-template', 'utf8').then(email => console.log(email));
  if (findEmailInDB) {
    sgMail.send(msg);
    res.json(msg).status(201);
  } else {
    sgMail.send(unregisteredMsg);
    res.json(unregisteredMsg).status(201);
  };

});
//if theres a trip id be sure its included in req

/*=========DELETE TRIP============ */
router.delete('/trips/:id', (req, res, next) => {
  const userId = getUserId(req);
  const tripId = req.params.id;
  knex.select('trips')
    .where('id', tripId)
    .andWhere('trips.user_id', userId)
    .del()
    .from('trips')
    .then(res => {
      if (res) {
        res.status(204).end();
      } else {
        next();
      }
    })
    .catch(next);
})

//we should cascade and then delete and reseed 




module.exports = {
  tripsRouter: router,
  getTripById,
  insertUserIntoTrip
}

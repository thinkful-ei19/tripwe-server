'use strict';

const express = require('express');
const router = express.Router();
const { knex } = require('../db-knex');
const { getUserId } = require('../utils/getUserId');
const util = require('util');
const inspect = data => util.inspect(data, { depth: null });
const { getTotalBudgetByTripId } = require('../models/budget')
const { editTrip, insertNewTrip, insertUserIntoTrip, deleteTripById, getUsersByAccommodationId } = require('../models/trip');
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
    'f.latitude',
    'f.longitude',
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
  console.log(newTripId);
  const insertUsersSuccess = await insertUserIntoTrip(userId, newTripId);
  console.log(insertUsersSuccess);

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
const findEmailInDB = email => {
  return knex('users')
    .select('id')
    .where({email})
    .then(res => {
     if(res.length > 0){
       return res[0].id;
     } else {
       return false;
     }
    })
    .catch(err => { console.log(err, 'findemail error'); });
}
const getDestination = id => {
  return knex.select('destination')
    .from('trips')
    .where({id})
    .then(res => {
      return res[0].destination;
    })
    .catch(err => { console.log(err, 'getDestination error'); });
}

router.post('/trips/:id/group', (req, res, next) => {
  const { id } = req.params;
  const { emails } = req.body;
  const tripId = id;
  console.log(emails);
  sgMail.setApiKey(SENDGRID_API_KEY)
  
  fs.readFile('./templates/email/invite-template-compiled.html', 'utf8', function (err,data) {
    let template = data;
    emails.forEach (async(email) => {
      console.log(email, 'email being passed');
      const userId = await findEmailInDB(email);
      console.log(userId);
      const destination = await getDestination(id);
      console.log(destination, 'this is destination');
      const unregisteredMsg = {
        to: email,
        from: 'tripWe@tripwe.com',
        subject: 'Become a member!',
        html: template.replace(/{{tripId}}/g, id).replace(/{{destination}}/g, destination)
      };
      const msg = {
        to: email,
        from: 'tripWe@tripwe.com',
        subject: 'You are invited!',
        html: template.replace(/{{tripId}}/g, id).replace(/{{destination}}/g, destination)
      };
      if (userId === false) {
        sgMail.send(unregisteredMsg);
        res.json().status(201);
      } else {
        const insertUser = await insertUserIntoTrip(userId, tripId);
        sgMail.send(msg);
        res.json().status(201);
      };
    });
  });
    //what to do with users that dont have accounts but want to show them in the group
    //play with status 
//if theres a trip id be sure its included in req

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
});

//we should cascade and then delete and reseed

module.exports = {
  tripsRouter: router,
  getTripById,
  insertUserIntoTrip
}
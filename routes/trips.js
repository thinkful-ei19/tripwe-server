'use strict';

const express = require('express');
const router = express.Router();
const { knex } = require('../db-knex');
const { getUserId } = require('../utils/getUserId');
const util = require('util');
const inspect = data => util.inspect(data, { depth: null });
const { getPlansByTripId } = require('../models/plans')
const { getBudgetAndTransactionsByTripId } = require('../models/budget')
const { getAccommodationsByTripId } = require('../models/accommodation')
const {
  editTrip,
  insertNewTrip,
  insertUserIntoTrip,
  deleteTripById,
  findEmailInDB,
  getDestination,
  getArrival,
  addTripInvites,
  getFullname,
  getUsername,
  getInvitedUsers,
  getUsersByTripId,
  getTripInfoById
  } = require('../models/trip');
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
  const invites = await getInvitedUsers(tripId);
  const accommodations = await getAccommodationsByTripId(tripId);
  const plans = await getPlansByTripId(tripId);
  const budget = await getBudgetAndTransactionsByTripId(tripId);
  return { trip, group: [...group, ...invites], accommodations, plans, budget }
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
  //const userId = getUserId(req);
  sgMail.setApiKey(SENDGRID_API_KEY)

  fs.readFile('./templates/email/invite-template-compiled.html', 'utf8', function (err,data) {
    let template = data;
    emails.forEach (async(email) => {
      const userId = await findEmailInDB(email);
      const destination = await getDestination(id);
      const arrival = await getArrival(id);
      const fullname = await getFullname(userId);
      const unregisteredMsg = {
        to: email,
        from: 'tripWe@tripwe.com',
        subject: 'Become a member!',
        html: template.replace(/{{tripId}}/g, id)
                      .replace(/{{destination}}/g, destination)
                      .replace(/{{arrival}}/g, arrival)
                      .replace(/{{fullname}}/g, fullname)
      };
      const msg = {
        to: email,
        from: 'tripWe@tripwe.com',
        subject: 'You are invited!',
        html: template.replace(/{{tripId}}/g, id)
                      .replace(/{{destination}}/g, destination)
                      .replace(/{{arrival}}/g, arrival)
                      .replace(/{{fullname}}/g, fullname)
      };
      if (userId === false) {
        sgMail.send(unregisteredMsg);
        const invite = await addTripInvites(email, id)
        //this res.json return email of unregistered user
        res.json(invite).status(201);
      } else {
        const insertUser = await insertUserIntoTrip(userId, tripId);
        const addedUser = await getUsername(userId);
        sgMail.send(msg);
        res.json(addedUser).status(201);
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

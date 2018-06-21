'use strict';

const express = require('express');
const router = express.Router();
const { knex } = require('../db-knex');
const { getUserId } = require('../utils/getUserId');
const util = require('util');

const insertNewAccommodation = NewAccommodation => {
  console.log(NewAccommodation, 'insert info');
  return knex.insert(NewAccommodation)
    .into('accommodations')
    .returning('id')
    .then(([id]) => id)
    .catch(e => {
      console.log('insertNewAccommodation:', e)
    })
}
const insertUserIntoAccommodation = (userId, id, accommodationId) => {
  // console.log(userId);
  // console.log(accommodationId);
  return knex.insert({
    user_id: userId,
    trip_id: id,
    accommodation_id: accommodationId,
  }).into("accommodations_users")
    .then(() => true)
    .catch(e => {
      console.error('insertUserNewAccomodation error: ', e)
      return false
    })
}
router.post('/trips/:id/accommodations', async (req, res, next) => {
  const userId = getUserId(req);
  //getUserId(req);
  const { id } = req.params;

  const { name, address, reference, arrival, departure, phone } = req.body;

  const newAccommodation = {
    trip_id: id,
    name,
    address,
    reference,
    arrival,
    departure,
    phone
  };
  //console.log(newAccommodation, 'newAccommodation')
  const NewAccommodationId = await insertNewAccommodation(newAccommodation);
  console.log(NewAccommodationId, 'NewAccommodationId')
  const success = await insertUserIntoAccommodation(userId, id, NewAccommodationId)

  if (success) {
    res.status(201).json();
  } else {
    res.status(500).json();
  }
});

// router.put('/accommodations/:id', (req, res, next) => {
//
//
//   const userId = getUserId(req);
//   const accommodationId = req.params.id;
//   const { hotel, address, arrival, departure, phone } = req.body;
//
//   const updatedAccommodation = {
//     user_id: userId,
//     hotel: hotel,
//     address: address,
//     arrival: arrival,
//     departure: departure,
//     phone: phone,
//   };
//
//   knex('accommodation.id').from('accommodations')
//     .where('accommodation.id', accommodationId)
//     .andWhere('baccommodation.user_id', userId)
//     .then(result => {
//       if (result && result.length > 0) {
//         knex('accommodations')
//           .update(updatedAccommodation)
//           .where('id', accommodationId)
//           .then(() => {
//             return knex.select('a.id', 'a.user_id', 'u.fullname', 'ua.status', 'a.hotel', 'a.address', 'a.arrival', 'a.departure', 'a.phone')
//               .from('accommodations')
//               .leftJoin('users', 'accommodation.user_id', 'users.id')
//               .where('accommodation.id', accommodationId)
//               .andWhere('accommodation.user_id', userId)
//               .first()
//               .then(result => {
//                 if (result) {
//                   res.json(result);
//                 }
//               });
//           });
//       } else {
//         next();
//       }
//     })
//     .catch(err => {
//       next(err);
//     });
//
// });

module.exports = router;

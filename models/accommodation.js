'use strict';

const express = require('express');
const router = express.Router();
const { dbGet } = require('../db-knex');
const { getUserId } = require('../utils/getUserId');


router.get('/accommodations', (req, res, next) => {
  const knex = dbGet();
  const userId = getUserId(req);

  knex.select('a.id', 'a.user_id', 'u.fullname', 'ua.status', 'a.hotel', 'a.address', 'a.arrival', 'a.departure', 'a.phone')
    .from('users_accommodations as ua')

    .leftJoin('users as u', 'ua.user_id', 'u.id')
    .leftJoin('accommodations as a', 'ua.trip_id', 'a.id')
    .then(results => {
      console.log(res.json(results));
    })
    .catch(err => {
      next(err);
    });
});
router.post('/accommodations', (req, res, next) => {
  const knex = dbGet();
  const userId = getUserId(req);
  const { hotel, address, arrival, departure, phone } = req.body;

  const requiredFields = ['hotel', 'address'];
  const missingField = requiredFields.find(field => !(field in req.body));

  if (missingField) {
    const err = new Error(`Missing '${missingField}' in request body`);
    err.status = 422;
    return next(err);
  }

  const newAccommodation = {
    user_id: userId,
    hotel: hotel,
    address: address,
    arrival: arrival,
    departure: departure,
    phone: phone,
  };

  let accommodationId;

  knex.insert(newAccommodation)
    .into('accommodations')
    .returning('id')
    .then(([id]) => {
      accommodationId = id;
    })
    .then(() => {
      return knex.select('a.id', 'a.user_id', 'u.fullname', 'ua.status', 'a.hotel', 'a.address', 'a.arrival', 'a.departure', 'a.phone')
        .from('accommodations')
        .leftJoin('users', 'accommodation.user_id', 'users.id')
        .where('accommodation.id', accommodationId)
        .andWhere('accommodation.user_id', userId)
        .first();
    })
    .then(result => {
      if (result) {
        res.location(`${req.originalUrl}/${accommodationId}`).status(201).json(result);
      } else {
        next();
      }
    })
    .catch(err => {
      next(err);
    });
});

router.put('/accommodations/:id', (req, res, next) => {

  const knex = dbGet();
  const userId = getUserId(req);
  const accommodationId = req.params.id;
  const { hotel, address, arrival, departure, phone } = req.body;

  const updatedAccommodation = {
    user_id: userId,
    hotel: hotel,
    address: address,
    arrival: arrival,
    departure: departure,
    phone: phone,
  };

  knex('accommodation.id').from('accommodations')
    .where('accommodation.id', accommodationId)
    .andWhere('baccommodation.user_id', userId)
    .then(result => {
      if (result && result.length > 0) {
        knex('accommodations')
          .update(updatedAccommodation)
          .where('id', accommodationId)
          .then(() => {
            return knex.select('a.id', 'a.user_id', 'u.fullname', 'ua.status', 'a.hotel', 'a.address', 'a.arrival', 'a.departure', 'a.phone')
              .from('accommodations')
              .leftJoin('users', 'accommodation.user_id', 'users.id')
              .where('accommodation.id', accommodationId)
              .andWhere('accommodation.user_id', userId)
              .first()
              .then(result => {
                if (result) {
                  res.json(result);
                }
              });
          });
      } else {
        next();
      }
    })
    .catch(err => {
      next(err);
    });

});



module.exports = router;
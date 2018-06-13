'use strict';

const express = require('express');
const router = express.Router();
const {dbGet} = require('../db-knex');
const { getUserId } = require('../utils/getUserId');

router.get('/trips', (req, res, next)=> {
  const knex = dbGet();
  const userId = getUserId(req);
  //select intermidiary 
  knex.select('t.id', 't.user_id', 'u.fullname','ut.status', 't.name', 't.destination', 't.description', 't.arrival', 't.departure')
    .from('users_trips as ut')
    //join trips
    //join users
    .leftJoin('users as u', 'ut.user_id', 'u.id')
    .leftJoin('trips as t', 'ut.trip_id', 't.id')
    .then(results => {
      console.log(res.json(results));
    })
    .catch(err => {
      next(err);
    });
});
module.exports = router;
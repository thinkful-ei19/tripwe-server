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
router.get('/dashboard', (req, res, next) => {
  const knex = dbGet();
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
  .from('trips as t')
  .where({ user_id: 1 })
  .then(result => {
    console.log("dashboard result: ", result);
    res.json(result)
  })
  .catch(err => {
      console.error("[trips] Error caught!", inspect(e), inspect(e.stack))
      next(err);
  });
});
// router.get('/dashboard', (req, res, next) => {
//   const knex = dbGet();

//   const userId = getUserId(req);
//   const query =  knex.select(
//     't.id',
//     't.user_id',
//     't.name',
//     't.destination',
//     't.description',
//     't.arrival',
//     't.departure'
//   )
//   .from('trips as t')
//   .where({ user_id: userId })
//   console.log('SQL knex query:', query.toString())
//   .then(result => {
//     console.log("dashboard result: ", result);
//     res.json(result)
//   })
//   .catch(err => {
//       console.error("[trips] Error caught!", inspect(e), inspect(e.stack))
//       next(err);
//   });
// });
module.exports = router;
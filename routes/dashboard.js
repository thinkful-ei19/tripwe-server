'use strict';

const express = require('express');
const router = express.Router();
const {dbGet} = require('../db-knex');
const util = require('util');
const inspect = data => util.inspect(data, { depth: null });

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
  .where({ user_id: userId })
  .then(result => {
    // console.log("dashboard result: ", result);
    res.json(result)
  })
  .catch(err => {
      console.error("[trips] Error caught!", inspect(e), inspect(e.stack))
      next(err);
  });
})

module.exports = router;

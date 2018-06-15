'use strict';

const express = require('express');
const router = express.Router();
const { knex } = require('../db-knex');
const { getUserId } = require('../utils/getUserId');

/* =====POST TO PLANS====== */

router.post('/trips/:id/plans', (req, res, next) => {
    const { id } = req.params;
    const userId = getUserId(req);
    const { date, description } = req.body;
    const newPlans = {
        trip_id: id,
        date,
        description
    }
    knex
        .insert(newPlans)
        .into('plans')
        .returning('id')
        .then(([id]) => id)
        .then(result => {
            res.json(result);
          })
          .catch(err => {
            next(err);
          });

});
module.exports = router;

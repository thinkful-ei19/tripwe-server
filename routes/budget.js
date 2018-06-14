'use strict';

const express = require('express');
const router = express.Router();
const {dbGet} = require('../db-knex');
const { getUserId } = require('../utils/getUserId');
const util = require('util');

router.post('/trips/:id/budget', async (req, res, next) => {
  const knex = dbGet();
  const { id } = req.params;

  const {
    totalBudget,
    currentSpending } = req.body;

  const newBudget = {
    trip_id: id,
    totalbudget: totalBudget,
    currentspending: currentSpending
  }

  knex.insert(newBudget)
    .into('budgets')
    .returning('id')
    .then(result => {
      if (result) {
        res.status(201).json();
      } else {
        next();
      }
    })
    .catch(err => {
      next(err);
    });

})

module.exports = router;

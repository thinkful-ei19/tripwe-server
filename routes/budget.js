'use strict';

const express = require('express');
const router = express.Router();
const { knex } = require('../db-knex');
const { getUserId } = require('../utils/getUserId');
const util = require('util');

router.post('/trips/:id/budgets', (req, res, next) => {
  const { id } = req.params;

  const { available } = req.body;

  const newBudget = {
    trip_id: id,
    available
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

router.post('/trips/:id/transactions', async (req, res, next) => {
  const { id } = req.params;

  const { description, amount, type } = req.body;

  const newTransaction = {
    trip_id: id,
    description,
    amount,
    type
  }

  try {
    await insertTransaction(newTransaction)
    await amendAmount(id, amount, type)
  } catch (e) {
    console.error('[/transactions] Error: ', e)
    return res.status(500).send()
  }

  res.status(200).json()
})

function insertTransaction(newTransaction) {
  return knex.insert(newTransaction)
    .into('transactions')
    .returning('id')
    .catch(err => {
      next(err);
    });
}

/**
 * transaction_type 0 - contribution (+)
 * transaction_type 1 - expense (-)
 */
function amendAmount(id, amount, type) {
  const operator = type === 0 ? '+' : '-'

  return knex.raw(`
    UPDATE BUDGETS
    SET AVAILABLE = AVAILABLE ${operator} ${amount}
    WHERE TRIP_ID = ${id}
  `)
  .catch(err => {
    next(err);
  });
}

module.exports = router;

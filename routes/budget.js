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
    .returning('available')
    .then(result => {
      if (result) {
        res.status(201).json(result);
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

  let updatedBudget;
  let transaction;
  try {
    transaction = await insertTransaction(newTransaction)
    updatedBudget = await amendAmount(id, amount, type)
  } catch (e) {
    console.error('[/transactions] Error: ', e)
    return res.status(500).send()
  }
    res.status(201).json({updatedBudget, transaction});
})

function insertTransaction(newTransaction) {
  return knex.insert(newTransaction)
    .into('transactions')
    .returning('id')
    .then(([res]) => knex('transactions').select().where({ id: res }))
    .catch(err => {
      console.log(err);
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
  .then(() => knex('budgets').select('available').where({ trip_id: id }))
  .catch(err => {
    next(err);
  });
}

module.exports = router;

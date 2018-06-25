'use strict';

const express = require('express');
const router = express.Router();
const { knex } = require('../db-knex');
const { getUserId } = require('../utils/getUserId');
const util = require('util');
const { insertTransaction, getTotalBudgetByTripId, deleteTransactionById } = require('../models/budget');

router.post('/trips/:id/transactions', async (req, res, next) => {
  const { id } = req.params;

  const { description, amount } = req.body;

  const newTransaction = {
    trip_id: id,
    description,
    amount
  }

  let updatedBudget;
  let transaction;
  try {
    transaction = await insertTransaction(newTransaction)
    updatedBudget = await getTotalBudgetByTripId(id)
  } catch (e) {
    return res.status(500).send()
  }
    res.status(201).json({ updatedBudget, transaction });
})
/* ===== DELETE BUDGETS BY ID ===== */
router.delete('/transactions/:id', (req, res, next) => {
    const transactionId = req.params.id;

    const success = deleteTransactionById(transactionId);

    if (success) {
        res.status(204).json();
    } else {
        res.status(500).json();
    }
})

module.exports = router;

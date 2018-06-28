const { knex } = require('../db-knex');

function insertTransaction(newTransaction) {
  return knex.insert(newTransaction)
    .into('transactions')
    .returning('id')
    .then(([res]) => knex('transactions').select().where({ id: res }))
    .catch(err => {
      console.log(err);
    });
}

async function getBudgetAndTransactionsByTripId(tripId) {
  const total = await getTotalBudgetByTripId(tripId);
  const transactions = await getTransactionsByTripId(tripId);
  return { total, transactions };
}

function getBudgetByTripId(tripId) {
  return knex
    .select(
      'b.trip_id as tripId',
      'b.available'
    )
    .from('budgets as b')
    .where({ trip_id: tripId })
    .first()
    .catch(err => {
      console.error(`[getBudgetByTripId] Error: ${err}`)
      return null
    })
}

function getTotalBudgetByTripId(tripId) {
  return knex('transactions')
    .sum('amount')
    .where({ trip_id: tripId })
    .first()
    .then(({ sum }) => sum)
    .catch(err => {
      console.error('[getTotalBudgetByTripId] Error: ', err);
    })
}

function getTransactionsByTripId(tripId) {
  return knex
    .select(
      't.id',
      't.trip_id as tripId',
      't.description',
      't.amount',
  )
    .from('transactions as t')
    .where({ trip_id: tripId })
    .orderBy('id', 'desc')
    .catch(err => {
      console.error(`[getTransactionsByTripId] Error: ${err}`)
      return null
    })
}

function deleteTransactionById(transactionId) {
    return knex('transactions')
        .where({id: transactionId}).del()
        .catch(err => console.error(`[deleteTransactionById] error: ${err}`))
}

module.exports = {
  getTotalBudgetByTripId,
  insertTransaction,
  deleteTransactionById,
  getTransactionsByTripId,
  getBudgetAndTransactionsByTripId
}

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

function deleteTransactionById(transactionId) {
    return knex('transactions')
        .where({id: transactionId}).del()
        .catch(err => console.error(`[deleteTransactionById] error: ${err}`))
}

module.exports = {
  getTotalBudgetByTripId,
  insertTransaction,
  deleteTransactionById
}

const { knex } = require('../db-knex');

function editPlanById(planId, updatedPlan) {
    return knex('plans')
        .update(updatedPlan)
        .where({ id: planId })
        .catch(err => console.error(`[editPlanById] error: ${err}`))
}

function deletePlanById(planId) {
    return knex('plans').where({ id: planId }).del()
        .catch(err => console.error(`[deleteplanbyid] error: ${err}`))
}

module.exports = {
  editPlanById,
  deletePlanById
}

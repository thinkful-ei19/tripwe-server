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
function insertPlan(newPlan){
   return knex.insert(newPlan)
    .into('plans')
    .returning('id')
    .then(([id]) => id)
    .catch(e => {
      console.error('insertPlan error: ', e)
    })
}
module.exports = {
  editPlanById,
  deletePlanById,
  insertPlan
}

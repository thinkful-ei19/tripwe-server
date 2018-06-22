const { knex } = require('../db-knex');

function editAccomodationById(accommodationId, updatedAccommodation) {
  console.log(updatedAccommodation, "ACC")
    return knex('accommodations')
        .update(updatedAccommodation)
        .where({ id: accommodationId })
        .then(() => true)
        .catch(err => {
            console.error(`[editAccomodationById] Error: ${err}`)
        })
}

function deleteAccomodationById(accommodationId) {
    return knex('accommodations')
        .where({ id: accommodationId })
        .del()
        .catch(err => {
            console.error(`[deleteAccomodationById] Error: ${err}`)
        })
}

function insertNewAccommodation(NewAccommodation) {
    return knex.insert(NewAccommodation)
        .into('accommodations')
        .returning('id')
        .then(([id]) => id)
        .catch(e => {
            console.error('insertNewAccommodation:', e)
        })
}
function insertUserIntoAccommodation(userId, accommodationId, id) {
    return knex.insert({
       user_id: userId,
       trip_id: id,
       accommodation_id: accommodationId,
    }).into("accommodations_users")
    .then(() => true)
    .catch(e => {
        console.error('insertUserIntoAccommodation error: ', e)
        return false
    })
}

module.exports = {
  editAccomodationById,
  deleteAccomodationById,
  insertNewAccommodation,
  insertUserIntoAccommodation
}

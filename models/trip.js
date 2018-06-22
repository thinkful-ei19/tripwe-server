const { knex } = require('../db-knex');

function editTrip(tripId, editedTrip) {
    return knex('trips').update(editedTrip).where({ id: tripId })
        .catch(err => console.error(`[editTrip] Error: ${err}`))
}

module.exports = {
  editTrip
}

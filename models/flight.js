const { knex } = require('../db-knex');

function editFlightById(flightId, updatedFlight){
    console.log(updatedFlight, "Flight")
    return knex('flights')
        .update(updatedFlight)
        .where({ id: flightId })
        .then(() => true)
        .catch(err => {
            console.error(`[editFlightById] Error: ${err}`)
        })
}
function deleteFlightById(flightId) {
    return knex('flights')
        .where({ id: flightId })
        .del()
        .catch(err => {
            console.error(`[deleteFlightById] Error: ${err}`)
        })
}
function insertFlight(newFlight){
    return knex.insert(newFlight)
      .into('flights')
      .returning('id')
      .then(([id]) => id)
      .catch(e => {
        console.error('insertFlight error: ', e)
      })
}
function insertFlightInTrips(tripId, userId, flightId){
    return knex.raw(`
      UPDATE USERS_TRIPS
      SET FLIGHT_ID = ${flightId}
      WHERE TRIP_ID = ${tripId}
      AND USER_ID = ${userId}
    `)
    .then(() => true)
    .catch(e => {
      console.error('insertFlight error: ', e)
      return false
    })
}
module.exports = {
    editFlightById,
    deleteFlightById,
    insertFlight,
    insertFlightInTrips
}

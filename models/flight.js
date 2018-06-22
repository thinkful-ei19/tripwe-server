const { knex } = require('../db-knex');

function editFlightById(flightId, updatedFlight){
    console.log(updatedFlight, "Flight")
    return knex('flights')
        .update(updatedFlight)
        .where({ id: flightId })
        .then(() => true)
        .catch(err => {
            console.error(``)
        })
}
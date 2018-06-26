'use strict';
const { knex } = require('../db-knex');

function editTrip(tripId, editedTrip) {
  return knex('trips').update(editedTrip).where({ id: tripId })
      .catch(err => console.error(`[editTrip] Error: ${err}`))
}
function insertNewTrip(newTrip){
  return knex.insert(newTrip)
    .into('trips')
    .returning('id')
    .then(([id]) => id)
    .catch(e => { 
      console.error('insertNewTrips error: ', e)
    })
}
function insertUserIntoTrip(userId, newTripId){
  return knex.insert({ user_id: userId, trip_id: newTripId })
    .into('users_trips')
    .then(() => true)
    .catch(e => {
      console.error('insertUserIntoTrips error: ', e)
      return false
    })
}
function deleteTripById(tripId) {
  return knex('trips')
      .where({ id: tripId })
      .del()
      .catch(err => {
          console.error(`[deleteTripById] Error: ${err}`)
      })
}
function getUsersByAccommodationId(accommodationId) {

  return knex.select(
    'u.id',
    'u.fullname',
    'u.email',
    'u.username'
  )

    .from('accommodations_users as au')
    .leftJoin('users as u', 'au.user_id', 'u.id')
    .where({ accommodation_id: accommodationId })
    .then(res => {
      // console.log('getGroupByTripId res: ', res)
      return res; // array of accommodation object
    })
    .catch(err => {
      console.error(err);
    });
}

module.exports = {
  editTrip,
  getUsersByAccommodationId,
  insertNewTrip,
  insertUserIntoTrip,
  deleteTripById
};

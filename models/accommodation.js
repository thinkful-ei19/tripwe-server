const { knex } = require('../db-knex');

function editAccomodationById(accommodationId, updatedAccommodation) {
    return knex('accommodations')
        .update(updatedAccommodation)
        .where({ id: accommodationId })
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

function response(accommodationId) {
  return knex('accommodations')
      .select()
      .where({ id: accommodationId })
}

function getAccommodationsByTripId(tripId) {

  return knex.select(
    // accommodations
    'a.id',
    'a.trip_id',
    'a.name',
    'a.address',
    'a.reference',
    'a.arrival',
    'a.departure',
    'a.phone'
  )
    .from('accommodations as a')
    .where({ trip_id: tripId })
    .then(accommodations => {
      // console.log('getaccommodationsByTripId res: ', accommodations)

      const promises = accommodations.map(async accom => {
        return {
          ...accom,
          users: await getUsersByAccommodationId(accom.id)
        }
      })

      return Promise.all(promises);
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
  editAccomodationById,
  deleteAccomodationById,
  insertNewAccommodation,
  insertUserIntoAccommodation,
  response,
  getAccommodationsByTripId,
  getUsersByAccommodationId
}

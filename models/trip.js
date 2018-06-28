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
function getUserEmail(userId){
  return knex.select('email')
    .from('users')
    .where({id: userId})
    .then(res => {
      console.log('getUserEmail res: ',res[0].email);
    })
    .catch(err => { console.log(err, 'getUserEmail error'); });

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
const findEmailInDB = email => {
  return knex('users')
    .select('id')
    .where({email})
    .then(res => {
     if(res.length > 0){
       return res[0].id;
     } else {
       return false;
     }
    })
    .catch(err => { console.log(err, 'findemail error'); });
}
const getDestination = id => {
  return knex.select('destination')
    .from('trips')
    .where({id})
    .then(res => {
      return res[0].destination;
    })
    .catch(err => { console.log(err, 'getDestination error'); });
}
const getArrival = id => {
  return knex.select('arrival')
    .from('trips')
    .where({id})
    .then(res => {
      return res[0].arrival.toDateString();
    })
    .catch(err => { console.log(err, 'getArrival error'); });
}
const addTripInvites = (email, id) => {
  return knex.insert({email, trip_id: id})
    .into('trip_invites')
    .returning('email')
    .then(([email]) =>{
      return email;
    })
    .catch(e => {
      console.error('insertNewTrips error: ', e)
    })
}
const findInvited = email => {
  return knex.select('trip_id')
    .from('trip_invites')  
    .where({email})
    .then(res => {
      console.log('find invited res', res[0].trip_id);
      return res[0].trip_id;
    })
    .catch(err => {
      console.error(`[findInvited] Error: ${err}`)
      return false;
    })
}
const delInvited = email => {
  return knex('trip_invites')
    .where({email})
    .del()
    .catch(err => {
      console.error(`[deleteInvited] Error: ${err}`)
    })
}


module.exports = {
  editTrip,
  getUsersByAccommodationId,
  insertNewTrip,
  insertUserIntoTrip,
  deleteTripById,
  getUserEmail,
  findEmailInDB,
  getDestination,
  getArrival,
  addTripInvites,
  findInvited,
  delInvited
};

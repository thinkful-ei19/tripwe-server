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
function getUsername(userId){
  return knex.select('username')
    .from('users')
    .where({id: userId})
    .then(res => {
      return res[0].username;
    })
    .catch(err => {
      console.log('getUsername error')
    });
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
const getFullname = userId => {
  return knex.select('fullname')
    .from('users')
    .where({id: userId})
    .then(res => {
      return res[0].fullname;
    })
    .catch(err => { console.log(err, 'getFullname error'); });

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


function getInvitedUsers(tripId) {
  return knex
  .select(
    'ti.email'
  )
  .from('trip_invites as ti')
  .where('ti.trip_id', tripId)
  .catch(err => {
    console.error(err)
  })
}

function getUsersByTripId(tripId) {

  return knex
  .select(
    // users
    'u.id as userId',
    'u.fullname',
    'u.email',
    'u.username',
    // Flights
    'f.id as flightId',
    'f.trip_id',
    'f.user_id',
    'f.incomingdeparturetime',
    'f.incomingarrivaltime',
    'f.incomingdepartureairport',
    'f.incomingarrivalairport',
    'f.incomingflightnum',
    'f.outgoingdeparturetime',
    'f.outgoingarrivaltime',
    'f.outgoingdepartureairport',
    'f.outgoingarrivalairport',
    'f.outgoingflightnum',
    'f.incomingdeparturelatitude',
    'f.incomingdeparturelongitude',
    'f.incomingarrivallatitude',
    'f.incomingarrivallongitude',
    // status
    'ut.status'
  )
    .from('users as u')
    .leftJoin('users_trips as ut', 'ut.user_id', 'u.id')
    .leftJoin('flights as f', 'ut.flight_id', 'f.id')
    .where('ut.trip_id', tripId)
    .catch(err => {
      console.error(err)
    })
}

function getTripInfoById(tripId) {

  return knex.select(
    't.id',
    't.user_id',
    't.name',
    't.destination',
    't.description',
    't.arrival',
    't.departure'
  )
    .from('trips as t')
    .where({ id: tripId })
    .first()
}

module.exports = {
  editTrip,
  insertNewTrip,
  insertUserIntoTrip,
  deleteTripById,
  getUserEmail,
  findEmailInDB,
  getDestination,
  getFullname,
  getArrival,
  addTripInvites,
  findInvited,
  delInvited,
  getInvitedUsers,
  getUsername,
  getUsersByTripId,
  getTripInfoById
};

'use strict';
const {app} = require('../index');
const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const { TEST_DATABASE_URL, JWT_SECRET } = require('../config');
const {dbConnect, dbDisconnect} = require('../db-knex');

const knex = require('../db-knex');

// describe('TripWe Login', function(){
//     let token;
//     const fullname = 'Example User';
//     const username = 'exampleUser'; 
//     const password = 'examplePass';
//     before(function() {
//         return knex.connect(TEST_DATABASE_URL)
//            .then(() => mongoose.connect.db.dropDatabase());
//     });
//     beforeEach(function() {
//         return User.insertMany(seedUsers);
//     });
    
//     afterEach(function () {
//         return mongoose.connection.db.dropDatabase();
//     });
//     after(function () {
//         return mongoose.disconnect();
//     });
// });

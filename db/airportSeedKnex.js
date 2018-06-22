const path = require('path');
const { readFileSync } = require('fs');
const { knex } = require('../db-knex');
const { DATABASE_URL } = require('../config');


const airportJsonPath = path.resolve(__dirname, '../data', 'airportData.json')
const airportJson = readFileSync(airportJsonPath, 'utf8');
const { airports } = JSON.parse(airportJson);
console.log(airports[0], airports.length)
console.log('inserting')
knex('airports').insert(airports).then(() => {
  console.log("DONE!")
})

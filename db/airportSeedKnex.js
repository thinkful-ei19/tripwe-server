const path = require('path');
const { readFileSync } = require('fs');
const { knex } = require('../db-knex');
const { DATABASE_URL } = require('../config');
const createKnex = require('knex');

const airportJsonPath = path.resolve(__dirname, '../data', 'airportData.json')
const airportJson = readFileSync(airportJsonPath, 'utf8');
const { airports } = JSON.parse(airportJson);

const knex = createKnex({
  client: 'pg',
  connection: DATABASE_URL
});

knex('airports').insert(airports)

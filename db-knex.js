'use strict';

const createKnex = require('knex');

const { DATABASE_URL, DB_PASSWORD, DB_USER, DB_NAME } = require('./config');

const knex = createKnex({
  client: 'pg',
  connection: {
    host: DATABASE_URL,
    password: DB_PASSWORD,
    user: DB_USER,
    database: DB_NAME
  }
});

function dbDisconnect() {
  return knex.destroy();
}

module.exports = {
  dbDisconnect,
  knex
};

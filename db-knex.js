'use strict';

const createKnex = require('knex');

const { DATABASE_URL } = require('./config');

const knex = createKnex({
  client: 'pg',
  connection: DATABASE_URL
});

function dbDisconnect() {
  return knex.destroy();
}

module.exports = {
  dbDisconnect,
  knex
};

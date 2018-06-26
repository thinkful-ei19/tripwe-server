'use strict';
require('dotenv').config()

module.exports = {
  PORT: process.env.PORT || 8080,
  CLIENT_ORIGIN: process.env.CLIENT_ORIGIN || 'http://localhost:3000',
  //   DATABASE_URL:
  //         process.env.DATABASE_URL || 'mongodb://localhost/thinkful-backend',
  //   TEST_DATABASE_URL:
  //         process.env.TEST_DATABASE_URL ||
  //         'mongodb://localhost/thinkful-backend-test',
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRY: process.env.JWT_EXPIRY || '7d',
  DATABASE_URL:
    process.env.DATABASE_URL || 'tripwe-c20-thinkful.cskmxujlqp7w.us-east-2.rds.amazonaws.com',
  DB_USER:
    process.env.DB_USER || '',
  DB_NAME:
    process.env.DB_NAME || '',
  DB_PASSWORD:
    process.env.DB_PASSWORD || '',
  TEST_DATABASE_URL:
    process.env.TEST_DATABASE_URL ||
    'postgres://localhost/thinkful-backend-test',
  SENDGRID_API_KEY: process.env.SENDGRID_API_KEY
};

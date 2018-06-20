'use strict';

module.exports = {
  PORT: process.env.PORT || 8080,
  CLIENT_ORIGIN: process.env.CLIENT_ORIGIN || 'http://localhost:3000',
//   DATABASE_URL:
//         process.env.DATABASE_URL || 'mongodb://localhost/thinkful-backend',
//   TEST_DATABASE_URL:
//         process.env.TEST_DATABASE_URL ||
//         'mongodb://localhost/thinkful-backend-test',
  JWT_SECRET: process.env.JWT_SECRET || 'trippie-redd',
  JWT_EXPIRY: process.env.JWT_EXPIRY || '7d',
  DATABASE_URL:
      process.env.DATABASE_URL || 'postgres://qhhyctqy:JrY0ktm5xUI6maYKUpwg0WkOV-a1XweP@horton.elephantsql.com:5432/qhhyctqy',
  TEST_DATABASE_URL:
      process.env.TEST_DATABASE_URL ||
      'postgres://localhost/thinkful-backend-test',
  SENDGRID_API_KEY: process.env.SENDGRID_API_KEY
};

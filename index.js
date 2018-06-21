'use strict';

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const passport = require('passport');
const localStrategy = require('./passport/local');
const jwtStrategy = require('./passport/jwt');
const { PORT, CLIENT_ORIGIN } = require('./config');
//const { dbConnect } = require('./db-mongoose');
const { knex } = require('./db-knex');
const authRouter = require('./routes/auth');
const usersRouter = require('./routes/users');
const dashboardRouter = require('./routes/dashboard');
const { tripsRouter } = require('./routes/trips');
const plansRouter = require('./routes/plans');
const flightsRouter = require('./routes/flights');
const budgetRouter = require('./routes/budget');
const accommodationsRouter = require('./routes/accommodations');
const airportsRouter = require('./routes/airports');
const app = express();

passport.use(localStrategy);
passport.use(jwtStrategy);
//utilize body parser
app.use(
  bodyParser.json()
);
app.use(
  morgan(process.env.NODE_ENV === 'production' ? 'common' : 'dev', {
    skip: (req, res) => process.env.NODE_ENV === 'test'
  })
);

app.use(
  cors({
    origin: CLIENT_ORIGIN
  })
);
app.use('/api', authRouter);
app.use('/api', usersRouter);
app.use('/api', airportsRouter);
app.get('/api', (req, res) => {
  console.log('Hello! Testing, Testing 123');
});
// Endpoints below this require authentication
app.use(passport.authenticate('jwt', { session: false, failWithError: true }));
app.use('/api', tripsRouter);
app.use('/api', plansRouter);
app.use('/api', flightsRouter);
app.use('/api', budgetRouter);
app.use('/api', dashboardRouter);
app.use('/api', accommodationsRouter);
function runServer(port = PORT) {
  const server = app
    .listen(port, () => {
      console.info(`App listening on port ${server.address().port}`);
    })
    .on('error', err => {
      console.error('Express failed to start');
      console.error(err);
    });
}

if (require.main === module) {
  runServer();
}

module.exports = { app };

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
const {dbConnect} = require('./db-knex');
const authRouter = require('./routes/auth');
const usersRouter = require('./routes/users');

const app = express();

passport.use(localStrategy);
passport.use(jwtStrategy);
//utilize body parser
app.use(
  bodyParser.json()
)
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
app.get('/api',(req, res)=> {
  console.log('Hello! Testing, Testing 123')
});
// Endpoints below this require authentication
app.use(passport.authenticate('jwt', { session: false, failWithError: true }));

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
  dbConnect();
  runServer();
}

module.exports = { app };

const express = require('express');
const { Client } = require('pg');
const passport = require('passport');
const session = require('cookie-session');
const helmet = require('helmet');
const compression = require('compression');

// routers
const tagsRouter = require('./routes/tags');
const regexesRouter = require('./routes/regexes');
const testStringRouter = require('./routes/testStrings');
const authRouter = require('./routes/gitHubAuth');

const app = express();
app.use(helmet());
app.use(compression());
app.use('/', (r, res, next) => {
  res.set({
    'Access-Control-Allow-Origin': process.env.APP_URL,
    'Access-Control-Allow-Headers':
      'Origin, X-Requested-With, Content-Type, Accept',
    'Access-Control-Allow-Credentials': true,
  });
  next();
});
app.use(express.json());
app.use(
  session({
    secret: process.env.EXPRESS_SESSION_KEYS,
    name: 'regexploreID',
    httpOnly: false,
    // the server and the client are to be deployed on different hosts
    sameSite: process.env.NODE_ENV !== 'test' && 'none',
    // if sameSite is set, the cookies need secure to be set too
    secure: process.env.NODE_ENV !== 'test' && true,
  })
);
app.use(passport.initialize());
app.use(passport.session());

const dbClient = new Client(process.env.DBKEY);
dbClient.connect();

if (process.env.NODE_ENV === 'test') {
  app.use('/db-test', require('./routes/db')(dbClient));
  app.use('/', require('./routes/localAuth')(dbClient));
}

app.use('/tags', tagsRouter(dbClient));
app.use('/regexes', regexesRouter(dbClient));
app.use('/test-strings', testStringRouter(dbClient));
app.use('/auth', authRouter(dbClient));

module.exports = { app };

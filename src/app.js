const express = require('express');
const { Client } = require('pg');
const passport = require('passport');
const session = require('cookie-session');

// routers
const tagsRouter = require('./routes/tags');
const regexesRouter = require('./routes/regexes');
const testStringRouter = require('./routes/testStrings');
const authRouter = require('./routes/gitHubAuth');

const app = express();
app.use(express.json());
app.use(session({ keys: JSON.parse(process.env.EXPRESS_SESSION_KEYS) }));
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

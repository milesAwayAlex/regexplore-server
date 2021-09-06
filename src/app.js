const express = require('express');
const { Client } = require('pg');
const passport = require('passport');
const session = require('cookie-session');

// routers
const dbTestRouter = require('./routes/db');
const localAuthRouter = require('./routes/localAuth');
const tagsRouter = require('./routes/tags');
const regexesRouter = require('./routes/regexes');
const testStringRouter = require('./routes/testStrings');

const app = express();
app.use(express.json());
app.use(session({ secret: process.env.EXPRESS_SESSION_SECRET }));
app.use(passport.initialize());
app.use(passport.session());

const dbClient = new Client(process.env.DBKEY);
dbClient.connect();

// TODO protect!
app.get('/', (req, res) => res.send('here be server..'));

// TODO protect!!!
app.use('/db-test', dbTestRouter(dbClient));

// TODO remove
app.use('/', localAuthRouter(dbClient));
app.use('/tags', tagsRouter(dbClient));
app.use('/regexes', regexesRouter(dbClient));
app.use('/test-strings', testStringRouter(dbClient));

module.exports = { app };

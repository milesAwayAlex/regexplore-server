const express = require('express');
const { Client } = require('pg');
require('dotenv').config();

// routers
const dbTestRouter = require('./routes/db');

const app = express();
const dbClient = new Client(process.env.DBKEY);
dbClient.connect();

app.get('/', (req, res) => res.send('here be server..'));

app.use('/db-test', dbTestRouter(dbClient));

module.exports = { app };

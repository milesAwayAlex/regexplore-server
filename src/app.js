const express = require('express');
const { Client } = require('pg');

// routers
const dbTestRouter = require('./routes/db');
const tagsRouter = require('./routes/tags');

const app = express();
app.use(express.json());

const dbClient = new Client(process.env.DBKEY);
dbClient.connect();

// TODO protect!
app.get('/', (req, res) => res.send('here be server..'));

// TODO protect!!!
app.use('/db-test', dbTestRouter(dbClient));

app.use('/tags', tagsRouter(dbClient));

module.exports = { app };

const express = require('express');
const { Client } = require('pg');
require('dotenv').config();

const app = express();
const dbClient = new Client(process.env.DBKEY);
dbClient.connect();

app.get('/', (req, res) => res.send('here be server..'));

// this is used for the db smoke test
app.get('/db-test', async (req, res) => {
  try {
    const { rows } = await dbClient.query('SELECT NOW() AS "time"');
    res.json(rows);
  } catch (e) {
    console.error(e);
  }
});

// this is used to wrap up the test suite
app.get('/db-disconnect', async (req, res) => {
  try {
    await dbClient.end();
    res.send('disconnected from the database');
  } catch (e) {
    console.error(e);
  }
});

module.exports = { app };

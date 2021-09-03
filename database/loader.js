require('dotenv').config();
const { Client } = require('pg');
const { readFile, readdir } = require('fs/promises');

const dbClient = new Client(process.env.DBKEY);
dbClient.connect();

const getQueries = (arr) =>
  Promise.all(arr.map((filename) => readFile(dir + '/' + filename, 'utf-8')));

const runQueries = (queries) =>
  Promise.all(queries.map((sql) => dbClient.query(sql)));

const dir = 'database/schema';

console.log('Running the schema files from', dir);

readdir(dir)
  .then((arr) => getQueries(arr))
  .then((queries) => runQueries(queries))
  .then(() => console.log('Finished'))
  .finally(() => dbClient.end());

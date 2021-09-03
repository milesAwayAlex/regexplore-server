require('dotenv').config();
const { Client } = require('pg');
const { readFile, readdir } = require('fs/promises');

const getQueries = (arr) =>
  Promise.all(
    arr.map((filename) => {
      console.log('Reading: ', filename);
      return readFile(dir + '/' + filename, 'utf-8');
    })
  );

const runQueries = (queries) =>
  Promise.all(queries.map((sql) => dbClient.query(sql)));

const dbClient = new Client(process.env.DBKEY);
const dir = 'database/schema';

console.log('Running the schema files from', dir);

Promise.all([dbClient.connect(), readdir(dir)])
  .then(([nothing, arr]) => getQueries(arr))
  .then((queries) => runQueries(queries))
  .then(() => console.log('Finished'))
  .finally(() => dbClient.end());

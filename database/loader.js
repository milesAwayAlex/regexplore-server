require('dotenv').config();
const { Client } = require('pg');
const { readFile, readdir } = require('fs/promises');

const getQueries = (arr, dir) =>
  Promise.all(
    arr.map((filename) => {
      console.log(`Reading ${dir}/${filename}`);
      return readFile(`${dir}/${filename}`, 'utf-8');
    })
  );

const runQueries = (queries) =>
  Promise.all(queries.map((sql) => dbClient.query(sql)));

const dbClient = new Client(process.env.DBKEY);
const schemaDir = 'database/schema';
const seedsDir = 'database/test-seeds';

console.log('Running the schema files from', schemaDir);

Promise.all([dbClient.connect(), readdir(schemaDir)])
  .then(([nothing, arr]) => getQueries(arr, schemaDir))
  .then((queries) => runQueries(queries))
  .then(() =>
    console.log('Finished with the schema, running the seeds from', seedsDir)
  )
  .then(() => readdir(seedsDir))
  .then((arr) => getQueries(arr, seedsDir))
  .then((queries) => runQueries(queries))
  .then(() => console.log('Finished with the seeds'))
  .finally(() => dbClient.end());

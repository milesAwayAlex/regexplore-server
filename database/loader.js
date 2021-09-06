require('dotenv').config();
const { Client } = require('pg');
const { readFile, readdir } = require('fs/promises');

/**
 * More info on the text search:
 * https://gist.github.com/milesAwayAlex/2b0ea6dc14e452a322afd8cdddd9fc56
 *
 */

const tsDriver = 'database/ts_driver.sql';
const schemaDir = 'database/schema';
const seedsDir = 'database/test-seeds';

const dbClient = new Client(process.env.DBKEY);

const getQueries = (...arr) =>
  Promise.all(
    arr.map((path) => {
      return readFile(path, 'utf-8');
    })
  );

const runQueries = (...queries) =>
  Promise.all(queries.map((sql) => dbClient.query(sql)));

console.log(`\nRunning the schema files from ${schemaDir}`);

Promise.all([dbClient.connect(), readdir(schemaDir)])
  .then(([, arr]) => arr.map((filename) => `${schemaDir}/${filename}`))
  .then((arr) => getQueries(...arr))
  .then((queries) => runQueries(...queries))
  .then(() => console.log(`Running the text search driver from ${tsDriver}`))
  .then(() => getQueries(tsDriver))
  .then((query) => runQueries(...query))
  .then(() => console.log(`Running the seeds from ${seedsDir}`))
  .then(() => readdir(seedsDir))
  .then((arr) => arr.map((filename) => `${seedsDir}/${filename}`))
  .then((arr) => getQueries(...arr))
  .then((queries) => runQueries(...queries))
  .then(() => console.log('All done\n'))
  .finally(() => dbClient.end());

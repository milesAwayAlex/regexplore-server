require('dotenv').config();
const { Client } = require('pg');
const { readFile, readdir } = require('fs/promises');

/**
 * More info on the text search:
 * https://gist.github.com/87002e84952936681c05d7e4b703cdec
 *
 */

const tsDriver = 'database/ts_driver.sql';
const schemaDir = 'database/schema';
const seedsDir = 'database/test-seeds';

const dbClient = new Client(process.env.DBKEY);

const getQueries = (...arr) =>
  Promise.all(
    arr.map((path) => {
      console.log('Reading from', path);
      return readFile(path, 'utf-8');
    })
  );

const runQueries = (...queries) =>
  Promise.all(queries.map((sql) => dbClient.query(sql)));

console.log(`\nRunning the schema files from ${schemaDir}\n`);

Promise.all([dbClient.connect(), readdir(schemaDir)])
  .then(([, arr]) => arr.map((filename) => `${schemaDir}/${filename}`))
  .then((arr) => getQueries(/* tsDriver, */ ...arr))
  .then((queries) => runQueries(...queries))
  .then(() => getQueries(tsDriver))
  .then((query) => runQueries(...query))
  .then(() =>
    console.log(
      `\nFinished with the schema, running the seeds from ${seedsDir}\n`
    )
  )
  .then(() => readdir(seedsDir))
  .then((arr) => arr.map((filename) => `${seedsDir}/${filename}`))
  .then((arr) => getQueries(...arr))
  .then((queries) => runQueries(...queries))
  .then(() => console.log('\nFinished with the seeds\n'))
  .finally(() => dbClient.end());

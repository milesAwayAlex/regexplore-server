const express = require('express');

const app = express();

app.get('/', (req, res) => res.send('Here be the Server'));

module.exports = { app };

require('dotenv').config();
const PORT = process.env.PORT;
const { app } = require('./src/app');

if (process.env.NODE_ENV === 'development') {
  app.use(require('morgan')('dev'));
}

app.listen(PORT);

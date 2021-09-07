const router = require('express').Router();

module.exports = (db) => {
  // this is used to wrap up the test suite
  router.get('/disconnect', async (req, res, next) => {
    try {
      await db.end();
      res.send('disconnected from the database');
    } catch (e) {
      next(e);
    }
  });
  return router;
};

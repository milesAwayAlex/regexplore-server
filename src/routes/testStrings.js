const router = require('express').Router();

module.exports = (db) => {
  router.post('/search', async ({ body }, res, next) => {
    try {
      const { id } = body;
      const { rows } = await db.query(
        `
      SELECT id,
        test_string,
        is_matching
      FROM test_strings
      WHERE regex_id = $1::INTEGER;          
        `,
        [id]
      );
      res.json({ rows });
    } catch (e) {
      next(e);
    }
  });

  return router;
};

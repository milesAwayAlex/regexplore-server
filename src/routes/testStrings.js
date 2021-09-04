const router = require('express').Router();

module.exports = (db) => {
  router.post('/search', async ({ body }, res, next) => {
    // const pageNum = (!!body.requestedPage && body.requestedPage - 1) || 0;
    const { id } = body;
    try {
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

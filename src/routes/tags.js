const router = require('express').Router();

module.exports = (db) => {
  router.get('/', async (r, res, next) => {
    try {
      const { rows } = await db.query(`
        SELECT id,
          tag_name
        FROM tags
        ORDER BY tag_name
        LIMIT 20;
        `);
      res.json(rows);
    } catch (e) {
      next(e);
    }
  });
  router.post('/search', async ({ body }, res, next) => {
    const { id, tsq } = body;
    try {
      if (!!id) {
        const { rows } = await db.query(
          `
        SELECT id,
          tag_name
        FROM tags
        WHERE id = $1;
      `,
          [body.id]
        );
        res.json(rows);
      }
    } catch (e) {
      next(e);
    }
  });

  return router;
};

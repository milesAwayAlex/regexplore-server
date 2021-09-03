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
          [id]
        );
        res.json(rows);
      } else {
        const { rows } = await db.query(
          `
        SELECT id,
          tag_name
        FROM tags
        WHERE tsv @@ websearch_to_tsquery('english', $1);
          `,
          [tsq]
        );
        res.json(rows);
      }
    } catch (e) {
      next(e);
    }
  });

  return router;
};

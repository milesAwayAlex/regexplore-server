const router = require('express').Router();

module.exports = (db) => {
  router.get('/', async (r, res, next) => {
    const limit = 20;
    try {
      const { rows } = await db.query(
        `
      SELECT tags.id,
        tags.tag_name,
        COUNT(regexes_tags.regex_id) AS popularity
      FROM tags
        LEFT JOIN regexes_tags ON tags.id = regexes_tags.tag_id
      GROUP BY tags.id
      ORDER BY COUNT(regexes_tags.regex_id) DESC,
        tags.id ASC
      LIMIT $1::INTEGER;
        `,
        [limit]
      );
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
        WHERE id = $1::INTEGER;
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
        WHERE tsv @@ websearch_to_tsquery('english', $1::TEXT);
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

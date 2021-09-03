const router = require('express').Router();

module.exports = (db) => {
  router.post('/', async ({ body }, res, next) => {
    const pageNum = (!!body.requestedPage && body.requestedPage - 1) || 0;
    const offset = 5;
    try {
      const [{ rows }, total] = await Promise.all([
        db.query(
          `
      SELECT regexes.id,
        user_id,
        title,
        notes,
        regex,
        fork_of,
        date_created,
        date_edited
      FROM regexes
      WHERE is_public IS TRUE
      ORDER BY id ASC
      LIMIT $1::INTEGER OFFSET $1::INTEGER * $2::INTEGER;
          `,
          [offset, pageNum]
        ),
        db.query(
          `
          SELECT COUNT(regexes.id) / $1::INTEGER AS total_pages
          FROM regexes
          WHERE is_public IS TRUE;
          `,
          [offset]
        ),
      ]);
      res.json({
        pageNum: pageNum + 1,
        regexes: rows,
        totalPages: Math.ceil(parseFloat(total.rows[0].total_pages)),
      });
    } catch (e) {
      next(e);
    }
  });

  return router;
};

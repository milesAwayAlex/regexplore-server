const router = require('express').Router();

module.exports = (db) => {
  router.post('/', async ({ body }, res, next) => {
    // can recieve 0, 1, 2, or 3 of these
    const { tags, tsq, requestedPage } = body;

    // set the query modules
    let tagsQuery =
      (!!tags && !!tags.length && `AND tags.id IN (${tags.join(', ')})`) || '';
    let sortingModule = 'ORDER BY regexes.date_created DESC';

    // the numbers used in the offset calculation
    const pageNum = (!!requestedPage && requestedPage - 1) || 0;
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
          date_edited,
          json_object_agg(COALESCE(tags.id, 0), tags.tag_name) AS tags
        FROM regexes
          LEFT JOIN regexes_tags ON regexes.id = regexes_tags.regex_id
          LEFT JOIN tags ON regexes_tags.tag_id = tags.id
        WHERE regexes.is_public IS TRUE
          ${tagsQuery}
        GROUP BY regexes.id
          ${sortingModule}
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

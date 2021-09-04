const router = require('express').Router();

module.exports = (db) => {
  router.post('/', async ({ body }, res, next) => {
    // can recieve 0, 1, 2, or 3 of these
    const { tags, tsq, requestedPage } = body;

    // the numbers used in the offset calculation
    const pageNum = (!!requestedPage && requestedPage - 1) || 0;
    const offset = 5;

    // start assembling the arguments array
    const queryArgs = [offset, pageNum];

    // set the query modules
    let tagsFilter = '';
    if (!!tags && !!tags.length) {
      // build a string of substitution tokens
      const tokens = tags
        .map((t) => {
          // update the arguments array
          queryArgs.push(t);
          return `$${queryArgs.length}::INTEGER`;
        })
        .join();
      tagsFilter = `AND tags.id IN (${tokens})`;
    }
    // TODO other ordering options?.
    let sortingModule = 'ORDER BY regexes.date_created DESC';
    if (!!tsq) {
      queryArgs.push(tsq);
      sortingModule = `
    ORDER BY ts_rank(
      weighted_tsv,
      to_tsquery('english', $${queryArgs.length}::TEXT)
    ) DESC
        `;
    }
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
          ${tagsFilter}
        GROUP BY regexes.id
          ${sortingModule}
        LIMIT $1::INTEGER OFFSET $1::INTEGER * $2::INTEGER;
          `,
          queryArgs
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

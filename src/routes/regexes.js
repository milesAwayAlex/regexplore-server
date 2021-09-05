const router = require('express').Router();

module.exports = (db) => {
  router.post('/', async ({ body }, res, next) => {
    // can recieve 0, 1, 2, or 3 of these
    const { tags, tsq, requestedPage } = body;

    // the numbers used in the offset calculation
    const pageNum = (!!requestedPage && requestedPage - 1) || 0;
    const offset = 5;

    // start assembling the arguments array
    const queryArgs = [];

    // set the query modules
    let filter = 'WHERE regexes.is_public IS TRUE\n';
    if (!!tags && !!tags.length) {
      // build a string of substitution tokens
      const tokens = tags
        .map((t) => {
          // update the arguments array
          queryArgs.push(t);
          return `$${queryArgs.length}::INTEGER`;
        })
        .join();
      filter += `AND regexes_tags.tag_id IN (${tokens})\n`;
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
      filter += `
    AND ts_rank(
      weighted_tsv,
      to_tsquery('english', $${queryArgs.length}::TEXT)
    ) > 0
      `;
    }
    try {
      const [{ rows }, total] = await Promise.all([
        db.query(
          `
        SELECT regexes.id,
          user_id,
          users.name AS user_name,
          title,
          notes,
          regex,
          fork_of,
          date_created,
          date_edited,
          json_agg(t.tag_obj) AS tags
        FROM regexes
          LEFT JOIN users ON users.id = regexes.user_id
          LEFT JOIN regexes_tags ON regexes.id = regexes_tags.regex_id
          LEFT JOIN tags ON regexes_tags.tag_id = tags.id
          LEFT JOIN (
            SELECT regexes_tags.regex_id,
              json_object_agg(COALESCE(tags.id, 0), tags.tag_name) AS tag_obj
            FROM regexes_tags
              JOIN tags ON regexes_tags.tag_id = tags.id
            GROUP BY regexes_tags.regex_id
          ) t ON t.regex_id = regexes.id
          ${filter}
        GROUP BY regexes.id,
          users.id
          ${sortingModule}
        LIMIT $${queryArgs.length + 1}::INTEGER OFFSET $${
            queryArgs.length + 1
          }::INTEGER * $${queryArgs.length + 2}::INTEGER;
          `,
          [...queryArgs, offset, pageNum]
        ),
        db.query(
          `
          SELECT sum(c.total_rows) AS num_rows
          FROM (
              SELECT COUNT(DISTINCT regexes.id) AS total_rows
              FROM regexes
                LEFT JOIN regexes_tags ON regexes.id = regexes_tags.regex_id
              ${filter}
              GROUP BY regexes.id
            ) c;
          `,
          queryArgs
        ),
      ]);
      const regexes = rows.map((regex) => ({
        ...regex,
        tags: regex.tags[0],
      }));
      res.json({
        pageNum: pageNum + 1,
        regexes,
        totalPages: Math.ceil(Number.parseInt(total.rows[0].num_rows) / offset),
      });
    } catch (e) {
      console.error(e);
      next(e);
    }
  });

  return router;
};

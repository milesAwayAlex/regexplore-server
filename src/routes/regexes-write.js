const router = require('express').Router();

module.exports = (db) => {
  router.post('/', async ({ body, user }, res, next) => {
    if (!user?.id) {
      return res.status(401).json({ error: 'User session not found' });
    }
    const { regexID, title, notes, regex, forkOf, testStr, tags } = body;
    const { id: userID } = user;

    let returnID, exists;

    // TODO write the tags logic

    try {
      if (!regexID) {
        const {
          rows: [{ id, is_public }],
        } = await db.query(
          `
        INSERT INTO regexes (user_id, title, notes, regex)
        VALUES (
            $1::INTEGER,
            $2::TEXT,
            $3::TEXT,
            $4::TEXT
          )
        RETURNING id,
          title,
          notes,
          regex,
          is_public;
        `,
          [userID, title, notes, regex]
        );
        const res = await db.query(
          `
        INSERT INTO test_strings (regex_id, test_string)
        VALUES ($1::INTEGER, $2::TEXT);
        `,
          [id, testStr]
        );
        [returnID, exists] = [id, is_public];
      }
      res.json({
        id: returnID,
        exists,
      });
    } catch (e) {
      next(e);
    }
  });

  return router;
};

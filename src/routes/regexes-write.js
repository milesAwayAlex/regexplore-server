const router = require('express').Router();

module.exports = (db) => {
  router.post('/', async ({ body, user }, res, next) => {
    if (!user?.id) {
      return res.status(401).json({ error: 'User session not found' });
    }
    const { regexID, title, notes, regex, forkOf, testStr } = body;
    const { id: userID } = user;

    // TODO write the tags logic

    try {
      if (!regexID) {
        const {
          rows: [{ id }],
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
          regex;
        `,
          [userID, title, notes, regex]
        );
        const {
          rows: [{ id: testStrID }],
        } = await db.query(
          `
        INSERT INTO test_strings (regex_id, test_string)
        VALUES ($1::INTEGER, $2::TEXT)
        RETURNING id;
        `,
          [id, testStr]
        );
        res.json({
          id,
          testStrID,
        });
      }
    } catch (e) {
      next(e);
    }
  });

  return router;
};

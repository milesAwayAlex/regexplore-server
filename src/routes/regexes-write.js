const router = require('express').Router();

module.exports = (db) => {
  router.post('/', async ({ body, user }, res, next) => {
    try {
      // access control
      if (!user?.id) {
        return res.status(401).json({ error: 'User session not found' });
      }
      const { regexID, title, notes, regex, forkOf, testStr, tags, remove } =
        body;
      const { id: userID } = user;

      let confirmedID = null;
      let newTitle = null;
      let exists = null;
      let tagsCreated = 0;
      let tagsAssociated = 0;

      // TODO regex editing logic - confirm regexID with the userID
      // if the regex should be edited - set confirmedID
      // edit or create regex conditionally on confirmedID
      // tags can be generated in parallel with the confirmation
      // update regexes, regexes_tags, and test_strings can run in parallel
      // insert into regexes has to run first to produce confirmedID
      // delete is update set is_public to false

      // tags come in two flavors: {id, tagName} and {tagName}
      // separate first
      const { existingTags = [], newTags = [] } = !!tags?.length
        ? tags.reduce(
            (a, { id, tagName }) => {
              if (!!Number.parseInt(id)) {
                a.existingTags.push(id);
              } else {
                a.newTags.push(tagName);
              }
              return a;
            },
            {
              existingTags: [],
              newTags: [],
            }
          )
        : {};

      // delete regex shortcuts
      if (!confirmedID && remove) {
        return res
          .status(403)
          .json({ error: 'Only the owner can delete the regex' });
      }
      if (confirmedID && remove) {
        await db.query(
          `DELETE FROM regexes
        WHERE id = $1::INTEGER;`,
          [confirmedID]
        );
        return res.json({ exits: false });
      }
      // bad request shortcut
      if (!title || !regex) {
        return res
          .status(400)
          .json({ error: 'A regex requires a title and a literal' });
      }

      // assemble the VALUES for tag generation
      const tagValuesStr = newTags?.map((n, i) => `($${i + 1}::TEXT)`)?.join();

      // generate the missing tags
      if (!!newTags?.length) {
        const { rows: newTagsArr } = await db.query(
          `
          INSERT INTO tags (tag_name)
          VALUES 
          ${tagValuesStr}
          ON CONFLICT (tag_name) DO NOTHING
          RETURNING id;
          `,
          [...newTags]
        );
        // add the new IDs to the existing tags
        existingTags.push(...newTagsArr.map(({ id }) => id));

        tagsCreated = newTagsArr.length;
      }
      // create the regex
      if (!confirmedID) {
        const {
          rows: [{ id, is_public, title: retTitle }],
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

        [confirmedID, exists, newTitle] = [id, is_public, retTitle];
      }

      // assemble the values for regexes_tags insertion
      const regexesTagsStr = existingTags
        ?.map((e, i) => `($1::INTEGER, $${i + 2}::INTEGER)`)
        ?.join();

      // remove the existing test string
      await db.query(
        `
      DELETE FROM test_strings
      WHERE regex_id = $1::INTEGER
      `,
        [confirmedID]
      );

      // insert into test_strings and regexes_tags
      const [r, { rows: newConnectionsArr = [] }] = await Promise.all([
        db.query(
          `
          INSERT INTO test_strings (regex_id, test_string)
          VALUES ($1::INTEGER, $2::TEXT);
            `,
          [confirmedID, testStr]
        ),
        // only create associations if there are tags to associate
        !!existingTags?.length &&
          db.query(
            `
          INSERT INTO regexes_tags (regex_id, tag_id)
          VALUES 
            ${regexesTagsStr}
          ON CONFLICT DO NOTHING
          RETURNING tag_id;
            `,
            [confirmedID, ...existingTags]
          ),
      ]);
      tagsAssociated = newConnectionsArr?.length;

      res.json({
        id: confirmedID,
        title: newTitle,
        exists,
        tagsCreated,
        tagsAssociated,
      });
    } catch (e) {
      next(e);
    }
  });

  return router;
};

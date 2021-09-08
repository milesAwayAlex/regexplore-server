const router = require('express').Router();

module.exports = (db) => {
  router.post('/', async ({ body, user }, res, next) => {
    try {
      // access control
      if (!user?.id) {
        return res.status(401).json({ error: 'User session not found' });
      }

      const { regexID, title, notes, regex, testStr, tags, remove } = body;
      const { id: userID } = user;

      let newTitle = null;
      let exists = null;

      // tags come in two flavors: {id, tagName} and {tagName}
      // separate for processing
      const { existingTags = [], newTags = [] } =
        !!tags?.length &&
        tags.reduce(
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
        );

      // assemble the values for tag generation
      const tagValuesStr = newTags?.map((n, i) => `($${i + 1}::TEXT)`)?.join();

      // confirm regexID/generate the missing tags
      const [{ rows: confirmIDRows = [] }, { rows: newTagsArr = [] }] =
        await Promise.all([
          // confirm regexID with the userID
          !!regexID &&
            db.query(
              `
        SELECT id
        FROM regexes
        WHERE id = $1::INTEGER
          AND user_id = $2::INTEGER
        `,
              [regexID, userID]
            ),
          // generate the missing tags
          !!newTags?.length &&
            db.query(
              `
        INSERT INTO tags (tag_name)
        VALUES 
        ${tagValuesStr}
        ON CONFLICT (tag_name) DO NOTHING
        RETURNING id, tag_name;
        `,
              [...newTags]
            ),
        ]);
      // if the regex should be edited - set confirmedID
      let confirmedID = confirmIDRows[0]?.id;
      // add the new IDs to the existing tags
      existingTags.push(...newTagsArr.map(({ id }) => id));

      // delete regex shortcuts
      if (remove) {
        if (confirmedID) {
          await db.query(
            `DELETE FROM regexes
            WHERE id = $1::INTEGER;`,
            [confirmedID]
          );
          return res.json({ exists: false });
        }
        return res
          .status(403)
          .json({ error: 'Only the owner can delete the regex' });
      }
      // bad request shortcut
      if (!title || !regex) {
        return res
          .status(400)
          .json({ error: 'A regex requires a title and a literal' });
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
          is_public;
        `,
          [userID, title, notes, regex]
        );

        [confirmedID, exists, newTitle] = [id, is_public, retTitle];
      } else {
        // or update the existing one and clear the test string
        const [
          {
            rows: [{ is_public, title: retTitle }],
          },
        ] = await Promise.all([
          // edit the regex
          db.query(
            `
          UPDATE regexes
          SET (title, notes, regex) = ($3::TEXT, $4::TEXT, $5::TEXT)
          WHERE id = $2::INTEGER
            AND user_id = $1::INTEGER
          RETURNING id,
            title,
            is_public
          `,
            [userID, regexID, title, notes, regex]
          ),
          // remove the existing test string
          db.query(
            `
          DELETE FROM test_strings
          WHERE regex_id = $1::INTEGER
          `,
            [confirmedID]
          ),
          // clear the existing connections (allows untagging regexes)
          db.query(
            `
          DELETE FROM regexes_tags
          WHERE regex_id = $1::INTEGER
            `,
            [confirmedID]
          ),
        ]);
        [exists, newTitle] = [is_public, retTitle];
      }

      // assemble the values for regexes_tags insertion
      const regexesTagsStr = existingTags
        ?.map((e, i) => `($1::INTEGER, $${i + 2}::INTEGER)`)
        ?.join();

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

      res.json({
        id: confirmedID,
        title: newTitle,
        exists,
        tagsCreated: newTagsArr?.length || 0,
        tagsAssociated: newConnectionsArr?.length || 0,
        newTags: newTagsArr.map(({ id, tag_name }) => ({
          id,
          tagName: tag_name,
        })),
      });
    } catch (e) {
      next(e);
    }
  });

  return router;
};

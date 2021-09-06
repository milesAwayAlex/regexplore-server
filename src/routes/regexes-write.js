const router = require('express').Router();

module.exports = (db) => {
  router.post('/', async ({ body, user }, res, next) => {
    // access control
    if (!user?.id) {
      return res.status(401).json({ error: 'User session not found' });
    }
    const { regexID, title, notes, regex, forkOf, testStr, tags } = body;
    const { id: userID } = user;

    // bad request shortcut
    if (!title || !regex) {
      return res
        .status(400)
        .json({ error: 'A regex requires a title and a literal' });
    }

    let returnID;
    let exists;
    let tagsCreated = 0;
    let tagsAssociated = 0;

    // TODO write the tags logic
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

    try {
      // generate the missing tags
      if (!!newTags?.length) {
        // assemble the VALUES for tag generation
        const tagValuesStr = newTags.map((n, i) => `($${i + 1}::TEXT)`).join();
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

        [returnID, exists] = [id, is_public];

        // assemble the VALUES for regexes_tags insertion

        const regexesTagsStr = existingTags
          .map(
            (id, i, arr) => `($${arr.length + 1}::INTEGER, $${i + 1}::INTEGER)`
          )
          .join();

        // insert into test_strings and regexes_tags
        const [r, { rows: newConnectionsArr = [] }] = await Promise.all([
          db.query(
            `
          INSERT INTO test_strings (regex_id, test_string)
          VALUES ($1::INTEGER, $2::TEXT);
            `,
            [id, testStr]
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
              [...existingTags, id]
            ),
        ]);
        tagsAssociated = newConnectionsArr?.length;
      }
      res.json({
        id: returnID,
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

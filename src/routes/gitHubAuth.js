const router = require('express').Router();
const passport = require('passport');
const { Strategy } = require('passport-github2');

module.exports = (db) => {
  passport.use(
    new Strategy(
      {
        clientID: process.env.GITHUB_OAUTH_CL_ID,
        clientSecret: process.env.GITHUB_OAUTH_CL_SECRET,
        callbackURL: process.env.GITHUB_OAUTH_CB,
        state: process.env.GITHUB_OAUTH_STATE,
      },
      async (aT, rT, { displayName, username, photos }, done) => {
        try {
          let { rows } = await db.query(
            `
          SELECT id,
            name
          FROM users
          WHERE email = $1::TEXT;
          `,
            [username]
          );
          if (!rows?.length) {
            // TODO create a user
            const { rows: newRows } = await db.query(
              `
            INSERT INTO users (name, email)
            VALUES ($1::TEXT, $2::TEXT)
            RETURNING id,
              name
                `,
              [displayName, username]
            );

            rows = newRows;
          }
          const { id, name } = rows[0];
          const avatarURL = photos?.[0]?.value;
          return done(null, { id, name, avatarURL });
        } catch (e) {
          return done(e);
        }
      }
    )
  );
  passport.serializeUser((u, done) => {
    done(null, u);
  });
  passport.deserializeUser((u, done) => {
    done(null, u);
  });
  router.get(
    '/github',
    passport.authenticate('github', { scope: ['read:user'] })
  );
  router.get(
    '/github/callback',
    passport.authenticate('github', { failureRedirect: process.env.APP_URL }),
    (r, res) => {
      res.redirect(process.env.APP_URL);
    }
  );
  router.get('/logout', (req, res) => {
    req.logout();
    req.session = null;
    res.redirect(process.env.APP_URL);
  });
  return router;
};

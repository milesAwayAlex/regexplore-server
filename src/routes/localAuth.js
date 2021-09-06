const router = require('express').Router();
const passport = require('passport');
const { LocalStrategy } = require('../localStrategy');
const { compare } = require('bcryptjs');

module.exports = (db) => {
  passport.use(
    new LocalStrategy(async (email, password, done) => {
      try {
        const { rows } = await db.query(
          `
        SELECT id,
          name,
          pass_hash
        FROM users
        WHERE email = $1::TEXT;
        `,
          [email]
        );
        if (!rows.length) {
          return done(null, false, { message: 'User Not Found' });
        }
        const { id, name, pass_hash } = rows[0];
        const passMatch = await compare(password, pass_hash);
        if (!passMatch) {
          return done(null, false, { message: 'Password issue' });
        }
        return done(null, { id, name });
      } catch (e) {
        return done(e);
      }
    })
  );
  passport.serializeUser((u, done) => done(null, u));
  passport.deserializeUser((u, done) => done(null, u));
  router.post('/login', passport.authenticate('local'), async (req, res) => {
    res.send('ok');
  });
  router.post('/protected', ({ user }, res) => {
    if (!user?.id) res.status(401).json({ error: 'session not found' });
    res.json(user);
  });
  router.post('/logout', (req, res) => {
    req.session = null;
    res.send('logged out');
  });
  return router;
};

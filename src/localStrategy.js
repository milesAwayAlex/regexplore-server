const { Strategy } = require('passport-strategy');

class LocalStrategy extends Strategy {
  constructor(cb) {
    super();
    if (typeof cb !== 'function') {
      throw new TypeError('Local Strategy requires a verify callback');
    }
    this.verify = cb;
    this.name = 'local';
  }
  authenticate(req, options) {
    const { username, password } = req.body;
    if (!username || !password) {
      return this.fail(
        { message: options.badRequestMessage || 'Missing credentials' },
        400
      );
    }
    const verified = (err, user, info) => {
      if (!!err) return this.error(err);
      if (!user) return this.fail(info);
      this.success(user);
    };
    try {
      this.verify(username, password, verified);
    } catch (e) {
      return this.error(e);
    }
  }
}

module.exports = { LocalStrategy };

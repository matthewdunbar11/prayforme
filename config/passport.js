const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const User = require('../app/models/user');
const config = require('../config/main');

// Setup work and export for the JWT passport strategy
module.exports = function(passport) {
  const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeader(),
    secretOrKey: config.secret
  };
  passport.use(new JwtStrategy(opts, function(jwt_payload, done) {
    const jwt_user_id = jwt_payload._doc._id
    User.findById(jwt_user_id, function(err, user) {
      if (err) {
        return done(err, false);
      }
      if (user) {
        done(null, user);
      } else {
        done(null, false);
      }
    });
  }));
};

const passport = require('passport');
const express = require('express');
const config = require('../config/main');
const jwt = require('jsonwebtoken');

var User = require('./models/user');

module.exports = function(app) {
  app.use(passport.initialize());
  require('../config/passport')(passport);

  var apiRoutes = express.Router();

  apiRoutes.post('/register', function(req, res) {
    if(!req.body.email || !req.body.password) {
      res.json({ success: false, message: 'Please enter email and password.'});
    }
    else {
      var newUser = new User({
        email: req.body.email,
        password: req.body.password
      });

      newUser.save(function(err) {
        if(err) {
          return res.json({ success: false, message: 'That email address already exists.'});
        }
        res.json({success: true, message: 'Successfully created new user.'});
      });
    }
  });

  apiRoutes.post('/authenticate', function(req, res) {
    User.findOne({
      email: req.body.email
    }, function(err, user) {
      if (err) throw err;

      if (!user) {
        res.send({ success: false, message: 'Authentication failed.' });
      }
      else {
        user.comparePassword(req.body.password, function(err, isMatch) {
          if(isMatch && !err) {
            var token = jwt.sign(user, config.secret, {
              expiresIn: 10080
            });
            res.json({ success: true, token: 'JWT ' + token });
          }
          else {
            res.send({ success: false, message: 'Authentication failed.' });
          }
        })
      }
    })
  });

  apiRoutes.get('/dashboard', passport.authenticate('jwt', { session: false }), function(req, res) {
    res.send('It worked! User id is: ' + req.user._id + '.');
  });

  app.use('/api', apiRoutes);
};

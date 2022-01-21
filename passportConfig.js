const LocalStrategy = require('passport-local').Strategy;
const { pool } = require('./dbConfig');
const bcrypt = require('bcrypt');

function initialize (passport) {
  const authenticateUser = (email, password, done) => {
    pool.query(
      `SELECT * FROM users WHERE email = $1`, 
      [],
      (err, results) => {
        if(err) {
          throw err;
        }
        console.log(results.rows);

        if(results.rows.length > 0) {
          const user = results.rows[0];
          bcrypt.compare(password, user.password, (err, isMatch) => {
            if(err) {
              throw err;
            }
            if(isMatch) {
              return done(null, user);
            } else {
              return done(null, false, {message: "Password is not correct"});
            }
          });
        } else {
          return done(null, false, {message: "Email is not  registered"});
        }
      }
    );
  }
  passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
  }), authenticateUser)
}
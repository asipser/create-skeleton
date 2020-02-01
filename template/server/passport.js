const passport = require("passport");
var GoogleStrategy = require("passport-google-oauth20");
var LocalStrategy = require("passport-local");

const User = require("./models/user");
const bcrypt = require("bcrypt");

function transformUser(jsonUser) {
  delete jsonUser.password;
}

{{#nosql}}
// gets user from DB, or makes a new account if it doesn't exist yet
function getOrCreateUser(profile) {
  // the "sub" field means "subject", which is a unique identifier for each user
  return User.findOne({ googleid: profile.id }).then(async (existingUser) => {
    if (existingUser) return existingUser.toJSON();
    const newUser = new User({
      firstName: profile.name.givenName,
      lastName: profile.name.familyName,
      googleid: profile.id,
    });

    return (await newUser.save()).toJSON();
  });
}{{/nosql}}
{{^nosql}}
function getOrCreateUser(profile) {
  return db
    .query("SELECT id, name, googleid FROM users WHERE googleid=$1", [profile.id])
    .then((result, err) => {
      if (err) {
        console.error("Error when selecting user on login", err);
        throw Error(err);
      }

      if (result.rows.length > 0) {
        return result.rows[0];
      } else {
        const insert = "INSERT INTO users(name, googleid) VALUES($1, $2) RETURNING *";
        const values = [profile.name, profile.id];
        return db.query(insert, values).then((res, err) => res.rows[0]);
      }
    });
}{{/nosql}}

// set up passport configs
passport.use(
  new GoogleStrategy(
    {
      clientID: "1023896289089-dmo7at78mmlrhto4u6e7ifhlt44rlait.apps.googleusercontent.com",
      clientSecret: "jEWQbBdvUZcHDWK6yasjEeiq",
      callbackURL: "/auth/google/callback",
    },
    function(accessToken, refreshToken, profile, done) {
      getOrCreateUser(profile)
        .then((userJson) => done(null, transformUser(userJson)))
        .catch(done);
    }
  )
);

passport.use(
  new LocalStrategy({ usernameField: "email", passwordField: "password" }, function(
    email,
    password,
    done
  ) {
    User.findOne({ email }, async function(err, user) {
      if (err) {
        return done(err);
      }
      if (!user) {
        return done(null, false);
      }
      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        return done(null, false);
      }

      return done(null, transformUser(user.toJSON()));
    });
  })
);

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, transformUser(user.toJSON()));
  });
});

module.exports = passport;

{{#auth}}
const passport = require("passport");
{{#auth.google}}
var GoogleStrategy = require("passport-google-oauth20");
{{/auth.google}}
{{#auth.local}}
var LocalStrategy = require("passport-local");
{{/auth.local}}

{{#nosql}}
const User = require("./models/user");
{{/nosql}}
{{^nosql}}
const db = require("./db");
{{/nosql}}
const bcrypt = require("bcrypt");

{{#auth.google}}
{{#nosql}}
// gets user from DB, or makes a new account if it doesn't exist yet
async function getOrCreateGoogleUser(profile) {
  // the "sub" field means "subject", which is a unique identifier for each user
  const existingUser = await User.findOne({ googleid: profile.id })
{{#auth.local}}
    .select("-password");
{{/auth.local}}
  if (existingUser) return existingUser.toJSON();
  const newUser = new User({
    firstName: profile.name.givenName,
    lastName: profile.name.familyName,
    googleid: profile.id,
  });
  return (await newUser.save()).toJSON();
}
{{/nosql}}
{{^nosql}}
function getOrCreateGoogleUser(profile) {
  return db
    .query("SELECT id, firstname, lastname, googleid FROM users WHERE googleid=$1", [profile.id])
    .then((result, err) => {
      if (err) {
        console.error("Error when selecting user on login", err);
        throw Error(err);
      }

      if (result.rows.length > 0) {
        return result.rows[0];
      } else {
        const insert = "INSERT INTO users(firstname, lastname, googleid) VALUES($1, $2, $3) RETURNING *";
        const values = [profile.name.givenName, profile.name.familyName, profile.id];
        return db.query(insert, values).then((res, err) => res.rows[0]);
      }
    });
}
{{/nosql}}

// set up passport configs
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.PASSPORT_GOOGLE_ID,
      clientSecret: process.env.PASSPORT_GOOGLE_SECRET,
      callbackURL: "/auth/google/callback",
    },
    function(accessToken, refreshToken, profile, done) {
      getOrCreateGoogleUser(profile)
        .then((userJson) => done(null, userJson))
        .catch(done);
    }
  )
);
{{/auth.google}}
{{#auth.local}}
{{#nosql}}
function getLocalUser(email) {
  return User.findOne({ email })
    .then(user => {
      if (user) return user.toJSON();
      return undefined;
    });
};
{{/nosql}}
{{^nosql}}
function getLocalUser(email) {
  return db
    .query("SELECT id, email, password FROM users WHERE email=$1", [email])
    .then((result, err) => {
      return result.rows.length > 0 ? result.rows[0] : undefined;
    });
}{{/nosql}}

passport.use(
  new LocalStrategy({ usernameField: "email", passwordField: "password" }, async function (
    email,
    password,
    done
  ) {
    const userJson = await getLocalUser(email);
    if (userJson) {
      const match = await bcrypt.compare(password, userJson.password);
      if (!match) {
        return done(null, false);
      }
      delete userJson.password;
      return done(null, userJson);
    }
    return done(null, false);
  })
);
{{/auth.local}}


passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
{{#nosql}}
  User.findById(id)
{{#auth.local}}
    .select("-password")
{{/auth.local}}
    .then(user => {
      done(null, user.toJSON());
    });
{{/nosql}}
{{^nosql}}
  db
    .query("SELECT id, email, googleid FROM users WHERE id=$1", [id])
    .then((result, err) => {
      done(err, result.rows[0]);
    });
{{/nosql}}
});

module.exports = passport;
{{/auth}}
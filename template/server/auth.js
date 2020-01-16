const { OAuth2Client } = require("google-auth-library");
const User = require("./models/user");
const socket = require("./server-socket");
const db = require("./db-pg");

// create a new OAuth client used to verify google sign-in
//    TODO: replace with your own CLIENT_ID
const CLIENT_ID = "121479668229-t5j82jrbi9oejh7c8avada226s75bopn.apps.googleusercontent.com";
const client = new OAuth2Client(CLIENT_ID);

// accepts a login token from the frontend, and verifies that it's legit
function verify(token) {
  return client
    .verifyIdToken({
      idToken: token,
      audience: CLIENT_ID,
    })
    .then((ticket) => ticket.getPayload());
}

{{#nosql}}
// gets user from DB, or makes a new account if it doesn't exist yet
function getOrCreateUser(user) {
  // the "sub" field means "subject", which is a unique identifier for each user
  return User.findOne({ googleid: user.sub }).then(async (existingUser) => {
    if (existingUser) return existingUser.toJSON();

    const newUser = new User({
      name: user.name,
      googleid: user.sub,
    });

    return (await newUser.save()).toJSON();
  });
}{{/nosql}}
{{^nosql}}
function getOrCreateUser(user) {
  return db
    .query("SELECT id, name, googleid FROM users WHERE googleid=$1", [user.sub])
    .then((result, err) => {
      if (err) {
        console.error("Error when selecting user on login", err);
        throw Error(err);
      }

      if (result.rows.length > 0) {
        return result.rows[0];
      } else {
        const insert = "INSERT INTO users(name, googleid) VALUES($1, $2) RETURNING *";
        const values = [user.name, user.sub];
        return db.query(insert, values).then((res, err) => res.rows[0]);
      }
    });
}{{/nosql}}

async function login(req, res) {
  let user = await verify(req.body.token);
  try {
    user = await getOrCreateUser(user);
    console.log(user);
    req.session.user = user;
    res.send(user);
  } catch (err) {
    console.log(`Failed to log in: ${err}`);
    throw Error(err);
  }
}

function logout(req, res) {
  req.session.user = null;
  res.send({});
}

function populateCurrentUser(req, res, next) {
  // simply populate "req.user" for convenience
  req.user = req.session.user;
  next();
}

function ensureLoggedIn(req, res, next) {
  if (!req.user) {
    return res.status(401).send({ err: "not logged in" });
  }

  next();
}

module.exports = {
  login,
  logout,
  populateCurrentUser,
  ensureLoggedIn,
};

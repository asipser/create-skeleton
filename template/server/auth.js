{{#auth}}
/*
|--------------------------------------------------------------------------
| auth.js -- Auth API routes
|--------------------------------------------------------------------------
|
| This file defines the API authentication routes for your server.
|
*/
const express = require("express");
const passport = require("./passport");
{{#nosql}}
const User = require("./models/user");
{{/nosql}}
{{^nosql}}
const db = require("./db");
{{/nosql}}

const router = express.Router();

const socket = require("./server-socket");
const SALT_ROUNDS = 10;
const bcrypt = require("bcrypt");

const addSocketIdtoSession = (req, res, next) => {
  req.session.socketId = req.query.socketId;
  next();
};

// authentication routes
router.get(
  "/google",
  addSocketIdtoSession,
  passport.authenticate("google", { scope: ["profile"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  function(req, res) {
    console.log(`success logged in with user ID ${req.user.id}`);
    if (req.session.socketId) {
      socket
        .getIo()
        .in(req.session.socketId)
        .emit("google", req.user);
      res.end();
    } else {
      res.redirect("/");
    }
  }
);

router.get("/logout", function(req, res) {
  req.logout();
  res.send({});
});

{{#nosql}}
async function createUser(email, password) {
  //throws if user exists
  if (await User.findOne({ email })) {
    throw Error("Email already exists");
  }
  const hashedSaltedPwd = await bcrypt.hash(password, SALT_ROUNDS);
  const newUser = new User({
    email: email,
    password: hashedSaltedPwd,
  });
  return newUser.save();
}
{{/nosql}}
{{^nosql}}
async function createUser(email, password) {
  //throws if user exists
  db.query("SELECT id FROM users WHERE email=$1", [email]).then((result, err) => {
    if (result.rows.length > 0) {
      throw Error("Email already exists");
    }
  });
  const hashedSaltedPwd = await bcrypt.hash(password, SALT_ROUNDS);
  return db
    .query("INSERT INTO users(email, password) VALUES($1, $2) RETURNING *", [
      email,
      hashedSaltedPwd,
    ])
    .then((result, err) => result.rows[0]);
}
{{/nosql}}

router.post("/register", async function(req, res) {
  try {
    const user = await createUser(req.body.email, req.body.password);
    req.login(user, function(err) {
      req.user.password = undefined;
      res.send(req.user);
    });
  } catch (error) {
    console.log(error);
    res.status(403).send({ error: "Email already exists" });
  }
});

router.post("/login", passport.authenticate("local"), function(req, res) {
  res.send(req.user);
});

module.exports = router;
{{/auth}}
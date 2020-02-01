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

const User = require("./models/user");

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

router.post("/register", async function(req, res) {
  const pass = req.body.password;
  const email = req.body.email;
  try {
    if (await User.findOne({ email })) {
      res.status(403).send({ error: "Email already exists" });
    }
    const hashedSaltedPwd = await bcrypt.hash(pass, SALT_ROUNDS);
    const newUser = new User({
      email: email,
      password: hashedSaltedPwd,
    });

    req.login(await newUser.save(), function(err) {
      if (err) {
        return next(err);
      }
      res.send(req.user);
    });
  } catch (error) {
    throw error;
  }
});

router.post("/login", passport.authenticate("local"), function(req, res) {
  res.send(req.user);
});

module.exports = router;

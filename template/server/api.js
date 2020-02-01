/*
|--------------------------------------------------------------------------
| api.js -- server routes
|--------------------------------------------------------------------------
|
| This file defines the routes for your server.
|
*/

const express = require("express");

// import models so we can interact with the database
{{#nosql}}
const User = require("./models/user");
{{/nosql}}
{{^nosql}}
const db = require("./db");
{{/nosql}}

//add error handling to async endpoints
const { decorateRouter } = require("@awaitjs/express");

// api endpoints: all these paths will be prefixed with "/api/"
const router = decorateRouter(express.Router());

// |------------------------------|
// | write your API methods below!|
// |------------------------------|

router.getAsync("/example", async function(req, res, next) {
  res.send({ hello: "world" });
});

// anything else falls to this "not found" case
router.all("*", (req, res) => {
  console.log(`API route not found: ${req.method} ${req.url}`);
  res.status(404).send({ msg: "API route not found" });
});

module.exports = router;

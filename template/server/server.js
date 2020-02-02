/*
|--------------------------------------------------------------------------
| server.js -- The core of your server
|--------------------------------------------------------------------------
|
| This file defines how your server starts up. Think of it as the main() of your server.
| At a high level, this file does the following things:
| - Connect to the database
| - Sets up server middleware (i.e. addons that enable things like json parsing, user login)
| - Hooks up all the backend routes specified in api.js
| - Fowards frontend routes that should be handled by the React router
| - Sets up error handling in case something goes wrong when handling a request
| - Actually starts the webserver
*/

//import libraries needed for the webserver to work!
const http = require("http");
const express = require("express"); // backend framework for our node server.

// library that stores info about each connected user
const session = require("express-session")({
  secret: "my-secret",
  resave: false,
  saveUninitialized: true,
});

const path = require("path"); // provide utilities for working with file and directory paths
const { decorateApp } = require("@awaitjs/express");

const api = require("./api");
{{#auth}}
const auth = require("./auth");
const passport = require("./passport");
{{/auth}}

{{#socket}}
// socket stuff
const socket = require("./server-socket");
{{/socket}}

// Server configuration below

// TODO: Choose one of below database connection options
const db = require("./db");
const environment = process.env.NODE_ENV == "production" ? "prod" : "dev";
let databaseName = "testdb"; // TODO: fill me in

{{#nosql}}
// --------- MONGO DATABASE ---------------
dbConfigMongo = {
  // mongoConnectionURL: "mongodb+srv://<USERNAME>:<PASSWORD>@example.mongodb.net",
  mongoConnectionURL:
    "mongodb+srv://a:a@cluster0-xyvyf.mongodb.net/test?retryWrites=true&w=majority",
  databaseName,
  environment,
};
db.init(dbConfigMongo);
{{/nosql}}
{{^nosql}}
// --------- POSTGRES DATABASE ------------
dbConfigPostgres = {
  user: "asipser",
  host: "localhost",
  password: "pass",
  port: 5432,
  database: databaseName,
};
db.init(dbConfigPostgres);
{{/nosql}}

// create a new express server
const app = decorateApp(express());

// allow us to process POST requests
app.use(express.json());

//register express session middleware
app.use(session);

{{#auth}}
//register passport & passport session middleware
app.use(passport.initialize());
app.use(passport.session());

//connect authentication routes
app.use("/auth", auth);
{{/auth}}

// connect user-defined routes
app.use("/api", api);

// load the compiled react files, which will serve /index.html and /bundle.js
const reactPath = path.resolve(__dirname, "..", "client", "dist");
app.use(express.static(reactPath));

// for all other routes, render index.html and let react router handle it
app.get("*", (req, res) => {
  res.sendFile(path.join(reactPath, "index.html"));
});

// any server errors cause this function to run
app.use((err, req, res, next) => {
  const status = err.status || 500;
  if (status === 500) {
    // 500 means Internal Server Error
    console.log("The server errored when processing a request!");
    console.log(err);
  }

  res.status(status);
  res.send({
    status: status,
    message: err.message,
  });
});

// hardcode port to 3000 for now
const port = 3000;
const server = http.Server(app);
{{#socket}}
socket.init(server, session);
{{/socket}}

server.listen(port, () => {
  console.log(`Server running on port: ${port}`);
});

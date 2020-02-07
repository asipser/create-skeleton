{{#socket}}
{{#socket.session}}
const sharedsession = require("express-socket.io-session");
{{/socket.session}}
{{#auth}}
{{#nosql}}
const User = require("./models/user");
{{/nosql}}
{{^nosql}}
const db = require("./db");
{{/nosql}}
{{/auth}}

let io;

module.exports = {
  init: (http, session) => {
    io = require("socket.io")(http);
    //set up socket middleware
{{#socket.session}}
    io.use(
      sharedsession(session, {
        autoSave: true,
      })
    );
{{#auth}}
    io.use((socket, next) => {
      if (socket.handshake.session.passport) {
        socket.userId = socket.handshake.session.passport.user;
      } else {
        socket.userId = undefined;
      }
      next();
    });
{{/auth}}
{{/socket.session}}
    io.on("connection", async (socket) => {
{{#auth}}
      if (socket.userId) { 
{{#nosql}}
        const userObj = await User
          .findById(socket.userId)
{{#auth.local}}
          .select("-password");
{{/auth.local}}
        socket.emit("user", userObj.toJSON());
{{/nosql}}
{{^nosql}}
        const { rows } = await db.query("SELECT id, email, googleid FROM users WHERE id = $1", [socket.userId]);
        socket.emit("user", rows[0]);
{{/nosql}}
      }
{{/auth}}
    });
  },

  getIo: () => io,
};
{{/socket}}
const { Pool } = require("pg");

let pool;

module.exports = {
  pool,
  init: (dbConfig) => {
    pool = new Pool(dbConfig);
    pool.connect((err, client, done) => {
      if (err) console.log(err);
      else console.log("Connected to Postgres");
      done(err);
    });
    pool.on("error", function(err) {
      console.log("PG ERROR: ", err.message, err.stack);
    });
  },
  query: (text, params) => {
    return pool.query(text, params);
  },
};

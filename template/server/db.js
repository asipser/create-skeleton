{{#nosql}}
const mongoose = require("mongoose"); // library to connect to MongoDB

module.exports = {
  init: (dbConfig) => {
    // connect to mongodb
    mongoose
      .connect(dbConfig.mongoConnectionURL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        dbName: `${dbConfig.databaseName}-${dbConfig.environment}`,
      })
      .then(() => console.log("Connected to MongoDB"))
      .catch((err) => console.log(`Error connecting to MongoDB: ${err}`));
  },
};
{{/nosql}}
{{^nosql}}
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
{{/nosql}}
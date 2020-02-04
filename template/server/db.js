{{#nosql}}
const mongoose = require("mongoose"); // library to connect to MongoDB
const logger = require("pino")(); // import pino logger

module.exports = {
  init: (dbConfig) => {
    // connect to mongodb
    mongoose
      .connect(process.env.MONGO_CONNECTION_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      })
      .then(() => logger.info("Server connected to MongoDB"))
      .catch((err) => logger.error("Error connecting to MongoDB", err));
  },
};

{{/nosql}}
{{^nosql}}
const { Pool } = require("pg");
const logger = require("pino")(); // import pino logger

let pool;

module.exports = {
  pool,
  init: () => {
    const connectionString = process.env.POSTGRES_CONNECTION_URI;
    pool = new Pool({connectionString});
    pool.connect((err, client, done) => {
      if (err) logger.error("Error connecting to Postgres", err);
      else logger.info("Server connected to Postgres");
      done(err);
    });
    pool.on("error", function(err) {
      logger.error("Postgres err: ", err);
    });
  },
  query: (text, params) => {
    return pool.query(text, params);
  },
};

{{/nosql}}
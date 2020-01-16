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

/**
 * db.config.js
 * -----------------------------------------
 * Mongoose connection options, isolated from connection logic itself
 * (see database/connection.js) so options can be tuned independently.
 */

const mongooseOptions = {
  autoIndex: true, // set to false in a real high-traffic prod deployment; true here for dev safety
  maxPoolSize: 20,
  minPoolSize: 5,
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  family: 4, // force IPv4, avoids some IPv6 resolution delays on certain hosts
};

module.exports = mongooseOptions;
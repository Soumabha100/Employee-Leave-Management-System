const mongoose = require('mongoose');

/**
 * Connects to MongoDB database using the MONGO_URI environment variable.
 * Logs success host or logs a sanitized error message and exits with status 1 on failure.
 * @returns {Promise<typeof mongoose>} Resolves to the mongoose instance on success.
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;

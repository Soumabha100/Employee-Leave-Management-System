require('dotenv').config();

const app = require('./app');
const connectDB = require('./config/db');

// Fail fast: verify critical environment variables
const requiredEnv = ['PORT', 'JWT_SECRET'];
for (const envVar of requiredEnv) {
  if (!process.env[envVar]) {
    console.error(`Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
}

const PORT = process.env.PORT || 5000;

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

const startServer = async () => {
  // Connect to MongoDB if MONGO_URI is provided
  if (process.env.MONGO_URI && process.env.MONGO_URI.trim() !== '') {
    await connectDB();
  } else {
    console.log('Notice: MONGO_URI is not set yet. Skipping MongoDB connection for now.');
  }

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();

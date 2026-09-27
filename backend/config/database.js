const mongoose = require('mongoose');

let gridfsBucket;

const connectDB = async () => {
  try {
    if (mongoose.connection.readyState >= 1) {
      if (!gridfsBucket && mongoose.connection.db) {
        gridfsBucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
          bucketName: 'uploads'
        });
      }
      return mongoose.connection;
    }

    const mongoUri = process.env.MONGODB_URI;

    if (!mongoUri) {
      throw new Error('MONGODB_URI is not defined in .env file');
    }

    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
      family: 4
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Initialize GridFS
    gridfsBucket = new mongoose.mongo.GridFSBucket(conn.connection.db, {
      bucketName: 'uploads'
    });

    return conn;
  } catch (error) {
    console.error('Database connection error:', error.message);
    throw error;
  }
};

const getGridFSBucket = () => gridfsBucket;

module.exports = {
  connectDB,
  getGridFSBucket
};
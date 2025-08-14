const mongoose = require('mongoose');
require('dotenv').config();
require('colors');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      connectTimeoutMS: 60000
    });

    console.log('Connected to MongoDB'.green.bold);
  } catch (error) {
    console.error('Error connecting to MongoDB:'.red.bold, error.message);
    process.exit(1);
  }
};

module.exports = { connectDB };

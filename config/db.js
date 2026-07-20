const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI || '';
    const maskedUri = uri.length > 20 ? uri.substring(0, 25) + '...' : uri;
    console.log(`Connecting to MongoDB with URI starting with: ${maskedUri}`);
    const conn = await mongoose.connect(uri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    console.log('Please ensure you have configured your MONGODB_URI in the .env file correctly.');
    // Do not exit process here, let the app run without DB to show frontend if needed
    // process.exit(1);
  }
};

module.exports = connectDB;

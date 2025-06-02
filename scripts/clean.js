const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Attraction = require('../models/Attraction');
const User = require('../models/User');
const Reservation = require('../models/Reservation');
const ParkSetting = require('../models/ParkSetting');

// Connect to MongoDB
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tusenfryd');
    console.log('Connected to MongoDB for cleaning');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
}

// Clean database function
async function cleanDatabase() {
  try {
    console.log('🧹 Starting database cleanup...');

    // Clear all collections
    console.log('Clearing attractions...');
    await Attraction.deleteMany({});
    console.log('✅ Attractions cleared');

    console.log('Clearing users...');
    await User.deleteMany({});
    console.log('✅ Users cleared');

    console.log('Clearing reservations...');
    await Reservation.deleteMany({});
    console.log('✅ Reservations cleared');

    console.log('Clearing park settings...');
    await ParkSetting.deleteMany({});
    console.log('✅ Park settings cleared');

    console.log('\n🎉 Database cleanup completed successfully!');

  } catch (error) {
    console.error('❌ Cleanup failed:', error);
    throw error;
  }
}

// Run cleanup
async function main() {
  await connectDB();
  await cleanDatabase();
  await mongoose.disconnect();
  console.log('Disconnected from MongoDB');
  process.exit(0);
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  process.exit(1);
});

// Run the cleanup
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { cleanDatabase, connectDB };

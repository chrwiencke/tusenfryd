const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Attraction = require('./models/Attraction');
const Reservation = require('./models/Reservation');

// Connect to MongoDB
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tusenfryd');
    console.log('Connected to MongoDB for testing');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
}

async function testReservation() {
  try {
    await connectDB();
    
    console.log('🎢 Testing reservation creation...');
    
    // Find an active attraction
    const attraction = await Attraction.findOne({ status: 'open' });
    
    if (!attraction) {
      console.log('❌ No open attractions found');
      return;
    }
    
    console.log('✅ Found attraction:', attraction.name);
    
    // Create a test reservation
    const reservation = new Reservation({
      attraction: attraction._id,
      guestName: 'Test User',
      guestEmail: 'test@example.com',
      guestPhone: '+47 123 45 678',
      numberOfGuests: 2,
      notes: 'Test reservation'
    });
    
    await reservation.save();
    console.log('✅ Reservation created successfully');
    console.log('Queue position:', reservation.queuePosition);
    console.log('Estimated time:', reservation.estimatedTime);
    
    // Test reservation without phone
    const reservation2 = new Reservation({
      attraction: attraction._id,
      guestName: 'Test User 2',
      guestEmail: 'test2@example.com',
      numberOfGuests: 1,
      notes: 'Test reservation without phone'
    });
    
    await reservation2.save();
    console.log('✅ Reservation without phone created successfully');
    console.log('Queue position:', reservation2.queuePosition);
    console.log('Estimated time:', reservation2.estimatedTime);
    
    // Clean up test data
    await Reservation.deleteMany({ guestEmail: { $in: ['test@example.com', 'test2@example.com'] } });
    console.log('✅ Test data cleaned up');
    
    console.log('🎉 All tests passed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error('Error details:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

testReservation();

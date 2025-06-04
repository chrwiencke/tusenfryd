const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('./models/User');

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

async function testLogin() {
  try {
    await connectDB();
    
    // Find the admin user
    const user = await User.findOne({ username: 'admin' });
    
    if (!user) {
      console.log('❌ Admin user not found');
      return;
    }
    
    console.log('✅ Admin user found:');
    console.log('Username:', user.username);
    console.log('Email:', user.email);
    console.log('Role:', user.role);
    console.log('IsActive:', user.isActive);
    console.log('Password hash:', user.password);
    
    // Test password comparison
    const testPassword = 'admin123';
    console.log('\n🔐 Testing password comparison:');
    console.log('Test password:', testPassword);
    
    // Manual bcrypt compare
    const manualCompare = await bcrypt.compare(testPassword, user.password);
    console.log('Manual bcrypt.compare result:', manualCompare);
    
    // User method compare
    const methodCompare = await user.comparePassword(testPassword);
    console.log('User.comparePassword result:', methodCompare);
    
    // Test wrong password
    const wrongPassword = 'wrongpassword';
    const wrongCompare = await user.comparePassword(wrongPassword);
    console.log('Wrong password test result:', wrongCompare);
    
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

testLogin();

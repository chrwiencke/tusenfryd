const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const User = require('./models/User');

// Connect to MongoDB
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tusenfryd');
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
}

async function resetAdminPassword() {
  try {
    await connectDB();
    
    // Find the admin user
    let user = await User.findOne({ username: 'admin' });
    
    if (!user) {
      console.log('❌ Admin user not found, creating new one...');
      user = new User({
        username: 'admin',
        email: 'admin@tusenfryd.no',
        password: 'admin123',
        role: 'admin',
        isActive: true
      });
    } else {
      console.log('✅ Admin user found, updating password...');
      user.password = 'admin123'; // This will trigger the pre-save hook to hash it
    }
    
    await user.save();
    
    console.log('✅ Admin password reset successfully');
    console.log('Username: admin');
    console.log('Password: admin123');
    
    // Test the password immediately
    const testResult = await user.comparePassword('admin123');
    console.log('Password test result:', testResult ? '✅ Success' : '❌ Failed');
    
  } catch (error) {
    console.error('❌ Reset failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

resetAdminPassword();

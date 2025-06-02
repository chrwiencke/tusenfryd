const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const Attraction = require('../models/Attraction');
const User = require('../models/User');
const ParkSetting = require('../models/ParkSetting');

// Connect to MongoDB
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tusenfryd');
    console.log('Connected to MongoDB for seeding');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
}

// Sample attractions data
const attractionsData = [
  {
    name: "SpeedMonster",
    description: "Experience the ultimate adrenaline rush on Norway's fastest roller coaster. Launch from 0 to 90 km/h in just 2.3 seconds!",
    category: "roller-coaster",
    thrillLevel: 5,
    minHeight: 140,
    maxHeight: null,
    duration: 90,
    capacity: 20,
    image: "/images/attractions/speedmonster.jpg",
    isActive: true,
    features: ["Launch coaster", "Loop", "High speed"],
    location: "Thrill Zone",
    openingYear: 2006
  },
  {
    name: "ThunderCoaster",
    description: "A classic wooden roller coaster that has been thrilling visitors since 1988. Experience the charm of traditional coaster design.",
    category: "roller-coaster",
    thrillLevel: 4,
    minHeight: 120,
    maxHeight: null,
    duration: 120,
    capacity: 24,
    image: "/images/attractions/thundercoaster.jpg",
    isActive: true,
    features: ["Wooden coaster", "Classic design", "Family friendly"],
    location: "Classic Zone",
    openingYear: 1988
  },
  {
    name: "Loopen",
    description: "The first roller coaster in the world to feature a clothoid loop. A historic and thrilling experience!",
    category: "roller-coaster",
    thrillLevel: 4,
    minHeight: 130,
    maxHeight: null,
    duration: 105,
    capacity: 20,
    image: "/images/attractions/loopen.jpg",
    isActive: true,
    features: ["Historic loop", "Unique design", "Landmark attraction"],
    location: "Heritage Zone",
    openingYear: 1988
  },
  {
    name: "Supersplash",
    description: "Get ready to get soaked! This water ride features a massive splash that will cool you down on hot summer days.",
    category: "water",
    thrillLevel: 3,
    minHeight: 110,
    maxHeight: null,
    duration: 180,
    capacity: 20,
    image: "/images/attractions/supersplash.jpg",
    isActive: true,
    features: ["Water ride", "Big splash", "Cooling experience"],
    location: "Water Zone",
    openingYear: 1998
  },
  {
    name: "Tornado",
    description: "Spin and twist in this exciting spinning coaster that will leave you dizzy with excitement!",
    category: "thrill",
    thrillLevel: 4,
    minHeight: 120,
    maxHeight: null,
    duration: 150,
    capacity: 16,
    image: "/images/attractions/tornado.jpg",
    isActive: true,
    features: ["Spinning cars", "Unpredictable ride", "Family thrill"],
    location: "Spin Zone",
    openingYear: 2003
  },
  {
    name: "Horror House",
    description: "Dare to enter the most frightening haunted house in Norway. Not for the faint of heart!",
    category: "thrill",
    thrillLevel: 3,
    minHeight: 120,
    maxHeight: null,
    duration: 300,
    capacity: 12,
    image: "/images/attractions/horror-house.jpg",
    isActive: true,
    features: ["Horror theme", "Dark ride", "Scare experience"],
    location: "Dark Zone",
    openingYear: 1995
  },
  {
    name: "Flying Carpet",
    description: "Soar through the air on this magical flying carpet ride. Perfect for families with children!",
    category: "family",
    thrillLevel: 2,
    minHeight: 90,
    maxHeight: null,
    duration: 120,
    capacity: 32,
    image: "/images/attractions/flying-carpet.jpg",
    isActive: true,
    features: ["Family friendly", "Gentle thrills", "Arabian theme"],
    location: "Family Zone",
    openingYear: 2001
  },
  {
    name: "Bumper Cars",
    description: "Classic bumper car fun for all ages. Bump and crash your way to victory in this timeless attraction!",
    category: "family",
    thrillLevel: 1,
    minHeight: 100,
    maxHeight: null,
    duration: 180,
    capacity: 20,
    image: "/images/attractions/bumper-cars.jpg",
    isActive: true,
    features: ["Interactive", "All ages", "Classic fun"],
    location: "Family Zone",
    openingYear: 1990
  },
  {
    name: "Ferris Wheel",
    description: "Enjoy panoramic views of the entire park and surrounding landscape from 50 meters high!",
    category: "family",
    thrillLevel: 1,
    minHeight: 0,
    maxHeight: null,
    duration: 600,
    capacity: 48,
    image: "/images/attractions/ferris-wheel.jpg",
    isActive: true,
    features: ["Scenic views", "Relaxing", "Photo opportunity"],
    location: "Central Plaza",
    openingYear: 1985
  },
  {
    name: "Kids Coaster",
    description: "The perfect first roller coaster experience for young adventurers. Gentle thrills and big smiles!",
    category: "children",
    thrillLevel: 2,
    minHeight: 90,
    maxHeight: 140,
    duration: 90,
    capacity: 16,
    image: "/images/attractions/kids-coaster.jpg",
    isActive: true,
    features: ["Kid-friendly", "First coaster", "Gentle thrills"],
    location: "Kids Zone",
    openingYear: 2010
  }
];

// Sample admin user
const adminData = {
  username: 'admin',
  email: 'admin@tusenfryd.no',
  password: 'admin123', // This will be hashed
  role: 'admin',
  firstName: 'Park',
  lastName: 'Administrator'
};

// Park settings - create individual settings
const parkSettings = [
  {
    key: 'parkName',
    value: 'Tusenfryd',
    description: 'Name of the amusement park',
    category: 'general'
  },
  {
    key: 'isOpen',
    value: true,
    description: 'Whether the park is currently open',
    category: 'general'
  },
  {
    key: 'openingTime',
    value: '10:00',
    description: 'Park opening time',
    category: 'hours'
  },
  {
    key: 'closingTime',
    value: '22:00',
    description: 'Park closing time',
    category: 'hours'
  },
  {
    key: 'seasonStart',
    value: new Date('2024-04-01'),
    description: 'Start of the park season',
    category: 'general'
  },
  {
    key: 'seasonEnd',
    value: new Date('2024-10-31'),
    description: 'End of the park season',
    category: 'general'
  },
  {
    key: 'maxDailyVisitors',
    value: 15000,
    description: 'Maximum number of daily visitors',
    category: 'general'
  },
  {
    key: 'currentVisitors',
    value: 0,
    description: 'Current number of visitors in the park',
    category: 'general'
  },
  {
    key: 'weatherAlert',
    value: false,
    description: 'Weather alert status',
    category: 'emergency'
  },
  {
    key: 'emergencyMessage',
    value: '',
    description: 'Emergency message for visitors',
    category: 'emergency'
  },
  {
    key: 'welcomeNotification',
    value: 'Welcome to Tusenfryd! Have a magical day at Norway\'s most exciting amusement park!',
    description: 'Welcome notification message',
    category: 'notification'
  },
  {
    key: 'queueNotification',
    value: 'Popular attractions may have longer wait times during peak hours.',
    description: 'Queue time notification',
    category: 'notification'
  }
];

// Seed function
async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');

    // Clear existing data
    console.log('Clearing existing data...');
    await Attraction.deleteMany({});
    await User.deleteMany({});
    await ParkSetting.deleteMany({});
    console.log('✅ Existing data cleared');

    // Create attractions
    console.log('Creating attractions...');
    const attractions = await Attraction.insertMany(attractionsData);
    console.log(`✅ Created ${attractions.length} attractions`);

    // Create admin user
    console.log('Creating admin user...');
    const hashedPassword = await bcrypt.hash(adminData.password, 12);
    const admin = new User({
      ...adminData,
      password: hashedPassword
    });
    await admin.save();
    console.log('✅ Created admin user');
    console.log('   Username: admin');
    console.log('   Password: admin123');

    // Create park settings
    console.log('Creating park settings...');
    await ParkSetting.insertMany(parkSettings);
    console.log('✅ Created park settings');

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\nYou can now:');
    console.log('1. Start the server with: npm run dev');
    console.log('2. Access the admin panel at: http://localhost:3000/admin');
    console.log('3. Login with username: admin, password: admin123');
    console.log('4. Visit the public site at: http://localhost:3000');

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  }
}

// Run seeding
async function main() {
  await connectDB();
  await seedDatabase();
  await mongoose.disconnect();
  console.log('Disconnected from MongoDB');
  process.exit(0);
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  process.exit(1);
});

// Run the seeding
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { seedDatabase, connectDB };

const mongoose = require('mongoose');

const attractionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['open', 'closed', 'maintenance'],
    default: 'open'
  },
  waitTime: {
    type: Number,
    default: 0,
    min: 0
  },
  capacity: {
    type: Number,
    required: true,
    min: 1
  },
  currentQueue: {
    type: Number,
    default: 0,
    min: 0
  },
  openingHours: {
    start: {
      type: String,
      default: '10:00'
    },
    end: {
      type: String,
      default: '22:00'
    }
  },
  image: {
    type: String,
    default: '/images/default-attraction.jpg'
  },
  category: {
    type: String,
    enum: ['roller-coaster', 'family', 'thrill', 'water', 'children'],
    default: 'family'
  },
  heightRequirement: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Calculate estimated wait time based on queue
attractionSchema.methods.calculateWaitTime = function() {
  if (this.status !== 'open') return 0;
  return Math.max(0, Math.ceil((this.currentQueue / this.capacity) * 15)); // 15 minutes per capacity cycle
};

// Check if attraction is currently open
attractionSchema.methods.isCurrentlyOpen = function() {
  if (this.status !== 'open') return false;
  
  const now = new Date();
  const currentTime = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
  
  return currentTime >= this.openingHours.start && currentTime <= this.openingHours.end;
};

module.exports = mongoose.model('Attraction', attractionSchema);

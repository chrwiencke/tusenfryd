const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
  attraction: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Attraction',
    required: true
  },
  guestName: {
    type: String,
    required: true,
    trim: true
  },
  guestEmail: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  guestPhone: {
    type: String,
    trim: true
  },
  numberOfGuests: {
    type: Number,
    required: true,
    min: 1,
    max: 10
  },
  queuePosition: {
    type: Number,
    required: true
  },
  reservationTime: {
    type: Date,
    default: Date.now
  },
  estimatedTime: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled', 'expired'],
    default: 'active'
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Index for efficient querying
reservationSchema.index({ attraction: 1, status: 1, queuePosition: 1 });
reservationSchema.index({ guestEmail: 1 });
reservationSchema.index({ estimatedTime: 1 });

// Generate queue position
reservationSchema.pre('save', async function(next) {
  if (this.isNew && !this.queuePosition) {
    try {
      const lastReservation = await this.constructor
        .findOne({ 
          attraction: this.attraction, 
          status: 'active' 
        })
        .sort({ queuePosition: -1 });
      
      this.queuePosition = lastReservation ? lastReservation.queuePosition + 1 : 1;
      
      // Calculate estimated time (15 minutes per queue position)
      const baseTime = new Date();
      this.estimatedTime = new Date(baseTime.getTime() + (this.queuePosition * 15 * 60 * 1000));
      
      next();
    } catch (error) {
      next(error);
    }
  } else {
    next();
  }
});

// Method to update queue positions when a reservation is completed
reservationSchema.statics.updateQueuePositions = async function(attractionId, completedPosition) {
  await this.updateMany(
    { 
      attraction: attractionId, 
      queuePosition: { $gt: completedPosition },
      status: 'active'
    },
    { 
      $inc: { queuePosition: -1 }
    }
  );
};

// Check if reservation is expired (more than 4 hours old)
reservationSchema.methods.isExpired = function() {
  const fourHoursAgo = new Date(Date.now() - (4 * 60 * 60 * 1000));
  return this.reservationTime < fourHoursAgo && this.status === 'active';
};

module.exports = mongoose.model('Reservation', reservationSchema);

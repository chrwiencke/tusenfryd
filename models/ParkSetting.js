const mongoose = require('mongoose');

const parkSettingSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true
  },
  value: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['hours', 'notification', 'general', 'emergency'],
    default: 'general'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Static method to get setting by key
parkSettingSchema.statics.getSetting = async function(key, defaultValue = null) {
  const setting = await this.findOne({ key, isActive: true });
  return setting ? setting.value : defaultValue;
};

// Static method to set setting
parkSettingSchema.statics.setSetting = async function(key, value, description = '', category = 'general') {
  return await this.findOneAndUpdate(
    { key },
    { value, description, category, isActive: true },
    { upsert: true, new: true }
  );
};

module.exports = mongoose.model('ParkSetting', parkSettingSchema);

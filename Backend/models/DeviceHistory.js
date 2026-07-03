const mongoose = require('mongoose');

const deviceHistorySchema = new mongoose.Schema({
  deviceId: { type: String, required: true },
  ip: { type: String, required: true },
  status: { type: String, enum: ['online', 'offline'], required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date }, 
  durationMinutes: { type: Number, default: 0 } 
});

module.exports = mongoose.model('DeviceHistory', deviceHistorySchema);
const mongoose = require('mongoose');

const CustomDeviceSchema = new mongoose.Schema({
  type: { type: String, required: true }, // Ties it to the HardwareClass
  deviceId: String,
  name: String,
  ip: String,
  location: String,
  status: { type: String, default: 'offline' },
  latency: String,
  rootCause: String,
  lastSeen: Date
});

module.exports = mongoose.model('CustomDevice', CustomDeviceSchema);
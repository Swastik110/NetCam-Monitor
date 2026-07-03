const mongoose = require('mongoose');

const radioSchema = new mongoose.Schema({
  deviceId: { type: String, required: true, unique: true },
  linkName: { type: String, required: true },
  ipEndpoints: { type: String, required: true }, // e.g., "172.22.64.220 / .219"
  location: { type: String, required: true },
  signalStrength: { type: String, default: '-50 dBm' },
  status: { type: String, enum: ['online', 'offline', 'warning'], default: 'offline' },
  lastSeen: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Radio', radioSchema);
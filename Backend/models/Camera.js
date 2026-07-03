const mongoose = require('mongoose');

const cameraSchema = new mongoose.Schema({
  deviceId: { type: String, required: true, unique: true }, // e.g., "SL-01"
  section: { type: String, required: true }, // e.g., "GM OFFICE"
  name: { type: String, required: true },
  ip: { type: String, required: true },
  location: { type: String },
  status: { type: String, enum: ['online', 'offline', 'warning'], default: 'offline' },
  latency: { type: String, default: '-' },
  rootCause: { type: String, default: 'OK' },
  lastSeen: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Camera', cameraSchema);
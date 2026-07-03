const mongoose = require('mongoose');

const nvrSchema = new mongoose.Schema({
  deviceId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  ip: { type: String, required: true },
  location: { type: String, required: true },
  status: { type: String, enum: ['online', 'offline', 'warning'], default: 'offline' },
  uptime: { type: String, default: '100%' },
  lastSeen: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Nvr', nvrSchema);
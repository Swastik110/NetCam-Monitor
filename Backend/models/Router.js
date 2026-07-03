const mongoose = require('mongoose');

const routerSchema = new mongoose.Schema({
  deviceId: { type: String, required: true, unique: true },
  gatewayName: { type: String, required: true },
  ip: { type: String, required: true },
  location: { type: String, required: true },
  networkLoad: { type: String, default: '10%' },
  status: { type: String, enum: ['online', 'offline', 'warning'], default: 'offline' },
  lastSeen: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Router', routerSchema);
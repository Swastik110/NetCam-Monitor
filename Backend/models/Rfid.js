const mongoose = require('mongoose');

const rfidSchema = new mongoose.Schema({
  deviceId: { type: String, required: true, unique: true },
  barrierName: { type: String, required: true },
  controllerIp: { type: String, required: true },
  location: { type: String, required: true },
  provider: { type: String, default: 'TATVIK' },
  hardwareChain: { type: String, required: true },
  status: { type: String, enum: ['online', 'offline', 'warning'], default: 'offline' },
  lastSeen: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Rfid', rfidSchema);
const mongoose = require('mongoose');

const metricSchema = new mongoose.Schema({
  deviceId: { type: String, required: true },
  timestamp: { type: Date, required: true, default: Date.now },
  latencyMs: { type: Number, default: 0 },
  isOnline: { type: Boolean, default: false }
});

// Create a compound index to quickly query historical data
metricSchema.index({ deviceId: 1, timestamp: -1 });

// THIS IS THE CRITICAL LINE THAT PREVENTS THE ERROR:
module.exports = mongoose.model('CameraMetric', metricSchema);
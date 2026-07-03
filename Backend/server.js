require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');

const connectDB = require('./config/db');
const startMonitoring = require('./services/pingService');

// --- Models ---
const Nvr = require('./models/Nvr');
const Radio = require('./models/Radio');
const Rfid = require('./models/Rfid');
const Router = require('./models/Router');
const Camera = require('./models/Camera');
const CameraMetric = require('./models/CameraMetric');
const DeviceHistory = require('./models/DeviceHistory'); // <--- 1. NEW: Imported History Model

// --- Initialization ---
const app = express();
const server = http.createServer(app);

// --- Middleware ---
app.use(cors());
app.use(express.json());

// --- Database Connection ---
connectDB();

// --- Setup WebSockets ---
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", 
    methods: ["GET", "POST"]
  }
});

// --- API Routes ---

// Basic Health Route
app.get('/health', (req, res) => {
  res.json({ status: 'NOC Server is running smoothly.' });
});

// TEMPORARY ROUTE TO WIPE HISTORY CLEAN
app.get('/api/wipe-history', async (req, res) => {
  await DeviceHistory.deleteMany({});
  res.json({ message: "History wiped clean for the demo!" });
});

// Basic Device Fetching
app.get('/api/nvr', async (req, res) => res.json(await Nvr.find()));
app.get('/api/radio', async (req, res) => res.json(await Radio.find()));
app.get('/api/rfid', async (req, res) => res.json(await Rfid.find()));
app.get('/api/router', async (req, res) => res.json(await Router.find()));

// API: Get all cameras
app.get('/api/cameras', async (req, res) => {
  try {
    const cameras = await Camera.find().sort({ section: 1, deviceId: 1 });
    res.json(cameras);
  } catch (error) {
    console.error('Error fetching cameras:', error);
    res.status(500).json({ error: 'Server Error' });
  }
});

// <--- 2. NEW: 30-Day History API Route --->
app.get('/api/history/:deviceId', async (req, res) => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const history = await DeviceHistory.find({
      deviceId: req.params.deviceId,
      startTime: { $gte: thirtyDaysAgo }
    }).sort({ startTime: -1 }); // Sends the newest outages first
    
    res.json(history);
  } catch (error) {
    console.error('History Fetch Error:', error);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

// API: Get 12-hour latency history for a specific camera (Used in the live graph)
app.get('/api/cameras/:id/history', async (req, res) => {
  try {
    const { id } = req.params;
    const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000);
    
    const metrics = await CameraMetric.find({
      deviceId: id,
      timestamp: { $gte: twelveHoursAgo }
    }).sort({ timestamp: 1 });

    const formattedData = metrics.map(m => ({
      time: new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      latency: m.latencyMs
    }));

    res.json(formattedData);
  } catch (error) {
    console.error('Error fetching history:', error);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

// --- Sockets & Server Start ---

// Socket Connection Handler
io.on('connection', (socket) => {
  console.log(`💻 NOC Dashboard Connected: ${socket.id}`);
  
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 NOC Backend running on port ${PORT}`);
  
  // Boot up the monitoring engine
  startMonitoring(io);
});
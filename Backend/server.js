require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken'); 

const connectDB = require('./config/db');
const startMonitoring = require('./services/pingService');
const path = require('path');


// --- Models ---
const Nvr = require('./models/Nvr');
const Radio = require('./models/Radio');
const Rfid = require('./models/Rfid');
const Router = require('./models/Router');
const Camera = require('./models/Camera');
const CustomDevice = require('./models/CustomDevice'); // NEW
const HardwareClass = require('./models/HardwareClass'); // NEW
const CameraMetric = require('./models/CameraMetric');
const DeviceHistory = require('./models/DeviceHistory');
const User = require('./models/User'); 

const app = express();
const server = http.createServer(app);
const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_noc_key';

app.use(cors());
app.use(express.json());
connectDB();

const io = new Server(server, { cors: { origin: "http://localhost:5173", methods: ["GET", "POST", "DELETE", "PUT"] } });

// --- AUTHENTICATION ---
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (await User.findOne({ username })) return res.status(400).json({ error: 'Operator ID already exists' });
    await new User({ username, password }).save();
    res.status(201).json({ message: 'Registration successful!' });
  } catch (error) { res.status(500).json({ error: 'Server error' }); }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user || !(await user.comparePassword(password))) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ id: user._id, username: user.username }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, username: user.username });
  } catch (error) { res.status(500).json({ error: 'Server error' }); }
});

// --- DYNAMIC HARDWARE CLASSES API ---
app.get('/api/classes', async (req, res) => res.json(await HardwareClass.find()));

app.post('/api/classes/add', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Class name required' });
    const newClass = await HardwareClass.create({ name });
    res.status(201).json(newClass);
  } catch (error) { res.status(500).json({ error: 'Failed to create class. May already exist.' }); }
});

app.delete('/api/classes/:name', async (req, res) => {
  try {
    const { name } = req.params;
    await HardwareClass.findOneAndDelete({ name });
    
    // Wipe all devices inside this class, plus their telemetry data
    const devicesToKill = await CustomDevice.find({ type: name });
    const deviceIds = devicesToKill.map(d => d.deviceId);
    
    await DeviceHistory.deleteMany({ deviceId: { $in: deviceIds } });
    await CameraMetric.deleteMany({ deviceId: { $in: deviceIds } });
    await CustomDevice.deleteMany({ type: name });

    res.json({ message: 'Hardware class and all associated nodes permanently terminated.' });
  } catch (error) { res.status(500).json({ error: 'Failed to terminate class' }); }
});

// --- DEVICE MANAGEMENT API ---
app.post('/api/devices/add', async (req, res) => {
  try {
    const { type, name, ip, location } = req.body;
    let newDeviceData = { ip, status: 'offline', lastSeen: new Date() };

    if (['Camera', 'NVR', 'Radio', 'RFID', 'Router'].includes(type)) {
      let Model; let prefix;
      if (type === 'Camera') { Model = Camera; prefix = 'CAM'; newDeviceData.name = name; newDeviceData.section = location; newDeviceData.location = location;}
      else if (type === 'NVR') { Model = Nvr; prefix = 'NVR'; newDeviceData.name = name; newDeviceData.location = location; }
      else if (type === 'Radio') { Model = Radio; prefix = 'RAD'; newDeviceData.linkName = name; newDeviceData.ipEndpoints = ip; newDeviceData.location = location; }
      else if (type === 'RFID') { Model = Rfid; prefix = 'RFID'; newDeviceData.barrierName = name; newDeviceData.controllerIp = ip; newDeviceData.location = location; }
      else if (type === 'Router') { Model = Router; prefix = 'RTR'; newDeviceData.gatewayName = name; newDeviceData.location = location; }
      
      const count = await Model.countDocuments();
      newDeviceData.deviceId = `${prefix}-${count + 101}`;
      await new Model(newDeviceData).save();
    } else {
      // It's a custom dynamic class!
      const count = await CustomDevice.countDocuments({ type });
      const prefix = type.substring(0, 3).toUpperCase();
      newDeviceData.deviceId = `${prefix}-${count + 101}`;
      newDeviceData.type = type;
      newDeviceData.name = name;
      newDeviceData.location = location;
      await new CustomDevice(newDeviceData).save();
    }
    res.status(201).json({ message: 'Device added' });
  } catch (error) { res.status(500).json({ error: 'Failed to add device.' }); }
});

app.delete('/api/devices/:deviceId', async (req, res) => {
  try {
    const { deviceId } = req.params;
    await Promise.all([
      Camera.findOneAndDelete({ deviceId }), Nvr.findOneAndDelete({ deviceId }), Radio.findOneAndDelete({ deviceId }),
      Rfid.findOneAndDelete({ deviceId }), Router.findOneAndDelete({ deviceId }), CustomDevice.findOneAndDelete({ deviceId }),
      DeviceHistory.deleteMany({ deviceId }), CameraMetric.deleteMany({ deviceId })
    ]);
    res.json({ message: 'Device wiped.' });
  } catch (error) { res.status(500).json({ error: 'Failed to delete.' }); }
});

// --- DATA FETCH ROUTES ---
app.get('/api/nvr', async (req, res) => res.json(await Nvr.find()));
app.get('/api/radio', async (req, res) => res.json(await Radio.find()));
app.get('/api/rfid', async (req, res) => res.json(await Rfid.find()));
app.get('/api/router', async (req, res) => res.json(await Router.find()));
app.get('/api/cameras', async (req, res) => res.json(await Camera.find().sort({ section: 1, deviceId: 1 })));
app.get('/api/custom-devices', async (req, res) => res.json(await CustomDevice.find()));

app.get('/api/history/:deviceId', async (req, res) => {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  res.json(await DeviceHistory.find({ deviceId: req.params.deviceId, startTime: { $gte: thirtyDaysAgo } }).sort({ startTime: -1 }));
});

app.get('/api/cameras/:id/history', async (req, res) => {
  const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000);
  const metrics = await CameraMetric.find({ deviceId: req.params.id, timestamp: { $gte: twelveHoursAgo } }).sort({ timestamp: 1 });
  res.json(metrics.map(m => ({ time: new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), latency: m.latencyMs })));
});

io.on('connection', (socket) => { console.log(`💻 NOC Connected: ${socket.id}`); });
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => { console.log(`🚀 NOC Backend running on port ${PORT}`); startMonitoring(io); });

app.use(express.static(path.join(__dirname, '../Frontend/dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../Frontend/dist', 'index.html'));
});

// ... (keep your existing PORT and server.listen here) ...

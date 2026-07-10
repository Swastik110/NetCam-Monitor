const ping = require('ping');
const net = require('net'); 
const cron = require('node-cron');

const Camera = require('../models/Camera');
const Nvr = require('../models/Nvr');
const Radio = require('../models/Radio');
const Rfid = require('../models/Rfid');
const Router = require('../models/Router');
const CustomDevice = require('../models/CustomDevice'); // <-- NEW
const CameraMetric = require('../models/CameraMetric');
const DeviceHistory = require('../models/DeviceHistory');

const checkPort = (ip, port) => {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(1500);
    socket.on('connect', () => { socket.destroy(); resolve(true); });
    socket.on('timeout', () => { socket.destroy(); resolve(false); });
    socket.on('error', () => { socket.destroy(); resolve(false); });
    if(ip) socket.connect(port, ip);
    else resolve(false);
  });
};

const extractIPv4 = (str) => {
  if (!str) return null;
  const match = str.match(/\b(?:\d{1,3}\.){3}\d{1,3}\b/);
  return match ? match[0] : str;
};

const startMonitoring = (io) => {
  console.log('🛡️ Universal Diagnostic Engine Started (Monitoring ALL Infrastructure)...');

  cron.schedule('*/30 * * * * *', async () => {
    try {
      // 1. Fetch EVERYTHING, including the new custom devices
      const [cameras, nvrs, radios, rfids, routers, customDevs] = await Promise.all([
        Camera.find(), Nvr.find(), Radio.find(), Rfid.find(), Router.find(), CustomDevice.find()
      ]);

      // 2. Normalize them into one massive universal list
      const allDevices = [
        ...cameras.map(d => ({ doc: d, type: 'Camera', ip: d.ip, id: d.deviceId, name: d.name })),
        ...nvrs.map(d => ({ doc: d, type: 'NVR', ip: d.ip, id: d.deviceId, name: d.name })),
        ...radios.map(d => ({ doc: d, type: 'Radio', ip: extractIPv4(d.ipEndpoints), id: d.deviceId, name: d.linkName })),
        ...rfids.map(d => ({ doc: d, type: 'RFID', ip: d.controllerIp || d.ip, id: d.deviceId, name: d.barrierName })),
        ...routers.map(d => ({ doc: d, type: 'Router', ip: d.ip, id: d.deviceId, name: d.gatewayName })),
        ...customDevs.map(d => ({ doc: d, type: d.type, ip: d.ip, id: d.deviceId, name: d.name })) // <-- NEW
      ];

      // 3. Ping everything in parallel
      await Promise.all(allDevices.map(async (device) => {
        if (!device.ip) return; 

        const res = await ping.promise.probe(device.ip, { timeout: 2 });
        let newStatus = 'offline';
        let newLatency = '-';
        let latencyMs = 0;
        let diagnosticReason = 'OK';

        if (res.alive) {
          latencyMs = Math.round(res.time);
          newLatency = `${latencyMs}ms`;
          newStatus = latencyMs > 150 ? 'warning' : 'online';
          diagnosticReason = newStatus === 'warning' ? 'Network Congestion' : 'OK';
        } else {
          const isPortOpen = await checkPort(device.ip, 80);
          diagnosticReason = isPortOpen ? 'Software Crashed (Needs Reboot)' : 'Device Unreachable / Power Loss';
        }

        const latestRecord = await DeviceHistory.findOne({ deviceId: device.id }).sort({ startTime: -1 });
        
        if (!latestRecord || latestRecord.status !== newStatus) {
          if (latestRecord && !latestRecord.endTime) {
            const now = new Date();
            latestRecord.endTime = now;
            latestRecord.durationMinutes = Math.round((now - latestRecord.startTime) / 60000);
            await latestRecord.save();
          }
          await DeviceHistory.create({ deviceId: device.id, ip: device.ip, status: newStatus, startTime: new Date() });
        }

        await CameraMetric.create({ deviceId: device.id, latencyMs, isOnline: res.alive });

        const dbDoc = device.doc;
        let statusChanged = (dbDoc.status !== newStatus);
        
        dbDoc.status = newStatus;
        dbDoc.latency = newLatency;
        dbDoc.rootCause = diagnosticReason;
        dbDoc.lastSeen = new Date();
        await dbDoc.save();

        const emitData = { id: device.id, status: newStatus, latency: newLatency, rootCause: diagnosticReason, lastSeen: dbDoc.lastSeen };
        io.emit('deviceStatusUpdate', emitData); 
        io.emit('cameraStatusUpdate', emitData);

        if (statusChanged) {
          console.log(`📡 Alert: [${device.type}] ${device.name} is ${newStatus.toUpperCase()} [${diagnosticReason}]`);
        }
      }));
    } catch (error) { 
      console.error('Universal Engine Error:', error); 
    }
  });
};

module.exports = startMonitoring;
require('dotenv').config();
const mongoose = require('mongoose');
const Nvr = require('./models/Nvr');
const Radio = require('./models/Radio');
const Rfid = require('./models/Rfid');
const Router = require('./models/Router');

// --- THE DATA ---
const nvrData = [
  { deviceId: "NVR-01", name: "Control Room NVR 1", ip: "172.22.65.16", location: "Control_Room" },
  { deviceId: "NVR-02", name: "GM Office Primary NVR", ip: "172.22.65.142", location: "GM OFC" },
  { deviceId: "NVR-03", name: "Control Room NVR 2", ip: "172.22.65.147", location: "Control_Room" },
  { deviceId: "NVR-14", name: "JRD Weighbridge 6 NVR", ip: "172.22.193.225", location: "JRD WB-6" },
  { deviceId: "NVR-16", name: "Road Sale Barrier NVR", ip: "172.22.65.59", location: "Road Sale Barrier" }
  // You can paste the rest of your NVRs here later, keeping it short for testing
];

const radioData = [
  { deviceId: "RAD-01", linkName: "Exchange <-> Road sale barrier", ipEndpoints: "172.22.64.220 / .219", location: "Sector A Link" },
  { deviceId: "RAD-02", linkName: "East Repeater <-> JRD WB", ipEndpoints: "172.22.64.90 / .89", location: "East Border" }
];

const rfidData = [
  { deviceId: "RFID-01", barrierName: "DCH JRD BORDER BARRIER", controllerIp: "172.22.64.226", location: "JRD Border Entry", hardwareChain: "PC .150 -> Ctrl .226 -> Cam .227/.228" },
  { deviceId: "RFID-02", barrierName: "MAIN MINE ENTRY GATE", controllerIp: "172.22.64.48", location: "Primary Gate 1", hardwareChain: "PC .46 -> Ctrl .48 -> Cam .49/.50" }
];

const routerData = [
  { deviceId: "RTR-01", gatewayName: "VTC Core Gateway", ip: "172.22.64.211", location: "VTC Center" },
  { deviceId: "RTR-02", gatewayName: "View Point Distribution", ip: "172.22.64.212", location: "View Point" }
];

// --- THE INJECTION ENGINE ---
mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("📦 MongoDB Connected. Wiping old infrastructure data...");
    
    // Clear out any old test data
    await Nvr.deleteMany({});
    await Radio.deleteMany({});
    await Rfid.deleteMany({});
    await Router.deleteMany({});

    console.log("🌱 Injecting new enterprise infrastructure...");
    
    // Insert the new arrays
    await Nvr.insertMany(nvrData);
    await Radio.insertMany(radioData);
    await Rfid.insertMany(rfidData);
    await Router.insertMany(routerData);

    console.log("✅ Database Seeding Complete!");
    process.exit();
  })
  .catch(err => {
    console.error("❌ Seeding Error:", err);
    process.exit(1);
  });
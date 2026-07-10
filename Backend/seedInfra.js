require('dotenv').config();
const mongoose = require('mongoose');
const Nvr = require('./models/Nvr');
const Radio = require('./models/Radio');
const Rfid = require('./models/Rfid');
const Router = require('./models/Router');

// ==========================================
// 1. NVR DATA (Complete 20 entries)
// ==========================================
const nvrData = [
  { deviceId: "NVR-01", name: "Control Room NVR 1", ip: "172.22.65.16", location: "Control Room" },
  { deviceId: "NVR-02", name: "GM OFC NVR", ip: "172.22.65.142", location: "GM OFC" },
  { deviceId: "NVR-03", name: "Control Room NVR 2", ip: "172.22.65.147", location: "Control Room" },
  { deviceId: "NVR-04", name: "Control Room NVR 3", ip: "172.22.65.148", location: "Control Room" },
  { deviceId: "NVR-05", name: "Control Room NVR 4", ip: "172.22.65.183", location: "Control Room" },
  { deviceId: "NVR-06", name: "Control Room NVR 5", ip: "172.22.65.189", location: "Control Room" },
  { deviceId: "NVR-07", name: "Diesel filling NVR", ip: "172.22.65.251", location: "Diesel filling" },
  { deviceId: "NVR-08", name: "WB No. 1 NVR", ip: "172.22.65.227", location: "WB No. 1" },
  { deviceId: "NVR-09", name: "System OFC NVR", ip: "172.22.64.121", location: "System OFC" },
  { deviceId: "NVR-10", name: "System NVR", ip: "172.22.65.242", location: "System" },
  { deviceId: "NVR-11", name: "PO OFC NVR", ip: "172.22.65.97", location: "PO OFC" },
  { deviceId: "NVR-12", name: "WB-7 NVR", ip: "172.22.65.146", location: "WB-7" },
  { deviceId: "NVR-13", name: "WB-3/4 NVR", ip: "172.22.65.228", location: "WB-3/4" },
  { deviceId: "NVR-14", name: "JRD WB-6 NVR", ip: "172.22.193.225", location: "JRD WB-6" },
  { deviceId: "NVR-15", name: "Sector-B dispensary NVR", ip: "172.22.66.37", location: "Sector-B dispensary" },
  { deviceId: "NVR-16", name: "Road Sale Barrier NVR", ip: "172.22.65.59", location: "Road Sale Barrier" },
  { deviceId: "NVR-17", name: "SILO-3 NVR", ip: "172.22.64.249", location: "SILO-3" },
  { deviceId: "NVR-18", name: "New Diesel Filling Point NVR", ip: "172.22.64.122", location: "New Diesel Filling Point" },
  { deviceId: "NVR-19", name: "Control Room NVR 6", ip: "172.22.64.124", location: "Control Room" },
  { deviceId: "NVR-20", name: "STP Plant NVR", ip: "172.22.64.127", location: "STP Plant" }
];

// ==========================================
// 2. RADIO DATA (11 Point-to-Point Links)
// ==========================================
const radioData = [
  { deviceId: "RAD-01", linkName: "Exchange-1 <-> Road sale barrier", ipEndpoints: "172.22.64.220 / .219", location: "Road Sale Link" },
  { deviceId: "RAD-02", linkName: "East Repeater <-> JRD WB", ipEndpoints: "172.22.64.90 / .89", location: "JRD Border Link" },
  { deviceId: "RAD-03", linkName: "F-substation-1 <-> ETP", ipEndpoints: "172.22.64.100 / .101", location: "Substation East" },
  { deviceId: "RAD-04", linkName: "F-substation-2 <-> East Repeater", ipEndpoints: "172.22.64.100 / .88", location: "Substation West" },
  { deviceId: "RAD-05", linkName: "Exchange-2 <-> silo-3", ipEndpoints: "172.22.65.21 / .22", location: "Silo Access Link" },
  { deviceId: "RAD-06", linkName: "SILO <-> WB- 3/4", ipEndpoints: "172.22.64.93 / .95", location: "Weighbridge Link" },
  { deviceId: "RAD-07", linkName: "Repeater <-> Jeesco BB", ipEndpoints: "172.22.64.85 / .86", location: "Jeesco Link" },
  { deviceId: "RAD-08", linkName: "Old Silo <-> 120T workshop", ipEndpoints: "172.22.65.25 / .26", location: "Workshop Link" },
  { deviceId: "RAD-09", linkName: "East section <-> New Diesel Point", ipEndpoints: "172.22.64.150 / .151", location: "Fuel Station Link" },
  { deviceId: "RAD-10", linkName: "West Section <-> Caliber camp BB", ipEndpoints: "172.22.64.152 / .153", location: "Camp Link" },
  { deviceId: "RAD-11", linkName: "WB-6 <-> HQ", ipEndpoints: "172.22.193.220 / .221", location: "HQ Trunk Link" }
];

// ==========================================
// 3. RFID DATA (5 Precision Hardware Mappings)
// ==========================================
const rfidData = [
  { deviceId: "RFID-01", barrierName: "DCH JRD BORDER BARRIER", controllerIp: "172.22.193.226", location: "JRD Border Entry", hardwareChain: "PC .150 -> Tatvik Ctrl .226 -> Cam .227/.228" },
  { deviceId: "RFID-02", barrierName: "MAIN MINE ENTRY BARRIER", controllerIp: "172.22.65.48", location: "Primary Gate 1", hardwareChain: "PC .46 -> Tatvik Ctrl .48 -> Cam .49/.50" },
  { deviceId: "RFID-03", barrierName: "ROAD SALE BARRIER", controllerIp: "172.22.65.69", location: "Road Sale Gate", hardwareChain: "PC .57 -> Tatvik Ctrl .69 -> Cam .59/.60" },
  { deviceId: "RFID-04", barrierName: "JRD SIDING BARRIER", controllerIp: "172.22.17.64", location: "Siding Entry", hardwareChain: "PC .62 -> Base Ctrl .64 -> Cam .65/.66" },
  { deviceId: "RFID-05", barrierName: "DCH-JND DCH", controllerIp: "172.22.64.168", location: "JND Connection", hardwareChain: "PC .166 -> Tatvik Ctrl .168 -> Cam .169/.170" }
];

// ==========================================
// 4. ROUTER DATA (Verified Gateways + 3 Additions)
// ==========================================
const routerData = [
  { deviceId: "RTR-01", gatewayName: "VTC Core Gateway", ip: "172.22.64.211", location: "VTC Center" },
  { deviceId: "RTR-02", gatewayName: "View Point Distribution", ip: "172.22.64.212", location: "View Point" },
  { deviceId: "RTR-03", gatewayName: "Control Room Core Router", ip: "172.22.65.1", location: "Control Room" },
  { deviceId: "RTR-04", gatewayName: "GM Office Distribution Switch", ip: "172.22.65.141", location: "GM OFC" },
  { deviceId: "RTR-05", gatewayName: "JRD Weighbridge Area Router", ip: "172.22.193.1", location: "JRD WB-6" },
  { deviceId: "RTR-06", gatewayName: "Silo Complex Aggregator", ip: "172.22.64.200", location: "SILO-3" },
  // Last 3 custom entries added for infrastructure completion:
  { deviceId: "RTR-07", gatewayName: "Sector-B Network Distribution", ip: "172.22.66.1", location: "Sector-B Dispensary" },
  { deviceId: "RTR-08", gatewayName: "STP Plant Access Router", ip: "172.22.64.130", location: "STP Plant" },
  { deviceId: "RTR-09", gatewayName: "Mine Perimeter Fiber Gateway", ip: "172.22.64.2", location: "Main Entry Gate" }
];

// ==========================================
// THE INJECTION ENGINE
// ==========================================
mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("📦 MongoDB Connected. Wiping old infrastructure data...");
    
    // Clear out any old test data
    await Nvr.deleteMany({});
    await Radio.deleteMany({});
    await Rfid.deleteMany({});
    await Router.deleteMany({});

    console.log("🌱 Injecting verified production infrastructure...");
    
    // Insert the pristine production arrays
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
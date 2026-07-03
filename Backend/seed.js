require('dotenv').config();
const mongoose = require('mongoose');
const Camera = require('./models/Camera');
const connectDB = require('./config/db');

// Helper to generate realistic mock statuses for the initial database load
const randomStatus = () => {
  const rand = Math.random();
  if (rand > 0.85) return { status: 'offline', latency: '-', lastSeen: new Date(Date.now() - 7200000) }; // 2 hours ago
  if (rand > 0.70) return { status: 'warning', latency: `${Math.floor(Math.random() * 300 + 150)}ms`, lastSeen: new Date() };
  return { status: 'online', latency: `${Math.floor(Math.random() * 40 + 5)}ms`, lastSeen: new Date() };
};

// The Complete Dudhichua CCTV Dataset
const cameras = [
  // --- GM OFFICE ---
  { deviceId: "SL-01", section: "GM OFFICE", ip: "172.22.65.221", name: "DCH MAIN GATE CAM 1 CP_PLUS", location: "Main Gate", ...randomStatus() },
  { deviceId: "SL-02", section: "GM OFFICE", ip: "172.22.65.222", name: "DCH MAIN GATE CAM 2 CP_PLUS", location: "Main Gate", ...randomStatus() },
  { deviceId: "SL-03", section: "GM OFFICE", ip: "172.22.65.224", name: "DCH MAIN GATE CAM 3 CP_PLUS", location: "Main Gate", ...randomStatus() },
  { deviceId: "SL-04", section: "GM OFFICE", ip: "172.22.65.185", name: "GM OFFICE MR SECTION HIKVISION", location: "MR Section", ...randomStatus() },
  { deviceId: "SL-05", section: "GM OFFICE", ip: "172.22.65.188", name: "GM OFFICE KITCHEN HIKVISION", location: "Kitchen", ...randomStatus() },
  { deviceId: "SL-06", section: "GM OFFICE", ip: "172.22.65.184", name: "FINANCE SECTION HIKVISION", location: "Finance Dept", ...randomStatus() },
  { deviceId: "SL-07", section: "GM OFFICE", ip: "172.22.65.20",  name: "GM OFFICE ENTRY HALL HIKVISION", location: "Entry Hall", ...randomStatus() },
  { deviceId: "SL-08", section: "GM OFFICE", ip: "172.22.65.68",  name: "GM OFFICE ENTRANCE ROYAL SHIELD", location: "Entrance", ...randomStatus() },
  { deviceId: "SL-09", section: "GM OFFICE", ip: "172.22.65.186", name: "GM OFC PURCHASE SECTION GATE", location: "Purchase Dept", ...randomStatus() },
  { deviceId: "SL-10", section: "GM OFFICE", ip: "172.22.65.105", name: "GM OFC PARKING HONEYWELL", location: "Parking Lot", ...randomStatus() },
  { deviceId: "SL-11", section: "GM OFFICE", ip: "172.22.65.69",  name: "GM OFFICE CANTEEN", location: "Canteen", ...randomStatus() },

  // --- BOOM BARRIER ---
  { deviceId: "SL-12", section: "BOOM BARRIER", ip: "172.22.65.71",  name: "MINE ENTRY BARRIER ROYAL SHIELD", location: "Mine Entry", ...randomStatus() },
  { deviceId: "SL-13", section: "BOOM BARRIER", ip: "172.22.65.143", name: "ROAD SALE BARRIER CP_PLUS", location: "Road Sale", ...randomStatus() },
  { deviceId: "SL-14", section: "BOOM BARRIER", ip: "172.22.65.48",  name: "MINE ENTRY MAIN BB HIKVISION", location: "Mine Entry Main", ...randomStatus() },
  { deviceId: "SL-15", section: "BOOM BARRIER", ip: "172.22.65.49",  name: "MINE EXIT MAIN BB HIKVISION", location: "Mine Exit Main", ...randomStatus() },
  { deviceId: "SL-16", section: "BOOM BARRIER", ip: "172.22.64.152", name: "MINE ENTRY JRD BB HIKVISION", location: "JRD Entry", ...randomStatus() },
  { deviceId: "SL-17", section: "BOOM BARRIER", ip: "172.22.65.58",  name: "MINE ENTRY ROAD SALE BB HIKVISION", location: "Road Sale Entry", ...randomStatus() },
  { deviceId: "SL-18", section: "BOOM BARRIER", ip: "172.22.65.57",  name: "MINE EXIT ROAD SALE BB HIKVISION", location: "Road Sale Exit", ...randomStatus() },
  { deviceId: "SL-19", section: "BOOM BARRIER", ip: "172.22.65.73",  name: "ROAD SALE BARRIER ROYAL SHIELD PTZ", location: "Road Sale PTZ", ...randomStatus() },
  { deviceId: "SL-20", section: "BOOM BARRIER", ip: "172.22.65.197", name: "GSSCO BB ENTRY/EXIT", location: "GSSCO", ...randomStatus() },
  { deviceId: "SL-21", section: "BOOM BARRIER", ip: "172.22.17.96",  name: "JRD BOOM BARRIER", location: "JRD Barrier", ...randomStatus() },
  { deviceId: "SL-22", section: "BOOM BARRIER", ip: "172.22.64.153", name: "MINE EXIT JRD BB HIKVISION", location: "JRD Exit", ...randomStatus() },

  // --- WEIGH BRIDGES ---
  { deviceId: "SL-23", section: "WEIGH BRIDGES", ip: "172.22.65.75",  name: "WB-1 IN ROYAL SHIELD", location: "WB-1 In", ...randomStatus() },
  { deviceId: "SL-24", section: "WEIGH BRIDGES", ip: "172.22.65.96",  name: "WB-1 TOP VIEW", location: "WB-1 Top", ...randomStatus() },
  { deviceId: "SL-25", section: "WEIGH BRIDGES", ip: "172.22.65.64",  name: "WB-1 SECURE EYE", location: "WB-1 General", ...randomStatus() },
  { deviceId: "SL-26", section: "WEIGH BRIDGES", ip: "172.22.65.92",  name: "WB-3/4 PLATFORM ROYAL SHIELD", location: "WB-3/4 Platform", ...randomStatus() },
  { deviceId: "SL-27", section: "WEIGH BRIDGES", ip: "172.22.65.93",  name: "WB-4 PLATFORM ROYAL SHIELD", location: "WB-4 Platform", ...randomStatus() },
  { deviceId: "SL-28", section: "WEIGH BRIDGES", ip: "172.22.65.131", name: "WB-3 CAM 1 HIKVISION", location: "WB-3", ...randomStatus() },
  { deviceId: "SL-29", section: "WEIGH BRIDGES", ip: "172.22.65.133", name: "WB-3 CAM 2 HIKVISION", location: "WB-3", ...randomStatus() },
  { deviceId: "SL-30", section: "WEIGH BRIDGES", ip: "172.22.65.187", name: "WB-6 JRD IN VIEW HIKVISION", location: "WB-6 JRD", ...randomStatus() },
  { deviceId: "SL-31", section: "WEIGH BRIDGES", ip: "172.22.65.103", name: "WB-6 TOP VIEW ROYAL SHIELD", location: "WB-6 Top", ...randomStatus() },
  { deviceId: "SL-32", section: "WEIGH BRIDGES", ip: "172.22.65.109", name: "WB-6 HIKVISION", location: "WB-6", ...randomStatus() },
  { deviceId: "SL-33", section: "WEIGH BRIDGES", ip: "172.22.65.91",  name: "WB-7 TOP VIEW ROYAL SHIELD", location: "WB-7 Top", ...randomStatus() },
  { deviceId: "SL-34", section: "WEIGH BRIDGES", ip: "172.22.65.113", name: "WB-7 IN HIKVISION", location: "WB-7 In", ...randomStatus() },
  { deviceId: "SL-35", section: "WEIGH BRIDGES", ip: "172.22.65.62",  name: "WB-3 IN CP_PLUS", location: "WB-3 In", ...randomStatus() },
  { deviceId: "SL-36", section: "WEIGH BRIDGES", ip: "172.22.65.35",  name: "WB-7 PLATFORM CP PLUS", location: "WB-7 Platform", ...randomStatus() },

  // --- INDUSTRIAL OPS ---
  { deviceId: "SL-37", section: "INDUSTRIAL OPS", ip: "172.22.65.123", name: "DOZER SECTION HONEYWELL", location: "Dozer Area", ...randomStatus() },
  { deviceId: "SL-38", section: "INDUSTRIAL OPS", ip: "172.22.65.127", name: "F-SUB STATION", location: "Sub Station", ...randomStatus() },
  { deviceId: "SL-39", section: "INDUSTRIAL OPS", ip: "172.22.65.90",  name: "DIESEL FILLING ROYAL SHIELD", location: "Diesel Point", ...randomStatus() },
  { deviceId: "SL-40", section: "INDUSTRIAL OPS", ip: "172.22.65.63",  name: "DIESEL POINT OUTSIDE ROAD", location: "Diesel Outer", ...randomStatus() },
  { deviceId: "SL-41", section: "INDUSTRIAL OPS", ip: "172.22.65.79",  name: "DIESEL FILLING INFLOW METER 1", location: "Meter 1", ...randomStatus() },
  { deviceId: "SL-42", section: "INDUSTRIAL OPS", ip: "172.22.65.114", name: "DIESEL FILLING TOWER HIKVISION", location: "Diesel Tower", ...randomStatus() },
  { deviceId: "SL-43", section: "INDUSTRIAL OPS", ip: "172.22.65.71",  name: "DIESEL FILLING INFLOW MTR 2", location: "Meter 2", ...randomStatus() },
  { deviceId: "SL-44", section: "INDUSTRIAL OPS", ip: "172.22.65.107", name: "LIGHT VEHICLE DIESEL FILING POINT", location: "LV Diesel", ...randomStatus() },
  { deviceId: "SL-45", section: "INDUSTRIAL OPS", ip: "172.22.65.78",  name: "120T SCRAP YARD HONEYWELL", location: "120T Yard", ...randomStatus() },
  { deviceId: "SL-46", section: "INDUSTRIAL OPS", ip: "172.22.65.77",  name: "120T SCRAP YARD HIKVISION", location: "120T Yard", ...randomStatus() },
  { deviceId: "SL-47", section: "INDUSTRIAL OPS", ip: "172.22.65.121", name: "120T DUMPER SEC/WORKSHOP", location: "Dumper Workshop", ...randomStatus() },
  { deviceId: "SL-48", section: "INDUSTRIAL OPS", ip: "172.22.65.74",  name: "100T DUMPER SECTION", location: "100T Section", ...randomStatus() },
  { deviceId: "SL-49", section: "INDUSTRIAL OPS", ip: "172.22.65.67",  name: "TIME OFFICE NEW PTZ", location: "Time Office", ...randomStatus() },
  { deviceId: "SL-50", section: "INDUSTRIAL OPS", ip: "172.22.65.203", name: "CHP TIME OFFICE", location: "CHP", ...randomStatus() },
  { deviceId: "SL-51", section: "INDUSTRIAL OPS", ip: "172.22.65.65",  name: "CHP TRISECTION POLE", location: "CHP Pole", ...randomStatus() },
  { deviceId: "SL-52", section: "INDUSTRIAL OPS", ip: "172.22.65.60",  name: "RAILWAY SIDING IN SECURE EYE", location: "Railway Siding", ...randomStatus() },
  { deviceId: "SL-53", section: "INDUSTRIAL OPS", ip: "172.22.65.138", name: "CRUSER 2 TOWER PTZ", location: "Crusher 2", ...randomStatus() },
  { deviceId: "SL-54", section: "INDUSTRIAL OPS", ip: "172.22.65.192", name: "DCH RAILWAY WHARF WALL", location: "Wharf Wall", ...randomStatus() },
  { deviceId: "SL-55", section: "INDUSTRIAL OPS", ip: "172.22.65.204", name: "COAL SAMPLING ROYAL SHIELD", location: "Sampling", ...randomStatus() },
  { deviceId: "SL-56", section: "INDUSTRIAL OPS", ip: "172.22.65.199", name: "ETP HIKVISION", location: "ETP", ...randomStatus() },
  { deviceId: "SL-57", section: "INDUSTRIAL OPS", ip: "172.22.65.134", name: "COAL LAB CP_PLUS", location: "Coal Lab", ...randomStatus() },
  { deviceId: "SL-58", section: "INDUSTRIAL OPS", ip: "172.22.65.136", name: "ETP MINES 1 HIKVISION", location: "ETP Mines", ...randomStatus() },
  { deviceId: "SL-59", section: "INDUSTRIAL OPS", ip: "172.22.65.110", name: "DCH SHOVEL PTZ HONEYWELL", location: "Shovel Area", ...randomStatus() },
  { deviceId: "SL-60", section: "INDUSTRIAL OPS", ip: "172.22.65.129", name: "RAILWAY ENTRY EXIT HIKVISION", location: "Railway Gate", ...randomStatus() },
  { deviceId: "SL-61", section: "INDUSTRIAL OPS", ip: "172.22.65.122", name: "NEW TIME OFFICE IN", location: "Time Office Inner", ...randomStatus() },

  // --- WEST SECTION ---
  { deviceId: "SL-62", section: "WEST SECTION", ip: "172.22.65.89",  name: "COAL STOCK WEST ROYAL SHIELD", location: "West Coal Stock", ...randomStatus() },
  { deviceId: "SL-63", section: "WEST SECTION", ip: "172.22.65.104", name: "WEST PARKING ROYAL SHIELD", location: "West Parking", ...randomStatus() },
  { deviceId: "SL-64", section: "WEST SECTION", ip: "172.22.65.181", name: "WEST TRI-SECTION HIKVISION PTZ", location: "West Tri-Section", ...randomStatus() },

  // --- EAST SECTION ---
  { deviceId: "SL-65", section: "EAST SECTION", ip: "172.22.65.94",  name: "EAST VIEW POINT ROYAL SHIELD", location: "East View Point", ...randomStatus() },
  { deviceId: "SL-66", section: "EAST SECTION", ip: "172.22.65.202", name: "WB-3 IN VIEW ROYAL SHIELD", location: "WB-3 View", ...randomStatus() },
  { deviceId: "SL-67", section: "EAST SECTION", ip: "172.22.65.180", name: "EAST PARKING HIKVISION", location: "East Parking", ...randomStatus() },

  // --- STORE ---
  { deviceId: "SL-68", section: "STORE", ip: "172.22.65.70",  name: "R-STORE ENTRY TOWER ROYAL SHIELD", location: "Store Tower", ...randomStatus() },
  { deviceId: "SL-69", section: "STORE", ip: "172.22.65.223", name: "R-STORE ISSUE SECTION HIKVISION", location: "Issue Section", ...randomStatus() },
  { deviceId: "SL-70", section: "STORE", ip: "172.22.65.158", name: "VIEW POINT KALI MANDIR", location: "Kali Mandir", ...randomStatus() },
  { deviceId: "SL-71", section: "STORE", ip: "172.22.65.118", name: "R-STORE HONEYWELL", location: "Main Store", ...randomStatus() },
  { deviceId: "SL-72", section: "STORE", ip: "172.22.65.117", name: "R-STORE SECTION HONEYWELL", location: "Store Section", ...randomStatus() },

  // --- SILO ---
  { deviceId: "SL-73", section: "SILO", ip: "172.22.65.120", name: "SILO-3 INSIDE VIEW HIKVISION", location: "Silo-3 Inner", ...randomStatus() },
  { deviceId: "SL-74", section: "SILO", ip: "172.22.65.190", name: "SILO-3 TRACK IN VIEW CP_PLUS", location: "Silo-3 Track In", ...randomStatus() },
  { deviceId: "SL-75", section: "SILO", ip: "172.22.65.137", name: "SILO-3 TRACK OUT CP_PLUS", location: "Silo-3 Track Out", ...randomStatus() },
  { deviceId: "SL-76", section: "SILO", ip: "172.22.65.124", name: "DCH SILO-1 PTZ HONEYWELL-B/D", location: "Silo-1", ...randomStatus() },
  { deviceId: "SL-77", section: "SILO", ip: "172.22.65.230", name: "SILO-2 PTZ VIEW HIKVISION", location: "Silo-2", ...randomStatus() },

  // --- COAL STOCK ---
  { deviceId: "SL-78", section: "COAL STOCK", ip: "172.22.65.66",  name: "12 No. COAL STOCK", location: "Stock 12", ...randomStatus() },
  { deviceId: "SL-79", section: "COAL STOCK", ip: "172.22.65.76",  name: "1&2 No. COAL STOCK", location: "Stock 1 & 2", ...randomStatus() },
  { deviceId: "SL-80", section: "COAL STOCK", ip: "172.22.64.155", name: "COAL STOCK EAST HIKVISION", location: "Stock East", ...randomStatus() },
  { deviceId: "SL-81", section: "COAL STOCK", ip: "172.22.65.102", name: "CRUSHER 1 ROYAL SHIELD", location: "Crusher 1", ...randomStatus() },

  // --- DISPENSARY ---
  { deviceId: "SL-82", section: "DISPENSARY", ip: "172.22.96.36",  name: "DISPENSARY SECTOR B HONEYWELL", location: "Sector B", ...randomStatus() },
];

const seedDB = async () => {
  try {
    await connectDB();
    
    console.log('🗑️  Clearing old camera data...');
    await Camera.deleteMany(); // Wipes the collection clean
    
    console.log('🌱 Injecting 82 Dudhichua cameras...');
    await Camera.insertMany(cameras); // Inserts the array
    
    console.log('✅ Database seeded successfully!');
    process.exit(0); // Closes the terminal process cleanly
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDB();
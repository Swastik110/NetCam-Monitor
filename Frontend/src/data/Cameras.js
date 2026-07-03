// src/data/Cameras.js

// Helper to generate realistic mock statuses
const randomStatus = () => {
  const rand = Math.random();
  if (rand > 0.85) return { status: 'offline', latency: '-', lastSeen: '2 hrs ago' };
  if (rand > 0.70) return { status: 'warning', latency: `${Math.floor(Math.random() * 300 + 150)}ms`, lastSeen: 'Just now' };
  return { status: 'online', latency: `${Math.floor(Math.random() * 40 + 5)}ms`, lastSeen: 'Just now' };
};

export const cameras = [
  // --- GM OFFICE ---
  { id: "SL-01", section: "GM OFFICE", ip: "172.22.65.221", name: "DCH MAIN GATE CAM 1 CP_PLUS", ...randomStatus() },
  { id: "SL-02", section: "GM OFFICE", ip: "172.22.65.222", name: "DCH MAIN GATE CAM 2 CP_PLUS", ...randomStatus() },
  { id: "SL-03", section: "GM OFFICE", ip: "172.22.65.224", name: "DCH MAIN GATE CAM 3 CP_PLUS", ...randomStatus() },
  { id: "SL-04", section: "GM OFFICE", ip: "172.22.65.185", name: "GM OFFICE MR SECTION HIKVISION", ...randomStatus() },
  { id: "SL-05", section: "GM OFFICE", ip: "172.22.65.188", name: "GM OFFICE KITCHEN HIKVISION", ...randomStatus() },
  { id: "SL-06", section: "GM OFFICE", ip: "172.22.65.184", name: "FINANCE SECTION HIKVISION", ...randomStatus() },
  { id: "SL-07", section: "GM OFFICE", ip: "172.22.65.20",  name: "GM OFFICE ENTRY HALL HIKVISION", ...randomStatus() },
  { id: "SL-08", section: "GM OFFICE", ip: "172.22.65.68",  name: "GM OFFICE ENTRANCE ROYAL SHIELD", ...randomStatus() },
  { id: "SL-09", section: "GM OFFICE", ip: "172.22.65.186", name: "GM OFC PURCHASE SECTION GATE", ...randomStatus() },
  { id: "SL-10", section: "GM OFFICE", ip: "172.22.65.105", name: "GM OFC PARKING HONEYWELL", ...randomStatus() },
  { id: "SL-11", section: "GM OFFICE", ip: "172.22.65.69",  name: "GM OFFICE CANTEEN", ...randomStatus() },

  // --- BOOM BARRIER ---
  { id: "SL-12", section: "BOOM BARRIER", ip: "172.22.65.71",  name: "MINE ENTRY BARRIER ROYAL SHIELD", ...randomStatus() },
  { id: "SL-13", section: "BOOM BARRIER", ip: "172.22.65.143", name: "ROAD SALE BARRIER CP_PLUS", ...randomStatus() },
  { id: "SL-14", section: "BOOM BARRIER", ip: "172.22.65.48",  name: "MINE ENTRY MAIN BB HIKVISION", ...randomStatus() },
  { id: "SL-15", section: "BOOM BARRIER", ip: "172.22.65.49",  name: "MINE EXIT MAIN BB HIKVISION", ...randomStatus() },
  { id: "SL-16", section: "BOOM BARRIER", ip: "172.22.64.152", name: "MINE ENTRY JRD BB HIKVISION", ...randomStatus() },
  { id: "SL-17", section: "BOOM BARRIER", ip: "172.22.65.58",  name: "MINE ENTRY ROAD SALE BB HIKVISION", ...randomStatus() },
  { id: "SL-18", section: "BOOM BARRIER", ip: "172.22.65.57",  name: "MINE EXIT ROAD SALE BB HIKVISION", ...randomStatus() },
  { id: "SL-19", section: "BOOM BARRIER", ip: "172.22.65.73",  name: "ROAD SALE BARRIER ROYAL SHIELD PTZ", ...randomStatus() },
  { id: "SL-20", section: "BOOM BARRIER", ip: "172.22.65.197", name: "GSSCO BB ENTRY/EXIT", ...randomStatus() },
  { id: "SL-21", section: "BOOM BARRIER", ip: "172.22.17.96",  name: "JRD BOOM BARRIER", ...randomStatus() },
  { id: "SL-22", section: "BOOM BARRIER", ip: "172.22.64.153", name: "MINE EXIT JRD BB HIKVISION", ...randomStatus() },

  // --- WEIGH BRIDGES ---
  { id: "SL-23", section: "WEIGH BRIDGES", ip: "172.22.65.75",  name: "WB-1 IN ROYAL SHIELD", ...randomStatus() },
  { id: "SL-24", section: "WEIGH BRIDGES", ip: "172.22.65.96",  name: "WB-1 TOP VIEW", ...randomStatus() },
  { id: "SL-25", section: "WEIGH BRIDGES", ip: "172.22.65.64",  name: "WB-1 SECURE EYE", ...randomStatus() },
  { id: "SL-26", section: "WEIGH BRIDGES", ip: "172.22.65.92",  name: "WB-3/4 PLATFORM ROYAL SHIELD", ...randomStatus() },
  { id: "SL-27", section: "WEIGH BRIDGES", ip: "172.22.65.93",  name: "WB-4 PLATFORM ROYAL SHIELD", ...randomStatus() },
  { id: "SL-28", section: "WEIGH BRIDGES", ip: "172.22.65.131", name: "WB-3 CAM 1 HIKVISION", ...randomStatus() },
  { id: "SL-29", section: "WEIGH BRIDGES", ip: "172.22.65.133", name: "WB-3 CAM 2 HIKVISION", ...randomStatus() },
  { id: "SL-30", section: "WEIGH BRIDGES", ip: "172.22.65.187", name: "WB-6 JRD IN VIEW HIKVISION", ...randomStatus() },
  { id: "SL-31", section: "WEIGH BRIDGES", ip: "172.22.65.103", name: "WB-6 TOP VIEW ROYAL SHIELD", ...randomStatus() },
  { id: "SL-32", section: "WEIGH BRIDGES", ip: "172.22.65.109", name: "WB-6 HIKVISION", ...randomStatus() },
  { id: "SL-33", section: "WEIGH BRIDGES", ip: "172.22.65.91",  name: "WB-7 TOP VIEW ROYAL SHIELD", ...randomStatus() },
  { id: "SL-34", section: "WEIGH BRIDGES", ip: "172.22.65.113", name: "WB-7 IN HIKVISION", ...randomStatus() },
  { id: "SL-35", section: "WEIGH BRIDGES", ip: "172.22.65.62",  name: "WB-3 IN CP_PLUS", ...randomStatus() },
  { id: "SL-36", section: "WEIGH BRIDGES", ip: "172.22.65.35",  name: "WB-7 PLATFORM CP PLUS", ...randomStatus() },

  // --- INDUSTRIAL OPERATIONS (DOZER, DIESEL, ETP, SIDING, ETC) ---
  { id: "SL-37", section: "INDUSTRIAL OPS", ip: "172.22.65.123", name: "DOZER SECTION HONEYWELL", ...randomStatus() },
  { id: "SL-38", section: "INDUSTRIAL OPS", ip: "172.22.65.127", name: "F-SUB STATION", ...randomStatus() },
  { id: "SL-39", section: "INDUSTRIAL OPS", ip: "172.22.65.90",  name: "DIESEL FILLING ROYAL SHIELD", ...randomStatus() },
  { id: "SL-40", section: "INDUSTRIAL OPS", ip: "172.22.65.63",  name: "DIESEL POINT OUTSIDE ROAD SECURE EYE", ...randomStatus() },
  { id: "SL-41", section: "INDUSTRIAL OPS", ip: "172.22.65.79",  name: "DIESEL FILLING INFLOW METER 1 HIKVISION", ...randomStatus() },
  { id: "SL-42", section: "INDUSTRIAL OPS", ip: "172.22.65.114", name: "DIESEL FILLING TOWER HIKVISION", ...randomStatus() },
  { id: "SL-43", section: "INDUSTRIAL OPS", ip: "172.22.65.71",  name: "DIESEL FILLING INFLOW MTR 2 HIKVISION", ...randomStatus() },
  { id: "SL-44", section: "INDUSTRIAL OPS", ip: "172.22.65.107", name: "LIGHT VEHICLE DIESEL FILING POINT", ...randomStatus() },
  { id: "SL-45", section: "INDUSTRIAL OPS", ip: "172.22.65.78",  name: "120T SCRAP YARD HONEYWELL", ...randomStatus() },
  { id: "SL-46", section: "INDUSTRIAL OPS", ip: "172.22.65.77",  name: "120T SCRAP YARD HIKVISION", ...randomStatus() },
  { id: "SL-47", section: "INDUSTRIAL OPS", ip: "172.22.65.121", name: "120T DUMPER SEC/WORKSHOP HONEYWELL", ...randomStatus() },
  { id: "SL-48", section: "INDUSTRIAL OPS", ip: "172.22.65.74",  name: "100T DUMPER SECTION ROYAL SHIELD", ...randomStatus() },
  { id: "SL-49", section: "INDUSTRIAL OPS", ip: "172.22.65.67",  name: "TIME OFFICE NEW PTZ ROYAL SHIELD", ...randomStatus() },
  { id: "SL-50", section: "INDUSTRIAL OPS", ip: "172.22.65.203", name: "CHP TIME OFFICE CHP ROYAL SHIELD", ...randomStatus() },
  { id: "SL-51", section: "INDUSTRIAL OPS", ip: "172.22.65.65",  name: "CHP TRISECTION POLE", ...randomStatus() },
  { id: "SL-52", section: "INDUSTRIAL OPS", ip: "172.22.65.60",  name: "RAILWAY SIDING IN SECURE EYE", ...randomStatus() },
  { id: "SL-53", section: "INDUSTRIAL OPS", ip: "172.22.65.138", name: "CRUSER 2 TOWER PTZ HIKVISION", ...randomStatus() },
  { id: "SL-54", section: "INDUSTRIAL OPS", ip: "172.22.65.192", name: "DCH RAILWAY WHARF WALL HIKVISION", ...randomStatus() },
  { id: "SL-55", section: "INDUSTRIAL OPS", ip: "172.22.65.204", name: "COAL SAMPLING ROYAL SHIELD", ...randomStatus() },
  { id: "SL-56", section: "INDUSTRIAL OPS", ip: "172.22.65.199", name: "ETP HIKVISION", ...randomStatus() },
  { id: "SL-57", section: "INDUSTRIAL OPS", ip: "172.22.65.134", name: "COAL LAB CP_PLUS", ...randomStatus() },
  { id: "SL-58", section: "INDUSTRIAL OPS", ip: "172.22.65.136", name: "ETP MINES 1 HIKVISION", ...randomStatus() },
  { id: "SL-59", section: "INDUSTRIAL OPS", ip: "172.22.65.110", name: "DCH SHOVEL PTZ HONEYWELL", ...randomStatus() },
  { id: "SL-60", section: "INDUSTRIAL OPS", ip: "172.22.65.129", name: "RAILWAY ENTRY EXIT HIKVISION", ...randomStatus() },
  { id: "SL-61", section: "INDUSTRIAL OPS", ip: "172.22.65.122", name: "NEW TIME OFFICE IN", ...randomStatus() },

  // --- WEST SECTION ---
  { id: "SL-62", section: "WEST SECTION", ip: "172.22.65.89",  name: "COAL STOCK WEST ROYAL SHIELD", ...randomStatus() },
  { id: "SL-63", section: "WEST SECTION", ip: "172.22.65.104", name: "WEST PARKING ROYAL SHIELD", ...randomStatus() },
  { id: "SL-64", section: "WEST SECTION", ip: "172.22.65.181", name: "WEST TRI-SECTION HIKVISION PTZ", ...randomStatus() },

  // --- EAST SECTION ---
  { id: "SL-65", section: "EAST SECTION", ip: "172.22.65.94",  name: "EAST VIEW POINT ROYAL SHIELD", ...randomStatus() },
  { id: "SL-66", section: "EAST SECTION", ip: "172.22.65.202", name: "WB-3 IN VIEW ROYAL SHIELD", ...randomStatus() },
  { id: "SL-67", section: "EAST SECTION", ip: "172.22.65.180", name: "EAST PARKING HIKVISION", ...randomStatus() },

  // --- STORE ---
  { id: "SL-68", section: "STORE", ip: "172.22.65.70",  name: "R-STORE ENTRY TOWER ROYAL SHIELD", ...randomStatus() },
  { id: "SL-69", section: "STORE", ip: "172.22.65.223", name: "R-STORE ISSUE SECTION HIKVISION", ...randomStatus() },
  { id: "SL-70", section: "STORE", ip: "172.22.65.158", name: "VIEW POINT KALI MANDIR", ...randomStatus() },
  { id: "SL-71", section: "STORE", ip: "172.22.65.118", name: "R-STORE HONEYWELL", ...randomStatus() },
  { id: "SL-72", section: "STORE", ip: "172.22.65.117", name: "R-STORE SECTION HONEYWELL", ...randomStatus() },

  // --- SILO ---
  { id: "SL-73", section: "SILO", ip: "172.22.65.120", name: "SILO-3 INSIDE VIEW HIKVISION", ...randomStatus() },
  { id: "SL-74", section: "SILO", ip: "172.22.65.190", name: "SILO-3 TRACK IN VIEW CP_PLUS", ...randomStatus() },
  { id: "SL-75", section: "SILO", ip: "172.22.65.137", name: "SILO-3 TRACK OUT CP_PLUS", ...randomStatus() },
  { id: "SL-76", section: "SILO", ip: "172.22.65.124", name: "DCH SILO-1 PTZ HONEYWELL-B/D", ...randomStatus() },
  { id: "SL-77", section: "SILO", ip: "172.22.65.230", name: "SILO-2 PTZ VIEW HIKVISION", ...randomStatus() },

  // --- COAL STOCK, CRUSHER ---
  { id: "SL-78", section: "COAL STOCK", ip: "172.22.65.66",  name: "12 No. COAL STOCK", ...randomStatus() },
  { id: "SL-79", section: "COAL STOCK", ip: "172.22.65.76",  name: "1&2 No. COAL STOCK", ...randomStatus() },
  { id: "SL-80", section: "COAL STOCK", ip: "172.22.64.155", name: "COAL STOCK EAST HIKVISION", ...randomStatus() },
  { id: "SL-81", section: "COAL STOCK", ip: "172.22.65.102", name: "CRUSHER 1 ROYAL SHIELD", ...randomStatus() },

  // --- DISPENSARY ---
  { id: "SL-82", section: "DISPENSARY", ip: "172.22.96.36",  name: "DISPENSARY SECTOR B HONEYWELL", ...randomStatus() },
];
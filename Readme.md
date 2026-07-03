# 🚀 NetCam Monitor

> A modern Network Operations Center (NOC) dashboard for real-time monitoring and diagnostics of enterprise surveillance and network infrastructure.

![License](https://img.shields.io/badge/License-MIT-blue.svg)
![React](https://img.shields.io/badge/Frontend-React%2019-61DAFB)
![Node.js](https://img.shields.io/badge/Backend-Node.js-339933)
![MongoDB](https://img.shields.io/badge/Database-MongoDB-47A248)
![Socket.IO](https://img.shields.io/badge/Realtime-Socket.IO-black)

---

## 📖 Overview

NetCam Monitor is a full-stack monitoring platform designed to provide centralized visibility into enterprise surveillance and networking infrastructure.

The application continuously monitors Cameras, NVRs, Routers, RFID Controllers, and Radio devices using a real-time telemetry engine. It performs automated health checks, stores historical device data, and streams live updates to an interactive dashboard through WebSockets.

The project demonstrates modern full-stack development using React, Node.js, Express, MongoDB, and Socket.IO while following a scalable architecture suitable for enterprise monitoring systems.

---

# ✨ Features

### 📡 Real-Time Device Monitoring
- Live monitoring of Cameras
- NVR monitoring
- Router monitoring
- Radio monitoring
- RFID controller monitoring

### ⚡ Live Dashboard
- Instant device status updates
- WebSocket-based communication
- Live latency monitoring
- Health statistics
- Interactive telemetry graphs

### 🧠 Intelligent Diagnostics
- Automatic Ping Monitoring
- Port Connectivity Checks
- Root Cause Analysis
- Warning detection for high latency
- Device availability tracking

### 📊 Analytics & History
- Historical outage logs
- Device uptime tracking
- Latency visualization
- Status transition timeline
- Live telemetry charts

### 🔍 Powerful Dashboard
- Search devices
- Category-wise monitoring
- Section-wise camera grouping
- Device filtering
- Detailed telemetry modal
- Historical reports

---

# 🛠 Tech Stack

## Frontend

- React 19
- Vite
- Tailwind CSS
- Socket.IO Client
- Recharts
- Lucide React Icons

## Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- Socket.IO
- Node Cron
- Ping
- Dotenv

---

# 🏗 Project Structure

```
NetCam Monitor
│
├── Backend
│   ├── config
│   ├── models
│   ├── services
│   ├── server.js
│   └── package.json
│
├── Frontend
│   ├── src
│   ├── public
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

---

# ⚙️ How It Works

1. The backend periodically scans every registered device.
2. Each device is pinged to determine availability.
3. If ping fails, additional port connectivity checks are performed.
4. Device status is updated inside MongoDB.
5. Historical state transitions are recorded.
6. Live updates are broadcast using Socket.IO.
7. The React dashboard instantly reflects every device change.

---

# 🚀 Installation

## Clone Repository

```bash
git clone https://github.com/your-username/netcam-monitor.git

cd netcam-monitor
```

---

## Backend Setup

```bash
cd Backend

npm install
```

Create a `.env` file:

```env
PORT=5000

MONGODB_URI=your_mongodb_connection_string
```

Start backend:

```bash
npm start
```

---

## Frontend Setup

```bash
cd Frontend

npm install

npm run dev
```

Frontend runs on

```
http://localhost:5173
```

Backend runs on

```
http://localhost:5000
```

---

# 📈 Dashboard Modules

- NOC Command Center
- Camera Monitoring
- NVR Monitoring
- Router Monitoring
- Radio Monitoring
- RFID Monitoring
- Live Telemetry
- Historical Reports
- Network Health Overview
- Device Search & Filtering

---

# 📡 Monitoring Engine

The monitoring service automatically:

- Performs scheduled health checks
- Measures network latency
- Detects offline devices
- Identifies possible failure reasons
- Logs every status transition
- Updates MongoDB
- Streams live updates to connected clients

---

# 💡 Key Highlights

- Real-time communication using Socket.IO
- Enterprise-style NOC dashboard
- Responsive user interface
- Modular backend architecture
- Automatic health monitoring
- Historical outage tracking
- Live telemetry visualization
- Scalable code structure

---

# 📄 Future Improvements

- User Authentication
- Role-Based Access Control
- Email & SMS Alerts
- SNMP Integration
- Device Configuration Panel
- PDF Report Generation
- Docker Deployment
- Kubernetes Support
- Performance Analytics
- Dark/Light Themes

---

# 🤝 Contributing

Contributions are welcome.

If you have ideas for improvements, feel free to fork the repository, create a feature branch, and submit a pull request.

---

# 📜 License

This project is licensed under the MIT License.

---

# 👨‍💻 Author

**Swastik**

Software Engineering Student

Built as a full-stack Network Operations Center (NOC) monitoring solution demonstrating modern web technologies, real-time communication, and scalable backend architecture.
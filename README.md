# 🌿 SmartFarm Web Application

**SmartFarm** is a modern full-stack MERN (MongoDB, Express.js, React, Node.js) web application designed to empower rural and smallholder farmers by bridging the gap between agriculture stakeholders, markets, and data-driven insights. It offers real-time communication, marketplace services, AI-powered crop insights, and weather intelligence.

---

## 🔑 Key Features

* 🔐 **Role-Based Dashboards** for Farmers and Agricultural Officers
* 💬 **Real-Time Chat** with file sharing, group support, and read receipts
* 🌦 **Weather Integration** with location-aware forecasts and crop suggestions
* 🛒 **Farm Marketplace** for listing and exchanging tools, produce, and supplies
* 📊 **Live Market Intelligence** with real-time price updates and trend visualizations
* ✅ **JWT Authentication** with secure session and token management
* 🎨 **Responsive UI** using TailwindCSS and ShadCN UI, including theme toggle support

---

## ⚙️ Tech Stack

| Technology              | Purpose                                |
| ----------------------- | -------------------------------------- |
| **React**               | Frontend interface                     |
| **Node.js**             | Backend runtime                        |
| **Express.js**          | RESTful API framework                  |
| **MongoDB**             | NoSQL database                         |
| **Mongoose**            | MongoDB ODM for schemas/models         |
| **Socket.IO**           | Real-time communication (chat, market) |
| **JWT & Bcrypt**        | Authentication and password security   |
| **TailwindCSS**         | Utility-first CSS framework            |
| **ShadCN UI**           | Prebuilt styled components             |
| **Chart.js / Recharts** | Price trend visualization              |
| **OpenWeatherMap**      | Location-based weather API             |

---

## 🗂️ Project Structure

```
/project-root
├── /backend
│   ├── /models              # Mongoose schemas (e.g., user.js)
│   ├── /routes              # API route handlers
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── chat.js
│   │   ├── market.js
│   │   ├── weather.js
│   │   └── product.js
│   ├── /middlewares         # JWT protection middleware
│   │   └── auth.js
│   ├── /socket              # Socket.IO event handlers
│   │   ├── chatHandler.js
│   │   └── marketHandler.js
│   ├── server.js            # App entry point with CORS, MongoDB, Socket.IO setup
│   ├── .env                 # Env variables (JWT_SECRET, DB URI, etc.)
│   └── package.json         # Backend dependencies
│
├── /frontend
│   ├── /src
│   │   ├── /components       # Shared UI components
│   │   ├── /contexts         # React contexts (e.g., AuthContext.jsx)
│   │   ├── /pages            # Page views (Login, Register, Dashboard)
│   │   ├── /services         # Axios instance (api.js)
│   │   ├── /socket           # Client-side Socket.IO (SocketContext.jsx)
│   │   ├── App.jsx
│   │   └── index.jsx
│   ├── package.json         # Frontend dependencies
│
└── README.md
```

---

## 🚀 Getting Started

### ✅ Prerequisites

* Node.js (v18+ recommended)
* MongoDB (local or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas))
* OpenWeatherMap API Key
* Yarn or npm

---

### 🛠️ Setup Instructions

```bash
# Clone the repository
git clone https://github.com/KelvinMbugii/SmartFarm-APP.git
cd smartfarm-app

# Setup backend
cd server
cp .env.example .env   # Create environment config
npm install
npm run dev            # Start development server

# Setup frontend
cd ../client
npm install
npm run dev            # Launch React app
```

---

## 📬 Contact

For questions, ideas, or collaboration opportunities:

**Kelvin Wanjugu**
📧 Email: [kc1078900@gmail.com](mailto:kc1078900@gmail.com)
🌐 GitHub: [KelvinMbugii](https://github.com/KelvinMbugii)

---



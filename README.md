# SmartFarm-APP
A-Smart-Farm-Application

# 🌾 SmartFarm – MERN Stack Web Application

SmartFarm is a full-stack web application that connects farmers with agricultural officers,
markets, and data-driven insights. Built with the MERN stack (MongoDB, Express, React, Node.js), 
it empowers rural and smallholder farmers with real-time communication, market access, equipment 
exchange, and AI-enhanced agricultural insights.

---

## 🧩 Features

- ✅ **Role-based Dashboards** for Farmers & Agricultural Officers
- 💬 **Real-time Chat** with file sharing, read receipts, and group chats
- 🌦️ **Weather Integration** with location-based forecasts and crop recommendations
- 🛒 **Marketplace** for farm equipment, orders, and price comparison
- 📈 **Market Intelligence** with live price tracking and trend visualizations
- 🔐 **JWT Authentication** and secure session management
- 🎨 **Responsive UI** using TailwindCSS and ShadCN UI with theme toggle

---

## 🚀 Technologies Used

| Tech          | Role                                |
|---------------|-------------------------------------|
| React         | Frontend UI                         |
| Node.js       | Backend server                      |
| Express       | RESTful API                         |
| MongoDB       | Database                            |
| Mongoose      | ODM (schemas & models)              |
| Socket.io     | Real-time communication             |
| JWT / Bcrypt  | Authentication & security           |
| TailwindCSS   | Responsive design                   |
| ShadCN UI     | Styled React components             |
| Chart.js / Recharts | Price visualization         |
| OpenWeatherMap | Weather API                        |

---

## 📦 Project Structure



---

## ⚙️ Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB instance (local or Atlas)
- Yarn or npm
- OpenWeatherMap API key

### Setup Instructions

```bash
# Clone the repo
git clone https://github.com/KelvinMbugii/SmartFarm-APP.git
cd smartfarm-app

# Setup server
cd server
cp .env.example .env
npm install
npm run dev

# Setup client
cd ../client
npm install
npm run dev 
``` 

🗓️ Project Timeline – 14-Day Milestone Plan
✅ Day 1–2: Project Setup & Planning
 Initialize Git repo & structure (client/server)

 Setup React (Vite), TailwindCSS, ShadCN UI

 Setup Express, Mongoose, CORS, dotenv

 Install client/server dependencies

 Create basic MongoDB schemas (Users, Products, Chats, Prices)

🔐 Day 3–4: Authentication System
 JWT registration & login for farmers/officers

 Create protected routes (dashboard access)

 Implement role-based redirection

 Build login/register UI

🧭 Day 5–6: Dashboards
 Farmer dashboard (weather, chat, market info)

 Officer dashboard (issues, chat access)

 Responsive layout (sidebar/topbar)

 Theme toggle (dark/light)

💬 Day 7–8: Real-Time Chat
 Setup Socket.io server/client

 Implement private & group chats

 Add typing indicators, read receipts

 Support image/file uploads

🛒 Day 9–10: Marketplace Features
 Build Equipment & Product listing/search

 Add price comparison

 Implement order management (basic)

 Display product details

☁️ Day 11: Weather Integration
 Integrate OpenWeatherMap or similar API

 Location-based weather display

 Show crop recommendations

 Weather alerts

📈 Day 12: Market Intelligence
 Create price trend charts

 Simulate real-time price updates

 Add basic forecasting logic

 Enable data export (CSV/JSON)

🧪 Day 13: Testing & Optimization
 Mobile responsiveness testing

 Handle slow network gracefully

 Add 404 & error fallback

 Code cleanup & UI polish

🚀 Day 14: Deployment & Documentation
 Deploy backend (Render/Railway)

 Deploy frontend (Netlify/Vercel)

 Final README with setup instructions

 Add sample users for demo

📬 Contact
For questions or collaboration:

Kelvin Wanjugu
Email: kc1078900@gmail.com
GitHub: github.com/KelvinMbugii/

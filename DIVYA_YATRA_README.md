# 🕉️ Divya Yatra — Smart Pilgrims Assistant

<div align="center">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white" alt="MySQL" />
  <img src="https://img.shields.io/badge/Gemini_AI-8E75C2?style=for-the-badge&logo=google&logoColor=white" alt="Gemini AI" />
  <img src="https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socketdotio&logoColor=white" alt="Socket.io" />
  <img src="https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Vercel" />
</div>

<p align="center">
  <strong>A full-stack AI-powered platform for a safer, smarter & spiritual yatra experience</strong>
  <br />
  Designed for Mahakaleshwar Temple, Ujjain — engineered to scale for 100+ million devotees at Simhastha Kumbh 2028.
</p>

<p align="center">
  <a href="https://divyayatra.xyz"><strong>Live Demo (divyayatra.xyz)</strong></a> | 
  <a href="https://divya-yatra-tit.vercel.app"><strong>Vercel Mirror</strong></a>
</p>

---

## 📋 Table of Contents
* [🌟 Overview](#-overview)
* [✨ Features](#-features)
* [🏗️ Architecture](#%EF%B8%8F-architecture)
* [🚀 Getting Started](#-getting-started)
  * [Prerequisites](#prerequisites)
  * [Environment Setup](#environment-setup)
  * [Backend Setup](#backend-setup)
  * [Frontend Setup](#frontend-setup)
* [🔑 Environment Variables Reference](#-environment-variables-reference)
* [📡 API Routes Reference](#-api-routes-reference)
* [🛠️ Tech Stack](#%EF%B8%8F-tech-stack)
* [📁 Project Structure](#-project-structure)
* [🌐 Deployment](#-deployment)
* [🤝 Contributing](#-contributing)

---

## 🌟 Overview
**Divya Yatra** is a comprehensive smart pilgrim management platform engineered to resolve critical challenges faced by pilgrims during mass spiritual gatherings. 

It addresses:
* 🚨 **Stampede prevention** via real-time crowd density monitoring.
* 🔍 **AI-powered lost & found** system utilizing advanced image matching.
* 👨‍👩‍👧 **Family safety tracking** with live GPS coordinates and geo-tagged SOS alerts.
* 🎟️ **Priority ticketing** and time-slot booking to reduce queue waiting times.
* 🤖 **Multilingual AI travel planner** (Gemini AI) for custom spiritual itineraries.
* 📺 **Live Darshan** temple streaming.
* 🅿️ **Smart parking** marketplace to book peer-to-peer parking spots.

---

## ✨ Features

| Feature | Description |
| :--- | :--- |
| 🎟️ **Priority Ticketing** | Time-slot booking with VIP priority & real-time queue availability. |
| 📡 **Zone Crowd Monitoring** | Live RFID/QR-based zone density tracking and check-ins. |
| 👨‍👩‍👧 **Family Safety Mode** | Real-time GPS family tracking, voice-activated SOS, and guardian rescue routes. |
| 🧠 **AI Crowd Detection** | YOLOv8-powered crowd analysis with live density heatmaps. |
| 📺 **Live Darshan** | HD temple streaming with multiple select camera views. |
| 🔍 **AI Lost & Found** | AI image matching and matching alerts for lost items. |
| 🗺️ **Interactive Divine Map** | Interactive leaflet map of Ujjain with GPS navigation & crowd overlays. |
| 🤖 **AI Yatra Planner** | Gemini AI chatbot with multilingual support & custom spiritual itineraries. |
| 🅿️ **Parking Marketplace** | Peer-to-peer parking slot listing, booking, and navigation management. |
| 🆘 **Emergency SOS** | One-tap geo-tagged emergency broadcast to administrators. |
| ⚙️ **Admin Dashboard** | Control panel for zone control, alerts, system analytics, and user moderation. |
| 📊 **Real-time Socket.IO** | Live data push for crowd metrics, location tracking, and SOS broadcasts. |

---

## 🏗️ Architecture

Divya Yatra utilizes a modern client-server architecture with real-time data synchronizations.

```mermaid
graph TD
    Client([React Frontend]) <-->|Socket.IO: Live metrics, GPS, SOS| SocketServer[Socket.IO Server]
    Client <-->|REST HTTP Requests| ExpressApp[Express REST API]
    ExpressApp <--> Database[(MySQL DB via Sequelize)]
    
    %% Third Party Integrations
    ExpressApp --- GeminiAI[Gemini AI: Chatbot Engine]
    ExpressApp --- Cloudinary[Cloudinary: CDN Storage]
    ExpressApp --- Geoapify[Geoapify: Nearby Map APIs]
```

### Data Flow
`Pilgrim Device` ➔ `React Frontend` ➔ `Express REST API` ➔ `MySQL Database` (via Socket.IO & third-party integrations like Cloudinary, Gemini, and Geoapify).

---

## 🚀 Getting Started

### Prerequisites
Make sure you have the following installed on your machine:
* **Node.js** (>= 18.x)
* **npm** (>= 9.x)
* **MySQL** (>= 8.0)
* **Git** (Latest)

### Environment Setup
> [!IMPORTANT]
> Never commit real credentials to GitHub. Always use `.env` files which are included in your `.gitignore` configuration.

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Harsh-2006-git/Smart-Pilgrims-Assistant-App.git
   cd Smart-Pilgrims-Assistant-App
   ```
2. **Setup environment files:**
   * **Backend:** Copy `Backend/.Sampleenv` to `Backend/.env`
   * **Frontend:** Copy `Frontend/.env.sample` to `Frontend/.env`

---

### Backend Setup
1. **Navigate to the Backend directory:**
   ```bash
   cd Backend
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Seed zone data** (first-time database setup only):
   ```bash
   npm run seed
   ```
4. **Start the development server (with hot reload):**
   ```bash
   npm run dev
   ```
   *The backend server will run at* `http://localhost:3001`

---

### Frontend Setup
1. **Navigate to the Frontend directory:**
   ```bash
   cd ../Frontend
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Start the local development server:**
   ```bash
   npm run dev
   ```
   *The frontend application will start at* `http://localhost:5173`

---

## 🔑 Environment Variables Reference

### Backend (`Backend/.env`)
```ini
# 🌐 Application Config
PORT=3001
ADMIN_EMAIL=your-admin-email@example.com

# ☁️ Cloudinary Configuration (Used for Lost & Found images, profiles, etc.)
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_URL=cloudinary://your_api_key:your_api_secret@your_cloud_name

# 🗄️ Database Configuration (DB_MODE: "local" or "cloud")
DB_MODE=local

# --- Local MySQL ---
DB_USER_LOCAL=root
DB_PASSWORD_LOCAL=your_mysql_password
DB_HOST_LOCAL=localhost
DB_PORT_LOCAL=3306
DB_NAME_LOCAL=ujjain

# --- Cloud MySQL (Aiven / PlanetScale / Amazon RDS) ---
# DATABASE_URL=mysql://username:password@host:port/database_name
# DB_SSL=true
# DB_CA_CERT_PATH=./ca.pem

# 🤖 Gemini AI Configuration
GEMINI_API_KEY=your_gemini_api_key
GEMINI_API_KEY_BACKUP=your_backup_gemini_api_key

# 📍 Geoapify API
GEOAPIFY_API_KEY=your_geoapify_api_key

# 🔐 Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your_google_client_secret

# 🔑 Authentication / JWT
JWT_SECRET=your_64_character_hex_jwt_secret
REFRESH_TOKEN_SECRET=your_64_character_hex_refresh_token_secret

# 🔎 SerpAPI (Web Search integration for AI Chatbot)
SERP_API_KEY=your_serp_api_key

# 📧 SMTP / Email Configuration (Used for OTP & SOS alerts)
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=your_email@example.com
SMTP_PASS=your_smtp_password_or_app_password

# 🌍 Frontend API Origin
VITE_API_URL=http://localhost:3001
```

### Frontend (`Frontend/.env`)
```ini
# 🌍 API Base URL
VITE_API_URL=http://localhost:3001

# 🔐 Google OAuth (Frontend)
VITE_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
```
> [!TIP]
> All variables exposed on the frontend must start with the `VITE_` prefix to be bundled correctly by Vite.

---

## 📡 API Routes Reference

All API endpoints are prefixed with `/api/v1/`

| Route Prefix | Purpose |
| :--- | :--- |
| `/api/v1/auth` | User registration, logins, Google OAuth, and JWT refreshes |
| `/api/v1/zone` | Zone occupancy data, QR codes check-in history, and coordinates logs |
| `/api/v1/lost` | AI-assisted Lost & Found reporting and matches lookup |
| `/api/v1/ticket` | Priority queue time-slot bookings and verification |
| `/api/v1/admin` | Dashboard analytics, zone setups, users moderation, and SOS reviews |
| `/api/v1/parking` | P2P Parking slot listings, availability search, and checkout routes |
| `/api/v1/booking` | Parking checkout validations and reservation listings |
| `/api/v1/family` | Family network associations and real-time tracking links |
| `/api/v1/nearby` | Local services (hospitals, restrooms, temples) search integrations |
| `/api/v1/chatbot` | Conversational travel assistance via Gemini AI |
| `/api/v1/location` | Real-time coordinate synchronization logs |
| `/api/v1/crowd` | YOLOv8-driven occupancy statistics uploads |

---

## 🛠️ Tech Stack

### Backend
* **Runtime:** Node.js + Express 5
* **Database & ORM:** MySQL + Sequelize ORM
* **Real-time Communication:** Socket.IO
* **Generative AI:** Google Gemini AI SDK
* **Media Handling:** Cloudinary API + Multer
* **Authentication:** JWT (Access & Refresh tokens) + Google OAuth 2.0
* **Security:** Helmet + CORS

### Frontend
* **Core:** React 19 + Vite SPA framework
* **Styling:** TailwindCSS 4
* **Routing:** React Router DOM 7
* **Maps & Cartography:** Leaflet + React-Leaflet
* **Visualizations:** Recharts Dashboard Visuals
* **Client-side ML:** TensorFlow.js + COCO-SSD object detection
* **Utilities:** jsQR (browser scanner), React Hook Form, Zod validation, Radix UI primitives, Lucide React

---

## 📁 Project Structure

```
Smart-Pilgrims-Assistant-App/
├── Backend/
│   ├── AI_Core/              # YOLOv8 python code integrations
│   ├── config/               # Database instances & setup
│   ├── controllers/          # Business logic handlers
│   ├── middlewares/          # Auth guards & error handlers
│   ├── models/               # Sequelize DB schema definitions
│   ├── routes/               # Express route directories
│   ├── socket/               # Socket.IO handlers
│   ├── uploads/              # Local upload directory (Dev)
│   ├── utils/                # Helper files
│   └── index.js              # Entrypoint file
│
└── Frontend/
    ├── public/               # Static assets & icons
    └── src/
        ├── assets/           # Media files & brand logos
        ├── components/       # Reusable components
        ├── pages/            # View pages (ticket, admin, chatbot, etc.)
        └── main.jsx          # Mount file
```

---

## 🌐 Deployment

### Backend ➔ Deployed on Render / Railway
1. Setup a remote SQL instance (e.g. Aiven / AWS RDS).
2. Create a new service on Render/Railway.
3. Configure all variables in the dashboard env settings.
4. Set **DB_MODE** to `cloud`.
5. Set start command to `npm start`.

### Frontend ➔ Deployed on Vercel
1. Set the Root Directory to `Frontend`.
2. Configure **VITE_API_URL** (pointing to your deployed backend url) and **VITE_GOOGLE_CLIENT_ID**.
3. Deploy! The configurations for SPA routing fallback are preset in `vercel.json`.

---

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:
1. **Fork** the repository.
2. Create your feature branch: `git checkout -b feature/your-feature-name`.
3. Commit your changes: `git commit -m "feat: add your feature"`.
4. Push to your fork branch and submit a **Pull Request**.

---
*Developed for a safer, smarter & spiritual Simhastha Kumbh 2028.*

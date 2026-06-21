# 📈 NexTrade - AI-Powered Investment Assistant

![NexTrade Banner](https://via.placeholder.com/1200x300/0f172a/38bdf8?text=NexTrade+-+Your+Personal+AI+Investment+Assistant)

**NexTrade** is a professional, AI-powered investment tracking and analysis platform built to help users navigate both **Cryptocurrency** and **Stock** markets. By combining real-time market data with artificial intelligence insights, NexTrade acts as your personal financial advisor.

---

## 🚀 Features

- **🤖 AI Market Analysis:** Get instant, AI-driven insights on specific assets, market trends, and portfolio health.
- **💹 Real-time Data:** Live price tracking for Crypto (via CoinGecko) and Stocks (via Yahoo Finance).
- **🔔 Smart Alerts:** Set price alerts and receive notifications (e.g., via Telegram) when assets hit your target.
- **📊 Portfolio Management:** Track your holdings, calculate PnL (Profit and Loss), and visualize your asset distribution.
- **📱 Cross-Platform:** Beautiful, responsive web interface that also compiles natively to Android/iOS using Capacitor.

## 🛠️ Technology Stack

**Frontend:**
- ⚛️ React 18 + Vite
- 🎨 TailwindCSS for modern, responsive UI
- 📱 Capacitor (for Android mobile build)

**Backend:**
- ⚡ FastAPI (Python)
- 🗄️ SQLite / SQLAlchemy (Database & ORM)
- 🧠 AI Integrations (OpenAI / Gemini)

## 📂 Project Structure

```text
nextTrade/
├── backend/            # FastAPI Backend Application
│   ├── app/            # Main application logic (Routers, Services, Models)
│   ├── requirements.txt# Python dependencies
│   └── migrate.py      # Database migration scripts
├── frontend/           # React + Vite Frontend Application
│   ├── src/            # UI Components, Pages, and Context
│   ├── android/        # Capacitor Android project
│   ├── package.json    # Node dependencies
│   └── vite.config.js  # Vite configuration
└── .github/            # GitHub Actions (CI/CD Pipelines)
```

## 🔒 Security & Best Practices

This repository is configured to prioritize security:
- **Environment Variables:** `.env` files are strictly ignored and never committed.
- **Databases:** Local SQLite databases (`*.db`) are ignored.
- **Virtual Environments:** Python (`.venv`, `venv`) and Node (`node_modules`) environments are ignored.

## ⚙️ Getting Started (Local Development)

### 1. Clone the Repository
```bash
git clone https://github.com/yasintkcbyk/NexTrade.git
cd NexTrade
```

### 2. Setup Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows use `venv\Scripts\activate`
pip install -r requirements.txt

# Create a .env file based on your API keys (OpenAI, Telegram, etc.)
# Run the server
uvicorn app.main:app --reload --port 8000
```

### 3. Setup Frontend
```bash
cd frontend
npm install

# Create a .env file for frontend if necessary
# Start the development server
npm run dev
```

## 📜 License

This project is proprietary and confidential. All rights reserved.

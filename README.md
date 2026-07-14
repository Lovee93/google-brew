# Google Brew ☕️ - Coffee Rewards Platform

Welcome to **Google Brew**, a modern, real-time coffee loyalty and rewards platform built in **10 minutes** as a showcase for the *Build with Next* series.

This repository demonstrates a complete transition from the **outer loop** (spec-driven backend generation) to the **inner loop** (IDE development, component refactoring, and integration fixes).

---

## 🚀 The Build Journey (Spec to IDE)

1. **API Specifications**: We first defined the system requirements in [`api-design.json`](api-design.json):
   - Customers earn **1 point for every $1 spent**
   - Free coffee rewards unlock at **50 points**
   - Premium **Gold tier** unlocks at **200 points**
   - **Anti-Fraud limits**: Maximum of **3 redemptions per day** per customer
   - Interactive rewards dashboard required
2. **Backend Scaffolding**: We used **Antigravity-CLI** to automatically generate a Node.js Express server matching the JSON specifications.
3. **Frontend Development**: The frontend was built using **Antigravity IDE** to quickly spin up a themed dashboard, connecting the static visual layout to the generated API endpoints.
4. **IDE Refactoring**: We transitioned to inner-loop optimization, modularizing the frontend from a monolithic structure in `App.jsx` into self-contained sub-components under `src/components/`.

---

## 🛠️ Tech Stack & Design Architecture

### Backend (`/backend`)
- **Express.js**: Provides the main API routing layer.
- **In-Memory Store**: Since this project was designed as a rapid demo, the server-side transactional locking rules (to guard against promotion race conditions) are simulated using an in-memory memory store state (`store.js`) rather than a heavy persistent database.
- **Public API Access**: The original `api-design.json` specified JWT token authentication headers. To support quick public testing and dashboard simulation for the demo web layout, the active API routes operate as public endpoints.

### Frontend (`/frontend`)
- **React + Vite**: High-speed frontend build tooling.
- **Vanilla CSS Layout**: A dark, premium espresso coffee theme designed with HSL color tokens, glassmorphism card layouts, interactive elements, custom scrollbars, and fluid animations.
- **Modular Components**:
  - `Header`: Navigation logo and backend health/connection state checks.
  - `CustomerSwitcher`: Swaps between active customer accounts.
  - `CustomerProfile`: Renders profile details, a points circle meter progress gauge, and daily limit indicator dots.
  - `CashierSimulator`: Allows cashier simulation to record purchases ($1 = 1 point) and log instant scores.
  - `RewardsCatalog`: A tabbed view of available rewards coupons versus redeemed history.
  - `ToastContainer`: Controls floating notifications and system confirmations.
  - `AntiFraudModal`: Shows dialog warnings when velocity limits are hit.

---

## ⚙️ Running Locally

Follow these instructions to run both the frontend and backend servers.

### 1. Run the Backend Server
```bash
cd backend
npm install
npm run dev
```
The API server will listen on `http://localhost:3000/`.

### 2. Run the Frontend Dev Server
```bash
cd frontend
npm install
npm run dev
```
Open your browser and navigate to `http://localhost:5173/`. The frontend is configured to call `http://localhost:3000` directly. This cross-origin communication is permitted because the backend Express server (`server.js`) explicitly sends CORS headers (`Access-Control-Allow-Origin: *`) during development.

## ☁️ Google Cloud Run Deployment

A multi-stage `Dockerfile` is included at the root of the project to bundle the built React frontend and serve it from the Express backend in production.

This application is designed to be deployed directly to **Google Cloud Run**.

### 1. Build & Deploy Directly from Source
You can build and deploy the containerized application to Cloud Run with a single command:
```bash
gcloud run deploy google-brew \
  --source . \
  --port 3000 \
  --allow-unauthenticated
```

### 2. Manual Container Push (Alternative)
Alternatively, you can build the image with Cloud Builds and deploy:
```bash
# Build the image in the cloud
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/google-brew .

# Deploy the image to Cloud Run
gcloud run deploy google-brew \
  --image gcr.io/YOUR_PROJECT_ID/google-brew \
  --port 3000 \
  --allow-unauthenticated
```


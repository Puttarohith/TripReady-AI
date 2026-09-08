# 🧭 TripReady AI (iQOO AMG Performance Edition)

> **Autonomous Itinerary Recovery & High-Performance Travel Companion**  
> *Built for the iQOO Hackathon 2026*

[![GitHub repo](https://img.shields.io/badge/GitHub-TripReady--AI-blue?style=flat-square&logo=github)](https://github.com/Puttarohith/TripReady-AI)
[![Theme](https://img.shields.io/badge/Theme-iQOO%20AMG%20Motorsport-FFC700?style=flat-square)](https://github.com/Puttarohith/TripReady-AI)
[![Status](https://img.shields.io/badge/Status-Hackathon%20Ready-00D2BE?style=flat-square)](https://github.com/Puttarohith/TripReady-AI)

---

## ⚡ Problem Overview
Travelers face unpredictable disruptions: sudden flight delays, lost booking PDFs, and fragmented calendar apps that fail to adapt. A 90-minute delay creates a domino effect that causes missed keynotes and wasted reservations.

**TripReady AI** transforms static itineraries into an active, intelligent co-pilot. When airline delays occur, it automatically calculates schedule risk, bypasses non-critical stops (like leisure lunch), and re-routes travelers directly to their high-priority events.

---

## 🚀 Key Features

### 1. 🔄 Autonomous Itinerary Recovery (+45m / +90m Delay Engine)
- Simulates live airline delays (+45 Mins, +90 Mins).
- Detects tight buffer gaps and keynote schedule clashes.
- Suggests an optimized sequence (e.g. *Airport ➔ Direct to Conference*, skipping lunch and rescheduling hotel check-in to evening) to save 1h 30m.
- **One-Click Apply** writes the recovered sequence back to the master itinerary and restores the Trip Risk Score.

### 2. 🛡️ Live Calculated Trip Risk Score
- Proprietary 0–100% risk engine.
- Evaluates flight delay telemetry, Open-Meteo precipitation probability, and missing required checklist items.
- Transparent modal breakdown explaining score deductions.

### 3. 🌦️ Live Destination Telemetry & Traffic Radar
- Direct integration with the **Open-Meteo API** (real-time temperature, condition codes, rain probability).
- Proactive contextual alerts (e.g., rainfall forecast adds rainwear prep to active checklist).

### 4. 🎙️ Hands-Free Voice AI Assistant
- Floating round mic button docked at the bottom-right corner.
- Docked Chat Panel directly above it.
- Bidirectional **Web Speech API** recognition and speech synthesis audio responses with text fallback.
- Quick query chips (`📍 Next Event`, `🌦️ Weather`, `⏱️ Am I late?`, `🚕 Book cab`).

### 5. 🚕 Multi-Provider Cab Aggregator
- Compares live fares and arrival times for **Ola Cabs**, **Uber India**, and **Rapido Auto/Cab**.
- Deep-links directly to booking portals.

### 6. 📧 Direct OAuth Ticket Ingestion & Parser
- Connects to Gmail and Outlook OAuth 2.0 to scan flight, hotel, and summit vouchers.
- Semantic parser extracts Terminal gates, Check-in counter times, and baggage limits (e.g. 15kg check-in, 7kg cabin).

---

## 🎨 Design System: iQOO AMG Motorsport
- **Carbon-Fiber Micro-Weave** background texture (`#07090E`).
- **Aerodynamic Track Glows**: AMG Petronas Teal (`#00D2BE`), iQOO Speed Yellow (`#FFC700`), and AMG Racing Red (`#E5002B`).
- High-contrast dark glass cards (`rgba(13, 17, 26, 0.92)`) with typography in **Plus Jakarta Sans**.

---

## 📂 Repository Structure
```text
├── index.html                       # Complete responsive TripReady AI single-page application
├── manifest.json                    # PWA Web App Manifest
├── styles.css                       # Standalone styling sheet
├── sw.js                            # Service Worker for offline capability
└── README.md                        # Documentation & Architecture Overview
```

---

## 💻 Quick Start & Testing

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Puttarohith/TripReady-AI.git
   cd TripReady-AI
   ```

2. **Open the app:**
   - Double-click `index.html` or serve with any static web server:
     ```bash
     npx serve .
     # or python -m http.server 8000
     ```

3. **Try the Core Flows:**
   - Click the top **Trip Risk Score** badge to see the live breakdown.
   - Go to **Itinerary Recovery** tab and test `+90 Mins Delay` ➔ Click `⚡ Apply Suggested Sequence`.
   - Click the bottom-right **🎙️ Voice AI** button and speak or select quick chips.
   - Click **Book a Cab** to launch the Ola / Uber / Rapido aggregator.

---

## 👥 Authors
Developed for the **iQOO Hackathon 2026**.

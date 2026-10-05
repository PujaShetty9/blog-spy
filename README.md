# Competitor Blog Spy & Real-Time Content Monitoring System (V1)

A high-performance, lightweight, single-frontend React + LocalStorage application designed to continuously monitor competitor websites and detect newly published blog articles in real-time.

---

## 1. Project Objective

The primary objective of **Blog Spy** is to demonstrate automated intelligence on competitor content publishing. The system continuously polls competitor RSS feeds to detect new posts, calculating exact **publication time**, **detection time**, and exact numerical **detection delay** (`detected_at - published_at`), while preventing duplicate entries using unique article identifiers/URLs.

---

## 2. Architecture

This V1 project runs completely in the browser as **ONE single deployable frontend application**:

```
 ┌─────────────────────────────────────────────────────────────┐
 │                      React + Vite UI                        │
 │  (Dashboard, Competitors, Articles, Logs, Demo, 100-Site)   │
 └──────────────────────────────┬──────────────────────────────┘
                                │
                                ▼
 ┌─────────────────────────────────────────────────────────────┐
 │                Client-Side JavaScript Engine                │
 │  ┌───────────────────────────────────────────────────────┐  │
 │  │        Monitoring Loop (monitoringEngine.js)          │  │
 │  └───────────────────────────┬───────────────────────────┘  │
 │                              │                              │
 │  ┌───────────────────────────▼───────────────────────────┐  │
 │  │             LocalStorage Persistent Storage           │  │
 │  │  • competitors  • articles  • monitoring_logs           │  │
 │  └───────────────────────────────────────────────────────┘  │
 └─────────────────────────────────────────────────────────────┘
```

---

## 3. Technology Stack & Dependencies

- **Framework**: React 18, Vite
- **Language**: JavaScript (ES6+)
- **Storage**: LocalStorage API
- **Icons & UI**: Lucide-React, Recharts (Bar Charts)
- **Deployment**: Single static build bundle (`dist/`) deployable anywhere (Vercel, Netlify, GitHub Pages)

---

## 4. LocalStorage Schema

### `competitors`
- `id`: Unique string
- `name`: Competitor name
- `website_url`: Domain / Demo website URL
- `monitoring_status`: `'Active'` | `'Paused'`
- `monitoring_interval`: Interval in seconds (default 5s)
- `created_at`: ISO timestamp

### `articles`
- `id`: Unique string
- `competitor_id`: Foreign ID
- `title`: Article title
- `body` / `content`: Article body text
- `author`: Author name
- `published_at`: Exact publication ISO timestamp
- `detected_at`: Exact detection ISO timestamp
- `detection_delay_seconds`: Exact numerical duration (`(detected_at - published_at) / 1000`)
- `source_url`: Unique article source URL (for duplicate prevention)
- `detection_strategy`: `'RSS'`

### `monitoring_logs`
- `competitor`: Competitor name
- `check_time` / `started_at`: Check timestamp
- `status`: `'Success'` | `'Failed'`
- `number_of_new_articles`: Integer count of new articles detected
- `response_time_ms`: Millisecond latency
- `error`: Error message or null

---

## 5. Key Features

1. **Dummy Competitor & Controlled Demo Mode**:
   - Allows publishing a new article live to the dummy competitor's RSS feed.
   - Captures publication time (`published_at`) when published.
   - Client-side monitoring loop checks the feed on its next tick, captures detection time (`detected_at`), and calculates exact detection delay.

2. **Detection Delay Calculation**:
   $$\text{detection\_delay} = \text{detected\_at} - \text{published\_at}$$
   Displays exact numerical delay (e.g. `7 sec`, `1 min 24 sec`).

3. **Duplicate Prevention**:
   Strict unique `source_url` lookup prevents re-inserting previously detected articles.

4. **Audit Monitoring Logs**:
   Logs every check cycle with status, new articles count, response time, and errors.

5. **100-Site Concurrency Simulation**:
   Frontend simulation demonstrating high-throughput monitoring across 100 dummy competitors with 10 parallel async workers.

---

## 6. Quick Start Guide

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Run Development Server
```bash
npm run dev
```
*(Runs on `http://localhost:3000`)*

### Step 3: Build for Production Deployment
```bash
npm run build
```
*(Outputs single static web bundle to `./dist`)*

---

## 7. How to Test Demo Mode

1. Open `http://localhost:3000` in your browser.
2. Click **Demo Mode** in the sidebar.
3. Select a preset or type a title/body.
4. Click **Publish Test Article & Run Monitoring**.
5. Observe:
   - Article published to dummy competitor feed.
   - Monitoring loop detects new article.
   - Exact publication time, detection time, and numerical detection delay calculated and stored in LocalStorage.
   - Refresh browser (`F5`) to confirm data persists!

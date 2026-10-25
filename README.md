# S&P 500 Top 5 of Top 5 Tracker 📊

A high-performance financial web application built with **React**, **TypeScript**, and **Vite** that tracks the **top 10 stocks in each of the top 5 industries** in the S&P 500, ranked by **Market Capitalization** using **TradingView's 19 FactSet Economic Sectors**.

---

## 🌟 Key Highlights

- **19 TradingView Sectors Classification**: Built on TradingView's standard 19 FactSet economic sectors.
- **Top 5 Industries Ranked by Aggregate Market Cap**:
  1. ⚡ **Electronic Technology** (~$19.1T) — Semiconductors, hardware, optical & precision tech (NVDA, AAPL, AVGO, MU, AMD...)
  2. 💻 **Technology Services** (~$13.4T) — Cloud computing, enterprise software, internet services (GOOGL, MSFT, META, PLTR, ORCL...)
  3. 🏛️ **Finance** (~$9.4T) — Major global banks, investment brokerages, insurance & payment giants (BRK.B, JPM, V, MA, BAC...)
  4. 🧬 **Health Technology** (~$5.5T) — Pharmaceuticals, biotechnology, medical devices (LLY, JNJ, ABBV, MRK, TMO...)
  5. 🛍️ **Retail Trade** (~$5.4T) — Internet retail, warehouse clubs, department stores (AMZN, WMT, COST, HD, TJX...)
- **Top 10 Stocks Per Industry**: Detailed rank (#1 to #10 in sector), S&P 500 overall rank, live price, 24h change %, market cap, sector weight %, 52-week price range gauges, and P/E ratios.
- **TradingView Interactive Widget Modal**: Click any stock to view embedded live candlestick charts, real-time volume, performance indicators (1W, 1M, YTD, 1Y), and deep links directly to TradingView.
- **Four Dynamic Views**:
  - **Top 5 Industries Leaderboard**: The primary focus view with collapsible sector panels, sub-industry breakdown, and toggle between Table View and Card Grid View.
  - **50 Stocks Master Comparison Matrix**: Cross-industry sortable table with sector filter pills.
  - **Market Cap Treemap**: Visual market share tiles sized by market cap and colored by daily percentage return.
  - **All 19 TV Sectors Explorer**: Full ranking of all 19 sectors defined by TradingView with expandable top stock tables.
- **Live TradingView Data Sync**: Sync real-time quotes directly from the TradingView Scanner API with auto-refresh support (every 30s) and fallback to snapshot data.
- **Deduplication of Dual-Class Shares**: Smart toggle (e.g., handles Alphabet's GOOG vs GOOGL) to ensure 10 distinct companies per industry.
- **CSV Data Export**: One-click download of the complete Top 50 stocks dataset.
- **Modern Design & Dark/Light Themes**: Bloomberg Terminal meets Apple Pro aesthetic with vanilla CSS tokens, glassmorphism, responsive container queries, and accessibility.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm

### Installation
```bash
# Clone or navigate to the directory
cd the-top5-of-the-top5-of-snp500

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open `http://localhost:5173/` in your browser.

### Production Build
```bash
npm run build
npm run preview
```

---

## 📁 Project Architecture

```
├── index.html                   # SEO tags, Plus Jakarta Sans & JetBrains Mono fonts
├── public/
│   └── favicon.svg              # Custom financial logo
├── src/
│   ├── components/
│   │   ├── Navbar.tsx           # Header, market hours status, live sync & theme toggle
│   │   ├── MarketStatsHeader.tsx# KPI metric cards, tabs, search & filter controls
│   │   ├── Top5IndustriesView.tsx# The core top 5 industries and top 10 stocks view
│   │   ├── MatrixView.tsx       # 50-stock sortable comparative master table
│   │   ├── TreemapView.tsx      # Proportional visual market cap & return treemap
│   │   ├── All19SectorsView.tsx # Ranked list of all 19 TradingView sectors
│   │   ├── StockRow.tsx         # Responsive table row component
│   │   ├── StockCard.tsx        # Visual card grid component
│   │   ├── StockDetailModal.tsx # TradingView interactive chart iframe & fundamentals
│   │   └── Footer.tsx           # Methodology and attribution notes
│   ├── data/
│   │   ├── sectorsConfig.ts     # TradingView 19 sectors definitions, colors & icons
│   │   └── snp500_snapshot.json # Full pre-baked snapshot of 503 S&P 500 stocks
│   ├── services/
│   │   └── tradingViewService.ts# Live TradingView scanner API fetch engine
│   ├── utils/
│   │   ├── dataProcessor.ts     # Sector grouping, ranking and weight calculations
│   │   └── formatters.ts        # Currency, price, volume and percentage helpers
│   ├── types.ts                 # TypeScript data contracts
│   ├── index.css                # Global CSS design tokens, reset & glassmorphism
│   ├── App.css                  # Component styling & responsive layout
│   └── App.tsx                  # Main orchestration component
```

---

## 📐 Methodology

- **S&P 500 Universe**: 503 equity components tracked by S&P Dow Jones Indices.
- **Sector Classification**: 19 Economic Sectors defined by TradingView using FactSet industry classifications.
- **Industry Ranking**: Aggregate Market Capitalization of all S&P 500 members in that sector.
- **Stock Ranking**: Market Capitalization within each industry.

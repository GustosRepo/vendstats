# VendStats — New Features Roadmap

Status key: `[ ]` = not started · `[~]` = partial · `[x]` = done

---

## 🔥 High-Impact (Prioritize)

- [x] **End-of-Day Report** — Shareable summary card after each event (revenue, profit, top seller, items sold)
- [x] **Break-Even Calculator** — Shows units needed to break even on EventDetail, or surplus if already profitable
- [x] **Prep Recommendation System** — Suggests how much to prepare per item based on historical avg/min/max sales
- [x] **Best-Selling Items (across events)** — Dedicated Item Analysis screen with sort by qty/revenue/profit/margin
- [x] **Profit Per Item** — Covered by BestSellersScreen (Item Analysis) with per-item profit, margin, qty, revenue
- [x] **Event Comparison** — EventComparisonScreen with side-by-side stats table, trophy winner indicators, event picker modal
- [x] **Inventory Alerts Improvements** — Tab badge count, colored product borders (red=out-of-stock, orange=low), stock summary cards on Products screen, out-of-stock row on Dashboard
- [x] **Monthly Summary Report** — Share button on GlobalStatsScreen, generates monthly aggregate report via Share API

---

## 💰 Core Free — Missing Pieces

- [x] **Currency Picker UI** — `formatCurrency()` already supports USD/THB/MXN/EUR. Just needs a Settings selector + persist to MMKV
- [x] **Duplicate Event** — Clone a previous event (name, expenses, product selection) as a new event
- [x] **Event Location Field** — Add `location` string to Event type + CreateEvent form
- [x] **Expense Categories** — Expand beyond booth fee + travel. Add: supplies, misc/other costs
- [x] **Sell-Through Rate** — Calculate prepared vs sold per item per event (color-coded progress bars)

---

## 📊 Pro — Analytics & Reports

- [x] **Revenue Trends Toggle** — 7D/30D/3M toggle on GlobalStatsScreen chart with getRevenueByPeriod()
- [x] **Event Performance Ranking** — EventRankingScreen with Best/Worst toggle, medals, profit/margin/stat chips
- [x] **Worst Performing Events** — Integrated into EventRankingScreen via "Worst First" toggle
- [x] **Smart Profit Insights** — Auto-generated tips: best day, margin trends, revenue vs profit item, expense warnings, location insights
- [x] **Separate CSV Exports** — ActionSheet picker: All Data, Events Only, Items Only, Expenses Only with dedicated CSV formats

---

## 🛠️ Pro — Business Tools

- [x] **Custom Event Tags / Categories** — Tag events (e.g., "farmers market", "festival", "pop-up")
- [x] **Menu Cost Calculator** — Input ingredients → calculate cost per item
- [x] **Ingredient Cost Breakdown** — Track per-ingredient costs, link to menu items

---



## 🧰 PRO Vendor Utilities

- [x] **Receipt Photo Attachments** — Attach photos of receipts to expenses
- [x] **Weather Notes for Events** — Log weather conditions, correlate with sales
- [x] **Daily Logging Reminders** — Push notification to remind vendors to log sales
- [x] **Event Sales Forecasting** — Predict revenue for upcoming events based on history

---



## 🍽️ Customer-Facing 

- [x] **QR Menu Display** — Generate a shareable menu from your items list
- [x] **Simple Menu Sharing** — Share menu via link or image

---

## ✅ Already Done

- [x] Event creation (name, date, location, booth fee, travel, notes, product selection)
- [x] Item/menu tracking (photo, price, cost, stock count, edit/delete)
- [x] Quick sale buttons (tap grid + quantity picker + haptics)
- [x] Manual sale entry (form with item name, price, cost, qty)
- [x] Basic profit calculation (revenue, expenses, profit per event)
- [x] Basic dashboard (event revenue, expenses, profit, best seller)
- [x] Low stock alerts (Pro-gated, configurable threshold)
- [x] Inventory tracking (stockCount auto-decrements on sale)
- [x] CSV export (combined events + sales)
- [x] Multi-event dashboard (GlobalStatsScreen, Pro-gated)
- [x] Revenue over time chart (7-day)
- [x] Top selling products
- [x] Profit by event data
- [x] Extended stats (margin, avg sale, best seller, most profitable product)
- [x] Languages: English, Spanish, Thai
- [x] Currency picker (USD, THB, MXN, EUR) — auto-applied globally
- [x] Payment QR code FAB
- [x] i18n for all screens + navigation headers
- [x] Monetization: Free tier (10 items) → Pro (unlimited + stats + CSV + alerts)
- [x] Onboarding flow (language → hero → category → ready)
- [x] Duplicate event (copy name, location, expenses, products, notes)
- [x] Event location field (create, edit, detail, event card)
- [x] End-of-Day Report (share via text with emoji formatting)
- [x] Sell-Through Rate (per-item progress bars, color-coded)
- [x] Expense categories: booth fee, travel, supplies, misc/other
- [x] Break-Even Calculator (inline on EventDetail, shows units needed or surplus)
- [x] Prep Recommendations (historical avg/min/max per item, 20% buffer)
- [x] Best-Selling Items / Item Analysis screen (sortable, ranked, cross-event)

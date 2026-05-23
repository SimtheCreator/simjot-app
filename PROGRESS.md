# SimJot — Progress Tracker

_Last updated: 2026-05-01_

---

## Current Status: Phase 4 complete → Ready to deploy to GitHub Pages

---

## Bugs Fixed (2026-05-01)

| # | File | Problem | Status |
|---|------|---------|--------|
| B1 | app.js | `#s-home` / `#recent-list` → fixed to use `#s0` / `#rl` | ✅ Fixed |
| B2 | index.html + app.js | Added `id="spent-amount"` and `id="left-amount"` to HTML; app.js uses getElementById | ✅ Fixed |
| B3 | app.js | Defined `getCat(catId)` — handles both string (API) and numeric (UI) ids | ✅ Fixed |
| B4 | index.html + app.js | Added `id="pay-cash/transfer/card"` to buttons; app.js reads `.pay-btn.on` id | ✅ Fixed |
| B5 | index.html + app.js | Added `id="note-input"`, `id="date-input"` to inputs; app.js uses getElementById | ✅ Fixed |
| B6 | index.html + app.js | Removed `onclick="alert(…)"` from save button; added `id="save-btn"`; app.js wires onclick in DOMContentLoaded | ✅ Fixed |
| B7 | index.html + app.js | CAT array now has `str` field (string id); `selCat` sets `selectedCat` global; `handleSave` sends `selectedCat` | ✅ Fixed |

**Bonus**: CAT array now has `bg`, `tc`, `short` fields needed by `renderRecentFromData`.

---

## Phases

### ✅ Phase 2 — UI Prototype
All 5 screens rendered with mock data.

### ✅ Phase 3 — Backend Connected
- Google Apps Script deployed (CORS: Anyone)
- `api.js` — CRUD wrappers complete
- `app.js` — handleSave, loadDashboard, showToast written

### ✅ Phase 3.5 — Fix Wiring (COMPLETE)
- [x] Fix all B1–B7 bugs
- [x] Test real save → Google Sheets ✓
- [x] loadDashboard shows real data ✓

### ✅ Phase 4 — PWA + GAS Backend + Date Format (COMPLETE)
> SimJotReal.html is now the main app file

- [x] SimJotReal.html — full UI rebuilt by user (6 screens, charts, ROI, OCR)
- [x] GAS backend wired: load on startup, save/edit/delete sync to Sheets
- [x] localStorage as offline cache (loads instantly, syncs in background)
- [x] Date format: DD/MM/YYYY display via `formatDisplayDate(iso)`, `type="date"` inputs
- [x] `gasToApp()` normalizer maps GAS response → internal transaction format
- [x] manifest.json — Android installable PWA
- [x] service-worker.js — offline cache (app loads without internet)
- [x] icons/icon.svg — PWA app icon
- [ ] GitHub Pages deploy → push SimJotReal.html as main file

### ⬜ Phase 5 — Comparative Dashboard (Time-Series)
- [ ] Month-over-Month (MoM): Last Month vs This Month per category
- [ ] Year-over-Year (YoY): Last Year vs This Year totals
- [ ] Variance % display (e.g. +12% Food spending vs last month)
- [ ] New "Stats" section on Dashboard or dedicated tab

### ⬜ Phase 6 — Categories & Tags
- [ ] Category management: create / edit / delete categories (e.g. add Travel)
- [ ] Custom tags on Add screen: multi-tag input (e.g. #Japan2026, #work)
- [ ] Tag filter on Transaction list
- [ ] Tag spending summary (see total spent per tag across all categories)
- [ ] GAS backend: update transactions schema to store tags array

### ⬜ Phase 8 — Capacitor APK
> Converts finished PWA into a real Android APK

- [ ] Install Capacitor + Android Studio setup
- [ ] `npx cap init` + `npx cap add android`
- [ ] Replace PWA file picker with native Camera/Gallery plugin (`@capacitor/camera`)
- [ ] Enable background file watcher for auto-scan slips (`@capacitor/filesystem` + `@capacitor/background-runner`)
- [ ] Native push notifications for reminders (`@capacitor/local-notifications`)
- [ ] Build APK: `npx cap build android`
- [ ] Test on physical Android device
- [ ] Optional: publish to Play Store

---

### ⬜ Phase 7 — OCR & Gallery
> Android-specific implementation

- [ ] Bank slip OCR via Tesseract.js — extract amount, date, bank name
- [ ] **Multi-file**: `<input type="file" multiple accept="image/*">` — select multiple slips at once
- [ ] Batch OCR queue — process each image sequentially, show progress (1/3, 2/3…)
- [ ] Draft review screen — shows all OCR results as draft cards, user confirms/edits each before saving
- [ ] Camera capture option: `accept="image/*" capture="environment"` (opens camera directly)
- [ ] Note: true auto-scan on new slip save is not possible in PWA — user taps "Scan Slips" button instead

---

## Session Log

| Date | Session | Work Done |
|------|---------|-----------|
| 2026-05-01 | Diagnosis | Full file audit — found 7 wiring bugs (B1–B7) |
| 2026-05-01 | Fix B1–B7 | All 7 bugs fixed in index.html + app.js; CAT array extended with str/bg/tc/short |
| 2026-05-01 | CORS fix | api.js POST uses no-cors; Code.gs pasted into GAS + re-deployed; setup() created sheet tabs |
| 2026-05-01 | ✅ Live | Transactions show in dashboard — full stack working (GitHub Pages → GAS → Sheets) |

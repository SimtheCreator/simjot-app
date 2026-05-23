# SimJot — Personal Finance Manager

PWA ติดตามรายจ่ายส่วนตัว เชื่อมต่อ Google Sheets เป็น database ใช้งานได้ออฟไลน์

**Live:** https://simthecreator.github.io/simjot-app/

---

## Tech Stack

| Layer | Tool |
|---|---|
| UI | HTML5 + Vanilla JS + CSS (mobile-first PWA) |
| Database | Google Sheets (tabs: transactions, categories, budgets, reminders) |
| Backend | Google Apps Script (Web App, anyone can access) |
| OCR | Tesseract.js 5 (อ่านสลิปโอนเงิน) |
| Charts | Chart.js 4.4 |
| Deploy | GitHub Pages |

---

## Features

- **Dashboard** — สรุปรายจ่ายเดือน, donut chart, bar chart, health score, safe-to-spend
- **บันทึกรายจ่าย** — form manual + OCR สแกนสลิป, auto-categorize
- **รายการ** — ค้นหา, filter ตามหมวด, export CSV, แก้ไข/ลบ
- **งบประมาณ** — ตั้งงบแยกหมวด, progress bar, แจ้งเตือนเมื่อใกล้/เกินงบ
- **เป้าหมายการออม** — เพิ่ม/ติดตาม goal, progress bar
- **ROI Calculator** — คำนวณค่าใช้ต่อวันของสิ่งที่ซื้อ
- **การแจ้งเตือน** — บิลประจำ, ใช้คำนวณ safe-to-spend

---

## localStorage Keys

ทุก key ใช้ prefix `simjot_`:

| Key | เก็บอะไร |
|---|---|
| `simjot_transactions` | รายการทั้งหมด |
| `simjot_roi` | รายการ ROI |
| `simjot_goals` | เป้าหมายการออม |
| `simjot_cat_map` | ML category map |

---

## Google Apps Script

- URL อยู่ใน `api.js` บรรทัดแรก (`SCRIPT_URL`)
- Deploy setting: **Execute as Me, Anyone can access**
- POST ใช้ `mode: "no-cors"` (GAS ไม่ส่ง CORS header บน POST)
- GET ใช้ fetch ปกติ (ต้องเปิด CORS บน GAS)

---

## 15 หมวดหมู่

🍜 อาหาร · 🚗 เดินทาง · 🛍️ ช้อปปิ้ง · 🏠 ที่พัก · 💊 สุขภาพ · 🎬 บันเทิง · 📚 การศึกษา · 💼 งาน · 💳 ชำระหนี้ · ✨ สกินแคร์ · 📱 ค่าโทรศัพท์ · 👗 เสื้อผ้า · 🎁 ของขวัญ · 👨‍👩‍👧 ครอบครัว · 📦 อื่นๆ

---

## Install as PWA (Android)

1. เปิด Chrome → ไปที่ live URL
2. แตะ ⋮ เมนู → "Add to Home screen"
3. แอปจะติดตั้งและทำงานแบบ offline ได้

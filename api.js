// SimJot — api.js
// วางไฟล์นี้ไว้ในโฟลเดอร์เดียวกับ index.html
// แก้ SCRIPT_URL ให้ตรงกับ Web App URL ที่ Deploy ไว้

const SCRIPT_URL = "https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec";

// ============================
// Core fetch helpers
// ============================
async function apiGet(action) {
  try {
    const res = await fetch(`${SCRIPT_URL}?action=${action}`);
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    return data;
  } catch (err) {
    console.error(`[SimJot] GET ${action} failed:`, err);
    throw err;
  }
}

async function apiPost(action, payload) {
  try {
    const res = await fetch(SCRIPT_URL, {
      method: "POST",
      body: JSON.stringify({ action, data: payload }),
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    return data;
  } catch (err) {
    console.error(`[SimJot] POST ${action} failed:`, err);
    throw err;
  }
}

// ============================
// Transactions
// ============================
const SimJotAPI = {

  async getTransactions() {
    const res = await apiGet("getTransactions");
    return res.transactions || [];
  },

  async addTransaction(txn) {
    // txn = { date, amount, category, note, payment_type, tags }
    return await apiPost("addTransaction", txn);
  },

  async editTransaction(txn) {
    // txn ต้องมี id ด้วย
    return await apiPost("editTransaction", txn);
  },

  async deleteTransaction(id) {
    return await apiPost("deleteTransaction", { id });
  },

  // ============================
  // Categories
  // ============================
  async getCategories() {
    const res = await apiGet("getCategories");
    return res.categories || [];
  },

  // ============================
  // Budgets
  // ============================
  async getBudgets() {
    const res = await apiGet("getBudgets");
    return res.budgets || [];
  },

  async saveBudget(month, category_id, budget_amount) {
    // month format: "2025-04"
    return await apiPost("saveBudget", { month, category_id, budget_amount });
  },

  // ============================
  // Reminders
  // ============================
  async getReminders() {
    const res = await apiGet("getReminders");
    return res.reminders || [];
  },

  async saveReminder(reminder) {
    return await apiPost("saveReminder", reminder);
  },

  // ============================
  // Utility: current month key
  // ============================
  currentMonth() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  },

  // ============================
  // Utility: คำนวณ spent per category
  // จาก transaction list ที่ดึงมาแล้ว
  // ============================
  calcSpentByCategory(transactions, month) {
    const result = {};
    transactions.forEach(t => {
      if (!t.date || !t.amount) return;
      const txnMonth = t.date.slice(0, 7); // "2025-04"
      if (month && txnMonth !== month) return;
      result[t.category] = (result[t.category] || 0) + Number(t.amount);
    });
    return result;
  },

};

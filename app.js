// SimJot — app.js

// ============================
// getCat — lookup by string id (API) or numeric id (UI)
// ============================
function getCat(catId) {
  const cat = typeof catId === 'number'
    ? CAT.find(x => x.id === catId)
    : CAT.find(x => x.str === catId);
  return cat || CAT[CAT.length - 1]; // fallback to 'other'
}

// ============================
// 1. บันทึกรายจ่าย
// ============================
async function handleSave() {
  const amountEl = document.getElementById('amt');
  const noteEl   = document.getElementById('note-input');
  const dateEl   = document.getElementById('date-input');
  const amount   = parseFloat(amountEl?.value);
  const note     = noteEl?.value || '';
  const date     = dateEl?.value || new Date().toISOString().slice(0, 10);

  const payEl    = document.querySelector('.pay-btn.on');
  const payMap   = { 'pay-cash': 'cash', 'pay-transfer': 'transfer', 'pay-card': 'card' };
  const payment_type = payMap[payEl?.id] || 'cash';

  if (!amount || amount <= 0) {
    showToast('กรุณาใส่จำนวนเงินก่อนครับ', 'error');
    return;
  }

  const btn = document.getElementById('save-btn');
  btn.textContent = 'กำลังบันทึก...';
  btn.disabled = true;

  try {
    await SimJotAPI.addTransaction({
      date,
      amount,
      category: selectedCat,
      note,
      payment_type,
      source: 'manual',
    });

    showToast('บันทึกแล้ว ✓', 'success');
    amountEl.value = '';
    noteEl.value   = '';
    goTab(0);
    await loadDashboard();

  } catch (err) {
    showToast('บันทึกไม่ได้ ลองใหม่ครับ', 'error');
    console.error(err);
  } finally {
    btn.textContent = 'บันทึกรายจ่าย';
    btn.disabled = false;
  }
}

// ============================
// 2. โหลด Dashboard จาก Sheets จริง
// ============================
async function loadDashboard() {
  try {
    const txns    = await SimJotAPI.getTransactions();
    const month   = SimJotAPI.currentMonth();
    const spent   = SimJotAPI.calcSpentByCategory(txns, month);
    const budgets = await SimJotAPI.getBudgets();

    const totalSpent  = Object.values(spent).reduce((s, v) => s + v, 0);
    const totalBudget = budgets
      .filter(b => b.month === month)
      .reduce((s, b) => s + Number(b.budget_amount), 0);

    const spentEl = document.getElementById('spent-amount');
    if (spentEl) spentEl.textContent = '฿' + totalSpent.toLocaleString();

    const leftEl  = document.getElementById('left-amount');
    if (leftEl)   leftEl.textContent = '฿' + Math.max(0, totalBudget - totalSpent).toLocaleString();

    renderRecentFromData(txns.slice(0, 5));

  } catch (err) {
    console.error('loadDashboard error:', err);
  }
}

// ============================
// 3. Render รายการล่าสุดจากข้อมูลจริง
// ============================
function renderRecentFromData(txns) {
  const el = document.getElementById('rl');
  if (!el) return;
  if (txns.length === 0) {
    el.innerHTML = '<p style="font-size:13px;color:#999;text-align:center;padding:20px 0;">ยังไม่มีรายการครับ</p>';
    return;
  }
  el.innerHTML = txns.map((t, i) => {
    const c = getCat(t.category);
    return `<div style="display:flex;align-items:center;gap:12px;padding:10px 16px;${i ? 'border-top:1px solid #f5f5f5;' : ''}">
      <div style="width:36px;height:36px;background:${c.bg};border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
        <span style="font-size:10px;font-weight:500;color:${c.tc};">${c.short}</span>
      </div>
      <div style="flex:1;min-width:0;">
        <p style="font-size:13px;font-weight:500;margin:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:#111;">${t.note || c.n}</p>
        <p style="font-size:11px;color:#999;margin:0;">${c.n} · ${t.date}</p>
      </div>
      <span style="font-size:13px;font-weight:500;color:#D85A30;white-space:nowrap;">-฿${Number(t.amount).toLocaleString()}</span>
    </div>`;
  }).join('');
}

// ============================
// 4. Toast notification
// ============================
function showToast(msg, type = 'success') {
  const old = document.getElementById('simjot-toast');
  if (old) old.remove();
  const t = document.createElement('div');
  t.id = 'simjot-toast';
  t.textContent = msg;
  t.style.cssText = `
    position:fixed;bottom:90px;left:50%;transform:translateX(-50%);
    background:${type === 'success' ? '#1D9E75' : '#A32D2D'};
    color:white;padding:10px 20px;border-radius:99px;
    font-size:13px;font-weight:500;z-index:9999;
    white-space:nowrap;pointer-events:none;
  `;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 2500);
}

// ============================
// 5. Init
// ============================
document.addEventListener('DOMContentLoaded', async () => {
  const btn = document.getElementById('save-btn');
  if (btn) btn.onclick = handleSave;
  await loadDashboard();
});

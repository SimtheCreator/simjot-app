// SimJot — app.js
// วางไฟล์นี้ในโฟลเดอร์เดียวกับ index.html และ api.js
// แล้วเพิ่มใน index.html ก่อน </body> :
//   <script src="api.js"></script>
//   <script src="app.js"></script>

// ============================
// 1. บันทึกรายจ่าย
// ============================
async function handleSave() {
  const amountEl  = document.querySelector('input[type="number"]');
  const noteEl    = document.querySelector('input[placeholder*="กาแฟ"]');
  const dateEl    = document.querySelector('input[type="text"]');
  const amount    = parseFloat(amountEl?.value);
  const note      = noteEl?.value || "";
  const date      = dateEl?.value || new Date().toISOString().slice(0, 10);

  // หา category ที่เลือกอยู่
  const selected  = document.querySelector('[data-catbtn][style*="border-color: rgb"]');
  const category  = selected?.dataset?.catbtn || "other";

  // หา payment type
  const payBtn    = ['cash','transfer','credit'].find(t => {
    const b = document.getElementById('pay-' + t);
    return b?.style.background.includes('E1F5EE');
  }) || 'cash';

  if (!amount || amount <= 0) {
    showToast("กรุณาใส่จำนวนเงินก่อนครับ", "error");
    return;
  }

  const btn = document.getElementById('save-btn');
  btn.textContent = "กำลังบันทึก...";
  btn.disabled = true;

  try {
    await SimJotAPI.addTransaction({
      date,
      amount,
      category,
      note,
      payment_type: payBtn,
      source: "manual"
    });

    showToast("บันทึกแล้ว ✓", "success");
    amountEl.value = "";
    noteEl.value   = "";
    showScreen('s-home', 'nav-home');
    await loadDashboard();

  } catch (err) {
    showToast("บันทึกไม่ได้ ลองใหม่ครับ", "error");
    console.error(err);
  } finally {
    btn.textContent = "บันทึกรายจ่าย";
    btn.disabled = false;
  }
}

// ============================
// 2. โหลด Dashboard จาก Sheets จริง
// ============================
async function loadDashboard() {
  try {
    const txns    = await SimJotAPI.getTransactions();
    const month   = SimJotAPI.currentMonth();          // "2025-04"
    const spent   = SimJotAPI.calcSpentByCategory(txns, month);
    const budgets = await SimJotAPI.getBudgets();

    // คำนวณยอดรวมเดือนนี้
    const totalSpent = Object.values(spent).reduce((s, v) => s + v, 0);
    const totalBudget = budgets
      .filter(b => b.month === month)
      .reduce((s, b) => s + Number(b.budget_amount), 0);

    // อัปเดต summary card
    const spentEl = document.querySelector('#s-home .spent-amount');
    if (spentEl) spentEl.textContent = '฿' + totalSpent.toLocaleString();

    const leftEl  = document.querySelector('#s-home .left-amount');
    if (leftEl)  leftEl.textContent  = '฿' + Math.max(0, totalBudget - totalSpent).toLocaleString();

    // อัปเดตรายการล่าสุด
    renderRecentFromData(txns.slice(0, 5));

  } catch (err) {
    console.error("loadDashboard error:", err);
  }
}

// ============================
// 3. Render รายการล่าสุดจากข้อมูลจริง
// ============================
function renderRecentFromData(txns) {
  const el = document.getElementById('recent-list');
  if (!el) return;
  if (txns.length === 0) {
    el.innerHTML = '<p style="font-size:13px;color:var(--color-text-secondary);text-align:center;padding:20px 0">ยังไม่มีรายการครับ</p>';
    return;
  }
  el.innerHTML = txns.map((t, i) => {
    const c = getCat(t.category);
    return `<div style="display:flex;align-items:center;gap:12px;padding:10px 0;${i ? 'border-top:0.5px solid var(--color-border-tertiary)' : ''}">
      <div class="dot" style="width:36px;height:36px;background:${c.bg};border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0">
        <span style="font-size:11px;font-weight:500;color:${c.tc}">${c.short}</span>
      </div>
      <div style="flex:1;min-width:0">
        <p style="font-size:13px;font-weight:500;margin:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:var(--color-text-primary)">${t.note || c.name}</p>
        <p style="font-size:11px;color:var(--color-text-secondary);margin:0">${c.name} · ${t.date}</p>
      </div>
      <span style="font-size:13px;font-weight:500;color:#D85A30;white-space:nowrap">-฿${Number(t.amount).toLocaleString()}</span>
    </div>`;
  }).join('');
}

// ============================
// 4. Toast notification
// ============================
function showToast(msg, type = "success") {
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
// 5. Init — รันตอนโหลดหน้า
// ============================
document.addEventListener('DOMContentLoaded', async () => {
  // wire ปุ่มบันทึก
  const btn = document.querySelector('#s-add button[style*="background:#1D9E75"]');
  if (btn) { btn.id = 'save-btn'; btn.onclick = handleSave; }
  // โหลดข้อมูลจริงจาก Sheets
  await loadDashboard();
});

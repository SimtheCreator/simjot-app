// SimJot — Google Apps Script backend
// วิธีใช้: คัดลอกโค้ดนี้ทั้งหมดไปวางใน Google Apps Script แล้ว Deploy ใหม่

var SS = SpreadsheetApp.getActiveSpreadsheet();

// ============================
// SETUP — รันครั้งเดียวเพื่อสร้าง Sheet tabs + headers
// วิธีรัน: เลือก setup ใน dropdown แล้วกด ▶ Run
// ============================
function setup() {
  var sheets = {
    "transactions": ["id", "date", "amount", "category", "tags", "note", "payment_type", "source"],
    "categories":   ["id", "name", "short", "color", "bg", "tc"],
    "budgets":      ["month", "category_id", "budget_amount"],
    "reminders":    ["id", "title", "amount", "frequency", "trigger_day", "active"]
  };
  Object.keys(sheets).forEach(function(name) {
    var sheet = SS.getSheetByName(name);
    if (!sheet) {
      sheet = SS.insertSheet(name);
      sheet.getRange(1, 1, 1, sheets[name].length).setValues([sheets[name]]);
      sheet.getRange(1, 1, 1, sheets[name].length)
        .setFontWeight("bold")
        .setBackground("#f3f3f3");
      sheet.setFrozenRows(1);
    }
  });
  Logger.log("SimJot setup complete ✓");
}

// ============================
// ENTRY POINTS
// ============================
function doGet(e) {
  var action = e.parameter.action;
  var result;
  try {
    if      (action === "getTransactions") result = getTransactions();
    else if (action === "getCategories")   result = getCategories();
    else if (action === "getBudgets")      result = getBudgets();
    else if (action === "getReminders")    result = getReminders();
    else result = { error: "Unknown action: " + action };
  } catch(err) {
    result = { error: err.message };
  }
  return ContentService
    .createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  var result;
  try {
    var payload = JSON.parse(e.postData.contents);
    var action  = payload.action;
    var data    = payload.data;
    if      (action === "addTransaction")    result = addTransaction(data);
    else if (action === "editTransaction")   result = editTransaction(data);
    else if (action === "deleteTransaction") result = deleteTransaction(data);
    else if (action === "saveBudget")        result = saveBudget(data);
    else if (action === "saveReminder")      result = saveReminder(data);
    else result = { error: "Unknown action: " + action };
  } catch(err) {
    result = { error: err.message };
  }
  return ContentService
    .createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

// ============================
// TRANSACTIONS
// Schema: id | date | amount | category | tags | note | payment_type | source
// ============================
function getTransactions() {
  var sheet = SS.getSheetByName("transactions");
  var rows  = sheet.getDataRange().getValues();
  var headers = rows[0];
  var txns = rows.slice(1).map(function(r) {
    var obj = {};
    headers.forEach(function(h, i) { obj[h] = r[i]; });
    return obj;
  }).filter(function(t) { return t.id !== ""; });
  return { transactions: txns };
}

function addTransaction(data) {
  var sheet = SS.getSheetByName("transactions");
  var id    = "txn_" + new Date().getTime();
  sheet.appendRow([
    id,
    data.date,
    data.amount,
    data.category,
    data.tags || "",
    data.note || "",
    data.payment_type || "cash",
    data.source || "manual"
  ]);
  return { ok: true, id: id };
}

function editTransaction(data) {
  var sheet = SS.getSheetByName("transactions");
  var rows  = sheet.getDataRange().getValues();
  for (var i = 1; i < rows.length; i++) {
    if (rows[i][0] == data.id) {
      sheet.getRange(i + 1, 1, 1, 8).setValues([[
        data.id,
        data.date,
        data.amount,
        data.category,
        data.tags || "",
        data.note || "",
        data.payment_type || "cash",
        data.source || "manual"
      ]]);
      return { ok: true };
    }
  }
  return { error: "Transaction not found: " + data.id };
}

function deleteTransaction(data) {
  var sheet = SS.getSheetByName("transactions");
  var rows  = sheet.getDataRange().getValues();
  for (var i = 1; i < rows.length; i++) {
    if (rows[i][0] == data.id) {
      sheet.deleteRow(i + 1);
      return { ok: true };
    }
  }
  return { error: "Transaction not found: " + data.id };
}

// ============================
// CATEGORIES
// Schema: id | name | short | color | bg | tc
// ============================
function getCategories() {
  var sheet = SS.getSheetByName("categories");
  if (!sheet) return { categories: [] };
  var rows    = sheet.getDataRange().getValues();
  var headers = rows[0];
  var cats = rows.slice(1).map(function(r) {
    var obj = {};
    headers.forEach(function(h, i) { obj[h] = r[i]; });
    return obj;
  }).filter(function(c) { return c.id !== ""; });
  return { categories: cats };
}

// ============================
// BUDGETS
// Schema: month | category_id | budget_amount
// ============================
function getBudgets() {
  var sheet = SS.getSheetByName("budgets");
  if (!sheet) return { budgets: [] };
  var rows    = sheet.getDataRange().getValues();
  var headers = rows[0];
  var budgets = rows.slice(1).map(function(r) {
    var obj = {};
    headers.forEach(function(h, i) { obj[h] = r[i]; });
    return obj;
  }).filter(function(b) { return b.month !== ""; });
  return { budgets: budgets };
}

function saveBudget(data) {
  var sheet = SS.getSheetByName("budgets");
  var rows  = sheet.getDataRange().getValues();
  for (var i = 1; i < rows.length; i++) {
    if (rows[i][0] == data.month && rows[i][1] == data.category_id) {
      sheet.getRange(i + 1, 3).setValue(data.budget_amount);
      return { ok: true };
    }
  }
  sheet.appendRow([data.month, data.category_id, data.budget_amount]);
  return { ok: true };
}

// ============================
// REMINDERS
// Schema: id | title | amount | frequency | trigger_day | active
// ============================
function getReminders() {
  var sheet = SS.getSheetByName("reminders");
  if (!sheet) return { reminders: [] };
  var rows    = sheet.getDataRange().getValues();
  var headers = rows[0];
  var rems = rows.slice(1).map(function(r) {
    var obj = {};
    headers.forEach(function(h, i) { obj[h] = r[i]; });
    return obj;
  }).filter(function(r) { return r.id !== ""; });
  return { reminders: rems };
}

function saveReminder(data) {
  var sheet = SS.getSheetByName("reminders");
  if (data.id) {
    var rows = sheet.getDataRange().getValues();
    for (var i = 1; i < rows.length; i++) {
      if (rows[i][0] == data.id) {
        sheet.getRange(i + 1, 1, 1, 6).setValues([[
          data.id, data.title, data.amount || "", data.frequency || "", data.trigger_day || "", data.active
        ]]);
        return { ok: true };
      }
    }
  }
  var id = "rem_" + new Date().getTime();
  sheet.appendRow([id, data.title, data.amount || "", data.frequency || "", data.trigger_day || "", data.active !== false]);
  return { ok: true, id: id };
}

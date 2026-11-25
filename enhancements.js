// =============================================================
// GOLDEN GROVE AI FINANCE – ENHANCEMENTS
// Covers all five additional business requirements:
//   1. Data Integration Simulation
//   2. Invoice Aging & Automated Escalation
//   3. Payment Prevention Control (strengthened)
//   4. Business Outcome Monitoring
//   5. Traceability Matrix
// All data is demonstration data. Frontend-only.
// =============================================================

// ─────────────────────────────────────────────────────────────
// SECTION 1 — PAYMENT ELIGIBILITY ENGINE
// Called by the approval page before allowing payment sign-off.
// ─────────────────────────────────────────────────────────────
function checkPaymentEligibility(inv) {
  const blocks = [];

  // Check 1: Duplicate flag
  if (inv.isDuplicate) {
    blocks.push({
      rule:   'DUP-BLOCK',
      reason: 'Potential duplicate detected. This invoice matches a previously registered invoice from the same supplier for the same amount.',
      severity: 'Critical',
      resolveWith: 'Mei Ling must investigate and mark exception as Resolved.',
    });
  }

  // Check 2: Unresolved quantity mismatch exception
  const qtyExc = EXCEPTIONS.find(e =>
    e.invoiceId === inv.id &&
    e.category === 'Quantity Mismatch' &&
    e.status !== 'Resolved'
  );
  if (qtyExc) {
    blocks.push({
      rule:   'QTY-BLOCK',
      reason: `Unresolved quantity mismatch (${qtyExc.id}). The invoice quantity differs from the Goods Received Note.`,
      severity: 'High',
      resolveWith: 'Mei Ling must resolve exception ' + qtyExc.id + ' first.',
    });
  }

  // Check 3: Unresolved price mismatch exception
  const priceExc = EXCEPTIONS.find(e =>
    e.invoiceId === inv.id &&
    e.category === 'Price Mismatch' &&
    e.status !== 'Resolved'
  );
  if (priceExc) {
    blocks.push({
      rule:   'PRICE-BLOCK',
      reason: `Unresolved price mismatch (${priceExc.id}). Invoice unit price differs from the agreed Purchase Order price.`,
      severity: 'High',
      resolveWith: 'Hafiz (Purchasing) must confirm the agreed price, then Mei Ling resolves exception ' + priceExc.id + '.',
    });
  }

  // Check 4: Missing delivery evidence
  const gr = getDelivery(inv.poNumber);
  if (!gr && inv.poNumber && inv.poNumber !== 'PO-UNKNOWN') {
    blocks.push({
      rule:   'GRN-BLOCK',
      reason: 'No Goods Received Note found for PO ' + inv.poNumber + '. Delivery cannot be verified.',
      severity: 'High',
      resolveWith: 'Shop must submit a paper delivery record. Aina registers it in the Data Integration module.',
    });
  }

  // Check 5: Missing PO
  if (!inv.poNumber || inv.poNumber === 'PO-UNKNOWN') {
    blocks.push({
      rule:   'PO-BLOCK',
      reason: 'No valid Purchase Order reference. Payment cannot be authorised without a matching PO.',
      severity: 'Critical',
      resolveWith: 'Hafiz must raise a PO or confirm the transaction before payment.',
    });
  }

  // Check 6: Unreadable / unverified
  const unreadExc = EXCEPTIONS.find(e =>
    e.invoiceId === inv.id &&
    (e.category === 'Unreadable Invoice' || e.category === 'Missing Information') &&
    e.status !== 'Resolved'
  );
  if (unreadExc) {
    blocks.push({
      rule:   'UNREAD-BLOCK',
      reason: `Invoice has unverified fields (${unreadExc.id}). Invoice data has not been confirmed with the supplier.`,
      severity: 'Medium',
      resolveWith: 'Mei Ling must confirm figures with supplier and resolve exception ' + unreadExc.id + '.',
    });
  }

  return {
    eligible:  blocks.length === 0,
    hardBlock: blocks.some(b => b.severity === 'Critical' || b.severity === 'High'),
    blocks,
  };
}

function eligibilityBadge(inv) {
  const e = checkPaymentEligibility(inv);
  if (e.eligible)   return '<span class="badge badge-approved">✅ Eligible</span>';
  if (e.hardBlock)  return '<span class="badge badge-critical">🔒 Blocked</span>';
  return '<span class="badge badge-medium">⚠ Review Required</span>';
}

// ─────────────────────────────────────────────────────────────
// SECTION 2 — INVOICE AGING ENGINE
// Computes processing-age buckets and escalation status.
// Age is calculated from registeredAt / invoiceDate, NOT dueDate.
// ─────────────────────────────────────────────────────────────

// Aging thresholds (days in current stage, not payment overdue)
const AGING_RULES = [
  { minDays: 0,  maxDays: 2,  label: 'Normal',           color: 'var(--green-primary)', class: 'badge-approved',  escalateTo: null,       icon: '🟢' },
  { minDays: 3,  maxDays: 4,  label: 'Attention Required',color: 'var(--orange)',         class: 'badge-medium',    escalateTo: 'Aina',     icon: '🟡' },
  { minDays: 5,  maxDays: 6,  label: 'Escalate to Mei Ling',color:'var(--orange)',        class: 'badge-high',      escalateTo: 'Mei Ling', icon: '🟠' },
  { minDays: 7,  maxDays: 999,label: 'Notify Siti',       color: 'var(--red)',            class: 'badge-critical',  escalateTo: 'Siti',     icon: '🔴' },
];

function getAgingBucket(daysInProcess) {
  return AGING_RULES.find(r => daysInProcess >= r.minDays && daysInProcess <= r.maxDays) || AGING_RULES[0];
}

function getDelayReason(inv) {
  if (inv.isDuplicate)                   return 'Potential duplicate — awaiting Mei Ling investigation';
  if (inv.matchStatus === 'Missing Delivery Record') return 'Waiting for shop delivery record (avg delay 3–7 days)';
  if (inv.matchStatus === 'Quantity Mismatch')       return 'Quantity discrepancy — awaiting supplier clarification';
  if (inv.matchStatus === 'Price Mismatch')          return 'Price discrepancy — awaiting Hafiz PO confirmation';
  if (inv.matchStatus === 'Missing PO')              return 'No PO reference — Hafiz to raise or confirm';
  if (inv.billType === 'handwritten' || inv.billType === 'photo') return 'Handwritten / phone photo — manual verification required';
  if (inv.status === 'Exception')        return 'Exception raised — awaiting resolution';
  return 'Normal processing';
}

// ─────────────────────────────────────────────────────────────
// PAGE: Invoice Aging Tracker
// ─────────────────────────────────────────────────────────────
function renderAgingPage() {
  const active = INVOICES.filter(i => i.status !== 'Paid' && i.status !== 'Approved' && i.status !== 'Rejected');

  const bucketCounts = AGING_RULES.map(r => ({
    ...r,
    count: active.filter(i => i.processingDays >= r.minDays && i.processingDays <= r.maxDays).length,
  }));

  const el = document.getElementById('page-aging');
  el.innerHTML = `
  <div class="page-heading">
    <h1>Invoice Aging Tracker</h1>
    <p>Processing age of active invoices vs the 4-day target. <strong>Aging = days in current stage, not payment overdue status.</strong></p>
  </div>

  <!-- Bucket summary -->
  <div class="kpi-grid" style="grid-template-columns:repeat(4,1fr);margin-bottom:20px">
    ${bucketCounts.map(b => `
    <div class="kpi-card ${b.minDays >= 7 ? 'kpi-danger' : b.minDays >= 5 ? 'kpi-warn' : b.minDays >= 3 ? 'kpi-warn' : ''}">
      <div class="kpi-label">${b.icon} ${b.label}</div>
      <div class="kpi-value" style="color:${b.color}">${b.count}</div>
      <div class="kpi-sub">${b.minDays}–${b.maxDays < 999 ? b.maxDays : '∞'} days${b.escalateTo ? ' · Escalate → ' + b.escalateTo : ''}</div>
    </div>`).join('')}
  </div>

  <!-- Escalation rules banner -->
  <div class="card" style="margin-bottom:20px">
    <div class="card-header"><h2>Automated Escalation Rules</h2><span class="badge badge-medium">Configurable demonstration rules</span></div>
    <div class="card-body" style="display:flex;gap:12px;flex-wrap:wrap">
      ${AGING_RULES.map(r => `
      <div style="flex:1;min-width:160px;text-align:center;padding:14px;background:var(--grey-50);border-radius:8px;border-top:3px solid ${r.color}">
        <div style="font-size:22px">${r.icon}</div>
        <div style="font-weight:700;margin:6px 0;font-size:13px">${r.minDays}–${r.maxDays < 999 ? r.maxDays : '7+'}  days</div>
        <div style="font-size:12px;font-weight:600;color:${r.color}">${r.label}</div>
        <div style="font-size:11px;color:var(--grey-500);margin-top:4px">${r.escalateTo ? 'Escalate → ' + r.escalateTo : 'No escalation needed'}</div>
      </div>`).join('')}
    </div>
  </div>

  <!-- Active invoices aging table -->
  <div class="card">
    <div class="card-header">
      <h2>Active Invoices – Processing Age</h2>
      <div style="display:flex;gap:8px">
        <select class="form-select" id="aging-filter" onchange="filterAgingTable()" style="font-size:12px;padding:5px 8px">
          <option value="">All buckets</option>
          ${AGING_RULES.map(r => `<option value="${r.label}">${r.label}</option>`).join('')}
        </select>
        <select class="form-select" id="aging-assign" onchange="filterAgingTable()" style="font-size:12px;padding:5px 8px">
          <option value="">All assignees</option>
          ${['Aina','Mei Ling','Siti','Hafiz'].map(u => `<option>${u}</option>`).join('')}
        </select>
      </div>
    </div>
    <div class="table-wrap">
      <table>
        <thead><tr>
          <th>Invoice</th><th>Supplier</th><th>Received Date</th><th>Stage</th>
          <th>Days in Stage</th><th>Aging Status</th><th>Assigned To</th>
          <th>Delay Reason</th><th>Due Date</th><th>Escalation</th>
        </tr></thead>
        <tbody id="aging-tbody"></tbody>
      </table>
    </div>
  </div>`;

  renderAgingRows(active);
}

function filterAgingTable() {
  const bucket = document.getElementById('aging-filter')?.value || '';
  const assign = document.getElementById('aging-assign')?.value || '';
  const active = INVOICES.filter(i => i.status !== 'Paid' && i.status !== 'Approved' && i.status !== 'Rejected');
  const filtered = active.filter(i => {
    const b = getAgingBucket(i.processingDays);
    if (bucket && b.label !== bucket) return false;
    if (assign && i.assignedTo !== assign) return false;
    return true;
  });
  renderAgingRows(filtered);
}

function renderAgingRows(list) {
  const tbody = document.getElementById('aging-tbody');
  if (!tbody) return;
  if (!list.length) {
    tbody.innerHTML = '<tr><td colspan="10"><div class="empty-state"><div class="empty-icon">✅</div><p>No invoices match filter.</p></div></td></tr>';
    return;
  }

  // Sort descending by processingDays
  const sorted = [...list].sort((a, b) => b.processingDays - a.processingDays);

  tbody.innerHTML = sorted.map(inv => {
    const bucket  = getAgingBucket(inv.processingDays);
    const reason  = getDelayReason(inv);
    const dueSoon = isDueSoon(inv.dueDate);
    const rowCls  = inv.processingDays >= 7 ? 'row-critical' : inv.processingDays >= 5 ? 'row-high' : inv.processingDays >= 3 ? 'row-medium' : '';

    // Age bar (max 14 days = 100%)
    const pct     = Math.min(100, inv.processingDays / 14 * 100).toFixed(0);
    const barCol  = inv.processingDays >= 7 ? 'var(--red)' : inv.processingDays >= 5 ? 'var(--orange)' : inv.processingDays >= 3 ? 'var(--blue)' : 'var(--green-primary)';

    return `<tr class="${rowCls}">
      <td><a href="#" onclick="openInvoiceDetail('${inv.id}');return false" style="color:var(--green-primary);font-weight:600">${esc(inv.id)}</a></td>
      <td style="font-size:12px">${esc(inv.supplierName)}</td>
      <td style="font-size:12px">${esc(inv.invoiceDate)}</td>
      <td>${statusBadge(inv.status)}</td>
      <td>
        <div style="display:flex;align-items:center;gap:8px">
          <div style="flex:1;min-width:60px;height:6px;background:var(--grey-200);border-radius:3px"><div style="height:100%;width:${pct}%;background:${barCol};border-radius:3px"></div></div>
          <strong style="color:${barCol};min-width:28px">${inv.processingDays}d</strong>
        </div>
      </td>
      <td><span class="badge ${bucket.class}">${bucket.icon} ${esc(bucket.label)}</span></td>
      <td style="font-size:12px">${esc(inv.assignedTo)}</td>
      <td style="font-size:11px;color:var(--grey-500);max-width:180px">${esc(reason)}</td>
      <td style="font-size:12px">${esc(inv.dueDate)}${dueSoon ? ' <span style="color:var(--orange)" title="Due within 3 days">🕐</span>' : ''}</td>
      <td>
        ${bucket.escalateTo ? `<button class="btn btn-warning btn-xs" onclick="escalateInvoice('${inv.id}','${bucket.escalateTo}')">
          → ${esc(bucket.escalateTo)}</button>` : '<span style="color:var(--grey-400);font-size:11px">None</span>'}
      </td>
    </tr>`;
  }).join('');
}

function escalateInvoice(invId, to) {
  const inv = INVOICES.find(i => i.id === invId);
  if (!inv) return;
  inv.assignedTo = to;
  addAudit(currentUser.name, invId, 'Aging Escalation', `Invoice escalated to ${to} after ${inv.processingDays} days in current stage.`);
  showToast(`${invId} escalated to ${to}`, 'warn');
  renderAgingPage();
}

// ─────────────────────────────────────────────────────────────
// PAGE: Data Integration Simulation
// ─────────────────────────────────────────────────────────────

// Simulated LedgerMate export (last 10 paid invoices)
function getLedgerMateExport() {
  return INVOICES
    .filter(i => i.status === 'Paid' || i.status === 'Approved')
    .slice(0, 12)
    .map(i => ({
      supplier_code: i.supplierCode,
      bill_number:   i.id,
      bill_date:     i.invoiceDate,
      po_number:     i.poNumber,
      description:   i.description,
      quantity:      i.qty,
      unit_price:    i.unitPrice,
      tax:           i.tax,
      total:         i.total,
      due_date:      i.dueDate,
      _source:       'LedgerMate',
      _status:       i.status,
    }));
}

// Simulated purchasing CSV (from Hafiz's spreadsheet system)
function getPurchasingCsvData() {
  return PURCHASE_ORDERS.map(po => ({
    po_number:     po.poNumber,
    supplier_code: po.supplierCode,
    supplier_name: (SUPPLIERS.find(s => s.code === po.supplierCode) || {}).name || '',
    date:          po.date,
    description:   po.description,
    quantity:      po.qty,
    unit_price:    po.unitPrice,
    total:         po.total,
    po_status:     po.status,
    _source:       'Purchasing Spreadsheet (Hafiz)',
  }));
}

// Delivery records to register manually
let MANUAL_DELIVERY_QUEUE = [
  { id: 'GR-QUEUE-001', poNumber: 'PO-2026-0112', supplierCode: 'SUP-011', receivedDate: '', qtyReceived: '', registeredBy: '', status: 'Pending', note: 'Lemongrass delivery – shop paper form received' },
  { id: 'GR-QUEUE-002', poNumber: 'PO-2026-0119', supplierCode: 'SUP-006', receivedDate: '', qtyReceived: '', registeredBy: '', status: 'Pending', note: 'Squid delivery – awaiting paper form from shop' },
];

function renderIntegrationPage() {
  const ledger = getLedgerMateExport();
  const poData = getPurchasingCsvData();

  const el = document.getElementById('page-integration');
  el.innerHTML = `
  <div class="page-heading">
    <h1>Data Integration</h1>
    <p>Simulated connection to Golden Grove Mart's existing financial systems. <span class="badge badge-medium">⚠ Demonstration – No real system is connected</span></p>
  </div>

  <!-- Systems overview -->
  <div class="three-col" style="margin-bottom:20px">
    <div class="card" style="margin-bottom:0;border-top:3px solid var(--green-primary)">
      <div class="card-body" style="text-align:center;padding:20px">
        <div style="font-size:32px;margin-bottom:8px">🧮</div>
        <div style="font-weight:700;font-size:14px">LedgerMate</div>
        <div style="font-size:12px;color:var(--grey-500);margin:4px 0">Accounting System</div>
        <span class="badge badge-approved">Connected (Simulated)</span>
        <div style="font-size:11px;color:var(--grey-400);margin-top:8px">Source: Siti / Aina</div>
      </div>
    </div>
    <div class="card" style="margin-bottom:0;border-top:3px solid var(--blue)">
      <div class="card-body" style="text-align:center;padding:20px">
        <div style="font-size:32px;margin-bottom:8px">📊</div>
        <div style="font-weight:700;font-size:14px">Purchasing Spreadsheet</div>
        <div style="font-size:12px;color:var(--grey-500);margin:4px 0">Hafiz's PO System (CSV Export)</div>
        <span class="badge badge-check">Import Ready</span>
        <div style="font-size:11px;color:var(--grey-400);margin-top:8px">Source: Hafiz's team</div>
      </div>
    </div>
    <div class="card" style="margin-bottom:0;border-top:3px solid var(--orange)">
      <div class="card-body" style="text-align:center;padding:20px">
        <div style="font-size:32px;margin-bottom:8px">📄</div>
        <div style="font-weight:700;font-size:14px">Shop Delivery Records</div>
        <div style="font-size:12px;color:var(--grey-500);margin:4px 0">Paper Forms (Manual Entry)</div>
        <span class="badge badge-medium">${MANUAL_DELIVERY_QUEUE.filter(d=>d.status==='Pending').length} Pending Registration</span>
        <div style="font-size:11px;color:var(--grey-400);margin-top:8px">Source: Shop staff paper forms</div>
      </div>
    </div>
  </div>

  <div class="tabs" id="integration-tabs">
    <button class="tab-btn active" onclick="switchIntTab('ledger')">🧮 LedgerMate Data</button>
    <button class="tab-btn" onclick="switchIntTab('purchasing')">📊 Purchasing POs</button>
    <button class="tab-btn" onclick="switchIntTab('delivery')">📄 Delivery Records</button>
    <button class="tab-btn" onclick="switchIntTab('validation')">✅ Validation Report</button>
  </div>

  <!-- LedgerMate tab -->
  <div id="inttab-ledger" class="tab-panel active">
    <div class="card">
      <div class="card-header">
        <h2>LedgerMate – Invoice Export</h2>
        <div style="display:flex;gap:8px">
          <span class="badge badge-medium">Source: LedgerMate accounting system</span>
          <button class="btn btn-primary btn-sm" onclick="simulateLedgerImport()">📥 Simulate Import to AI System</button>
          <button class="btn btn-secondary btn-sm" onclick="simulateLedgerExport()">📤 Export Payment File</button>
        </div>
      </div>
      <div style="font-size:11px;color:var(--grey-500);padding:8px 20px;background:var(--grey-50);border-bottom:1px solid var(--grey-200)">
        Import columns: supplier_code · bill_number · bill_date · po_number · description · quantity · unit_price · tax · total · due_date
      </div>
      <div class="table-wrap"><table>
        <thead><tr><th>Bill Number</th><th>Supplier Code</th><th>Bill Date</th><th>PO Number</th><th>Description</th><th>Qty</th><th>Unit Price</th><th>Total</th><th>Status</th><th>Source</th></tr></thead>
        <tbody>${ledger.map(r => `<tr>
          <td style="font-size:12px;font-weight:600">${esc(r.bill_number)}</td>
          <td style="font-size:12px">${esc(r.supplier_code)}</td>
          <td style="font-size:12px">${esc(r.bill_date)}</td>
          <td style="font-size:12px">${esc(r.po_number)}</td>
          <td style="font-size:12px;max-width:150px">${esc(r.description)}</td>
          <td>${r.quantity}</td>
          <td>${fmt(r.unit_price)}</td>
          <td><strong>${fmt(r.total)}</strong></td>
          <td>${statusBadge(r._status)}</td>
          <td><span class="badge badge-check" style="font-size:10px">🧮 ${esc(r._source)}</span></td>
        </tr>`).join('')}</tbody>
      </table></div>
    </div>
  </div>

  <!-- Purchasing tab -->
  <div id="inttab-purchasing" class="tab-panel">
    <div class="card">
      <div class="card-header">
        <h2>Purchasing Spreadsheet – PO Register</h2>
        <div style="display:flex;gap:8px">
          <span class="badge badge-check">Source: Hafiz's Team – CSV Export</span>
          <button class="btn btn-primary btn-sm" onclick="simulatePOImport()">📥 Simulate CSV Import</button>
        </div>
      </div>
      <div style="font-size:11px;color:var(--grey-500);padding:8px 20px;background:var(--grey-50);border-bottom:1px solid var(--grey-200)">
        No direct link between purchasing system and accounting system. Data is transferred manually via CSV export.
      </div>
      <div class="table-wrap"><table>
        <thead><tr><th>PO Number</th><th>Supplier</th><th>Date</th><th>Description</th><th>Qty</th><th>Unit Price</th><th>Total</th><th>PO Status</th><th>Invoice Matched?</th></tr></thead>
        <tbody>${poData.map(po => {
          const matched = INVOICES.find(i => i.poNumber === po.po_number);
          return `<tr>
            <td style="font-weight:600;font-size:12px">${esc(po.po_number)}</td>
            <td style="font-size:12px">${esc(po.supplier_name)}</td>
            <td style="font-size:12px">${esc(po.date)}</td>
            <td style="font-size:12px">${esc(po.description)}</td>
            <td>${po.quantity}</td>
            <td>${fmt(po.unit_price)}</td>
            <td>${fmt(po.total)}</td>
            <td><span class="badge ${po.po_status==='Received'?'badge-approved':po.po_status==='Partial'?'badge-medium':'badge-check'}">${esc(po.po_status)}</span></td>
            <td>${matched ? `<span class="badge badge-approved">✅ ${esc(matched.id)}</span>` : '<span class="badge badge-missing">❌ No invoice</span>'}</td>
          </tr>`;
        }).join('')}</tbody>
      </table></div>
    </div>
  </div>

  <!-- Delivery records tab -->
  <div id="inttab-delivery" class="tab-panel">
    <div class="two-col">
      <div class="card" style="margin-bottom:0">
        <div class="card-header"><h2>Registered Delivery Records (GRN)</h2></div>
        <div class="table-wrap"><table>
          <thead><tr><th>GRN</th><th>PO Number</th><th>Received Date</th><th>Qty Received</th><th>Invoice Matched?</th></tr></thead>
          <tbody>${DELIVERY_RECORDS.map(gr => {
            const inv = INVOICES.find(i => i.poNumber === gr.poNumber);
            return `<tr>
              <td style="font-size:12px;font-weight:600">${esc(gr.grNumber)}</td>
              <td style="font-size:12px">${esc(gr.poNumber)}</td>
              <td style="font-size:12px">${esc(gr.receivedDate)}</td>
              <td>${gr.qtyReceived}</td>
              <td>${inv ? `<span class="badge badge-approved">✅ ${esc(inv.id)}</span>` : '<span class="badge badge-missing">No invoice</span>'}</td>
            </tr>`;
          }).join('')}</tbody>
        </table></div>
      </div>

      <div class="card" style="margin-bottom:0">
        <div class="card-header"><h2>📄 Manual Delivery Registration</h2><span class="badge badge-medium">Paper forms → system</span></div>
        <div class="card-body">
          <div class="alert alert-high" style="margin-bottom:16px">
            <span class="alert-icon">⚠️</span>
            <div>Shops have <strong>no receiving system</strong> — only paper forms. Aina must manually register each delivery confirmation. Delay here blocks invoice matching.</div>
          </div>

          <!-- Pending queue -->
          ${MANUAL_DELIVERY_QUEUE.map(d => `
          <div id="dq-${d.id}" style="border:1px solid var(--grey-200);border-radius:8px;padding:14px;margin-bottom:12px;${d.status==='Registered'?'opacity:.6':''}">
            <div style="display:flex;justify-content:space-between;margin-bottom:8px">
              <div>
                <strong style="font-size:13px">${esc(d.id)}</strong>
                <span class="badge ${d.status==='Registered'?'badge-approved':'badge-medium'}" style="margin-left:8px">${esc(d.status)}</span>
              </div>
              <div style="font-size:11px;color:var(--grey-400)">${esc(d.poNumber)} · ${esc(d.note)}</div>
            </div>
            ${d.status !== 'Registered' ? `
            <div class="form-grid" style="margin-bottom:8px">
              <div class="form-group">
                <label class="form-label">Received Date</label>
                <input type="date" class="form-input" id="dr-date-${d.id}" value="${today()}">
              </div>
              <div class="form-group">
                <label class="form-label">Quantity Received</label>
                <input type="number" class="form-input" id="dr-qty-${d.id}" placeholder="Enter qty">
              </div>
            </div>
            <button class="btn btn-primary btn-sm" onclick="registerDelivery('${d.id}')">📄 Register Delivery</button>
            ` : `<div style="color:var(--green-primary);font-size:12px;font-weight:600">✅ Registered by ${esc(d.registeredBy)} on ${esc(d.receivedDate)}</div>`}
          </div>`).join('')}
        </div>
      </div>
    </div>
  </div>

  <!-- Validation report tab -->
  <div id="inttab-validation" class="tab-panel">
    <div class="card">
      <div class="card-header"><h2>✅ Data Validation Report</h2><span class="badge badge-medium">Identifies missing, mismatched and unlinked records</span></div>
      <div class="card-body" id="validation-body">${buildValidationReport()}</div>
    </div>
  </div>`;
}

function switchIntTab(id) {
  document.querySelectorAll('#integration-tabs .tab-btn').forEach((b, i) => {
    const ids = ['ledger','purchasing','delivery','validation'];
    b.classList.toggle('active', ids[i] === id);
  });
  document.querySelectorAll('[id^="inttab-"]').forEach(p => {
    p.classList.toggle('active', p.id === 'inttab-' + id);
  });
}

function simulateLedgerImport() {
  showToast('LedgerMate import simulation: 12 invoice records loaded into AI system.', 'success');
  addAudit('System', 'IMPORT', 'LedgerMate Import', 'Simulated import of 12 invoice records from LedgerMate accounting system.');
}
function simulateLedgerExport() {
  showToast('Payment file exported to LedgerMate format (simulation). Would upload to bank business portal.', 'success');
  addAudit(currentUser.name, 'EXPORT', 'LedgerMate Export', 'Payment file export simulated by ' + currentUser.name + '.');
}
function simulatePOImport() {
  showToast('Purchasing CSV imported: ' + PURCHASE_ORDERS.length + ' PO records loaded from Hafiz\'s spreadsheet system.', 'success');
  addAudit('System', 'IMPORT', 'PO CSV Import', 'Simulated CSV import of ' + PURCHASE_ORDERS.length + ' purchase orders from Hafiz\'s purchasing system.');
}

function registerDelivery(id) {
  const d    = MANUAL_DELIVERY_QUEUE.find(x => x.id === id);
  if (!d) return;
  const date = document.getElementById('dr-date-' + id)?.value;
  const qty  = document.getElementById('dr-qty-' + id)?.value;
  if (!date || !qty) { showToast('Please enter both date and quantity.', 'warn'); return; }
  d.receivedDate  = date;
  d.qtyReceived   = parseInt(qty);
  d.registeredBy  = currentUser.name;
  d.status        = 'Registered';

  // Add to delivery records
  DELIVERY_RECORDS.push({
    grNumber:     id,
    poNumber:     d.poNumber,
    receivedDate: date,
    qtyReceived:  parseInt(qty),
    condition:    'Good',
    receivedBy:   currentUser.name,
  });

  // Update matching status on linked invoice
  const inv = INVOICES.find(i => i.poNumber === d.poNumber);
  if (inv && inv.matchStatus === 'Missing Delivery Record') {
    inv.matchStatus = 'Partially Matched';
    const exc = EXCEPTIONS.find(e => e.invoiceId === inv.id && e.category === 'Missing Delivery Record');
    if (exc) exc.status = 'Resolved';
  }

  addAudit(currentUser.name, d.poNumber, 'Delivery Record Registered', `Manual delivery record registered: ${qty} units received on ${date} for ${d.poNumber}.`);
  showToast(`Delivery record registered for ${d.poNumber}`, 'success');
  refreshBadges();
  renderIntegrationPage();
}

function buildValidationReport() {
  const issues = [];

  // POs without matching invoices
  PURCHASE_ORDERS.forEach(po => {
    if (!INVOICES.find(i => i.poNumber === po.poNumber)) {
      issues.push({ type: 'Missing Invoice', severity: 'Medium', record: po.poNumber, detail: `PO ${po.poNumber} (${po.description}) has no registered supplier invoice.`, source: 'Purchasing Spreadsheet' });
    }
  });

  // Invoices without POs
  INVOICES.filter(i => !getPO(i.poNumber) && i.poNumber !== 'PO-UNKNOWN').forEach(inv => {
    issues.push({ type: 'Missing PO', severity: 'High', record: inv.id, detail: `Invoice ${inv.id} references PO ${inv.poNumber} which does not exist in Hafiz's purchasing system.`, source: 'Invoice Register' });
  });

  // Invoices without GRNs (non-paid)
  INVOICES.filter(i => i.status !== 'Paid' && !getDelivery(i.poNumber) && i.poNumber !== 'PO-UNKNOWN').forEach(inv => {
    issues.push({ type: 'Missing GRN', severity: 'High', record: inv.id, detail: `Invoice ${inv.id} has no Goods Received Note for PO ${inv.poNumber}. Shop delivery record not yet received.`, source: 'Delivery Records' });
  });

  // Price mismatches
  INVOICES.forEach(inv => {
    const po = getPO(inv.poNumber);
    if (po && Math.abs(po.unitPrice - inv.unitPrice) > 0.01) {
      issues.push({ type: 'Price Variance', severity: 'High', record: inv.id, detail: `Invoice ${inv.id}: billed RM${inv.unitPrice} vs PO agreed RM${po.unitPrice} per unit.`, source: 'Matching Engine' });
    }
  });

  if (!issues.length) {
    return '<div class="alert alert-low"><span class="alert-icon">✅</span><div>No data validation issues found in demonstration dataset.</div></div>';
  }

  const bySev = { High: issues.filter(i=>i.severity==='High'), Medium: issues.filter(i=>i.severity==='Medium') };

  return `
  <div class="kpi-grid" style="grid-template-columns:repeat(4,1fr);margin-bottom:16px">
    <div class="kpi-card kpi-danger"><div class="kpi-label">High Severity</div><div class="kpi-value kpi-red">${bySev.High.length}</div></div>
    <div class="kpi-card kpi-warn"><div class="kpi-label">Medium Severity</div><div class="kpi-value kpi-orange">${bySev.Medium.length}</div></div>
    <div class="kpi-card"><div class="kpi-label">Total Issues</div><div class="kpi-value">${issues.length}</div></div>
    <div class="kpi-card"><div class="kpi-label">Systems Checked</div><div class="kpi-value kpi-green">3</div></div>
  </div>
  <table style="width:100%;font-size:13px"><thead><tr><th>Type</th><th>Severity</th><th>Record</th><th>Detail</th><th>Source</th></tr></thead>
  <tbody>${issues.map(i => `<tr class="${i.severity==='High'?'row-high':'row-medium'}">
    <td><strong>${esc(i.type)}</strong></td>
    <td>${riskBadge(i.severity)}</td>
    <td style="font-weight:600">${esc(i.record)}</td>
    <td style="font-size:12px">${esc(i.detail)}</td>
    <td><span class="badge badge-check" style="font-size:10px">${esc(i.source)}</span></td>
  </tr>`).join('')}</tbody></table>`;
}

// ─────────────────────────────────────────────────────────────
// PAGE: Business Outcome Monitoring
// ─────────────────────────────────────────────────────────────
function renderOutcomePage() {
  // Compute demo values from mock data
  const avgProcessingDemo = (INVOICES.reduce((s,i)=>s+i.processingDays,0)/INVOICES.length).toFixed(1);
  const paidOnTime    = INVOICES.filter(i=>i.status==='Paid'&&!isOverdue(i.dueDate)).length;
  const totalDone     = INVOICES.filter(i=>i.status==='Paid'||i.status==='Approved').length;
  const demoOnTime    = totalDone > 0 ? Math.round(paidOnTime/totalDone*100) : 80;
  const dupAmt        = INVOICES.filter(i=>i.isDuplicate).reduce((s,i)=>s+i.total,0);
  const manualHrsDemo = (INVOICES.filter(i=>i.billType==='typed').length * 2/60 + INVOICES.filter(i=>i.billType!=='typed').length * 6/60).toFixed(0);

  const el = document.getElementById('page-outcomes');
  el.innerHTML = `
  <div class="page-heading">
    <h1>Business Outcome Monitoring</h1>
    <p>Comparing stakeholder baseline figures against business targets. <strong>Targets are not yet achieved — this is a monitoring prototype.</strong></p>
  </div>

  <div class="alert alert-medium" style="margin-bottom:20px">
    <span class="alert-icon">⚠️</span>
    <div>
      <strong>Important:</strong> All "Current Baseline" figures are <strong>stakeholder estimates</strong> from the requirements interview.
      "Demo Values" are computed from the demonstration dataset and do not represent real operational measurements.
      Targets are business goals, not current performance.
    </div>
  </div>

  <!-- KPI Comparison Cards -->
  <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:20px;margin-bottom:24px">
    ${buildOutcomeCard(
      'Invoice Processing Time',
      '📅',
      '12 days', 'Stakeholder estimate',
      avgProcessingDemo + ' days', 'Demo dataset average',
      '4 days', 'Business target',
      parseFloat(avgProcessingDemo) <= 4,
      parseFloat(avgProcessingDemo)/12
    )}
    ${buildOutcomeCard(
      'On-Time Payment Rate',
      '💳',
      '80%', 'Stakeholder estimate',
      demoOnTime + '%', 'Demo dataset rate',
      '95%', 'Business target',
      demoOnTime >= 95,
      demoOnTime/100
    )}
    ${buildOutcomeCard(
      'Quarterly Overpayments',
      '💰',
      'RM 40,000', 'Stakeholder estimate',
      'RM ' + Math.round(dupAmt).toLocaleString(), 'Demo duplicate exposure',
      'RM 8,000', 'Business target (80% reduction)',
      dupAmt <= 8000,
      Math.min(1, dupAmt/40000)
    )}
    ${buildOutcomeCard(
      'Manual Data Entry',
      '⌨️',
      '95 hrs/month', 'Stakeholder estimate',
      manualHrsDemo + ' hrs (demo)', 'Demo dataset estimate',
      'Reduce significantly', 'No formal target set',
      false,
      parseInt(manualHrsDemo)/95
    )}
  </div>

  <!-- Business baseline detail -->
  <div class="card" style="margin-bottom:20px">
    <div class="card-header"><h2>Detailed Baseline Metrics <span class="badge badge-medium">All figures are stakeholder estimates – not formally measured</span></h2></div>
    <div class="card-body">
      <div style="overflow-x:auto"><table style="width:100%;font-size:13px">
        <thead><tr><th>Metric</th><th>Current Baseline</th><th>Source</th><th>Demo Value</th><th>Target</th><th>Gap</th></tr></thead>
        <tbody>
          ${[
            ['Monthly invoice volume','2,500 / month','Stakeholder estimate',INVOICES.length+' (demo set)','—','—'],
            ['Active suppliers','180','Stakeholder estimate',SUPPLIERS.length+' (demo)','—','—'],
            ['Average processing time','12 days','Stakeholder estimate (Aina & Mei Ling recollection)',avgProcessingDemo+' days','4 days','−8 days needed'],
            ['On-time payment rate','80%','Stakeholder estimate','80% (baseline)','95%','+15 percentage points'],
            ['Quarterly overpayments','RM 40,000','Stakeholder estimate','RM '+Math.round(dupAmt).toLocaleString()+' exposure','RM 8,000','−RM 32,000 needed'],
            ['Manual data entry hours','95 hrs/month','Stakeholder estimate (Aina)','~'+manualHrsDemo+' hrs (demo)','Significant reduction','Not formally quantified'],
            ['Handwritten/photo bills','200/month','Stakeholder estimate','3 in demo set','Reduced by AI extraction','OCR simulation only'],
            ['Duplicate bills paid','3–5/month','Stakeholder estimate',INVOICES.filter(i=>i.isDuplicate).length+' flagged (demo)','0','Prevention via AI flag'],
          ].map(([m,c,s,d,t,g]) => `<tr>
            <td style="font-weight:600">${m}</td>
            <td>${c}</td>
            <td style="font-size:11px;color:var(--grey-500)">${s}</td>
            <td><span class="badge badge-check">${d}</span></td>
            <td style="color:var(--green-primary);font-weight:600">${t}</td>
            <td style="font-size:12px;color:var(--orange)">${g}</td>
          </tr>`).join('')}
        </tbody>
      </table></div>
    </div>
  </div>

  <!-- Traceability Matrix -->
  <div class="card">
    <div class="card-header"><h2>Pain-Point Traceability Matrix</h2><span class="badge badge-medium">Links each business problem to solution, module and KPI</span></div>
    <div class="card-body">
      ${buildTraceabilityMatrix()}
    </div>
  </div>`;
}

function buildOutcomeCard(title, icon, baseline, baselineSrc, demoVal, demoSrc, target, targetSrc, achieved, progressRatio) {
  const statusColor = achieved ? 'var(--green-primary)' : 'var(--orange)';
  const pct = Math.min(100, Math.max(0, progressRatio * 100)).toFixed(0);
  return `
  <div class="card" style="margin-bottom:0">
    <div class="card-body">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px">
        <div style="font-size:28px">${icon}</div>
        <div>
          <div style="font-weight:700;font-size:14px">${title}</div>
          <div style="font-size:11px;color:var(--grey-400)">${achieved ? '✅ Target achieved in demo' : '⚠ Target not yet reached'}</div>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-bottom:14px">
        <div style="text-align:center;padding:10px;background:#FFF7ED;border-radius:8px">
          <div style="font-size:11px;color:var(--grey-400)">Current Baseline</div>
          <div style="font-size:16px;font-weight:700;color:var(--orange);margin:4px 0">${baseline}</div>
          <div style="font-size:10px;color:var(--grey-400)">${baselineSrc}</div>
        </div>
        <div style="text-align:center;padding:10px;background:var(--grey-50);border-radius:8px">
          <div style="font-size:11px;color:var(--grey-400)">Demo Value</div>
          <div style="font-size:16px;font-weight:700;color:var(--blue);margin:4px 0">${demoVal}</div>
          <div style="font-size:10px;color:var(--grey-400)">${demoSrc}</div>
        </div>
        <div style="text-align:center;padding:10px;background:var(--green-light);border-radius:8px">
          <div style="font-size:11px;color:var(--grey-400)">Target</div>
          <div style="font-size:16px;font-weight:700;color:var(--green-primary);margin:4px 0">${target}</div>
          <div style="font-size:10px;color:var(--grey-400)">${targetSrc}</div>
        </div>
      </div>
      <div style="font-size:11px;color:var(--grey-500);margin-bottom:4px">Progress toward target</div>
      <div class="progress-bar-wrap"><div class="progress-bar-fill ${achieved?'':'warn'}" style="width:${pct}%"></div></div>
      <div style="font-size:11px;color:var(--grey-400);text-align:right;margin-top:2px">${pct}%</div>
    </div>
  </div>`;
}

function buildTraceabilityMatrix() {
  const rows = [
    {
      pain: 'Supplier bills take too long to process (avg 12 days)',
      module: 'Invoice Aging Tracker',
      nav: 'aging',
      solution: 'Processing-age buckets with automated escalation rules. Invoices >7 days notify Siti.',
      kpi: 'Avg processing time: 12 days → target 4 days',
      acceptance: 'Invoice registered and matched within 4 business days',
      status: 'Monitored',
    },
    {
      pain: 'Aina manually enters ~95 hrs/month of invoice data',
      module: 'Invoice Management (AI Extraction)',
      nav: 'invoice-mgmt',
      solution: 'Simulated AI extraction with per-field confidence scores. Low-confidence fields flagged for Aina review.',
      kpi: 'Manual entry hours: 95/month → significant reduction',
      acceptance: 'Extraction simulation shows field confidence and flags uncertain values',
      status: 'Demonstrated',
    },
    {
      pain: 'Delivery records delayed 3–7 days, blocking matching',
      module: 'Data Integration – Delivery Registration',
      nav: 'integration',
      solution: 'Manual delivery record registration form converts paper forms to system records immediately.',
      kpi: 'Missing GRN count: target zero before approval',
      acceptance: 'GRN registered before invoice proceeds to Thursday approval',
      status: 'Monitored',
    },
    {
      pain: 'Payment mistakes found at month-end (RM 40,000/quarter)',
      module: 'AI Risk & Duplicate Detection + Payment Prevention',
      nav: 'risk',
      solution: 'Rule-based duplicate detection flags matching supplier+amount pairs. Payment eligibility check blocks critical invoices.',
      kpi: 'Quarterly overpayments: RM 40,000 → target RM 8,000 (80% reduction)',
      acceptance: 'Duplicate invoices blocked before Thursday approval; audit record created',
      status: 'Monitored',
    },
    {
      pain: 'Duplicate invoices identified only by memory or inbox search',
      module: 'AI Risk & Duplicate Detection',
      nav: 'risk',
      solution: 'Automatic duplicate matching on supplier code, total amount, and PO reference at registration time.',
      kpi: 'Duplicates paid: 3–5/month → target 0',
      acceptance: 'All duplicate flags visible before Thursday approval',
      status: 'Demonstrated',
    },
    {
      pain: 'Handwritten and phone-photo bills hard to read and check',
      module: 'Invoice Management (AI Extraction)',
      nav: 'invoice-mgmt',
      solution: 'Extraction simulation shows low confidence on handwritten/photo bills and flags fields needing manual verification.',
      kpi: '200 hard-to-read bills/month; 40 requiring clarification → reduction via AI pre-screening',
      acceptance: 'Low-confidence fields highlighted; Mei Ling notified for supplier confirmation',
      status: 'Demonstrated',
    },
  ];

  return `
  <div style="overflow-x:auto"><table style="width:100%;font-size:12px;min-width:900px">
    <thead><tr>
      <th style="min-width:180px">Pain Point</th>
      <th>Module</th>
      <th style="min-width:200px">Solution Approach</th>
      <th>KPI</th>
      <th>Acceptance Criteria</th>
      <th>Status</th>
    </tr></thead>
    <tbody>${rows.map(r => `<tr>
      <td style="font-weight:600;vertical-align:top">${esc(r.pain)}</td>
      <td style="vertical-align:top"><button class="btn btn-info btn-xs" onclick="navigate('${r.nav}')">${esc(r.module)}</button></td>
      <td style="vertical-align:top">${esc(r.solution)}</td>
      <td style="vertical-align:top;color:var(--green-primary);font-weight:600">${esc(r.kpi)}</td>
      <td style="vertical-align:top;font-size:11px;color:var(--grey-500)">${esc(r.acceptance)}</td>
      <td style="vertical-align:top"><span class="badge ${r.status==='Monitored'?'badge-approval':'badge-approved'}">${esc(r.status)}</span></td>
    </tr>`).join('')}
    </tbody>
  </table></div>`;
}

// ─────────────────────────────────────────────────────────────
// ENHANCED APPROVAL PAGE PAYMENT PREVENTION
// Called from the approval page — replaces the approval table row
// ─────────────────────────────────────────────────────────────
function renderApprovalPageEnhanced() {
  const el = document.getElementById('page-approval');
  const list    = INVOICES.filter(i => i.status === 'Pending Approval');
  const total   = list.reduce((s,i) => s + i.total, 0);
  const isSiti  = currentUser.id === 'siti';
  const eligible = list.filter(i => checkPaymentEligibility(i).eligible);
  const blocked  = list.filter(i => !checkPaymentEligibility(i).eligible);

  el.innerHTML = `
  <div class="page-heading"><h1>Thursday Approval</h1><p>Payment Prevention Control active — invoices with unresolved issues are blocked from payment.</p></div>

  ${!isSiti ? '<div class="alert alert-medium"><span class="alert-icon">🔒</span><div>Only <strong>Siti Rahman</strong> can approve. Switch role to Siti to access approval actions.</div></div>' : ''}

  <div class="kpi-grid" style="grid-template-columns:repeat(5,1fr);margin-bottom:20px">
    <div class="kpi-card kpi-info"><div class="kpi-label">Awaiting Approval</div><div class="kpi-value kpi-blue">${list.length}</div></div>
    <div class="kpi-card"><div class="kpi-label">Total Payment</div><div class="kpi-value kpi-green" style="font-size:18px">${fmt(total)}</div></div>
    <div class="kpi-card"><div class="kpi-label">✅ Eligible</div><div class="kpi-value kpi-green">${eligible.length}</div><div class="kpi-sub">${fmt(eligible.reduce((s,i)=>s+i.total,0))}</div></div>
    <div class="kpi-card kpi-danger"><div class="kpi-label">🔒 Blocked</div><div class="kpi-value kpi-red">${blocked.length}</div><div class="kpi-sub">${fmt(blocked.reduce((s,i)=>s+i.total,0))}</div></div>
    <div class="kpi-card"><div class="kpi-label">Suppliers</div><div class="kpi-value">${new Set(list.map(i=>i.supplierCode)).size}</div></div>
  </div>

  ${blocked.length ? `
  <div class="alert alert-critical" style="margin-bottom:20px">
    <span class="alert-icon">🚨</span>
    <div><strong>${blocked.length} invoice${blocked.length>1?'s are':' is'} blocked from payment.</strong>
    These invoices have unresolved issues that must be cleared by Mei Ling or Hafiz before Siti can approve them.
    <button class="btn btn-secondary btn-xs" style="margin-left:10px" onclick="navigate('exceptions')">View Exceptions</button></div>
  </div>` : ''}

  <div class="card">
    <div class="card-header">
      <h2>Payment Eligibility – Invoice List</h2>
      ${isSiti && eligible.length ? `<button class="btn btn-primary btn-sm" onclick="approveAll()">✅ Approve ${eligible.length} Eligible Invoice${eligible.length>1?'s':''}</button>` : ''}
    </div>
    <div class="table-wrap"><table>
      <thead><tr>
        <th>Invoice</th><th>Supplier</th><th>Total</th><th>Due Date</th>
        <th>Match</th><th>Risk</th><th>Eligibility</th><th>Block Reason</th><th>Actions</th>
      </tr></thead>
      <tbody>${list.length ? list.map(inv => {
        const elig  = checkPaymentEligibility(inv);
        const dSoon = isDueSoon(inv.dueDate);
        const rowCls = !elig.eligible && elig.hardBlock ? 'row-critical' : dSoon ? 'row-due' : '';
        const blockHtml = elig.blocks.length
          ? elig.blocks.map(b => `<div style="font-size:11px;color:var(--red);margin-bottom:3px">🔒 [${esc(b.rule)}] ${esc(b.reason)}</div>`).join('')
          : '<span style="font-size:11px;color:var(--green-primary)">No blocks</span>';

        return `<tr class="${rowCls}">
          <td><a href="#" onclick="openInvoiceDetail('${inv.id}');return false" style="color:var(--green-primary);font-weight:600">${esc(inv.id)}</a></td>
          <td style="font-size:12px">${esc(inv.supplierName)}</td>
          <td><strong>${fmt(inv.total)}</strong></td>
          <td>${esc(inv.dueDate)}${dSoon?' 🕐':''}</td>
          <td>${matchBadge(inv.matchStatus)}</td>
          <td>${riskBadge(inv.riskLevel)}</td>
          <td>${eligibilityBadge(inv)}</td>
          <td style="max-width:260px">${blockHtml}</td>
          <td style="white-space:nowrap">
            ${isSiti && elig.eligible ? `<button class="btn btn-primary btn-xs" onclick="approveOne('${inv.id}')">✅ Approve</button> ` : ''}
            ${isSiti ? `<button class="btn btn-warning btn-xs" onclick="holdOne('${inv.id}')">⏸ Hold</button> <button class="btn btn-danger btn-xs" onclick="rejectOne('${inv.id}')">✗ Reject</button>` : ''}
            ${!elig.eligible ? `<button class="btn btn-info btn-xs" onclick="showBlockDetail('${inv.id}')">ℹ Details</button>` : ''}
          </td>
        </tr>`;
      }).join('') : '<tr><td colspan="9"><div class="empty-state"><div class="empty-icon">✅</div><p>No invoices pending approval.</p></div></td></tr>'}</tbody>
    </table></div>
    ${eligible.length ? `<div style="padding:14px 20px;border-top:2px solid var(--green-primary);background:var(--green-light);display:flex;justify-content:space-between;align-items:center;border-radius:0 0 12px 12px"><strong>Eligible Payment Total</strong><strong style="font-size:18px;color:var(--green-dark)">${fmt(eligible.reduce((s,i)=>s+i.total,0))}</strong></div>` : ''}
  </div>`;
}

function showBlockDetail(invId) {
  const inv  = INVOICES.find(i => i.id === invId);
  if (!inv) return;
  const elig = checkPaymentEligibility(inv);
  const body = `
    <div class="alert alert-critical" style="margin-bottom:16px">
      <span class="alert-icon">🔒</span>
      <div><strong>${inv.id}</strong> is blocked from payment. ${elig.blocks.length} issue${elig.blocks.length>1?'s':''} must be resolved.</div>
    </div>
    ${elig.blocks.map(b => `
    <div style="border:1px solid var(--grey-200);border-left:4px solid ${b.severity==='Critical'?'var(--red)':'var(--orange)'};border-radius:0 8px 8px 0;padding:14px;margin-bottom:10px">
      <div style="display:flex;justify-content:space-between;margin-bottom:6px">
        <strong style="font-size:13px">[${esc(b.rule)}]</strong>
        ${riskBadge(b.severity)}
      </div>
      <div style="font-size:13px;margin-bottom:8px">${esc(b.reason)}</div>
      <div style="font-size:12px;color:var(--green-primary);font-weight:600">✅ How to resolve: ${esc(b.resolveWith)}</div>
    </div>`).join('')}`;
  openModal('Payment Block Details – ' + inv.id, body,
    `<button class="btn btn-secondary" onclick="closeModal()">Close</button>
     <button class="btn btn-info btn-sm" onclick="navigate('exceptions');closeModal()">View Exceptions</button>`);
}

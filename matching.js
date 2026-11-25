// =============================================================
// MATCHING, RISK, EXCEPTIONS, APPROVAL, PAYMENTS, SUPPLIERS,
// XAI, REPORTS, AUDIT, USERS, SETTINGS PAGES
// =============================================================

// ── Invoice Matching Page ──────────────────────────────────────
function renderMatchingPage() {
  const el = document.getElementById('page-matching');
  const rows = INVOICES.map(inv => {
    const m = runMatchingCheck(inv);
    return `<tr class="${rowClass(inv)}" style="cursor:pointer" onclick="openInvoiceDetail('${inv.id}')">
      <td><strong>${esc(inv.id)}</strong></td>
      <td>${esc(inv.supplierName)}</td>
      <td>${m.po ? '✅ ' + esc(m.po.poNumber) : '<span style="color:var(--red)">❌ Missing</span>'}</td>
      <td>${m.gr ? '✅ Received: ' + m.gr.qtyReceived : '<span style="color:var(--orange)">⚠ Missing</span>'}</td>
      <td>${inv.qty}</td>
      <td>${m.gr ? (m.gr.qtyReceived < inv.qty ? `<span style="color:var(--red)">-${inv.qty-m.gr.qtyReceived}</span>` : '0') : '—'}</td>
      <td>${matchBadge(m.overallStatus)}</td>
      <td>${m.discrepancies.length ? '<span style="color:var(--red)">'+esc(m.discrepancies[0].slice(0,40))+'…</span>' : '<span style="color:var(--green-primary)">None</span>'}</td>
    </tr>`;
  }).join('');

  el.innerHTML = `
  <div class="page-heading"><h1>Invoice Matching</h1><p>Three-way matching: Supplier Invoice × Purchase Order × Goods Received Note</p></div>
  <div class="card" style="margin-bottom:16px">
    <div class="card-header"><h2>Matching Logic</h2></div>
    <div class="card-body">
      <div class="three-col">
        <div style="text-align:center;padding:14px;background:var(--grey-50);border-radius:8px"><div style="font-size:24px">📄</div><div style="font-weight:700;margin:6px 0">Supplier Invoice</div><div style="font-size:12px;color:var(--grey-500)">Billed quantity, unit price, total amount</div></div>
        <div style="text-align:center;padding:14px;background:var(--green-light);border-radius:8px"><div style="font-size:24px">🔍</div><div style="font-weight:700;margin:6px 0;color:var(--green-dark)">Matching Engine</div><div style="font-size:12px;color:var(--grey-500)">Rule-based comparison simulation</div></div>
        <div style="text-align:center;padding:14px;background:var(--grey-50);border-radius:8px"><div style="font-size:24px">📋</div><div style="font-weight:700;margin:6px 0">PO + GRN</div><div style="font-size:12px;color:var(--grey-500)">Agreed price, ordered qty, received qty</div></div>
      </div>
    </div>
  </div>
  <div class="card">
    <div class="card-header"><h2>Matching Results – All Invoices</h2></div>
    <div class="table-wrap"><table>
      <thead><tr><th>Invoice</th><th>Supplier</th><th>PO Match</th><th>GRN Match</th><th>Billed Qty</th><th>Qty Diff</th><th>Status</th><th>Discrepancy</th></tr></thead>
      <tbody>${rows}</tbody>
    </table></div>
  </div>`;
}

// ── Risk & Duplicates Page ─────────────────────────────────────
function renderRiskPage() {
  const el = document.getElementById('page-risk');
  const dups = INVOICES.filter(i => i.isDuplicate);
  const high = INVOICES.filter(i => i.riskLevel === 'Critical' || i.riskLevel === 'High');

  el.innerHTML = `
  <div class="page-heading"><h1>AI Risk & Duplicate Detection</h1><p>Rule-based risk scoring and duplicate analysis. <span class="badge badge-medium">Not real ML – illustrative rule-based scores</span></p></div>

  <div class="two-col">
    <div class="card">
      <div class="card-header"><h2>⚠️ Potential Duplicate Invoices (${dups.length})</h2></div>
      <div class="card-body">
        ${dups.map(inv => {
          const orig = inv.duplicateOf ? getInvoice(inv.duplicateOf) : null;
          return `<div style="border:1px solid var(--grey-200);border-radius:8px;padding:14px;margin-bottom:12px;border-left:4px solid var(--red)">
            <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:8px">
              <div><strong>${esc(inv.id)}</strong> <span class="badge badge-critical">Potential Duplicate</span></div>
              <button class="btn btn-secondary btn-xs" onclick="openInvoiceDetail('${inv.id}')">View Details</button>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:12px">
              <div><strong>This Invoice</strong><br>${esc(inv.supplierName)}<br>${fmt(inv.total)}<br>${esc(inv.invoiceDate)}</div>
              ${orig ? `<div><strong>Original (${esc(orig.id)})</strong><br>${esc(orig.supplierName)}<br>${fmt(orig.total)}<br>${esc(orig.invoiceDate)}</div>` : '<div><strong>Original</strong><br>—</div>'}
            </div>
            <div style="margin-top:8px;font-size:11px;color:var(--grey-500)">
              ${inv.anomalyFlags.map(f => `<span class="badge badge-high" style="margin-right:4px">${esc(f)}</span>`).join('')}
            </div>
            <div style="margin-top:8px;font-size:12px;background:var(--grey-50);padding:8px;border-radius:6px">
              <strong>Detection method:</strong> Same supplier code (${esc(inv.supplierCode)}), matching total amount (${fmt(inv.total)}), same PO reference.
            </div>
          </div>`;
        }).join('')}
        ${dups.length === 0 ? '<div class="empty-state"><div class="empty-icon">✅</div><p>No duplicate invoices detected.</p></div>' : ''}
      </div>
    </div>

    <div class="card">
      <div class="card-header"><h2>🔴 High / Critical Risk Invoices (${high.length})</h2></div>
      <div class="table-wrap"><table>
        <thead><tr><th>Invoice</th><th>Supplier</th><th>Risk Score</th><th>Level</th><th>Top Factor</th></tr></thead>
        <tbody>${high.map(inv => {
          const r = calculateRiskScore(inv);
          const topFactor = r.factors[0] || { factor: 'None', contribution: 0 };
          return `<tr class="row-${inv.riskLevel.toLowerCase()}" onclick="openInvoiceDetail('${inv.id}')" style="cursor:pointer">
            <td><strong>${esc(inv.id)}</strong></td>
            <td style="font-size:12px">${esc(inv.supplierName)}</td>
            <td><strong style="color:${r.score>=80?'var(--red)':'var(--orange)'}">${r.score}/100</strong></td>
            <td>${riskBadge(r.riskLevel)}</td>
            <td style="font-size:11px">${esc(topFactor.factor)}</td>
          </tr>`;
        }).join('')}</tbody>
      </table></div>
    </div>
  </div>

  <div class="card">
    <div class="card-header"><h2>Risk Score Legend</h2><span class="badge badge-medium">Illustrative rule-based scores, not ML predictions</span></div>
    <div class="card-body">
      <div class="three-col">
        ${[['0–29','Low','No significant risk indicators detected.','badge-low'],['30–59','Medium','Some risk factors present. Review recommended.','badge-medium'],['60–79','High','Multiple risk factors. Hold for Mei Ling review.','badge-high'],['80–100','Critical','Serious risk indicators. Hold immediately.','badge-critical']].map(([range,level,desc,cls])=>`
        <div style="padding:12px;background:var(--grey-50);border-radius:8px;text-align:center">
          <div class="badge ${cls}" style="font-size:13px;padding:4px 12px">${range} – ${level}</div>
          <div style="font-size:12px;color:var(--grey-500);margin-top:8px">${desc}</div>
        </div>`).join('')}
      </div>
    </div>
  </div>`;
}

// ── Exceptions Page ────────────────────────────────────────────
function renderExceptionsPage() {
  const el = document.getElementById('page-exceptions');
  el.innerHTML = `
  <div class="page-heading"><h1>Exception Management</h1><p>Investigate and resolve flagged invoice issues</p></div>
  <div class="card">
    <div class="filter-bar">
      <select class="form-select" id="exc-status-filter" onchange="renderExcTable()">
        <option value="">All Statuses</option>
        <option>Open</option><option>Investigating</option><option>Escalated</option><option>Resolved</option>
      </select>
      <select class="form-select" id="exc-risk-filter" onchange="renderExcTable()">
        <option value="">All Risk Levels</option>
        <option>Critical</option><option>High</option><option>Medium</option><option>Low</option>
      </select>
    </div>
    <div class="table-wrap"><table>
      <thead><tr><th>Exception ID</th><th>Invoice</th><th>Category</th><th>Risk</th><th>Assigned To</th><th>Created</th><th>Status</th><th>AI Recommendation</th><th>Actions</th></tr></thead>
      <tbody id="exc-tbody"></tbody>
    </table></div>
  </div>`;
  renderExcTable();
}

function renderExcTable() {
  const sf = document.getElementById('exc-status-filter')?.value || '';
  const rf = document.getElementById('exc-risk-filter')?.value || '';
  let list = EXCEPTIONS.filter(e => (!sf || e.status === sf) && (!rf || e.riskLevel === rf));
  const tbody = document.getElementById('exc-tbody');
  if (!tbody) return;
  tbody.innerHTML = list.map(exc => `
    <tr class="${exc.riskLevel === 'Critical' ? 'row-critical' : exc.riskLevel === 'High' ? 'row-high' : ''}">
      <td><strong>${esc(exc.id)}</strong></td>
      <td><a href="#" onclick="openInvoiceDetail('${exc.invoiceId}');return false" style="color:var(--green-primary)">${esc(exc.invoiceId)}</a></td>
      <td style="font-size:12px">${esc(exc.category)}</td>
      <td>${riskBadge(exc.riskLevel)}</td>
      <td>${esc(exc.assignedTo)}</td>
      <td style="font-size:12px">${esc(exc.createdDate)}</td>
      <td><span class="badge ${exc.status==='Resolved'?'badge-approved':exc.status==='Escalated'?'badge-overdue':'badge-check'}">${esc(exc.status)}</span></td>
      <td style="font-size:11px;max-width:200px">${esc(exc.aiRec)}</td>
      <td>
        <button class="btn btn-secondary btn-xs" onclick="openExcDetail('${exc.id}')">View</button>
        ${currentUser.id === 'meiLing' && exc.status !== 'Resolved' ? `<button class="btn btn-info btn-xs" onclick="resolveException('${exc.id}')">Resolve</button>` : ''}
      </td>
    </tr>`).join('') || '<tr><td colspan="9"><div class="empty-state"><p>No exceptions match filter.</p></div></td></tr>';
}

function openExcDetail(excId) {
  const exc = EXCEPTIONS.find(e => e.id === excId);
  if (!exc) return;
  const inv = getInvoice(exc.invoiceId);
  const body = `
    <div class="detail-grid">
      <div class="detail-item"><div class="detail-label">Exception ID</div><div class="detail-value">${esc(exc.id)}</div></div>
      <div class="detail-item"><div class="detail-label">Invoice</div><div class="detail-value">${esc(exc.invoiceId)}</div></div>
      <div class="detail-item"><div class="detail-label">Category</div><div class="detail-value">${esc(exc.category)}</div></div>
      <div class="detail-item"><div class="detail-label">Risk Level</div><div class="detail-value">${riskBadge(exc.riskLevel)}</div></div>
      <div class="detail-item"><div class="detail-label">Assigned To</div><div class="detail-value">${esc(exc.assignedTo)}</div></div>
      <div class="detail-item"><div class="detail-label">Status</div><div class="detail-value">${esc(exc.status)}</div></div>
    </div>
    <div class="alert alert-medium"><span class="alert-icon">🤖</span><div><strong>AI Recommendation:</strong> ${esc(exc.aiRec)}</div></div>
    ${inv ? `<div style="background:var(--grey-50);padding:12px;border-radius:8px;font-size:13px;margin-bottom:14px"><strong>Invoice:</strong> ${esc(inv.supplierName)} · ${fmt(inv.total)} · Due: ${esc(inv.dueDate)}</div>` : ''}
    <div class="section-heading">Investigation Notes</div>
    ${exc.notes.map(n => `<div style="background:var(--green-light);padding:10px;border-radius:6px;margin-bottom:6px;font-size:13px">📝 ${esc(n)}</div>`).join('') || '<div style="color:var(--grey-400);font-size:13px">No notes added yet.</div>'}
    ${currentUser.id === 'meiLing' || currentUser.id === 'siti' ? `
    <div style="margin-top:14px">
      <label class="form-label">Add Investigation Note</label>
      <textarea class="form-textarea" id="exc-note-input" placeholder="Enter your findings…"></textarea>
    </div>` : ''}`;
  const footer = `
    <button class="btn btn-secondary" onclick="closeModal()">Close</button>
    ${currentUser.id === 'meiLing' || currentUser.id === 'siti' ? `
      <button class="btn btn-info" onclick="addExcNote('${excId}')">Add Note</button>
      <button class="btn btn-primary" onclick="resolveException('${excId}');closeModal()">✅ Mark Resolved</button>` : ''}`;
  openModal('Exception Details – ' + exc.id, body, footer);
}

function addExcNote(excId) {
  const note = document.getElementById('exc-note-input')?.value.trim();
  if (!note) return;
  const exc = EXCEPTIONS.find(e => e.id === excId);
  if (exc) {
    exc.notes.push(note);
    exc.status = 'Investigating';
    addAudit(currentUser.name, exc.invoiceId, 'Note Added to Exception', note);
    showToast('Note added to ' + excId, 'success');
    openExcDetail(excId);
  }
}

function resolveException(excId) {
  const exc = EXCEPTIONS.find(e => e.id === excId);
  if (exc) {
    exc.status = 'Resolved';
    addAudit(currentUser.name, exc.invoiceId, 'Exception Resolved', 'Exception ' + excId + ' marked resolved by ' + currentUser.name);
    refreshBadges();
    showToast(excId + ' resolved', 'success');
    renderExceptionsPage();
  }
}

// ── Thursday Approval Page ─────────────────────────────────────
function renderApprovalPage() {
  const el = document.getElementById('page-approval');
  const list = INVOICES.filter(i => i.status === 'Pending Approval');
  const total = list.reduce((s,i) => s + i.total, 0);
  const isSiti = currentUser.id === 'siti';

  el.innerHTML = `
  <div class="page-heading"><h1>Thursday Approval</h1><p>Siti Rahman's weekly payment approval list</p></div>
  ${!isSiti ? '<div class="alert alert-medium"><span class="alert-icon">🔒</span><div>Only <strong>Siti Rahman (Finance Manager)</strong> can approve invoices. Switch to Siti to access approval actions.</div></div>' : ''}
  <div class="kpi-grid" style="grid-template-columns:repeat(4,1fr)">
    <div class="kpi-card"><div class="kpi-label">Awaiting Approval</div><div class="kpi-value kpi-blue">${list.length}</div></div>
    <div class="kpi-card"><div class="kpi-label">Total Payment</div><div class="kpi-value kpi-green" style="font-size:20px">${fmt(total)}</div></div>
    <div class="kpi-card"><div class="kpi-label">Suppliers</div><div class="kpi-value">${new Set(list.map(i=>i.supplierCode)).size}</div></div>
    <div class="kpi-card kpi-warn"><div class="kpi-label">With Exceptions</div><div class="kpi-value kpi-orange">${list.filter(i=>i.riskLevel==='High'||i.riskLevel==='Critical').length}</div></div>
  </div>
  <div class="card">
    <div class="card-header">
      <h2>Payment List – ${new Date().toLocaleDateString('en-MY',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}</h2>
      ${isSiti && list.length ? `<button class="btn btn-primary btn-sm" onclick="approveAll()">✅ Approve All Clean Invoices</button>` : ''}
    </div>
    <div class="table-wrap"><table>
      <thead><tr><th>Invoice</th><th>Supplier</th><th>Bill Date</th><th>Due Date</th><th>Total</th><th>Match Status</th><th>Risk</th><th>Flags</th><th>Actions</th></tr></thead>
      <tbody>${list.length ? list.map(inv => {
        const hasExc = EXCEPTIONS.some(e => e.invoiceId === inv.id && e.status !== 'Resolved');
        const blocked = inv.riskLevel === 'Critical' && hasExc;
        return `<tr class="${rowClass(inv)}">
          <td><a href="#" onclick="openInvoiceDetail('${inv.id}');return false" style="color:var(--green-primary);font-weight:600">${esc(inv.id)}</a></td>
          <td>${esc(inv.supplierName)}</td>
          <td>${esc(inv.invoiceDate)}</td>
          <td>${esc(inv.dueDate)}</td>
          <td><strong>${fmt(inv.total)}</strong></td>
          <td>${matchBadge(inv.matchStatus)}</td>
          <td>${riskBadge(inv.riskLevel)}</td>
          <td>${buildFlagIcons(inv)}</td>
          <td style="display:flex;gap:5px;flex-wrap:wrap">
            ${isSiti && !blocked ? `<button class="btn btn-primary btn-xs" onclick="approveOne('${inv.id}')">✅ Approve</button>` : ''}
            ${isSiti ? `<button class="btn btn-warning btn-xs" onclick="holdOne('${inv.id}')">⏸ Hold</button><button class="btn btn-danger btn-xs" onclick="rejectOne('${inv.id}')">✗ Reject</button>` : ''}
            ${blocked ? '<span class="badge badge-critical">🔒 Blocked – unresolved exception</span>' : ''}
          </td>
        </tr>`;
      }).join('') : '<tr><td colspan="9"><div class="empty-state"><div class="empty-icon">✅</div><p>No invoices pending approval.</p></div></td></tr>'}</tbody>
    </table></div>
    ${list.length ? `<div style="padding:14px 20px;border-top:2px solid var(--green-primary);background:var(--green-light);display:flex;justify-content:space-between;align-items:center;border-radius:0 0 12px 12px"><strong>Total Payment Amount</strong><strong style="font-size:18px;color:var(--green-dark)">${fmt(total)}</strong></div>` : ''}
  </div>`;
}

function approveOne(id) {
  if (currentUser.id !== 'siti') { showToast('Only Siti can approve invoices.','warn'); return; }
  advanceInvoiceStatus(id, 'Approved');
  renderApprovalPage();
}
function holdOne(id) {
  if (currentUser.id !== 'siti') return;
  advanceInvoiceStatus(id, 'Pending Check');
  showToast(id + ' held for further review.', 'warn');
  renderApprovalPage();
}
function rejectOne(id) {
  if (currentUser.id !== 'siti') return;
  advanceInvoiceStatus(id, 'Rejected');
  showToast(id + ' rejected.', 'error');
  renderApprovalPage();
}
function approveAll() {
  if (currentUser.id !== 'siti') { showToast('Only Siti can approve invoices.','warn'); return; }
  const clean = INVOICES.filter(i => i.status === 'Pending Approval' && i.riskLevel !== 'Critical');
  clean.forEach(i => { i.status = 'Approved'; addAudit('Siti', i.id, 'Bulk Approved', 'Approved in Thursday batch by Siti.'); });
  refreshBadges();
  showToast(clean.length + ' invoices approved. Ready for LedgerMate export.', 'success');
  renderApprovalPage();
}

// ── Payments Page ──────────────────────────────────────────────
function renderPaymentsPage() {
  const el = document.getElementById('page-payments');
  const paid    = PAYMENTS.filter(p => p.status === 'Paid');
  const pending = PAYMENTS.filter(p => p.status === 'Pending');
  const overdue = PAYMENTS.filter(p => p.status === 'Overdue');

  el.innerHTML = `
  <div class="page-heading"><h1>Payment Management</h1><p>Track and manage supplier payments</p></div>
  <div class="kpi-grid" style="grid-template-columns:repeat(4,1fr)">
    <div class="kpi-card kpi-info"><div class="kpi-label">Pending Payments</div><div class="kpi-value kpi-blue">${pending.length}</div><div class="kpi-sub">${fmt(pending.reduce((s,p)=>s+p.amount,0))}</div></div>
    <div class="kpi-card kpi-danger"><div class="kpi-label">Overdue Payments</div><div class="kpi-value kpi-red">${overdue.length}</div><div class="kpi-sub">${fmt(overdue.reduce((s,p)=>s+p.amount,0))}</div></div>
    <div class="kpi-card"><div class="kpi-label">Paid This Period</div><div class="kpi-value kpi-green">${paid.length}</div><div class="kpi-sub">${fmt(paid.reduce((s,p)=>s+p.amount,0))}</div></div>
    <div class="kpi-card"><div class="kpi-label">Total Batches</div><div class="kpi-value">${new Set(PAYMENTS.filter(p=>p.batchId).map(p=>p.batchId)).size}</div></div>
  </div>
  <div class="card">
    <div class="card-header"><h2>Payment Register</h2>
      <button class="btn btn-primary btn-sm" onclick="simulateExport()">📤 Export Payment File (Simulated)</button>
    </div>
    <div class="table-wrap"><table>
      <thead><tr><th>Payment ID</th><th>Invoice</th><th>Supplier</th><th>Amount</th><th>Due Date</th><th>Payment Date</th><th>Status</th><th>Batch</th></tr></thead>
      <tbody>${PAYMENTS.map(p => `<tr class="${p.status==='Overdue'?'row-high':''}">
        <td style="font-size:12px">${esc(p.id)}</td>
        <td><a href="#" onclick="openInvoiceDetail('${p.invoiceId}');return false" style="color:var(--green-primary)">${esc(p.invoiceId)}</a></td>
        <td style="font-size:12px">${esc(p.supplierName)}</td>
        <td>${fmt(p.amount)}</td>
        <td>${esc(p.dueDate)}${isDueSoon(p.dueDate)&&p.status!=='Paid'?' 🕐':''}</td>
        <td>${p.paymentDate || '—'}</td>
        <td><span class="badge badge-${p.status==='Paid'?'paid':p.status==='Overdue'?'overdue':'check'}">${esc(p.status)}</span></td>
        <td style="font-size:11px">${esc(p.batchId||'—')}</td>
      </tr>`).join('')}</tbody>
    </table></div>
  </div>`;
}
function simulateExport() {
  showToast('Payment file exported (simulation). In production this would generate a LedgerMate-compatible file for bank upload.', 'success');
  addAudit(currentUser.name, 'BATCH', 'Payment Export Simulated', 'Payment batch export simulated by ' + currentUser.name);
}

// ── Suppliers Page ─────────────────────────────────────────────
function renderSuppliersPage() {
  const el = document.getElementById('page-suppliers');
  el.innerHTML = `
  <div class="page-heading"><h1>Supplier Management</h1><p>Directory of ${SUPPLIERS.length} active suppliers</p></div>
  <div class="card">
    <div class="filter-bar">
      <input class="form-input" id="sup-search" placeholder="Search supplier name or code…" oninput="filterSuppliers()">
      <select class="form-select" id="sup-cat" onchange="filterSuppliers()">
        <option value="">All Categories</option>
        ${[...new Set(SUPPLIERS.map(s=>s.category))].map(c=>`<option>${c}</option>`).join('')}
      </select>
    </div>
    <div class="table-wrap"><table>
      <thead><tr><th>Code</th><th>Supplier Name</th><th>Category</th><th>Contact</th><th>Payment Terms</th><th>Total Invoices</th><th>Outstanding</th><th>Rating</th><th>Actions</th></tr></thead>
      <tbody id="sup-tbody"></tbody>
    </table></div>
  </div>`;
  filterSuppliers();
}
function filterSuppliers() {
  const s = (document.getElementById('sup-search')?.value||'').toLowerCase();
  const c = document.getElementById('sup-cat')?.value||'';
  const list = SUPPLIERS.filter(sup => (!s||(sup.name.toLowerCase().includes(s)||sup.code.toLowerCase().includes(s))) && (!c||sup.category===c));
  document.getElementById('sup-tbody').innerHTML = list.map(sup => {
    const invs = INVOICES.filter(i => i.supplierCode === sup.code);
    const outstanding = invs.filter(i => i.status !== 'Paid').reduce((s,i)=>s+i.total,0);
    const stars = '★'.repeat(Math.round(sup.rating)) + '☆'.repeat(5-Math.round(sup.rating));
    return `<tr>
      <td><strong>${esc(sup.code)}</strong></td>
      <td>${esc(sup.name)}</td>
      <td><span class="badge badge-check">${esc(sup.category)}</span></td>
      <td style="font-size:12px">${esc(sup.contact)}<br><span style="color:var(--grey-400)">${esc(sup.phone)}</span></td>
      <td>${sup.paymentTerms} days</td>
      <td>${invs.length}</td>
      <td>${fmt(outstanding)}</td>
      <td style="color:var(--orange)">${stars} <span style="font-size:11px">${sup.rating}</span></td>
      <td><button class="btn btn-secondary btn-xs" onclick="openSupplierDetail('${sup.code}')">View</button></td>
    </tr>`;
  }).join('') || '<tr><td colspan="9"><div class="empty-state"><p>No suppliers found.</p></div></td></tr>';
}
function openSupplierDetail(code) {
  const sup  = getSupplier(code);
  if (!sup) return;
  const invs = INVOICES.filter(i => i.supplierCode === code);
  const body = `
    <div class="detail-grid">
      <div class="detail-item"><div class="detail-label">Supplier Code</div><div class="detail-value">${esc(sup.code)}</div></div>
      <div class="detail-item"><div class="detail-label">Supplier Name</div><div class="detail-value">${esc(sup.name)}</div></div>
      <div class="detail-item"><div class="detail-label">Contact</div><div class="detail-value">${esc(sup.contact)}</div></div>
      <div class="detail-item"><div class="detail-label">Phone</div><div class="detail-value">${esc(sup.phone)}</div></div>
      <div class="detail-item"><div class="detail-label">Email</div><div class="detail-value">${esc(sup.email)}</div></div>
      <div class="detail-item"><div class="detail-label">Payment Terms</div><div class="detail-value">${sup.paymentTerms} days</div></div>
      <div class="detail-item"><div class="detail-label">Category</div><div class="detail-value">${esc(sup.category)}</div></div>
      <div class="detail-item"><div class="detail-label">Rating</div><div class="detail-value">${sup.rating}/5.0</div></div>
    </div>
    <div class="section-heading">Invoices from ${esc(sup.name)}</div>
    <table style="width:100%;font-size:12px"><thead><tr><th>Invoice</th><th>Total</th><th>Status</th><th>Risk</th></tr></thead>
    <tbody>${invs.map(i=>`<tr><td>${esc(i.id)}</td><td>${fmt(i.total)}</td><td>${statusBadge(i.status)}</td><td>${riskBadge(i.riskLevel)}</td></tr>`).join('') || '<tr><td colspan="4" style="text-align:center;color:var(--grey-400)">No invoices</td></tr>'}
    </tbody></table>`;
  openModal('Supplier – ' + sup.name, body);
}

// ── XAI Page ───────────────────────────────────────────────────
function renderXAIPage(params) {
  const el = document.getElementById('page-xai');
  const selectedId = params?.invoiceId || INVOICES.find(i=>i.riskLevel==='Critical')?.id || INVOICES[0]?.id;

  el.innerHTML = `
  <div class="page-heading"><h1>AI Explainability Centre</h1><p>Understand why the rule-based system flagged each invoice. <span class="badge badge-medium">Rule-based explanations, not actual ML</span></p></div>
  <div class="two-col">
    <div>
      <div class="form-group" style="margin-bottom:16px">
        <label class="form-label">Select Invoice to Explain</label>
        <select class="form-select" id="xai-invoice-sel" onchange="renderXAIDetail(this.value)">
          ${INVOICES.map(i=>`<option value="${i.id}" ${i.id===selectedId?'selected':''}>${i.id} – ${i.supplierName} – ${i.riskLevel} Risk</option>`).join('')}
        </select>
      </div>
      <div id="xai-detail"></div>
    </div>
    <div class="card">
      <div class="card-header"><h2>All Risk Scores</h2></div>
      <div class="table-wrap"><table>
        <thead><tr><th>Invoice</th><th>Score</th><th>Level</th></tr></thead>
        <tbody>${INVOICES.map(inv => {
          const r = calculateRiskScore(inv);
          return `<tr style="cursor:pointer" onclick="document.getElementById('xai-invoice-sel').value='${inv.id}';renderXAIDetail('${inv.id}')">
            <td style="font-size:12px">${esc(inv.id)}</td>
            <td><div style="display:flex;align-items:center;gap:6px"><div style="flex:1;height:6px;background:var(--grey-200);border-radius:3px"><div style="height:100%;width:${r.score}%;background:${r.score>=80?'var(--red)':r.score>=60?'var(--orange)':r.score>=30?'var(--blue)':'var(--green-primary)'};border-radius:3px"></div></div><strong style="min-width:28px;font-size:11px">${r.score}</strong></div></td>
            <td>${riskBadge(r.riskLevel)}</td>
          </tr>`;
        }).join('')}</tbody>
      </table></div>
    </div>
  </div>`;
  renderXAIDetail(selectedId);
}

function renderXAIDetail(invId) {
  const inv = getInvoice(invId);
  if (!inv) return;
  const xai = getXAIExplanation(inv);
  const el  = document.getElementById('xai-detail');
  if (!el) return;

  el.innerHTML = `
  <div class="card">
    <div class="card-header">
      <h2>${esc(inv.id)} – XAI Explanation</h2>
      <div style="display:flex;align-items:center;gap:10px">
        <div style="width:50px;height:50px;border-radius:50%;background:${xai.riskScore>=80?'var(--red)':xai.riskScore>=60?'var(--orange)':xai.riskScore>=30?'var(--blue)':'var(--green-primary)'};color:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center">
          <span style="font-size:16px;font-weight:700">${xai.riskScore}</span><span style="font-size:9px">/100</span>
        </div>
        ${riskBadge(xai.riskCategory)}
      </div>
    </div>
    <div class="card-body">
      <div style="background:var(--grey-50);padding:14px;border-radius:8px;margin-bottom:16px;font-size:13px;line-height:1.7"><strong>Decision:</strong> ${esc(xai.decision)}<br><strong>Explanation:</strong> ${esc(xai.explanation.split('\n')[0])}</div>

      ${xai.factors.length ? `
      <div class="section-heading">Contributing Factors</div>
      <div style="margin-bottom:16px">${xai.factors.map(f=>`
        <div class="factor-row">
          <span class="factor-name">${esc(f.factor)}</span>
          <span class="factor-sev ${f.severity}">${f.severity}</span>
          <div style="flex:1;max-width:120px"><div class="conf-bar-bg"><div class="conf-bar-fill ${f.severity==='High'?'conf-low-bar':f.severity==='Medium'?'conf-med-bar':'conf-high'}" style="width:${(f.contribution/40*100).toFixed(0)}%"></div></div></div>
          <span class="factor-contrib">+${f.contribution} pts</span>
        </div>`).join('')}
      </div>` : ''}

      ${xai.rules.length ? `
      <div class="section-heading">Triggered Business Rules</div>
      <div style="margin-bottom:16px">${xai.rules.map(r=>`<div style="font-size:12px;padding:8px 12px;background:var(--grey-50);border-left:3px solid var(--orange);border-radius:0 6px 6px 0;margin-bottom:5px">📋 ${esc(r)}</div>`).join('')}</div>` : ''}

      ${xai.evidence.length ? `
      <div class="section-heading">Supporting Evidence</div>
      <div style="margin-bottom:16px">${xai.evidence.map(ev=>`<div style="font-size:12px;padding:8px 12px;background:var(--grey-50);border-left:3px solid var(--blue);border-radius:0 6px 6px 0;margin-bottom:5px">🔎 ${esc(ev)}</div>`).join('')}</div>` : ''}

      ${xai.duplicateInvoice ? `
      <div class="section-heading">Matching Invoice (Duplicate Evidence)</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px">
        <div style="background:var(--grey-50);padding:12px;border-radius:8px;font-size:12px"><strong>This Invoice</strong><br>${esc(inv.id)}<br>${esc(inv.supplierName)}<br>${fmt(inv.total)}<br>${esc(inv.invoiceDate)}</div>
        <div style="background:#FFF5F5;padding:12px;border-radius:8px;font-size:12px;border:1px solid var(--red)"><strong>Potential Original</strong><br>${esc(xai.duplicateInvoice.id)}<br>${esc(xai.duplicateInvoice.supplierName)}<br>${fmt(xai.duplicateInvoice.total)}<br>${esc(xai.duplicateInvoice.invoiceDate)}</div>
      </div>` : ''}

      <div class="alert alert-${xai.riskScore>=60?'high':'low'}"><span class="alert-icon">${xai.riskScore>=60?'⚠️':'✅'}</span><div><strong>Recommended Action:</strong> ${esc(xai.recommendedAction)}</div></div>
    </div>
  </div>`;
}

// ── Reports Page ───────────────────────────────────────────────
function renderReportsPage() {
  const el = document.getElementById('page-reports');
  const paid = INVOICES.filter(i=>i.status==='Paid').length;
  const totalAmt = INVOICES.reduce((s,i)=>s+i.total,0);
  const avgDays = (INVOICES.reduce((s,i)=>s+i.processingDays,0)/INVOICES.length).toFixed(1);

  el.innerHTML = `
  <div class="page-heading"><h1>Reports & Analytics</h1><p>Finance and operations reporting</p></div>
  <div class="card" style="margin-bottom:16px">
    <div class="card-header"><h2>Report Filters</h2></div>
    <div class="card-body" style="display:flex;gap:12px;flex-wrap:wrap">
      <div class="form-group"><label class="form-label">Date From</label><input type="date" class="form-input" value="2026-11-01"></div>
      <div class="form-group"><label class="form-label">Date To</label><input type="date" class="form-input" value="2026-11-30"></div>
      <div class="form-group" style="justify-content:flex-end"><label class="form-label">&nbsp;</label>
        <button class="btn btn-primary" onclick="showToast('Report refreshed with current demonstration data.','success')">Apply Filters</button>
      </div>
      <div class="form-group" style="justify-content:flex-end"><label class="form-label">&nbsp;</label>
        <button class="btn btn-secondary" onclick="simulateCsvExport()">📥 Export CSV</button>
      </div>
    </div>
  </div>

  <div class="two-col">
    <div class="card"><div class="card-header"><h2>Monthly Invoice Processing</h2><span class="badge badge-medium">Demo Data</span></div>
      <div class="card-body">
        <div class="three-col" style="margin-bottom:12px">
          <div style="text-align:center"><div style="font-size:24px;font-weight:700;color:var(--green-primary)">${INVOICES.length}</div><div style="font-size:11px;color:var(--grey-400)">Total Invoices</div></div>
          <div style="text-align:center"><div style="font-size:24px;font-weight:700;color:var(--green-primary)">${fmt(totalAmt)}</div><div style="font-size:11px;color:var(--grey-400)">Total Value</div></div>
          <div style="text-align:center"><div style="font-size:24px;font-weight:700;color:var(--orange)">${avgDays}d</div><div style="font-size:11px;color:var(--grey-400)">Avg Processing</div></div>
        </div>
        ${buildProcessingChart()}
      </div>
    </div>
    <div class="card"><div class="card-header"><h2>Supplier Payment Performance</h2></div>
      <div class="card-body">
        <table style="width:100%;font-size:12px"><thead><tr><th>Supplier</th><th>Invoices</th><th>Paid</th><th>Exceptions</th></tr></thead>
        <tbody>${SUPPLIERS.slice(0,8).map(s=>{
          const sinvs = INVOICES.filter(i=>i.supplierCode===s.code);
          return `<tr><td>${esc(s.name.split(' ').slice(0,2).join(' '))}</td><td>${sinvs.length}</td><td>${sinvs.filter(i=>i.status==='Paid').length}</td><td>${sinvs.filter(i=>i.status==='Exception').length}</td></tr>`;
        }).join('')}</tbody></table>
      </div>
    </div>
  </div>

  <div class="two-col">
    <div class="card"><div class="card-header"><h2>Duplicate Invoice Detection</h2></div>
      <div class="card-body">
        <div style="display:flex;gap:16px;margin-bottom:12px">
          <div style="text-align:center;flex:1;background:var(--grey-50);padding:14px;border-radius:8px"><div style="font-size:28px;font-weight:700;color:var(--red)">${INVOICES.filter(i=>i.isDuplicate).length}</div><div style="font-size:11px;color:var(--grey-400)">Duplicates Detected</div></div>
          <div style="text-align:center;flex:1;background:var(--grey-50);padding:14px;border-radius:8px"><div style="font-size:28px;font-weight:700;color:var(--orange)">${EXCEPTIONS.filter(e=>e.category==='Potential Duplicate').length}</div><div style="font-size:11px;color:var(--grey-400)">Exceptions Raised</div></div>
          <div style="text-align:center;flex:1;background:var(--grey-50);padding:14px;border-radius:8px"><div style="font-size:28px;font-weight:700;color:var(--green-primary)">${fmt(INVOICES.filter(i=>i.isDuplicate).reduce((s,i)=>s+i.total,0))}</div><div style="font-size:11px;color:var(--grey-400)">Amount at Risk</div></div>
        </div>
        <div class="alert alert-medium"><span class="alert-icon">ℹ️</span><div>Baseline: 3–5 duplicate invoices paid per month. Target: 0 with AI detection.</div></div>
      </div>
    </div>
    <div class="card"><div class="card-header"><h2>Overpayment Analysis</h2><span class="badge badge-medium">Stakeholder Estimates</span></div>
      <div class="card-body">
        ${buildExceptionChart()}
        <div style="margin-top:12px;font-size:12px;color:var(--grey-500)">Quarterly overpayments: <strong>~RM 40,000 (current)</strong> → Target: <strong>RM 8,000</strong></div>
      </div>
    </div>
  </div>`;
}
function simulateCsvExport() {
  const rows = [['Invoice ID','Supplier','Total','Status','Risk','Due Date'],...INVOICES.map(i=>[i.id,i.supplierName,i.total,i.status,i.riskLevel,i.dueDate])];
  const csv = rows.map(r=>r.join(',')).join('\n');
  const a = document.createElement('a');
  a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
  a.download = 'gg-invoices-demo.csv';
  a.click();
  showToast('CSV exported (demonstration data)', 'success');
}

// ── Audit Trail Page ───────────────────────────────────────────
function renderAuditPage() {
  const el = document.getElementById('page-audit');
  el.innerHTML = `
  <div class="page-heading"><h1>Audit Trail</h1><p>${AUDIT_TRAIL.length} activity records (demonstration data)</p></div>
  <div class="card">
    <div class="filter-bar">
      <input class="form-input" id="aud-search" placeholder="Search actor, invoice, action…" oninput="filterAudit()">
    </div>
    <div class="table-wrap"><table>
      <thead><tr><th>Timestamp</th><th>Actor</th><th>Invoice</th><th>Action</th><th>Description</th></tr></thead>
      <tbody id="aud-tbody"></tbody>
    </table></div>
  </div>`;
  filterAudit();
}
function filterAudit() {
  const s = (document.getElementById('aud-search')?.value||'').toLowerCase();
  const list = AUDIT_TRAIL.filter(a => !s||(a.actor.toLowerCase().includes(s)||a.invoiceId.toLowerCase().includes(s)||a.action.toLowerCase().includes(s)));
  document.getElementById('aud-tbody').innerHTML = list.map(a=>`<tr>
    <td style="font-size:11px;white-space:nowrap">${esc(a.timestamp)}</td>
    <td><span class="badge badge-check">${esc(a.actor)}</span></td>
    <td style="font-size:12px">${esc(a.invoiceId)}</td>
    <td style="font-weight:600;font-size:12px">${esc(a.action)}</td>
    <td style="font-size:12px;color:var(--grey-500)">${esc(a.description)}</td>
  </tr>`).join('') || '<tr><td colspan="5"><div class="empty-state"><p>No audit records match.</p></div></td></tr>';
}

// ── Users Page ─────────────────────────────────────────────────
function renderUsersPage() {
  const el = document.getElementById('page-users');
  el.innerHTML = `
  <div class="page-heading"><h1>User Management</h1><p>Manage application users and role-based permissions</p></div>
  <div class="card">
    <div class="card-body">
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:16px">
        ${USERS.map(u=>`<div style="border:1px solid var(--grey-200);border-radius:12px;padding:18px;text-align:center">
          <div class="user-avatar" style="width:50px;height:50px;font-size:20px;margin:0 auto 10px">${u.avatar}</div>
          <div style="font-weight:700;font-size:15px">${esc(u.name)}</div>
          <div style="font-size:12px;color:var(--grey-500);margin:4px 0">${esc(u.role)}</div>
          <div style="font-size:11px;color:var(--grey-400);margin-bottom:10px">${esc(u.dept)}</div>
          <div style="display:flex;flex-wrap:wrap;gap:4px;justify-content:center">
            ${u.permissions.map(p=>`<span class="badge badge-check" style="font-size:10px">${p}</span>`).join('')}
          </div>
        </div>`).join('')}
      </div>
    </div>
  </div>`;
}

// ── Settings Page ──────────────────────────────────────────────
function renderSettingsPage() {
  const el = document.getElementById('page-settings');
  el.innerHTML = `
  <div class="page-heading"><h1>System Settings</h1><p>Application configuration</p></div>
  <div class="alert alert-medium"><span class="alert-icon">ℹ️</span><div>This is a frontend-only prototype. Settings here are for demonstration only and do not persist.</div></div>
  <div class="two-col">
    <div class="card"><div class="card-header"><h2>Business Rules</h2></div><div class="card-body">
      <div class="form-grid">
        <div class="form-group"><label class="form-label">Duplicate Score Threshold</label><input class="form-input" value="40"></div>
        <div class="form-group"><label class="form-label">Price Variance Alert (%)</label><input class="form-input" value="10"></div>
        <div class="form-group"><label class="form-label">Quantity Mismatch Tolerance</label><input class="form-input" value="0"></div>
        <div class="form-group"><label class="form-label">Due-Soon Warning (days)</label><input class="form-input" value="3"></div>
      </div>
      <div class="form-actions"><button class="btn btn-primary" onclick="showToast('Settings saved (simulation)','success')">Save Rules</button></div>
    </div></div>
    <div class="card"><div class="card-header"><h2>Accounting Integration</h2></div><div class="card-body">
      <div class="form-grid">
        <div class="form-group form-full"><label class="form-label">Accounting System</label><input class="form-input" value="LedgerMate"></div>
        <div class="form-group form-full"><label class="form-label">Import Column Mapping</label><textarea class="form-textarea">supplier_code, bill_number, bill_date, po_number, description, quantity, unit_price, tax, total, due_date</textarea></div>
      </div>
      <div class="form-actions"><button class="btn btn-primary" onclick="showToast('Integration settings saved (simulation)','success')">Save</button></div>
    </div></div>
  </div>`;
}

// ── Chatbot Page ───────────────────────────────────────────────
function renderChatbotPage() {
  const el = document.getElementById('page-chatbot');
  el.innerHTML = `
  <div class="page-heading"><h1>AI Finance Assistant</h1><p>Conversational AI for invoice and payment queries. Prototype simulation – not a real LLM.</p></div>
  <div style="max-width:720px;margin:0 auto">
    <div class="card" style="height:calc(100vh - 200px);display:flex;flex-direction:column">
      <div class="chat-header">
        <div class="chat-avatar">🤖</div>
        <div class="chat-title"><strong>Golden Grove AI Assistant</strong><span>Finance Intelligence · Demo Mode</span></div>
      </div>
      <div id="page-chat-messages" style="flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:10px"></div>
      <div style="padding:10px 14px;border-top:1px solid var(--grey-100);display:flex;flex-wrap:wrap;gap:6px" id="page-sug-btns"></div>
      <div style="padding:10px 12px;border-top:1px solid var(--grey-200);display:flex;gap:8px">
        <input class="form-input" id="page-chat-input" placeholder="Ask about invoices, risk, payments…" onkeydown="if(event.key==='Enter')sendPageChat()">
        <button class="btn btn-primary" onclick="sendPageChat()">Send</button>
        <button class="btn btn-secondary btn-sm" onclick="clearPageChat()">Clear</button>
      </div>
      <div style="font-size:10px;color:var(--grey-400);text-align:center;padding:6px">${CHATBOT_LABEL}</div>
    </div>
  </div>`;
  renderPageChatSuggestions();
  if (document.getElementById('page-chat-messages').childElementCount === 0) {
    appendPageMsg('bot', 'Hello! I\'m the Golden Grove AI Finance Assistant. I can help you with invoice queries, risk explanations, duplicate detection results, and payment performance. What would you like to know?');
  }
}

function renderPageChatSuggestions() {
  const c = document.getElementById('page-sug-btns');
  if (!c) return;
  c.innerHTML = SUGGESTED_QUESTIONS.slice(0,4).map(q=>`<button class="sug-btn" onclick="sendPageChatMessage('${q.replace(/'/,"\\'")}')">${q}</button>`).join('');
}

function appendPageMsg(role, text) {
  const c = document.getElementById('page-chat-messages');
  if (!c) return;
  const time = new Date().toLocaleTimeString('en-MY',{hour:'2-digit',minute:'2-digit'});
  const div = document.createElement('div');
  div.className = 'msg ' + role;
  div.innerHTML = `<div class="msg-bubble">${role==='bot' ? text : esc(text)}</div><div class="msg-time">${time}</div>`;
  c.appendChild(div);
  c.scrollTop = c.scrollHeight;
}

function sendPageChat() {
  const input = document.getElementById('page-chat-input');
  const msg = input.value.trim();
  if (!msg) return;
  input.value = '';
  sendPageChatMessage(msg);
}

function sendPageChatMessage(msg) {
  appendPageMsg('user', msg);
  const c = document.getElementById('page-chat-messages');
  const typingDiv = document.createElement('div');
  typingDiv.className = 'msg bot';
  typingDiv.innerHTML = '<div class="msg-bubble"><div class="chat-typing"><div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div></div></div>';
  c.appendChild(typingDiv);
  c.scrollTop = c.scrollHeight;
  setTimeout(() => {
    const resp = chatbotRespond(msg);
    typingDiv.remove();
    const div = document.createElement('div');
    div.className = 'msg bot';
    let actHtml = '';
    if (resp.actions?.length) {
      actHtml = '<div class="msg-actions">' + resp.actions.map(a => {
        if (a.nav) return `<button class="msg-action-btn" onclick="navigate('${a.nav}'${a.invoiceId?`,'${a.invoiceId}'`:''});">${a.label}</button>`;
        if (a.question) return `<button class="msg-action-btn" onclick="sendPageChatMessage('${a.question.replace(/'/,"\\'")}')">${a.label}</button>`;
        return '';
      }).join('') + '</div>';
    }
    div.innerHTML = `<div class="msg-bubble">${resp.text}</div>${actHtml}<div class="msg-time">${new Date().toLocaleTimeString('en-MY',{hour:'2-digit',minute:'2-digit'})}</div>`;
    c.appendChild(div);
    c.scrollTop = c.scrollHeight;
  }, 900);
}

function clearPageChat() {
  const c = document.getElementById('page-chat-messages');
  if (c) { c.innerHTML = ''; appendPageMsg('bot','Conversation cleared. How can I help you?'); }
}

// =============================================================
// INVOICE MANAGEMENT MODULE
// =============================================================

function renderInvoiceMgmt() {
  const el = document.getElementById('page-invoice-mgmt');
  el.innerHTML = `
  <div class="page-heading"><h1>Invoice Management</h1><p>Register new invoices and simulate AI-assisted extraction</p></div>
  <div class="tabs">
    <button class="tab-btn active" onclick="switchTab('upload')">📤 Upload & Extract</button>
    <button class="tab-btn" onclick="switchTab('manual')">✏️ Manual Registration</button>
  </div>
  <div id="tab-upload" class="tab-panel active">${buildUploadTab()}</div>
  <div id="tab-manual" class="tab-panel">${buildManualTab()}</div>`;
}

function switchTab(id) {
  document.querySelectorAll('.tab-btn').forEach((b,i) => {
    const ids = ['upload','manual'];
    b.classList.toggle('active', ids[i] === id);
  });
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
  document.getElementById('tab-' + id).classList.add('active');
}

function buildUploadTab() {
  return `
  <div class="two-col">
    <div class="card">
      <div class="card-header"><h2>Document Upload</h2></div>
      <div class="card-body">
        <div class="upload-zone" id="upload-zone" onclick="document.getElementById('file-input').click()" ondragover="event.preventDefault();this.classList.add('drag-over')" ondragleave="this.classList.remove('drag-over')" ondrop="handleFileDrop(event)">
          <div class="upload-icon">📄</div>
          <div class="upload-text">Drag and drop invoice here</div>
          <div class="upload-sub">or click to browse files</div>
          <div class="upload-sub" style="margin-top:8px">Supports: PDF, JPG, PNG</div>
        </div>
        <input type="file" id="file-input" accept=".pdf,.jpg,.jpeg,.png" style="display:none" onchange="handleFileSelect(this)">
        <div id="file-preview" style="margin-top:14px"></div>

        <div style="margin-top:16px">
          <div class="form-group">
            <label class="form-label">Or select a demonstration example:</label>
            <select class="form-select" id="extract-example-sel" onchange="extractionExample=parseInt(this.value)">
              ${EXTRACTION_EXAMPLES.map((ex,i) => `<option value="${i}">${ex.label}</option>`).join('')}
            </select>
          </div>
          <button class="btn btn-primary" style="margin-top:12px;width:100%" onclick="runExtraction()">🤖 Simulate AI Extraction</button>
        </div>
      </div>
    </div>

    <div class="card" id="extraction-results-card">
      <div class="card-header"><h2>AI Extraction Results</h2><span class="badge badge-medium" id="extract-status">Awaiting extraction</span></div>
      <div class="card-body" id="extraction-body">
        <div class="empty-state"><div class="empty-icon">🤖</div><p>Click "Simulate AI Extraction" to see the AI extraction demonstration.</p></div>
      </div>
    </div>
  </div>`;
}

function buildManualTab() {
  const supplierOptions = SUPPLIERS.map(s => `<option value="${s.code}">${s.name} (${s.code})</option>`).join('');
  const poOptions = PURCHASE_ORDERS.map(p => `<option value="${p.poNumber}">${p.poNumber} – ${p.supplierCode}</option>`).join('');
  return `
  <div class="card">
    <div class="card-header"><h2>Register Invoice Manually</h2></div>
    <div class="card-body">
      <form id="manual-invoice-form" onsubmit="submitManualInvoice(event)">
        <div class="form-grid">
          <div class="form-group">
            <label class="form-label">Supplier *</label>
            <select class="form-select" id="m-supplier" required onchange="prefillFromSupplier(this.value)">
              <option value="">Select supplier…</option>
              ${supplierOptions}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Invoice Number *</label>
            <input class="form-input" id="m-inv-no" placeholder="e.g. INV-2026-2071" required>
          </div>
          <div class="form-group">
            <label class="form-label">Invoice Date *</label>
            <input type="date" class="form-input" id="m-inv-date" required>
          </div>
          <div class="form-group">
            <label class="form-label">PO Number *</label>
            <select class="form-select" id="m-po">
              <option value="">Select PO…</option>
              ${poOptions}
            </select>
          </div>
          <div class="form-group form-full">
            <label class="form-label">Description *</label>
            <input class="form-input" id="m-desc" placeholder="e.g. Fresh tomatoes 200kg" required>
          </div>
          <div class="form-group">
            <label class="form-label">Quantity *</label>
            <input type="number" class="form-input" id="m-qty" placeholder="0" min="0" step="any" required oninput="calcManualTotal()">
          </div>
          <div class="form-group">
            <label class="form-label">Unit Price (RM) *</label>
            <input type="number" class="form-input" id="m-price" placeholder="0.00" min="0" step="0.01" required oninput="calcManualTotal()">
          </div>
          <div class="form-group">
            <label class="form-label">Tax (RM)</label>
            <input type="number" class="form-input" id="m-tax" value="0" min="0" step="0.01" oninput="calcManualTotal()">
          </div>
          <div class="form-group">
            <label class="form-label">Total (RM)</label>
            <input type="number" class="form-input" id="m-total" placeholder="Auto-calculated" step="0.01">
          </div>
          <div class="form-group">
            <label class="form-label">Due Date *</label>
            <input type="date" class="form-input" id="m-due" required>
          </div>
          <div class="form-group">
            <label class="form-label">Bill Type</label>
            <select class="form-select" id="m-billtype">
              <option value="typed">Clean typed bill</option>
              <option value="handwritten">Handwritten</option>
              <option value="photo">Phone photo</option>
            </select>
          </div>
        </div>
        <div class="form-actions">
          <button type="button" class="btn btn-secondary" onclick="document.getElementById('manual-invoice-form').reset()">Clear</button>
          <button type="submit" class="btn btn-primary">✅ Confirm & Register Invoice</button>
        </div>
      </form>
    </div>
  </div>`;
}

function handleFileDrop(e) {
  e.preventDefault();
  document.getElementById('upload-zone').classList.remove('drag-over');
  const file = e.dataTransfer.files[0];
  if (file) showFilePreview(file);
}
function handleFileSelect(input) {
  if (input.files[0]) showFilePreview(input.files[0]);
}
function showFilePreview(file) {
  document.getElementById('file-preview').innerHTML = `
    <div style="display:flex;align-items:center;gap:10px;padding:10px;background:var(--grey-50);border-radius:8px;border:1px solid var(--grey-200)">
      <span style="font-size:24px">${file.type.includes('pdf') ? '📄' : '🖼️'}</span>
      <div><div style="font-weight:600;font-size:13px">${esc(file.name)}</div><div style="font-size:11px;color:var(--grey-400)">${(file.size/1024).toFixed(1)} KB</div></div>
      <span style="margin-left:auto;color:var(--green-primary);font-size:11px">✓ Ready for extraction</span>
    </div>`;
}

function runExtraction() {
  const btn = document.querySelector('[onclick="runExtraction()"]');
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span> Extracting…';
  document.getElementById('extract-status').textContent = 'Processing…';
  document.getElementById('extract-status').className = 'badge badge-check';
  document.getElementById('extraction-body').innerHTML = `
    <div style="text-align:center;padding:32px">
      <div class="spinner" style="width:36px;height:36px;border-width:3px;margin:0 auto 12px"></div>
      <div style="font-size:13px;color:var(--grey-500)">AI Extraction Agent analysing document…</div>
    </div>`;

  setTimeout(() => {
    btn.disabled = false;
    btn.innerHTML = '🤖 Simulate AI Extraction';
    const exIdx = parseInt(document.getElementById('extract-example-sel').value) || 0;
    const example = EXTRACTION_EXAMPLES[exIdx];
    renderExtractionResults(example);
  }, 1800);
}

function renderExtractionResults(example) {
  document.getElementById('extract-status').textContent = 'Extraction Complete';
  document.getElementById('extract-status').className = 'badge badge-approved';

  const fields = example.fields;
  const hasLowConf = Object.values(fields).some(f => f.confidence < 70);

  let rowsHtml = Object.entries(fields).map(([key, f]) => {
    const label = key.replace(/([A-Z])/g,' $1').replace(/^./,s=>s.toUpperCase());
    const confClass = f.confidence >= 90 ? 'conf-high' : f.confidence >= 70 ? 'conf-med-bar' : 'conf-low-bar';
    const inputClass = f.confidence < 70 ? 'conf-low' : f.confidence < 90 ? 'conf-med' : '';
    return `<tr>
      <td style="font-weight:600;white-space:nowrap">${label}</td>
      <td><input class="form-input ${inputClass}" id="ext-${key}" value="${esc(f.value)}" style="padding:5px 8px"></td>
      <td>
        <div class="conf-bar-wrap">
          <div class="conf-bar-bg"><div class="conf-bar-fill ${confClass}" style="width:${f.confidence}%"></div></div>
          <span class="conf-pct" style="color:${f.confidence>=90?'var(--green-primary)':f.confidence>=70?'var(--orange)':'var(--red)'}">${f.confidence}%</span>
        </div>
      </td>
    </tr>`;
  }).join('');

  document.getElementById('extraction-body').innerHTML = `
    <div style="font-size:11px;color:var(--grey-400);margin-bottom:12px">🤖 Prototype AI Simulation – Results based on demonstration data, not real OCR.</div>
    ${hasLowConf ? '<div class="alert alert-high"><span class="alert-icon">⚠️</span><div><strong>Low confidence fields detected.</strong> Fields highlighted in red or yellow require manual verification by Aina.</div></div>' : ''}
    <table style="width:100%">
      <thead><tr><th>Field</th><th>Extracted Value</th><th>Confidence</th></tr></thead>
      <tbody>${rowsHtml}</tbody>
    </table>
    <div style="margin-top:16px;display:flex;gap:10px">
      <button class="btn btn-secondary btn-sm" onclick="runExtraction()">Re-extract</button>
      <button class="btn btn-primary btn-sm" onclick="confirmExtraction('${example.billType}')">✅ Confirm & Register Invoice</button>
    </div>`;
}

function confirmExtraction(billType) {
  const fields = ['supplierName','supplierCode','invoiceNumber','invoiceDate','poNumber','description','quantity','unitPrice','tax','total','dueDate'];
  const vals = {};
  fields.forEach(f => {
    const el = document.getElementById('ext-' + f);
    if (el) vals[f] = el.value;
  });
  registerInvoiceFromExtraction(vals, billType);
}

function registerInvoiceFromExtraction(vals, billType) {
  const sup = SUPPLIERS.find(s => s.code === vals.supplierCode) || SUPPLIERS[0];
  const newId = 'INV-2026-' + (parseInt(INVOICES[INVOICES.length-1].id.split('-')[3] || '2070') + 1);
  const riskResult = { riskLevel: 'Low' };
  const newInv = {
    id: newId,
    supplierCode: vals.supplierCode || sup.code,
    supplierName: vals.supplierName || sup.name,
    poNumber: vals.poNumber || '',
    invoiceDate: vals.invoiceDate || today(),
    dueDate: vals.dueDate || '',
    description: vals.description || '',
    qty: parseFloat(vals.quantity) || 0,
    unitPrice: parseFloat(vals.unitPrice) || 0,
    tax: parseFloat(vals.tax) || 0,
    total: parseFloat(vals.total) || 0,
    billType: billType || 'typed',
    status: 'Pending Check',
    riskLevel: 'Low',
    assignedTo: 'Aina',
    processingDays: 1,
    isDuplicate: false,
    matchStatus: 'Pending',
    anomalyFlags: [],
  };
  INVOICES.push(newInv);
  addAudit('Aina', newId, 'Invoice Registered', `Invoice registered via AI extraction simulation by ${currentUser.name}.`);
  refreshBadges();
  showToast(newId + ' registered successfully!', 'success');
  navigate('invoices');
}

function calcManualTotal() {
  const qty   = parseFloat(document.getElementById('m-qty').value)   || 0;
  const price = parseFloat(document.getElementById('m-price').value) || 0;
  const tax   = parseFloat(document.getElementById('m-tax').value)   || 0;
  document.getElementById('m-total').value = (qty * price + tax).toFixed(2);
}

function prefillFromSupplier(code) {
  // Auto-select matching POs
  const poSel = document.getElementById('m-po');
  Array.from(poSel.options).forEach(opt => {
    if (opt.value.includes(code)) opt.selected = true;
  });
}

function submitManualInvoice(e) {
  e.preventDefault();
  const supplierCode = document.getElementById('m-supplier').value;
  const sup = SUPPLIERS.find(s => s.code === supplierCode) || { name: 'Unknown', code: supplierCode };
  const newId = 'INV-2026-' + (parseInt(INVOICES[INVOICES.length-1].id.split('-')[3] || '2070') + 1);
  const qty   = parseFloat(document.getElementById('m-qty').value) || 0;
  const price = parseFloat(document.getElementById('m-price').value) || 0;
  const tax   = parseFloat(document.getElementById('m-tax').value) || 0;
  const total = parseFloat(document.getElementById('m-total').value) || (qty * price + tax);
  const dup   = INVOICES.find(i => i.supplierCode === supplierCode && Math.abs(i.total - total) < 0.01 && i.status !== 'Paid' && i.status !== 'Rejected');
  const newInv = {
    id: newId,
    supplierCode,
    supplierName: sup.name,
    poNumber: document.getElementById('m-po').value,
    invoiceDate: document.getElementById('m-inv-date').value,
    dueDate: document.getElementById('m-due').value,
    description: document.getElementById('m-desc').value,
    qty, unitPrice: price, tax, total,
    billType: document.getElementById('m-billtype').value,
    status: dup ? 'Exception' : 'Pending Check',
    riskLevel: dup ? 'High' : 'Low',
    assignedTo: dup ? 'Mei Ling' : 'Aina',
    processingDays: 1,
    isDuplicate: !!dup,
    duplicateOf: dup ? dup.id : null,
    matchStatus: dup ? 'Potential Duplicate' : 'Pending',
    anomalyFlags: dup ? ['Duplicate Detected'] : [],
  };
  INVOICES.push(newInv);
  if (dup) {
    EXCEPTIONS.push({ id:'EXC-'+(EXCEPTIONS.length+1).toString().padStart(3,'0'), invoiceId:newId, category:'Potential Duplicate', riskLevel:'High', assignedTo:'Mei Ling', createdDate:today(), status:'Open', aiRec:'Hold invoice. Verify with supplier before payment.', notes:[] });
  }
  addAudit(currentUser.name, newId, 'Invoice Registered', `Manually registered by ${currentUser.name}. ${dup?'Duplicate flag raised.':''}`);
  refreshBadges();
  showToast(newId + ' registered' + (dup ? ' – duplicate flagged!' : ' successfully!'), dup ? 'warn' : 'success');
  navigate('invoices');
}

// ── All Invoices page ──────────────────────────────────────────
function renderInvoicesPage() {
  const el = document.getElementById('page-invoices');
  const supplierOpts = ['', ...new Set(INVOICES.map(i => i.supplierName))].map(s => `<option value="${esc(s)}">${esc(s)||'All Suppliers'}</option>`).join('');
  el.innerHTML = `
  <div class="page-heading"><h1>All Invoices</h1><p>${INVOICES.length} invoices in demonstration dataset</p></div>
  <div class="card">
    <div class="filter-bar">
      <input class="form-input" id="inv-search" placeholder="Search invoice, supplier, PO…" oninput="filterInvoices()">
      <select class="form-select" id="inv-status" onchange="filterInvoices()">
        <option value="">All Statuses</option>
        ${['Pending Check','Pending Approval','Exception','Overdue','Approved','Paid'].map(s=>`<option>${s}</option>`).join('')}
      </select>
      <select class="form-select" id="inv-risk" onchange="filterInvoices()">
        <option value="">All Risk Levels</option>
        ${['Low','Medium','High','Critical'].map(r=>`<option>${r}</option>`).join('')}
      </select>
      <select class="form-select" id="inv-supplier" onchange="filterInvoices()">${supplierOpts}</select>
      <button class="btn btn-primary btn-sm" onclick="navigate('invoice-mgmt')">+ New Invoice</button>
    </div>
    <div class="table-wrap">
      <table>
        <thead><tr>
          <th>Invoice No.</th><th>Supplier</th><th>Invoice Date</th><th>PO No.</th>
          <th>Total</th><th>Due Date</th><th>Status</th><th>Risk</th><th>Assigned</th><th>Actions</th>
        </tr></thead>
        <tbody id="inv-tbody"></tbody>
      </table>
    </div>
    <div id="inv-pagination" style="padding:12px 20px;border-top:1px solid var(--grey-100);display:flex;gap:8px;align-items:center;font-size:12px;color:var(--grey-500)"></div>
  </div>`;
  filterInvoices();
}

let invPage = 1;
const INV_PAGE_SIZE = 10;

function filterInvoices() {
  invPage = 1;
  renderInvoicesTable();
}

function renderInvoicesTable() {
  const search   = (document.getElementById('inv-search')?.value || '').toLowerCase();
  const status   = document.getElementById('inv-status')?.value || '';
  const risk     = document.getElementById('inv-risk')?.value || '';
  const supplier = document.getElementById('inv-supplier')?.value || '';

  let list = INVOICES.filter(inv => {
    if (search && !inv.id.toLowerCase().includes(search) && !inv.supplierName.toLowerCase().includes(search) && !inv.poNumber.toLowerCase().includes(search)) return false;
    if (status && inv.status !== status) return false;
    if (risk && inv.riskLevel !== risk) return false;
    if (supplier && inv.supplierName !== supplier) return false;
    return true;
  });

  const total = list.length;
  const start = (invPage - 1) * INV_PAGE_SIZE;
  const page  = list.slice(start, start + INV_PAGE_SIZE);

  const tbody = document.getElementById('inv-tbody');
  if (!tbody) return;

  if (page.length === 0) {
    tbody.innerHTML = '<tr><td colspan="10"><div class="empty-state"><div class="empty-icon">🔍</div><p>No invoices match your filter.</p></div></td></tr>';
  } else {
    tbody.innerHTML = page.map(inv => `
      <tr class="${rowClass(inv)}">
        <td><a href="#" onclick="openInvoiceDetail('${inv.id}');return false" style="color:var(--green-primary);font-weight:600">${esc(inv.id)}</a></td>
        <td>${esc(inv.supplierName)}</td>
        <td>${esc(inv.invoiceDate)}</td>
        <td style="font-size:12px">${esc(inv.poNumber)}</td>
        <td>${fmt(inv.total)}</td>
        <td>${esc(inv.dueDate)}${isDueSoon(inv.dueDate)&&inv.status!=='Paid'?' 🕐':''}</td>
        <td>${statusBadge(inv.status)}</td>
        <td>${riskBadge(inv.riskLevel)}</td>
        <td style="font-size:12px">${esc(inv.assignedTo)}</td>
        <td>${buildInvActions(inv)}</td>
      </tr>`).join('');
  }

  const pag = document.getElementById('inv-pagination');
  if (pag) {
    const totalPages = Math.ceil(total / INV_PAGE_SIZE);
    pag.innerHTML = `Showing ${start+1}–${Math.min(start+INV_PAGE_SIZE,total)} of ${total} &nbsp;
      <button class="btn btn-secondary btn-xs" ${invPage<=1?'disabled':''} onclick="invPage--;renderInvoicesTable()">‹ Prev</button>
      <span style="padding:0 6px">Page ${invPage} of ${totalPages}</span>
      <button class="btn btn-secondary btn-xs" ${invPage>=totalPages?'disabled':''} onclick="invPage++;renderInvoicesTable()">Next ›</button>`;
  }
}

function buildInvActions(inv) {
  let btns = `<button class="btn btn-secondary btn-xs" onclick="openInvoiceDetail('${inv.id}')">View</button> `;
  if (inv.status === 'Pending Check' && (currentUser.id === 'meiLing' || currentUser.id === 'siti'))
    btns += `<button class="btn btn-info btn-xs" onclick="advanceInvoiceStatus('${inv.id}','Pending Approval')">→ Approve</button> `;
  if (inv.status === 'Pending Approval' && currentUser.id === 'siti')
    btns += `<button class="btn btn-primary btn-xs" onclick="advanceInvoiceStatus('${inv.id}','Approved')">✅</button> `;
  return btns;
}

function openInvoiceDetail(invId) {
  const inv = getInvoice(invId);
  if (!inv) return;
  const xai   = getXAIExplanation(inv);
  const match = runMatchingCheck(inv);
  const excs  = getException(invId);
  const audit = AUDIT_TRAIL.filter(a => a.invoiceId === invId);

  const body = `
    <div class="tabs" style="margin-bottom:16px">
      <button class="tab-btn active" onclick="switchModalTab('detail')">📋 Details</button>
      <button class="tab-btn" onclick="switchModalTab('match')">🔍 Matching</button>
      <button class="tab-btn" onclick="switchModalTab('risk')">⚠️ Risk & XAI</button>
      <button class="tab-btn" onclick="switchModalTab('history')">📋 History</button>
    </div>

    <div id="mtab-detail" class="tab-panel active">
      <div class="detail-grid">
        <div class="detail-item"><div class="detail-label">Invoice Number</div><div class="detail-value">${esc(inv.id)}</div></div>
        <div class="detail-item"><div class="detail-label">Supplier</div><div class="detail-value">${esc(inv.supplierName)} <small>(${esc(inv.supplierCode)})</small></div></div>
        <div class="detail-item"><div class="detail-label">Invoice Date</div><div class="detail-value">${esc(inv.invoiceDate)}</div></div>
        <div class="detail-item"><div class="detail-label">Due Date</div><div class="detail-value">${esc(inv.dueDate)}</div></div>
        <div class="detail-item"><div class="detail-label">PO Number</div><div class="detail-value">${esc(inv.poNumber)}</div></div>
        <div class="detail-item"><div class="detail-label">Description</div><div class="detail-value">${esc(inv.description)}</div></div>
        <div class="detail-item"><div class="detail-label">Quantity</div><div class="detail-value">${inv.qty}</div></div>
        <div class="detail-item"><div class="detail-label">Unit Price</div><div class="detail-value">${fmt(inv.unitPrice)}</div></div>
        <div class="detail-item"><div class="detail-label">Tax</div><div class="detail-value">${fmt(inv.tax)}</div></div>
        <div class="detail-item"><div class="detail-label">Total Amount</div><div class="detail-value" style="font-size:18px;font-weight:700;color:var(--green-primary)">${fmt(inv.total)}</div></div>
        <div class="detail-item"><div class="detail-label">Bill Type</div><div class="detail-value">${esc(inv.billType)}</div></div>
        <div class="detail-item"><div class="detail-label">Assigned To</div><div class="detail-value">${esc(inv.assignedTo)}</div></div>
        <div class="detail-item"><div class="detail-label">Processing Days</div><div class="detail-value">${inv.processingDays} days</div></div>
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        ${statusBadge(inv.status)} ${riskBadge(inv.riskLevel)} ${matchBadge(inv.matchStatus)}
        ${inv.isDuplicate ? '<span class="badge badge-critical">⚠ Potential Duplicate</span>' : ''}
      </div>
      ${excs.length ? `<div class="alert alert-high" style="margin-top:14px"><span class="alert-icon">🚨</span><div>${excs.length} exception(s) raised: ${excs.map(e=>e.category).join(', ')}</div></div>` : ''}
    </div>

    <div id="mtab-match" class="tab-panel">
      <div class="matching-row">
        <div class="matching-col ${match.poMatch==='Matched'?'match':match.poMatch==='Missing PO'?'':'mis'}">
          <h4>Purchase Order</h4>
          ${match.po ? `<div>PO: ${esc(match.po.poNumber)}</div><div>Qty: ${match.po.qty}</div><div>Unit: RM${match.po.unitPrice}</div><div>Total: ${fmt(match.po.total)}</div>` : '<div style="color:var(--red)">No PO found</div>'}
          <div style="margin-top:8px">${match.poMatch === 'Matched' ? '✅ Matched' : '⚠ ' + match.poMatch}</div>
        </div>
        <div class="matching-col">
          <h4>Supplier Invoice</h4>
          <div>Ref: ${esc(inv.id)}</div><div>Qty: ${inv.qty}</div><div>Unit: RM${inv.unitPrice}</div><div>Total: ${fmt(inv.total)}</div>
        </div>
        <div class="matching-col ${match.grMatch==='Matched'?'match':match.grMatch==='Missing GRN'?'':'warn'}">
          <h4>Goods Received Note</h4>
          ${match.gr ? `<div>GRN: ${esc(match.gr.grNumber)}</div><div>Received: ${match.gr.qtyReceived}</div><div>Date: ${esc(match.gr.receivedDate)}</div>` : '<div style="color:var(--orange)">No GRN found</div>'}
          <div style="margin-top:8px">${match.grMatch === 'Matched' ? '✅ Matched' : '⚠ ' + match.grMatch}</div>
        </div>
      </div>
      ${match.discrepancies.length ? `<div class="alert alert-high"><span class="alert-icon">⚠️</span><div><strong>Discrepancies found:</strong><br>${match.discrepancies.join('<br>')}</div></div>` : '<div class="alert alert-low"><span class="alert-icon">✅</span><div>No discrepancies found. Invoice fully matched.</div></div>'}
      <div style="background:var(--grey-50);padding:12px;border-radius:8px;font-size:13px;line-height:1.6"><strong>AI Explanation:</strong><br>${esc(match.explanation)}</div>
    </div>

    <div id="mtab-risk" class="tab-panel">
      <div style="display:flex;align-items:center;gap:16px;margin-bottom:16px">
        <div style="text-align:center;background:${xai.riskScore>=80?'var(--red)':xai.riskScore>=60?'var(--orange)':xai.riskScore>=30?'var(--blue)':'var(--green-primary)'};color:#fff;border-radius:50%;width:70px;height:70px;display:flex;flex-direction:column;align-items:center;justify-content:center;flex-shrink:0">
          <div style="font-size:22px;font-weight:700">${xai.riskScore}</div>
          <div style="font-size:9px;opacity:.85">/ 100</div>
        </div>
        <div>
          <div style="font-size:16px;font-weight:700">${xai.riskCategory} Risk</div>
          <div style="font-size:12px;color:var(--grey-500);margin-top:3px">${xai.recommendedAction}</div>
        </div>
      </div>
      ${xai.factors.length ? `<div style="margin-bottom:14px">${xai.factors.map(f=>`<div class="factor-row"><span class="factor-name">${esc(f.factor)}</span><span class="factor-sev ${f.severity}">${f.severity}</span><span class="factor-contrib">+${f.contribution} pts</span></div>`).join('')}</div>` : ''}
      ${xai.rules.length ? `<div style="margin-bottom:14px"><div class="section-heading">Triggered Rules</div>${xai.rules.map(r=>`<div style="font-size:12px;padding:6px 10px;background:var(--grey-50);border-radius:6px;margin-bottom:5px;border-left:3px solid var(--orange)">📋 ${esc(r)}</div>`).join('')}</div>` : ''}
      ${xai.evidence.length ? `<div><div class="section-heading">Supporting Evidence</div>${xai.evidence.map(ev=>`<div style="font-size:12px;padding:6px 10px;background:var(--grey-50);border-radius:6px;margin-bottom:5px">🔎 ${esc(ev)}</div>`).join('')}</div>` : ''}
      <div style="margin-top:12px;background:var(--green-light);padding:12px;border-radius:8px;font-size:13px;line-height:1.6"><strong>XAI Explanation:</strong><br>${esc(xai.explanation.split('\n')[0])}</div>
    </div>

    <div id="mtab-history" class="tab-panel">
      <div class="timeline">${audit.length ? audit.map(a=>`<div class="timeline-item"><div class="timeline-dot">📋</div><div class="timeline-body"><div class="timeline-action">${esc(a.action)}</div><div class="timeline-meta">${esc(a.actor)} · ${esc(a.timestamp)}</div><div class="timeline-desc">${esc(a.description)}</div></div></div>`).join('') : '<div class="empty-state"><p>No audit records for this invoice.</p></div>'}</div>
    </div>`;

  const footer = `
    <button class="btn btn-secondary" onclick="closeModal()">Close</button>
    ${inv.status === 'Pending Check' && (currentUser.id==='meiLing'||currentUser.id==='siti') ? `<button class="btn btn-info" onclick="advanceInvoiceStatus('${inv.id}','Pending Approval');closeModal()">→ Send to Approval</button>` : ''}
    ${inv.status === 'Pending Approval' && currentUser.id==='siti' ? `<button class="btn btn-primary" onclick="advanceInvoiceStatus('${inv.id}','Approved');closeModal()">✅ Approve</button><button class="btn btn-danger" onclick="advanceInvoiceStatus('${inv.id}','Rejected');closeModal()">✗ Reject</button>` : ''}
    <button class="btn btn-info btn-sm" onclick="navigate('xai',{invoiceId:'${inv.id}'});closeModal()">🔬 Full XAI</button>`;

  openModal(`Invoice Details – ${inv.id}`, body, footer);
}

function switchModalTab(id) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b.textContent.toLowerCase().includes(id.slice(0,3))));
  document.querySelectorAll('[id^="mtab-"]').forEach(p => { p.classList.toggle('active', p.id === 'mtab-' + id); });
}

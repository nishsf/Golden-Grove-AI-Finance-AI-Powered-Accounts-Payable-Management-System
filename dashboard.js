// =============================================================
// DASHBOARD MODULE
// =============================================================

function renderDashboard() {
  // Computed from mock data
  const total     = INVOICES.length;
  const pendChk   = INVOICES.filter(i => i.status === 'Pending Check').length;
  const pendApp   = INVOICES.filter(i => i.status === 'Pending Approval').length;
  const dups      = INVOICES.filter(i => i.isDuplicate).length;
  const overdue   = INVOICES.filter(i => i.status === 'Overdue' || (isOverdue(i.dueDate) && i.status !== 'Paid' && i.status !== 'Approved')).length;
  const dueSoon   = INVOICES.filter(i => isDueSoon(i.dueDate) && i.status !== 'Paid' && i.status !== 'Approved').length;
  const avgDays   = (INVOICES.reduce((s,i) => s+i.processingDays,0)/INVOICES.length).toFixed(1);
  const exceptions= EXCEPTIONS.filter(e => e.status !== 'Resolved').length;

  const el = document.getElementById('page-dashboard');
  el.innerHTML = `
  <div class="page-heading">
    <h1>Executive Dashboard</h1>
    <p>Golden Grove Mart – Invoice Processing Overview &nbsp;<span class="badge badge-medium" style="font-size:10px">⚠ Demonstration Data – Stakeholder Estimates</span></p>
  </div>

  <!-- KPI Cards -->
  <div class="kpi-grid">
    <div class="kpi-card">
      <div class="kpi-label">Total Invoices</div>
      <div class="kpi-value kpi-green">${total}</div>
      <div class="kpi-sub">this month (demo data)</div>
    </div>
    <div class="kpi-card kpi-warn">
      <div class="kpi-label">Pending Verification</div>
      <div class="kpi-value kpi-orange">${pendChk}</div>
      <div class="kpi-sub">awaiting Aina / Mei Ling</div>
    </div>
    <div class="kpi-card kpi-info">
      <div class="kpi-label">Pending Approval</div>
      <div class="kpi-value kpi-blue">${pendApp}</div>
      <div class="kpi-sub">on Siti's Thursday list</div>
    </div>
    <div class="kpi-card kpi-danger">
      <div class="kpi-label">Potential Duplicates</div>
      <div class="kpi-value kpi-red">${dups}</div>
      <div class="kpi-sub">rule-based detection</div>
    </div>
    <div class="kpi-card kpi-danger">
      <div class="kpi-label">Overdue Invoices</div>
      <div class="kpi-value kpi-red">${overdue}</div>
      <div class="kpi-sub">past payment due date</div>
    </div>
    <div class="kpi-card kpi-warn">
      <div class="kpi-label">Due Within 3 Days</div>
      <div class="kpi-value kpi-orange">${dueSoon}</div>
      <div class="kpi-sub">at risk of late payment</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-label">Avg Processing Time</div>
      <div class="kpi-value kpi-orange">${avgDays} <span style="font-size:14px">days</span></div>
      <div class="kpi-target">↓ Target: 4 days</div>
      <div class="progress-bar-wrap"><div class="progress-bar-fill warn" style="width:${Math.min(100,4/avgDays*100)}%"></div></div>
    </div>
    <div class="kpi-card">
      <div class="kpi-label">On-Time Payment Rate</div>
      <div class="kpi-value kpi-orange">80%</div>
      <div class="kpi-target">↑ Target: 95%</div>
      <div class="kpi-sub">stakeholder estimate</div>
      <div class="progress-bar-wrap"><div class="progress-bar-fill warn" style="width:80%"></div></div>
    </div>
    <div class="kpi-card kpi-danger">
      <div class="kpi-label">Quarterly Overpayments</div>
      <div class="kpi-value kpi-red" style="font-size:20px">RM 40K</div>
      <div class="kpi-target">↓ Target: RM 8K</div>
      <div class="kpi-sub">stakeholder estimate</div>
    </div>
  </div>

  <!-- Alerts -->
  <div id="dashboard-alerts">${buildAlerts()}</div>

  <!-- Charts row -->
  <div class="two-col">
    <div class="card">
      <div class="card-header"><h2>Invoice Status Distribution</h2></div>
      <div class="card-body">${buildStatusDonut()}</div>
    </div>
    <div class="card">
      <div class="card-header"><h2>Risk Level Distribution</h2></div>
      <div class="card-body">${buildRiskDonut()}</div>
    </div>
  </div>

  <div class="two-col">
    <div class="card">
      <div class="card-header"><h2>Processing Time vs Target</h2></div>
      <div class="card-body">${buildProcessingChart()}</div>
    </div>
    <div class="card">
      <div class="card-header"><h2>Exception Categories</h2></div>
      <div class="card-body">${buildExceptionChart()}</div>
    </div>
  </div>

  <!-- Business targets -->
  <div class="card">
    <div class="card-header"><h2>Business Targets vs Current Baseline</h2><span class="badge badge-medium">Stakeholder Estimates – Not Yet Achieved</span></div>
    <div class="card-body">
      <div class="three-col">
        ${buildTargetCard('Invoice Processing Time','12 days','4 days','warn')}
        ${buildTargetCard('On-Time Payment Rate','80%','95%','warn')}
        ${buildTargetCard('Quarterly Overpayments','RM 40,000','RM 8,000','danger')}
      </div>
      <p style="font-size:11px;color:var(--grey-400);margin-top:12px">⚠ All figures above are stakeholder estimates from the requirements interview and have not been formally measured.</p>
    </div>
  </div>

  <!-- Recent invoices -->
  <div class="card">
    <div class="card-header">
      <h2>Recent Invoices</h2>
      <button class="btn btn-primary btn-sm" onclick="navigate('invoice-mgmt')">+ Register Invoice</button>
    </div>
    <div class="table-wrap">
      <table>
        <thead><tr><th>Invoice</th><th>Supplier</th><th>Total</th><th>Due Date</th><th>Status</th><th>Risk</th><th>Flags</th></tr></thead>
        <tbody>${INVOICES.slice(0,8).map(inv=>`
          <tr class="${rowClass(inv)}" style="cursor:pointer" onclick="openInvoiceDetail('${inv.id}')">
            <td><strong>${esc(inv.id)}</strong></td>
            <td>${esc(inv.supplierName)}</td>
            <td>${fmt(inv.total)}</td>
            <td>${esc(inv.dueDate)}</td>
            <td>${statusBadge(inv.status)}</td>
            <td>${riskBadge(inv.riskLevel)}</td>
            <td>${buildFlagIcons(inv)}</td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>
  </div>`;
}

function buildAlerts() {
  let html = '';
  const dups    = INVOICES.filter(i => i.isDuplicate && i.status !== 'Paid');
  const overdue = INVOICES.filter(i => i.status === 'Overdue');
  const dueSoon = INVOICES.filter(i => isDueSoon(i.dueDate) && i.status !== 'Paid' && i.status !== 'Approved');
  const exc     = EXCEPTIONS.filter(e => e.status === 'Open' && e.riskLevel === 'Critical');

  if (dups.length)    html += `<div class="alert alert-critical"><span class="alert-icon">⚠️</span><div><strong>${dups.length} potential duplicate invoice${dups.length>1?'s':''}</strong> detected. ${dups.map(i=>`<a href="#" onclick="navigate('risk');return false">${i.id}</a>`).join(', ')} – Assign to Mei Ling for review.</div></div>`;
  if (overdue.length) html += `<div class="alert alert-high"><span class="alert-icon">🕐</span><div><strong>${overdue.length} overdue invoice${overdue.length>1?'s':''}</strong>. ${overdue.map(i=>i.id).join(', ')} – Requires urgent approval.</div></div>`;
  if (dueSoon.length) html += `<div class="alert alert-high"><span class="alert-icon">📅</span><div><strong>${dueSoon.length} invoice${dueSoon.length>1?'s are':' is'} due within 3 days</strong> and not yet approved. Risk of late payment.</div></div>`;
  if (exc.length)     html += `<div class="alert alert-critical"><span class="alert-icon">🚨</span><div><strong>${exc.length} critical exception${exc.length>1?'s':''} unresolved</strong>. <a href="#" onclick="navigate('exceptions');return false">View exceptions</a>.</div></div>`;
  return html;
}

function buildFlagIcons(inv) {
  let f = '';
  if (inv.isDuplicate) f += '<span title="Potential Duplicate" style="margin-right:3px">⚠️</span>';
  if (isDueSoon(inv.dueDate) && inv.status !== 'Paid') f += '<span title="Due Soon">🕐</span>';
  if (inv.billType === 'handwritten' || inv.billType === 'photo') f += '<span title="Handwritten/Photo">📷</span>';
  return f || '—';
}

function buildTargetCard(label, current, target, type) {
  return `<div class="kpi-card kpi-${type}">
    <div class="kpi-label">${label}</div>
    <div style="display:flex;align-items:baseline;gap:12px;margin-top:4px">
      <div><div style="font-size:10px;color:var(--grey-400)">Current</div><div class="kpi-value kpi-${type==='danger'?'red':'orange'}" style="font-size:20px">${current}</div></div>
      <div style="font-size:18px;color:var(--grey-300)">→</div>
      <div><div style="font-size:10px;color:var(--grey-400)">Target</div><div class="kpi-value kpi-green" style="font-size:20px">${target}</div></div>
    </div>
  </div>`;
}

function buildStatusDonut() {
  const statuses = ['Pending Check','Pending Approval','Exception','Overdue','Paid','Approved'];
  const colors   = ['#3478C5','#8B5CF6','#E58A16','#D62828','#176B45','#059669'];
  const counts   = statuses.map(s => INVOICES.filter(i => i.status === s).length);
  const total    = counts.reduce((a,b)=>a+b,0);
  let legendHtml = statuses.map((s,i) => `<div class="legend-item"><div class="legend-dot" style="background:${colors[i]}"></div><span>${s}: <strong>${counts[i]}</strong></span></div>`).join('');
  // Simple CSS donut via conic-gradient
  let pct = 0;
  let grad = counts.map((c,i) => {
    const start = pct; pct += c/total*100;
    return `${colors[i]} ${start.toFixed(1)}% ${pct.toFixed(1)}%`;
  }).join(',');
  return `<div class="donut-wrap">
    <div style="width:120px;height:120px;border-radius:50%;background:conic-gradient(${grad});flex-shrink:0;position:relative">
      <div style="position:absolute;inset:25%;border-radius:50%;background:#fff;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:700;color:var(--text-dark)">${total}</div>
    </div>
    <div class="donut-legend">${legendHtml}</div>
  </div>`;
}

function buildRiskDonut() {
  const levels  = ['Low','Medium','High','Critical'];
  const colors  = ['#176B45','#E58A16','#D62828','#7F1D1D'];
  const counts  = levels.map(l => INVOICES.filter(i => i.riskLevel === l).length);
  const total   = counts.reduce((a,b)=>a+b,0);
  let pct = 0;
  let grad = counts.map((c,i) => {
    const start = pct; pct += c/total*100;
    return `${colors[i]} ${start.toFixed(1)}% ${pct.toFixed(1)}%`;
  }).join(',');
  let legendHtml = levels.map((l,i) => `<div class="legend-item"><div class="legend-dot" style="background:${colors[i]}"></div><span>${l}: <strong>${counts[i]}</strong></span></div>`).join('');
  return `<div class="donut-wrap">
    <div style="width:120px;height:120px;border-radius:50%;background:conic-gradient(${grad});flex-shrink:0;position:relative">
      <div style="position:absolute;inset:25%;border-radius:50%;background:#fff;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:700;color:var(--text-dark)">${total}</div>
    </div>
    <div class="donut-legend">${legendHtml}</div>
  </div>`;
}

function buildProcessingChart() {
  // Show processing days for last 8 invoices vs 4-day target
  const items = INVOICES.slice(0,8);
  const maxD  = Math.max(...items.map(i=>i.processingDays), 12);
  const bars  = items.map(i => {
    const h = (i.processingDays / maxD * 160).toFixed(0);
    const color = i.processingDays <= 4 ? 'var(--green-primary)' : i.processingDays <= 8 ? 'var(--orange)' : 'var(--red)';
    return `<div class="bar-col">
      <div class="bar-val">${i.processingDays}d</div>
      <div class="bar-fill" style="height:${h}px;background:${color}"></div>
      <div class="bar-label">${i.id.slice(-4)}</div>
    </div>`;
  }).join('');
  const targetH = (4 / maxD * 160).toFixed(0);
  return `<div style="position:relative">
    <div class="chart-container">${bars}</div>
    <div style="position:absolute;bottom:${parseInt(targetH)+30}px;left:10px;right:10px;border-top:2px dashed var(--green-primary);"></div>
    <div style="position:absolute;bottom:${parseInt(targetH)+32}px;right:14px;font-size:10px;color:var(--green-primary);font-weight:700">4-day target</div>
  </div>`;
}

function buildExceptionChart() {
  const cats   = ['Duplicate','Qty Mismatch','Price Mismatch','Missing PO','Missing GRN','Unreadable','Overdue'];
  const counts = [
    EXCEPTIONS.filter(e=>e.category==='Potential Duplicate').length,
    EXCEPTIONS.filter(e=>e.category==='Quantity Mismatch').length,
    EXCEPTIONS.filter(e=>e.category==='Price Mismatch').length,
    EXCEPTIONS.filter(e=>e.category==='Missing PO').length,
    EXCEPTIONS.filter(e=>e.category==='Missing Delivery Record').length,
    EXCEPTIONS.filter(e=>e.category==='Unreadable Invoice').length,
    EXCEPTIONS.filter(e=>e.category==='Payment Overdue').length,
  ];
  const maxC = Math.max(...counts, 1);
  const colors = ['#D62828','#E58A16','#3478C5','#8B5CF6','#059669','#EC4899','#F59E0B'];
  const bars = cats.map((c,i) => {
    const h = (counts[i] / maxC * 140).toFixed(0);
    return `<div class="bar-col">
      <div class="bar-val">${counts[i]}</div>
      <div class="bar-fill" style="height:${h}px;background:${colors[i]}"></div>
      <div class="bar-label">${c}</div>
    </div>`;
  }).join('');
  return `<div class="chart-container">${bars}</div>`;
}

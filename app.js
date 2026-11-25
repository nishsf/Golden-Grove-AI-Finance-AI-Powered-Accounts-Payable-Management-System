// =============================================================
// GOLDEN GROVE AI FINANCE – MAIN APPLICATION
// Frontend-only prototype. All data is demonstration data.
// =============================================================

// ── State ─────────────────────────────────────────────────────
let currentUser = USERS[0]; // Aina by default
let currentPage = 'dashboard';
let chatOpen = false;
let chatHistory = [];
let extractionExample = 0;

// ── Boot ──────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  renderSidebar();
  bindRoleSwitcher();
  initChat();
  navigate('dashboard');
  refreshBadges();
});

// ── Sidebar ───────────────────────────────────────────────────
const NAV_ITEMS = [
  { id:'dashboard',   label:'Executive Dashboard',      icon:'📊', section:'MAIN MENU' },
  { id:'invoice-mgmt',label:'Invoice Management',       icon:'📤', badge:'invoices-new' },
  { id:'invoices',    label:'All Invoices',             icon:'📄', badge:'invoices-count' },
  { id:'matching',    label:'Invoice Matching',         icon:'🔍' },
  { id:'risk',        label:'AI Risk & Duplicates',     icon:'⚠️', badge:'risk-count' },
  { id:'exceptions',  label:'Exception Management',     icon:'🚨', badge:'exc-count' },
  { id:'aging',       label:'Invoice Aging Tracker',    icon:'🕐', badge:'aging-count' },
  { id:'approval',    label:'Thursday Approval',        icon:'✅', badge:'approval-count' },
  { id:'payments',    label:'Payment Management',       icon:'💳' },
  { id:'suppliers',   label:'Supplier Management',      icon:'🏢' },
  { id:'integration', label:'Data Integration',         icon:'🔗' },
  { id:'chatbot',     label:'AI Finance Assistant',     icon:'🤖' },
  { id:'xai',         label:'AI Explainability Centre', icon:'🔬' },
  { id:'outcomes',    label:'Business Outcomes',        icon:'📈', badge:'outcomes-flag' },
  { id:'reports',     label:'Reports & Analytics',      icon:'📊' },
  { id:'audit',       label:'Audit Trail',              icon:'📋', section:null },
  { id:'users',       label:'User Management',          icon:'👥', section:'ADMINISTRATION' },
  { id:'settings',    label:'System Settings',          icon:'⚙️' },
];

function renderSidebar() {
  const nav = document.getElementById('sidebar-nav');
  let html = '';
  let lastSection = null;
  NAV_ITEMS.forEach(item => {
    if (item.section && item.section !== lastSection) {
      html += `<div class="sidebar-section-label">${item.section}</div>`;
      lastSection = item.section;
    }
    html += `<div class="nav-item" id="nav-${item.id}" onclick="navigate('${item.id}')">
      <span class="nav-icon">${item.icon}</span>
      <span class="nav-label">${item.label}</span>
      ${item.badge ? `<span class="nav-badge" id="badge-${item.badge}" style="display:none">0</span>` : ''}
    </div>`;
  });
  nav.innerHTML = html;
}

function navigate(pageId, params) {
  currentPage = pageId;
  document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
  const navEl = document.getElementById('nav-' + pageId);
  if (navEl) navEl.classList.add('active');

  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const pageEl = document.getElementById('page-' + pageId);
  if (pageEl) {
    pageEl.classList.add('active');
  }

  const titles = {
    dashboard:     ['Executive Dashboard','Finance overview and KPI performance'],
    'invoice-mgmt':['Invoice Management','Register and process supplier invoices'],
    invoices:      ['All Invoices','Complete invoice register'],
    matching:      ['Invoice Matching','Three-way matching: Invoice × PO × GRN'],
    risk:          ['AI Risk & Duplicate Detection','Rule-based risk scoring and duplicate analysis'],
    exceptions:    ['Exception Management','Investigate and resolve invoice exceptions'],
    aging:         ['Invoice Aging Tracker','Processing age, escalation rules and delay reasons'],
    approval:      ['Thursday Approval','Weekly payment approval with payment prevention controls'],
    payments:      ['Payment Management','Track and manage supplier payments'],
    suppliers:     ['Supplier Management','Supplier directory and performance'],
    integration:   ['Data Integration','LedgerMate · Purchasing CSV · Manual delivery registration'],
    chatbot:       ['AI Finance Assistant','Conversational AI for invoice and payment queries'],
    xai:           ['AI Explainability Centre','Understand why invoices were flagged'],
    outcomes:      ['Business Outcome Monitoring','Baseline vs target vs demo — traceability matrix'],
    reports:       ['Reports & Analytics','Finance and operations reporting'],
    audit:         ['Audit Trail','Full system activity log'],
    users:         ['User Management','Manage user accounts and roles'],
    settings:      ['System Settings','Application configuration'],
  };
  const t = titles[pageId] || [pageId, ''];
  document.getElementById('topbar-title').textContent = t[0];

  // Render page content
  const renderer = {
    dashboard:     renderDashboard,
    'invoice-mgmt': renderInvoiceMgmt,
    invoices:      renderInvoicesPage,
    matching:      renderMatchingPage,
    risk:          renderRiskPage,
    exceptions:    renderExceptionsPage,
    aging:         renderAgingPage,
    approval:      renderApprovalPageEnhanced,
    payments:      renderPaymentsPage,
    suppliers:     renderSuppliersPage,
    integration:   renderIntegrationPage,
    chatbot:       renderChatbotPage,
    xai:           renderXAIPage,
    outcomes:      renderOutcomePage,
    reports:       renderReportsPage,
    audit:         renderAuditPage,
    users:         renderUsersPage,
    settings:      renderSettingsPage,
  };
  if (renderer[pageId]) renderer[pageId](params);
}

// ── Role Switcher ─────────────────────────────────────────────
function bindRoleSwitcher() {
  document.querySelectorAll('.role-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const userId = btn.dataset.user;
      currentUser = USERS.find(u => u.id === userId);
      document.querySelectorAll('.role-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById('topbar-user-name').textContent = currentUser.name;
      document.getElementById('topbar-user-role').textContent = currentUser.role;
      document.getElementById('topbar-avatar').textContent   = currentUser.avatar;
      document.getElementById('sidebar-user-info').textContent = currentUser.name + ' · ' + currentUser.role;
      navigate(currentPage);
      showToast(`Switched to ${currentUser.name} (${currentUser.role})`, 'success');
    });
  });
}

function hasPermission(perm) {
  return currentUser.permissions.includes(perm) || currentUser.permissions.includes('view');
}

// ── Badge refresh ─────────────────────────────────────────────
function refreshBadges() {
  const setBadge = (id, val) => {
    const el = document.getElementById('badge-' + id);
    if (!el) return;
    el.textContent = val;
    el.style.display = val > 0 ? '' : 'none';
  };
  setBadge('invoices-count', INVOICES.length);
  setBadge('risk-count', INVOICES.filter(i => i.isDuplicate).length);
  setBadge('exc-count', EXCEPTIONS.filter(e => e.status !== 'Resolved').length);
  setBadge('approval-count', INVOICES.filter(i => i.status === 'Pending Approval').length);
  // Aging: invoices overdue on processing (>= 5 days, not paid/approved)
  const agingAlert = INVOICES.filter(i =>
    i.processingDays >= 5 &&
    i.status !== 'Paid' && i.status !== 'Approved' && i.status !== 'Rejected'
  ).length;
  setBadge('aging-count', agingAlert);
  // Outcomes flag: targets not yet achieved
  setBadge('outcomes-flag', 1);
}

// ── Helpers ───────────────────────────────────────────────────
function esc(s) {
  if (s == null) return '';
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function fmt(n)  { return 'RM ' + Number(n).toLocaleString('en-MY', {minimumFractionDigits:2,maximumFractionDigits:2}); }
function today() { return new Date().toISOString().slice(0,10); }
function daysUntil(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr); d.setHours(0,0,0,0);
  const t = new Date(); t.setHours(0,0,0,0);
  return Math.round((d - t) / 86400000);
}
function isDueSoon(dateStr) { const d = daysUntil(dateStr); return d !== null && d >= 0 && d <= 3; }
function isOverdue(dateStr) { const d = daysUntil(dateStr); return d !== null && d < 0; }

function statusBadge(status) {
  const map = {
    'Pending Check':    'check',
    'Pending Approval': 'approval',
    'Approved':         'approved',
    'Paid':             'paid',
    'Overdue':          'overdue',
    'Exception':        'exception',
    'Rejected':         'overdue',
  };
  return `<span class="badge badge-${map[status]||'check'}">${esc(status)}</span>`;
}
function riskBadge(level) {
  return `<span class="badge badge-${(level||'low').toLowerCase()}">${esc(level||'Low')}</span>`;
}
function matchBadge(status) {
  const map = { 'Fully Matched':'matched','Partially Matched':'partial','Quantity Mismatch':'mismatch','Price Mismatch':'mismatch','Missing PO':'missing','Missing Delivery Record':'missing','Potential Duplicate':'mismatch','Manual Review Required':'partial' };
  return `<span class="badge badge-${map[status]||'partial'}">${esc(status)}</span>`;
}
function rowClass(inv) {
  if (inv.riskLevel === 'Critical') return 'row-critical';
  if (inv.riskLevel === 'High')     return 'row-high';
  if (isDueSoon(inv.dueDate) && inv.status !== 'Paid') return 'row-due';
  return '';
}

// ── Toast ─────────────────────────────────────────────────────
function showToast(msg, type='') {
  const c = document.getElementById('toast-container');
  const t = document.createElement('div');
  t.className = 'toast ' + type;
  t.textContent = msg;
  c.appendChild(t);
  setTimeout(() => t.remove(), 3200);
}

// ── Modal ─────────────────────────────────────────────────────
function openModal(title, bodyHtml, footerHtml) {
  document.getElementById('modal-title').textContent = title;
  document.getElementById('modal-body').innerHTML = bodyHtml;
  document.getElementById('modal-footer').innerHTML = footerHtml || '<button class="btn btn-secondary" onclick="closeModal()">Close</button>';
  document.getElementById('modal-backdrop').classList.remove('hidden');
}
function closeModal() { document.getElementById('modal-backdrop').classList.add('hidden'); }

// ── Status transition ──────────────────────────────────────────
function advanceInvoiceStatus(id, newStatus) {
  const inv = INVOICES.find(i => i.id === id);
  if (!inv) return;
  const old = inv.status;
  inv.status = newStatus;
  addAudit(currentUser.name, id, `Status: ${old} → ${newStatus}`, `Status changed by ${currentUser.name}.`);
  refreshBadges();
  showToast(`${id} → ${newStatus}`, 'success');
  navigate(currentPage);
}

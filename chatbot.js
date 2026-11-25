// =============================================================
// AI FINANCE CHATBOT
// Keyword/pattern-based intent recognition over mock data.
// No external LLM or API is used.
// =============================================================

const CHATBOT_LABEL = 'Prototype AI Simulation – Responses generated from demonstration data.';

const SUGGESTED_QUESTIONS = [
  'How many invoices are pending?',
  'Are there any potential duplicates?',
  'Why was INV-2026-2058 flagged?',
  'What is the current on-time payment rate?',
  'Which invoices need Mei Ling\'s attention?',
  'Which invoices are overdue on processing?',
  'Which invoices are blocked from payment?',
  'What is the average processing time?',
  'Are we achieving the 4-day target?',
  'What is the status of data integration?',
];

function chatbotRespond(userMessage) {
  const msg = userMessage.toLowerCase().trim();

  // ── Invoice status enquiries ──────────────────────────────
  if (match(msg, ['how many', 'pending'])) {
    const pc = INVOICES.filter(i => i.status === 'Pending Check').length;
    const pa = INVOICES.filter(i => i.status === 'Pending Approval').length;
    return mkResp(
      `There are currently <strong>${pc} invoices pending verification</strong> (Aina/Mei Ling) and <strong>${pa} invoices pending approval</strong> (Siti's Thursday list).`,
      [{ label: 'View All Invoices', nav: 'invoices' }, { label: 'View Approval List', nav: 'approval' }]
    );
  }

  if (match(msg, ['pending approval', 'thursday', 'siti'])) {
    const list = INVOICES.filter(i => i.status === 'Pending Approval');
    const total = list.reduce((s,i) => s+i.total, 0);
    return mkResp(
      `Siti's Thursday payment list has <strong>${list.length} invoices</strong> totalling <strong>RM ${total.toFixed(2)}</strong>:\n\n` +
      list.map(i => `• ${i.id} – ${i.supplierName} – RM ${i.total.toFixed(2)}`).join('\n'),
      [{ label: 'Open Thursday Approval', nav: 'approval' }]
    );
  }

  // ── Specific invoice lookup ───────────────────────────────
  const invIdMatch = userMessage.match(/INV-\d{4}-\d{4}/i);
  if (invIdMatch) {
    const invId = invIdMatch[0].toUpperCase();
    const inv = getInvoice(invId);
    if (!inv) return mkResp(`I couldn't find invoice <strong>${invId}</strong> in the demonstration dataset. Please check the invoice number.`);
    const xai = getXAIExplanation(inv);
    return mkResp(
      `<strong>${invId}</strong> – ${inv.supplierName}<br>` +
      `Status: <strong>${inv.status}</strong> | Risk: <strong>${xai.riskCategory}</strong> (${xai.riskScore}/100)<br>` +
      `Total: RM ${inv.total.toFixed(2)} | Due: ${inv.dueDate}<br><br>` +
      `<strong>AI Assessment:</strong> ${xai.explanation.split('\n')[0]}<br><br>` +
      (xai.factors.length ? `<strong>Risk factors:</strong><br>` + xai.factors.map(f => `• ${f.factor}: ${f.severity}`).join('<br>') : '') +
      `<br><br><em>Recommended: ${xai.recommendedAction}</em>`,
      [
        { label: 'View Risk Breakdown', nav: 'xai', invoiceId: invId },
        { label: 'Open Invoice Details', nav: 'invoices', invoiceId: invId },
      ]
    );
  }

  // ── Why was X flagged ─────────────────────────────────────
  if (match(msg, ['why', 'flagged']) || match(msg, ['explain', 'risk'])) {
    return mkResp(
      `To explain why a specific invoice was flagged, please include the invoice number in your question. For example:\n\n<em>"Why was INV-2026-2058 flagged?"</em>\n\nThe AI Explainability Centre also shows full risk breakdowns for every invoice.`,
      [{ label: 'Open XAI Centre', nav: 'xai' }]
    );
  }

  // ── Duplicates ────────────────────────────────────────────
  if (match(msg, ['duplicate', 'duplicates'])) {
    const dups = INVOICES.filter(i => i.isDuplicate);
    return mkResp(
      `The rule-based Risk Detection Agent has identified <strong>${dups.length} potential duplicate invoices</strong>:\n\n` +
      dups.map(i => `• <strong>${i.id}</strong> – ${i.supplierName} – RM ${i.total.toFixed(2)} (possible duplicate of ${i.duplicateOf || 'unknown'})`).join('\n') +
      `\n\nDuplicates are detected by matching supplier code, total amount, and PO reference.`,
      [{ label: 'View Duplicate Detection', nav: 'risk' }, { label: 'View Exceptions', nav: 'exceptions' }]
    );
  }

  // ── Supplier search ───────────────────────────────────────
  const supplierMatch = SUPPLIERS.find(s => msg.includes(s.name.toLowerCase()) || msg.includes(s.code.toLowerCase()));
  if (supplierMatch || match(msg, ['supplier', 'invoices from', 'bills from'])) {
    const sup = supplierMatch || null;
    if (sup) {
      const list = INVOICES.filter(i => i.supplierCode === sup.code);
      return mkResp(
        `Found <strong>${list.length} invoices</strong> from <strong>${sup.name}</strong>:\n\n` +
        list.map(i => `• ${i.id} – RM ${i.total.toFixed(2)} – ${i.status}`).join('\n'),
        [{ label: 'View Supplier Details', nav: 'suppliers' }]
      );
    }
  }

  // ── On-time payment rate ──────────────────────────────────
  if (match(msg, ['on-time', 'payment rate', 'on time'])) {
    const { current, target } = BUSINESS_TARGETS.onTimePaymentRate;
    return mkResp(
      `The current on-time payment rate is <strong>${current}%</strong>. The target is <strong>${target}%</strong>.\n\nThis means 1 in 5 supplier payments is currently made late. The main causes identified are:\n• Invoice processing takes ~12 days on average\n• Delivery records are often delayed by 3–7 days\n• Exceptions and duplicates hold up approval\n\n<em>These are stakeholder estimates, not formally measured figures.</em>`,
      [{ label: 'View Dashboard KPIs', nav: 'dashboard' }]
    );
  }

  // ── Processing time ───────────────────────────────────────
  if (match(msg, ['processing time', 'average time', '4-day', '12 day', 'target'])) {
    const { current, target } = BUSINESS_TARGETS.processingTimeDays;
    const avg = (INVOICES.reduce((s,i) => s + i.processingDays, 0) / INVOICES.length).toFixed(1);
    return mkResp(
      `<strong>Current average processing time: ${avg} days</strong> (based on demonstration data).\n\nStakeholder baseline: <strong>${current} days</strong>. Business target: <strong>${target} days</strong>.\n\nThe longest delays are caused by:\n• Waiting for shop delivery records (3–7 days)\n• Supplier queries adding 2 days\n• Farmer phone calls adding 2–4 days\n• Price queries adding 5–10 days\n\n<em>These are stakeholder estimates.</em>`,
      [{ label: 'View Performance Reports', nav: 'reports' }]
    );
  }

  // ── Overpayments ──────────────────────────────────────────
  if (match(msg, ['overpayment', 'overpaid', 'rm 40', 'quarterly'])) {
    const { current, target } = BUSINESS_TARGETS.quarterlyOverpayments;
    return mkResp(
      `Quarterly overpayments are currently estimated at <strong>RM ${current.toLocaleString()}</strong> per quarter (stakeholder estimate).\n\nBreakdown (Mei Ling's estimate):\n• ~45% duplicate payments\n• ~35% price differences\n• ~15% quantity/weight errors\n• ~5% other (e.g. wrong supplier code)\n\nThe business target is to reduce this to <strong>RM ${target.toLocaleString()}</strong> per quarter — an 80% reduction within one year.`,
      [{ label: 'View Overpayment Report', nav: 'reports' }]
    );
  }

  // ── Exceptions / Mei Ling ─────────────────────────────────
  if (match(msg, ['mei ling', 'exception', 'investigate'])) {
    const ml = EXCEPTIONS.filter(e => e.assignedTo === 'Mei Ling' && e.status !== 'Resolved');
    return mkResp(
      `Mei Ling has <strong>${ml.length} open exceptions</strong> requiring attention:\n\n` +
      ml.map(e => `• <strong>${e.id}</strong> (${e.invoiceId}) – ${e.category} – Risk: ${e.riskLevel}`).join('\n'),
      [{ label: 'Open Exception Management', nav: 'exceptions' }]
    );
  }

  // ── What should Aina do ───────────────────────────────────
  if (match(msg, ['aina', 'process next', 'what should aina'])) {
    const ainaQ = INVOICES.filter(i => i.assignedTo === 'Aina' && i.status === 'Pending Check');
    return mkResp(
      `Aina has <strong>${ainaQ.length} invoices</strong> in her queue:\n\n` +
      ainaQ.map(i => `• ${i.id} – ${i.supplierName} – RM ${i.total.toFixed(2)} (${i.billType})`).join('\n') +
      `\n\nPriority: invoices with due dates within 3 days should be processed first.`,
      [{ label: 'View All Invoices', nav: 'invoices' }]
    );
  }

  // ── Overdue ───────────────────────────────────────────────
  if (match(msg, ['overdue', 'late payment', 'past due'])) {
    const od = INVOICES.filter(i => i.status === 'Overdue');
    return mkResp(
      `There ${od.length === 1 ? 'is' : 'are'} <strong>${od.length} overdue invoice${od.length !== 1 ? 's' : ''}</strong>:\n\n` +
      od.map(i => `• ${i.id} – ${i.supplierName} – RM ${i.total.toFixed(2)} – Due: ${i.dueDate}`).join('\n') +
      (od.length ? '\n\nThese require urgent approval to avoid supplier disputes.' : ''),
      [{ label: 'View All Invoices', nav: 'invoices' }]
    );
  }

  // ── Summary of stats ─────────────────────────────────────
  if (match(msg, ['summary', 'overview', 'dashboard', 'status'])) {
    return mkResp(
      `<strong>Golden Grove Mart – Invoice Summary</strong>\n\n` +
      `• Total invoices this month: <strong>${INVOICES.length}</strong>\n` +
      `• Pending Check: <strong>${INVOICES.filter(i=>i.status==='Pending Check').length}</strong>\n` +
      `• Pending Approval: <strong>${INVOICES.filter(i=>i.status==='Pending Approval').length}</strong>\n` +
      `• Exceptions: <strong>${INVOICES.filter(i=>i.status==='Exception').length}</strong>\n` +
      `• Overdue: <strong>${INVOICES.filter(i=>i.status==='Overdue').length}</strong>\n` +
      `• Paid: <strong>${INVOICES.filter(i=>i.status==='Paid').length}</strong>\n` +
      `• Potential Duplicates: <strong>${INVOICES.filter(i=>i.isDuplicate).length}</strong>`,
      [{ label: 'Open Dashboard', nav: 'dashboard' }]
    );
  }

  // ── Quantity discrepancy ──────────────────────────────────
  if (match(msg, ['quantity', 'mismatch', 'discrepancy'])) {
    const qm = INVOICES.filter(i => i.matchStatus === 'Quantity Mismatch');
    return mkResp(
      `Found <strong>${qm.length} invoices</strong> with quantity mismatches:\n\n` +
      qm.map(i => `• ${i.id} – ${i.supplierName}: ${i.anomalyFlags.find(f=>f.includes('Quantity')) || 'Quantity Mismatch'}`).join('\n'),
      [{ label: 'View Invoice Matching', nav: 'matching' }]
    );
  }

  // ── Aging / escalation ────────────────────────────────────
  if (match(msg, ['aging', 'overdue']) || match(msg, ['escalat']) || match(msg, ['days', 'process'])) {
    const aged = INVOICES.filter(i => i.processingDays >= 5 && i.status !== 'Paid' && i.status !== 'Approved');
    return mkResp(
      `<strong>${aged.length} invoices</strong> have been in processing for 5 or more days and need escalation:\n\n` +
      aged.map(i => {
        const b = getAgingBucket(i.processingDays);
        return `• <strong>${i.id}</strong> – ${i.processingDays} days – ${b.icon} ${b.label} → ${b.escalateTo || 'No escalation'}`;
      }).join('\n') +
      `\n\nEscalation rules:\n• 1–2 days: Normal\n• 3–4 days: Attention Required\n• 5–6 days: Escalate to Mei Ling\n• 7+ days: Notify Siti`,
      [{ label: 'Open Aging Tracker', nav: 'aging' }]
    );
  }

  // ── Payment blocked / eligibility ─────────────────────────
  if (match(msg, ['block', 'eligible']) || match(msg, ['prevent', 'payment'])) {
    const pending = INVOICES.filter(i => i.status === 'Pending Approval');
    const blocked = pending.filter(i => !checkPaymentEligibility(i).eligible);
    return mkResp(
      `<strong>${blocked.length} of ${pending.length} invoices</strong> pending approval are currently <strong>blocked from payment</strong>.\n\n` +
      blocked.map(i => {
        const e = checkPaymentEligibility(i);
        return `• <strong>${i.id}</strong>: ${e.blocks.map(b => b.rule).join(', ')}`;
      }).join('\n') +
      `\n\nBlocked invoices cannot be approved by Siti until their exceptions are resolved by Mei Ling or Hafiz.`,
      [{ label: 'View Thursday Approval', nav: 'approval' }, { label: 'View Exceptions', nav: 'exceptions' }]
    );
  }

  // ── Data integration ──────────────────────────────────────
  if (match(msg, ['ledgermate']) || match(msg, ['integration', 'import']) || match(msg, ['delivery', 'record'])) {
    const pending = MANUAL_DELIVERY_QUEUE.filter(d => d.status === 'Pending').length;
    return mkResp(
      `Golden Grove Mart connects three data sources:\n\n` +
      `• <strong>LedgerMate</strong> – Accounting system (Siti/Aina). Invoices import via spreadsheet template.\n` +
      `• <strong>Purchasing Spreadsheet</strong> – Hafiz's team. Exported as CSV, no direct system link.\n` +
      `• <strong>Shop Delivery Records</strong> – Paper forms only. ${pending} record${pending !== 1 ? 's' : ''} awaiting manual registration.\n\n` +
      `No live API connections exist. All integration is manual or simulated in this prototype.`,
      [{ label: 'Open Data Integration', nav: 'integration' }]
    );
  }

  // ── Business targets / outcomes ───────────────────────────
  if (match(msg, ['target', 'achieve']) || match(msg, ['outcome', 'improve']) || match(msg, ['business', 'kpi'])) {
    return mkResp(
      `<strong>Business Improvement Targets (stakeholder estimates):</strong>\n\n` +
      `• Processing time: <strong>12 days → 4 days</strong>\n` +
      `• On-time payments: <strong>80% → 95%</strong>\n` +
      `• Quarterly overpayments: <strong>RM 40,000 → RM 8,000</strong>\n` +
      `• Manual data entry: <strong>~95 hrs/month → significant reduction</strong>\n\n` +
      `⚠ These are <em>stakeholder estimates</em>, not formally measured figures. Targets have not been achieved in this prototype.`,
      [{ label: 'View Business Outcomes', nav: 'outcomes' }]
    );
  }

  // ── Help / fallback ───────────────────────────────────────
  return mkResp(
    `I'm sorry, I didn't recognise that question. Here are some things I can help with:\n\n` +
    `• Invoice status and counts\n• Specific invoice details (e.g. <em>"What is INV-2026-2058?"</em>)\n• Risk explanations (e.g. <em>"Why was INV-2026-2058 flagged?"</em>)\n• Duplicate detection results\n• Payment performance\n• Aging and escalation status\n• Blocked / eligible invoices\n• Business targets and outcomes\n• Data integration status`,
    SUGGESTED_QUESTIONS.slice(0,4).map(q => ({ label: q, question: q }))
  );
}

function match(msg, keywords) {
  return keywords.every(k => msg.includes(k.toLowerCase()));
}

function mkResp(text, actions) {
  return { text, actions: actions || [] };
}

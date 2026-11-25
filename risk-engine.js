// =============================================================
// RISK ENGINE – Rule-based risk scoring (not ML/LLM)
// All scores are illustrative rule-based calculations.
// =============================================================

function calculateRiskScore(invoice) {
  let score = 0;
  const factors = [];
  const rules = [];

  // Rule 1: Duplicate detection
  const dup = INVOICES.find(inv =>
    inv.id !== invoice.id &&
    inv.supplierCode === invoice.supplierCode &&
    Math.abs(inv.total - invoice.total) < 0.01 &&
    inv.status !== 'Paid' && inv.status !== 'Rejected'
  );
  if (dup || invoice.isDuplicate) {
    score += 40;
    factors.push({ factor: 'Duplicate Similarity', severity: 'High',   contribution: 40 });
    rules.push('RULE-01: Duplicate invoice from same supplier with matching amount detected.');
  }

  // Rule 2: PO mismatch
  const po = getPO(invoice.poNumber);
  if (!po) {
    score += 25;
    factors.push({ factor: 'Missing PO Reference', severity: 'High',   contribution: 25 });
    rules.push('RULE-02: No matching Purchase Order found for the PO reference on this invoice.');
  } else if (Math.abs(po.unitPrice - invoice.unitPrice) > 0.01) {
    const priceDiff = Math.abs(po.unitPrice - invoice.unitPrice);
    const pct = (priceDiff / po.unitPrice * 100).toFixed(1);
    const contrib = pct > 10 ? 20 : 10;
    score += contrib;
    factors.push({ factor: 'Price Mismatch',       severity: pct > 10 ? 'High' : 'Medium', contribution: contrib });
    rules.push(`RULE-03: Invoice unit price RM${invoice.unitPrice} differs from PO unit price RM${po.unitPrice} by ${pct}%.`);
  }

  // Rule 3: Quantity vs delivery
  const gr = getDelivery(invoice.poNumber);
  if (!gr) {
    score += 15;
    factors.push({ factor: 'Missing Delivery Record', severity: 'Medium', contribution: 15 });
    rules.push('RULE-04: No Goods Received Note found for this PO. Cannot verify quantity delivered.');
  } else if (gr.qtyReceived < invoice.qty) {
    const diff = invoice.qty - gr.qtyReceived;
    const contrib = 20;
    score += contrib;
    factors.push({ factor: 'Quantity Mismatch', severity: 'High', contribution: contrib });
    rules.push(`RULE-05: Invoice quantity ${invoice.qty} exceeds GRN received quantity ${gr.qtyReceived} by ${diff} units.`);
  }

  // Rule 4: Unusual amount (> 2× average for that supplier)
  const supplierInvs = INVOICES.filter(i => i.supplierCode === invoice.supplierCode && i.id !== invoice.id && i.status === 'Paid');
  if (supplierInvs.length >= 2) {
    const avg = supplierInvs.reduce((s,i) => s + i.total, 0) / supplierInvs.length;
    if (invoice.total > avg * 2) {
      score += 15;
      factors.push({ factor: 'Unusual Amount', severity: 'Medium', contribution: 15 });
      rules.push(`RULE-06: Invoice amount RM${invoice.total.toFixed(2)} is more than twice the supplier average of RM${avg.toFixed(2)}.`);
    }
  }

  // Rule 5: Handwritten / photo (harder to verify)
  if (invoice.billType === 'handwritten' || invoice.billType === 'photo') {
    score += 5;
    factors.push({ factor: 'Difficult Document Type', severity: 'Low', contribution: 5 });
    rules.push('RULE-07: Invoice is handwritten or a phone photo. Higher error probability during manual entry.');
  }

  // Rule 6: Overdue
  const today = new Date(); today.setHours(0,0,0,0);
  const due = new Date(invoice.dueDate);
  if (due < today && invoice.status !== 'Paid' && invoice.status !== 'Approved') {
    score += 10;
    factors.push({ factor: 'Payment Overdue', severity: 'High', contribution: 10 });
    rules.push('RULE-08: Invoice due date has passed. Payment is overdue.');
  }

  score = Math.min(score, 100);

  let riskCategory, riskLevel;
  if (score < 30)      { riskCategory = 'Low';      riskLevel = 'Low'; }
  else if (score < 60) { riskCategory = 'Medium';   riskLevel = 'Medium'; }
  else if (score < 80) { riskCategory = 'High';     riskLevel = 'High'; }
  else                 { riskCategory = 'Critical';  riskLevel = 'Critical'; }

  const duplicateInvoice = dup ? dup.id : (invoice.duplicateOf || null);

  let recommendedAction = 'No immediate action required. Proceed with normal approval workflow.';
  if (score >= 80)      recommendedAction = 'Hold invoice immediately. Assign to Mei Ling for urgent investigation before any payment.';
  else if (score >= 60) recommendedAction = 'Flag for Mei Ling review. Do not proceed to approval until exception is resolved.';
  else if (score >= 30) recommendedAction = 'Review matching results carefully before forwarding to approval.';

  return { score, riskCategory, riskLevel, factors, rules, duplicateInvoice, recommendedAction };
}

function runMatchingCheck(invoice) {
  const po = getPO(invoice.poNumber);
  const gr = getDelivery(invoice.poNumber);

  const result = {
    invoiceId:    invoice.id,
    po:           po || null,
    gr:           gr || null,
    poMatch:      null,
    grMatch:      null,
    overallStatus:invoice.matchStatus,
    discrepancies:[],
    explanation:  '',
  };

  if (!po) {
    result.poMatch = 'Missing PO';
    result.discrepancies.push('No Purchase Order found for PO reference ' + invoice.poNumber);
  } else {
    const priceDiff = Math.abs(po.unitPrice - invoice.unitPrice);
    const qtyDiff   = Math.abs(po.qty - invoice.qty);
    if (priceDiff < 0.01 && qtyDiff === 0) {
      result.poMatch = 'Matched';
    } else {
      result.poMatch = 'Mismatch';
      if (priceDiff > 0.01) result.discrepancies.push(`Price: PO RM${po.unitPrice.toFixed(2)} vs Invoice RM${invoice.unitPrice.toFixed(2)}`);
      if (qtyDiff > 0)      result.discrepancies.push(`Quantity: PO ${po.qty} vs Invoice ${invoice.qty}`);
    }
  }

  if (!gr) {
    result.grMatch = 'Missing GRN';
    result.discrepancies.push('No Goods Received Note found for PO ' + invoice.poNumber);
  } else {
    const grQtyDiff = invoice.qty - gr.qtyReceived;
    if (grQtyDiff === 0) {
      result.grMatch = 'Matched';
    } else if (grQtyDiff > 0) {
      result.grMatch = 'Short Delivery';
      result.discrepancies.push(`GRN qty ${gr.qtyReceived} < Invoice qty ${invoice.qty} (difference: ${grQtyDiff} units, RM${(grQtyDiff * invoice.unitPrice).toFixed(2)})`);
    } else {
      result.grMatch = 'Over Delivery';
      result.discrepancies.push(`GRN qty ${gr.qtyReceived} > Invoice qty ${invoice.qty}`);
    }
  }

  // Build explanation
  if (result.discrepancies.length === 0) {
    result.explanation = `Invoice ${invoice.id} matches its Purchase Order and Goods Received Note on quantity, unit price, and total amount. No discrepancies found.`;
  } else {
    result.explanation = `Invoice ${invoice.id} has the following discrepancies: ${result.discrepancies.join('; ')}. `;
    if (gr && po && gr.qtyReceived < invoice.qty) {
      const diff = invoice.qty - gr.qtyReceived;
      result.explanation += `The supplier billed ${invoice.qty} units, but the shop delivery record confirms only ${gr.qtyReceived} units received. The difference is ${diff} units, representing RM${(diff * invoice.unitPrice).toFixed(2)} based on the PO unit price.`;
    }
  }

  return result;
}

function getXAIExplanation(invoice) {
  const risk = calculateRiskScore(invoice);
  const match = runMatchingCheck(invoice);
  const dup = risk.duplicateInvoice ? getInvoice(risk.duplicateInvoice) : null;

  const evidence = [];
  if (dup) {
    evidence.push(`Previously submitted invoice: ${dup.id}`);
    evidence.push(`Same supplier: ${invoice.supplierName}`);
    evidence.push(`Same invoice amount: RM${invoice.total.toFixed(2)}`);
    evidence.push(`Similar description: "${dup.description}"`);
    if (dup.id !== invoice.id) evidence.push(`Different invoice number submitted`);
  }
  if (match.discrepancies.length) match.discrepancies.forEach(d => evidence.push(d));

  return {
    invoiceId:         invoice.id,
    decision:          risk.riskCategory === 'Low' ? 'Approved for Processing' : 'Flagged for Review',
    riskScore:         risk.score,
    riskCategory:      risk.riskCategory,
    factors:           risk.factors,
    rules:             risk.rules,
    evidence:          evidence,
    matchingResult:    match,
    explanation:       buildXAINarrative(invoice, risk, match, dup),
    recommendedAction: risk.recommendedAction,
    duplicateInvoice:  dup,
  };
}

function buildXAINarrative(invoice, risk, match, dup) {
  let text = `Invoice ${invoice.id} from ${invoice.supplierName} was assigned a risk score of ${risk.score}/100 (${risk.riskCategory}). `;
  if (risk.factors.length === 0) {
    text += 'No risk rules were triggered. The invoice matches the Purchase Order and Goods Received Note.';
    return text;
  }
  text += 'The following rule-based risk indicators were identified:\n';
  risk.factors.forEach((f, i) => {
    text += `\n${i+1}. ${f.factor} (${f.severity} severity, +${f.contribution} points).`;
  });
  if (dup) {
    text += `\n\nDuplicate evidence: A similar invoice (${dup.id}) was previously submitted by ${dup.supplierName} on ${dup.invoiceDate} for RM${dup.total.toFixed(2)}.`;
  }
  if (match.discrepancies.length) {
    text += `\n\nMatching discrepancies: ${match.discrepancies.join('; ')}.`;
  }
  return text;
}

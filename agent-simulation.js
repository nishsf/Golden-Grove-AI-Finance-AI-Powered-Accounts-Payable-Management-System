// =============================================================
// AGENTIC AI SIMULATION
// This is a frontend simulation of coordinated AI agents.
// No actual LLM or ML models are running.
// =============================================================

const AGENTS = {
  extraction: {
    id: 'extraction',
    name: 'Invoice Extraction Agent',
    icon: '📄',
    description: 'Reads invoice documents, extracts field values and assigns confidence scores.',
    status: 'idle',
  },
  matching: {
    id: 'matching',
    name: 'Invoice Matching Agent',
    icon: '🔍',
    description: 'Compares invoice details against Purchase Orders and Goods Received Notes.',
    status: 'idle',
  },
  risk: {
    id: 'risk',
    name: 'Risk Detection Agent',
    icon: '⚠️',
    description: 'Applies rule-based checks to identify duplicates, anomalies and high-risk indicators.',
    status: 'idle',
  },
  exception: {
    id: 'exception',
    name: 'Exception Management Agent',
    icon: '🚨',
    description: 'Summarises findings, recommends actions, and assigns exceptions to the right team member.',
    status: 'idle',
  },
};

// Predefined extraction examples for demonstration
const EXTRACTION_EXAMPLES = [
  {
    label: 'Clean Typed Invoice',
    billType: 'typed',
    fields: {
      supplierName:  { value: 'Ahmad Fresh Produce',   confidence: 97 },
      supplierCode:  { value: 'SUP-001',               confidence: 99 },
      invoiceNumber: { value: 'INV-2026-2071',         confidence: 99 },
      invoiceDate:   { value: '2026-11-24',            confidence: 98 },
      poNumber:      { value: 'PO-2026-0111',          confidence: 96 },
      description:   { value: 'Long beans x100',       confidence: 95 },
      quantity:      { value: '100',                   confidence: 94 },
      unitPrice:     { value: '3.20',                  confidence: 96 },
      tax:           { value: '0.00',                  confidence: 99 },
      total:         { value: '320.00',                confidence: 98 },
      dueDate:       { value: '2026-12-24',            confidence: 97 },
    },
  },
  {
    label: 'Handwritten Invoice (Low Confidence)',
    billType: 'handwritten',
    fields: {
      supplierName:  { value: 'Majlis Ayam Kampung',   confidence: 72 },
      supplierCode:  { value: 'SUP-012',               confidence: 65 },
      invoiceNumber: { value: 'INV-2026-2072',         confidence: 68 },
      invoiceDate:   { value: '2026-11-24',            confidence: 61 },
      poNumber:      { value: 'PO-2026-0113',          confidence: 59 },
      description:   { value: 'Kampung chicken 1.2kg', confidence: 70 },
      quantity:      { value: '30',                    confidence: 55 },
      unitPrice:     { value: '22.00',                 confidence: 60 },
      tax:           { value: '0.00',                  confidence: 85 },
      total:         { value: '660.00',                confidence: 63 },
      dueDate:       { value: '2026-12-01',            confidence: 58 },
    },
  },
  {
    label: 'Phone Photo Invoice',
    billType: 'photo',
    fields: {
      supplierName:  { value: 'Hassan Poultry Farm',   confidence: 82 },
      supplierCode:  { value: 'SUP-005',               confidence: 78 },
      invoiceNumber: { value: 'INV-2026-2073',         confidence: 85 },
      invoiceDate:   { value: '2026-11-24',            confidence: 80 },
      poNumber:      { value: 'PO-2026-0105',          confidence: 71 },
      description:   { value: 'Whole chicken 1.5kg',   confidence: 76 },
      quantity:      { value: '80',                    confidence: 74 },
      unitPrice:     { value: '18.00',                 confidence: 72 },
      tax:           { value: '0.00',                  confidence: 88 },
      total:         { value: '1440.00',               confidence: 80 },
      dueDate:       { value: '2026-12-15',            confidence: 73 },
    },
  },
];

function simulateAgentWorkflow(invoice, onStep) {
  // Returns a Promise that resolves with the full workflow result
  // onStep(agentId, stepLabel, output) is called at each stage
  return new Promise(resolve => {
    const steps = [
      { agent: null,         delay: 400,  label: 'Orchestrator: Task received',          fn: () => ({ task: `Process invoice ${invoice.id}`, invoiceId: invoice.id }) },
      { agent: 'extraction', delay: 900,  label: 'Extraction Agent: Analysing document', fn: () => simulateExtraction(invoice) },
      { agent: 'matching',   delay: 800,  label: 'Matching Agent: Comparing PO and GRN', fn: () => runMatchingCheck(invoice) },
      { agent: 'risk',       delay: 700,  label: 'Risk Agent: Calculating risk score',   fn: () => calculateRiskScore(invoice) },
      { agent: 'exception',  delay: 600,  label: 'Exception Agent: Generating recommendation', fn: () => buildExceptionSummary(invoice) },
      { agent: null,         delay: 400,  label: 'Orchestrator: Final assessment ready', fn: () => getXAIExplanation(invoice) },
    ];

    let idx = 0;
    function runStep() {
      if (idx >= steps.length) { resolve(getXAIExplanation(invoice)); return; }
      const step = steps[idx++];
      setTimeout(() => {
        const output = step.fn();
        if (onStep) onStep(step.agent, step.label, output);
        runStep();
      }, step.delay);
    }
    runStep();
  });
}

function simulateExtraction(invoice) {
  // Return per-field confidence for an existing invoice
  const baseConf = invoice.billType === 'typed' ? 95 : invoice.billType === 'handwritten' ? 65 : 78;
  return {
    fields: {
      supplierName:  { value: invoice.supplierName, confidence: baseConf + 2 },
      supplierCode:  { value: invoice.supplierCode, confidence: baseConf + 4 },
      invoiceNumber: { value: invoice.id,           confidence: baseConf + 4 },
      invoiceDate:   { value: invoice.invoiceDate,  confidence: baseConf + 3 },
      poNumber:      { value: invoice.poNumber,     confidence: baseConf + 1 },
      description:   { value: invoice.description,  confidence: baseConf },
      quantity:      { value: String(invoice.qty),  confidence: baseConf - 7 },
      unitPrice:     { value: String(invoice.unitPrice), confidence: baseConf - 10 },
      tax:           { value: String(invoice.tax),  confidence: baseConf + 4 },
      total:         { value: invoice.total.toFixed(2), confidence: baseConf + 3 },
      dueDate:       { value: invoice.dueDate,      confidence: baseConf + 2 },
    },
    lowConfidenceFields: [],
  };
}

function buildExceptionSummary(invoice) {
  const risk   = calculateRiskScore(invoice);
  const excs   = getException(invoice.id);
  return {
    exceptionsFound:  excs.length,
    existingExceptions: excs,
    riskScore:        risk.score,
    riskLevel:        risk.riskLevel,
    recommendedAction: risk.recommendedAction,
    assignTo:         risk.score >= 60 ? 'Mei Ling' : risk.score >= 30 ? 'Aina' : 'Aina',
  };
}

// =============================================================
// GOLDEN GROVE AI FINANCE – MOCK DATA
// All records are demonstration data only.
// =============================================================

const DEMO_LABEL = '⚠ Demonstration Data';

// ─── Suppliers ────────────────────────────────────────────────
const SUPPLIERS = [
  { code:'SUP-001', name:'Ahmad Fresh Produce',      contact:'Ahmad Bin Razali',  phone:'012-3456781', email:'ahmad@freshproduce.my',    paymentTerms:30, category:'Vegetables',  rating:4.2 },
  { code:'SUP-002', name:'Fatimah Organic Farm',     contact:'Fatimah Binti Ali', phone:'013-2345672', email:'fatimah@organicfarm.my',   paymentTerms:14, category:'Organic',     rating:3.8 },
  { code:'SUP-003', name:'Golden Valley Rice Mill',  contact:'Chong Wei Liang',   phone:'016-7654323', email:'chong@goldenvalley.my',    paymentTerms:30, category:'Staples',     rating:4.6 },
  { code:'SUP-004', name:'Sunrise Beverages Sdn Bhd',contact:'Lim Ah Kow',        phone:'017-8765434', email:'lim@sunrisebev.my',        paymentTerms:21, category:'Beverages',   rating:4.1 },
  { code:'SUP-005', name:'Hassan Poultry Farm',      contact:'Hassan Bin Yusof',  phone:'011-9876545', email:'hassan@poultry.my',        paymentTerms:7,  category:'Poultry',     rating:3.5 },
  { code:'SUP-006', name:'Pelangi Seafood Trading',  contact:'Tan Siew Lin',      phone:'019-8764356', email:'tan@pelangi.my',           paymentTerms:14, category:'Seafood',     rating:4.0 },
  { code:'SUP-007', name:'Bukit Indah Dairy',        contact:'Rajan Pillai',      phone:'012-7653467', email:'rajan@dairy.my',           paymentTerms:21, category:'Dairy',       rating:4.4 },
  { code:'SUP-008', name:'Kampung Baru Grocers',     contact:'Zainab Bt Hamid',   phone:'013-6542578', email:'zainab@kbgrocers.my',      paymentTerms:30, category:'Dry Goods',   rating:3.9 },
  { code:'SUP-009', name:'TropiFresh Fruits',        contact:'Ong Boon Huat',     phone:'016-5431689', email:'ong@tropifresh.my',        paymentTerms:14, category:'Fruits',      rating:4.3 },
  { code:'SUP-010', name:'Mutiara Spice Traders',    contact:'Norizan Bt Kassim', phone:'011-4320790', email:'norizan@spice.my',         paymentTerms:30, category:'Spices',      rating:4.7 },
  { code:'SUP-011', name:'Eco Green Herbs',          contact:'Lee Chee Wah',      phone:'017-3219801', email:'lee@ecogreen.my',          paymentTerms:14, category:'Herbs',       rating:3.6 },
  { code:'SUP-012', name:'Majlis Ayam Kampung',      contact:'Pak Mail',          phone:'012-2108912', email:'pakmail@ayamkampung.my',   paymentTerms:7,  category:'Poultry',     rating:3.2 },
  { code:'SUP-013', name:'Sejahtera Palm Oil',       contact:'Mohd Firdaus',      phone:'013-1097023', email:'firdaus@sejahtera.my',     paymentTerms:30, category:'Oils',        rating:4.5 },
  { code:'SUP-014', name:'Maju Frozen Foods',        contact:'Susan Khoo',        phone:'016-0986134', email:'susan@majufrozen.my',      paymentTerms:21, category:'Frozen',      rating:4.0 },
  { code:'SUP-015', name:'Desa Timur Trading',       contact:'Ibrahim Bin Salleh',phone:'011-9875245', email:'ibrahim@desatimur.my',     paymentTerms:30, category:'Mixed',       rating:3.7 },
];

// ─── Purchase Orders ──────────────────────────────────────────
const PURCHASE_ORDERS = [
  { poNumber:'PO-2026-0101', supplierCode:'SUP-001', date:'2026-10-28', description:'Fresh tomatoes',      qty:200, unitPrice:3.50, total:700.00,  status:'Received' },
  { poNumber:'PO-2026-0102', supplierCode:'SUP-002', date:'2026-10-30', description:'Organic spinach',     qty:150, unitPrice:4.20, total:630.00,  status:'Received' },
  { poNumber:'PO-2026-0103', supplierCode:'SUP-003', date:'2026-11-01', description:'White rice 50kg bags',qty:100, unitPrice:52.00,total:5200.00, status:'Received' },
  { poNumber:'PO-2026-0104', supplierCode:'SUP-004', date:'2026-11-02', description:'Mineral water 500ml 24pk',qty:300,unitPrice:12.50,total:3750.00,status:'Received' },
  { poNumber:'PO-2026-0105', supplierCode:'SUP-005', date:'2026-11-03', description:'Whole chicken 1.5kg', qty:80,  unitPrice:18.00,total:1440.00, status:'Partial' },
  { poNumber:'PO-2026-0106', supplierCode:'SUP-006', date:'2026-11-04', description:'Frozen prawns 1kg',   qty:60,  unitPrice:35.00,total:2100.00, status:'Received' },
  { poNumber:'PO-2026-0107', supplierCode:'SUP-007', date:'2026-11-05', description:'Fresh milk 1L',       qty:250, unitPrice:4.80, total:1200.00, status:'Received' },
  { poNumber:'PO-2026-0108', supplierCode:'SUP-008', date:'2026-11-05', description:'Cooking oil 5L',      qty:120, unitPrice:28.00,total:3360.00, status:'Received' },
  { poNumber:'PO-2026-0109', supplierCode:'SUP-009', date:'2026-11-06', description:'Mixed tropical fruits',qty:180, unitPrice:5.50, total:990.00,  status:'Received' },
  { poNumber:'PO-2026-0110', supplierCode:'SUP-010', date:'2026-11-07', description:'Chilli powder 500g',  qty:200, unitPrice:6.80, total:1360.00, status:'Received' },
  { poNumber:'PO-2026-0111', supplierCode:'SUP-001', date:'2026-11-08', description:'Long beans',          qty:100, unitPrice:3.20, total:320.00,  status:'Received' },
  { poNumber:'PO-2026-0112', supplierCode:'SUP-011', date:'2026-11-09', description:'Lemongrass bunches',  qty:300, unitPrice:1.50, total:450.00,  status:'Pending' },
  { poNumber:'PO-2026-0113', supplierCode:'SUP-012', date:'2026-11-10', description:'Kampung chicken 1.2kg',qty:50, unitPrice:22.00,total:1100.00, status:'Received' },
  { poNumber:'PO-2026-0114', supplierCode:'SUP-013', date:'2026-11-10', description:'Palm oil 1L',         qty:500, unitPrice:8.50, total:4250.00, status:'Received' },
  { poNumber:'PO-2026-0115', supplierCode:'SUP-014', date:'2026-11-11', description:'Frozen fish fillet',  qty:90,  unitPrice:24.00,total:2160.00, status:'Received' },
  { poNumber:'PO-2026-0116', supplierCode:'SUP-003', date:'2026-11-12', description:'Basmati rice 5kg',    qty:60,  unitPrice:38.00,total:2280.00, status:'Partial' },
  { poNumber:'PO-2026-0117', supplierCode:'SUP-002', date:'2026-11-13', description:'Organic carrots',     qty:120, unitPrice:3.80, total:456.00,  status:'Received' },
  { poNumber:'PO-2026-0118', supplierCode:'SUP-015', date:'2026-11-14', description:'Mixed dry goods',     qty:1,   unitPrice:1850.00,total:1850.00,status:'Received' },
  { poNumber:'PO-2026-0119', supplierCode:'SUP-006', date:'2026-11-15', description:'Squid fresh 500g',    qty:40,  unitPrice:28.00,total:1120.00, status:'Pending' },
  { poNumber:'PO-2026-0120', supplierCode:'SUP-007', date:'2026-11-15', description:'Cheese slices 200g',  qty:150, unitPrice:9.80, total:1470.00, status:'Received' },
];

// ─── Delivery Records ─────────────────────────────────────────
const DELIVERY_RECORDS = [
  { grNumber:'GR-2026-0101', poNumber:'PO-2026-0101', receivedDate:'2026-10-31', qtyReceived:200, condition:'Good',    receivedBy:'Shop Staff' },
  { grNumber:'GR-2026-0102', poNumber:'PO-2026-0102', receivedDate:'2026-11-02', qtyReceived:150, condition:'Good',    receivedBy:'Shop Staff' },
  { grNumber:'GR-2026-0103', poNumber:'PO-2026-0103', receivedDate:'2026-11-04', qtyReceived:100, condition:'Good',    receivedBy:'Shop Staff' },
  { grNumber:'GR-2026-0104', poNumber:'PO-2026-0104', receivedDate:'2026-11-05', qtyReceived:300, condition:'Good',    receivedBy:'Shop Staff' },
  { grNumber:'GR-2026-0105', poNumber:'PO-2026-0105', receivedDate:'2026-11-06', qtyReceived:70,  condition:'Good',    receivedBy:'Shop Staff' }, // short delivery
  { grNumber:'GR-2026-0106', poNumber:'PO-2026-0106', receivedDate:'2026-11-07', qtyReceived:60,  condition:'Good',    receivedBy:'Shop Staff' },
  { grNumber:'GR-2026-0107', poNumber:'PO-2026-0107', receivedDate:'2026-11-08', qtyReceived:250, condition:'Good',    receivedBy:'Shop Staff' },
  { grNumber:'GR-2026-0108', poNumber:'PO-2026-0108', receivedDate:'2026-11-08', qtyReceived:120, condition:'Good',    receivedBy:'Shop Staff' },
  { grNumber:'GR-2026-0109', poNumber:'PO-2026-0109', receivedDate:'2026-11-09', qtyReceived:180, condition:'Good',    receivedBy:'Shop Staff' },
  { grNumber:'GR-2026-0110', poNumber:'PO-2026-0110', receivedDate:'2026-11-10', qtyReceived:200, condition:'Good',    receivedBy:'Shop Staff' },
  { grNumber:'GR-2026-0111', poNumber:'PO-2026-0111', receivedDate:'2026-11-11', qtyReceived:100, condition:'Good',    receivedBy:'Shop Staff' },
  // PO-112: no delivery record yet (pending)
  { grNumber:'GR-2026-0113', poNumber:'PO-2026-0113', receivedDate:'2026-11-13', qtyReceived:50,  condition:'Good',    receivedBy:'Shop Staff' },
  { grNumber:'GR-2026-0114', poNumber:'PO-2026-0114', receivedDate:'2026-11-13', qtyReceived:500, condition:'Good',    receivedBy:'Shop Staff' },
  { grNumber:'GR-2026-0115', poNumber:'PO-2026-0115', receivedDate:'2026-11-14', qtyReceived:90,  condition:'Good',    receivedBy:'Shop Staff' },
  { grNumber:'GR-2026-0116', poNumber:'PO-2026-0116', receivedDate:'2026-11-15', qtyReceived:50,  condition:'Good',    receivedBy:'Shop Staff' }, // short
  { grNumber:'GR-2026-0117', poNumber:'PO-2026-0117', receivedDate:'2026-11-16', qtyReceived:120, condition:'Good',    receivedBy:'Shop Staff' },
  { grNumber:'GR-2026-0118', poNumber:'PO-2026-0118', receivedDate:'2026-11-16', qtyReceived:1,   condition:'Good',    receivedBy:'Shop Staff' },
  // PO-119: no delivery record yet
  { grNumber:'GR-2026-0120', poNumber:'PO-2026-0120', receivedDate:'2026-11-17', qtyReceived:150, condition:'Good',    receivedBy:'Shop Staff' },
];

// ─── Invoices (30 records) ────────────────────────────────────
let INVOICES = [
  // 1 — Clean invoice, fully matched, approved
  { id:'INV-2026-2041', supplierCode:'SUP-001', supplierName:'Ahmad Fresh Produce',   poNumber:'PO-2026-0101', invoiceDate:'2026-11-01', dueDate:'2026-12-01', description:'Fresh tomatoes 200kg',      qty:200, unitPrice:3.50,  tax:0,    total:700.00,  billType:'typed',       status:'Approved',          riskLevel:'Low',      assignedTo:'Aina',     processingDays:4,  isDuplicate:false, matchStatus:'Fully Matched',         anomalyFlags:[] },
  // 2 — Duplicate of INV-2041 (same details, different number — farmer resent)
  { id:'INV-2026-2058', supplierCode:'SUP-001', supplierName:'Ahmad Fresh Produce',   poNumber:'PO-2026-0101', invoiceDate:'2026-11-05', dueDate:'2026-12-05', description:'Fresh tomatoes 200kg',      qty:200, unitPrice:3.50,  tax:0,    total:700.00,  billType:'photo',       status:'Pending Check',     riskLevel:'Critical', assignedTo:'Mei Ling', processingDays:9,  isDuplicate:true,  duplicateOf:'INV-2026-2041', matchStatus:'Potential Duplicate',   anomalyFlags:['Duplicate Detected','Same PO Reference'] },
  // 3 — Quantity mismatch (billed 100, received 70)
  { id:'INV-2026-2042', supplierCode:'SUP-005', supplierName:'Hassan Poultry Farm',   poNumber:'PO-2026-0105', invoiceDate:'2026-11-07', dueDate:'2026-11-21', description:'Whole chicken 1.5kg x80',   qty:80,  unitPrice:18.00, tax:0,    total:1440.00, billType:'typed',       status:'Exception',         riskLevel:'High',     assignedTo:'Mei Ling', processingDays:11, isDuplicate:false, matchStatus:'Quantity Mismatch',     anomalyFlags:['Quantity Mismatch: billed 80, received 70'] },
  // 4 — Price mismatch
  { id:'INV-2026-2043', supplierCode:'SUP-003', supplierName:'Golden Valley Rice Mill',poNumber:'PO-2026-0103', invoiceDate:'2026-11-04', dueDate:'2026-12-04', description:'White rice 50kg x100',     qty:100, unitPrice:55.00, tax:0,    total:5500.00, billType:'typed',       status:'Exception',         riskLevel:'High',     assignedTo:'Mei Ling', processingDays:10, isDuplicate:false, matchStatus:'Price Mismatch',        anomalyFlags:['Price Mismatch: PO RM52, billed RM55'] },
  // 5 — Missing delivery record
  { id:'INV-2026-2044', supplierCode:'SUP-011', supplierName:'Eco Green Herbs',       poNumber:'PO-2026-0112', invoiceDate:'2026-11-10', dueDate:'2026-11-24', description:'Lemongrass bunches x300',   qty:300, unitPrice:1.50,  tax:0,    total:450.00,  billType:'handwritten', status:'Pending Check',     riskLevel:'Medium',   assignedTo:'Aina',     processingDays:7,  isDuplicate:false, matchStatus:'Missing Delivery Record',anomalyFlags:['Missing Delivery Record'] },
  // 6 — Unreadable handwritten invoice
  { id:'INV-2026-2045', supplierCode:'SUP-012', supplierName:'Majlis Ayam Kampung',   poNumber:'PO-2026-0113', invoiceDate:'2026-11-11', dueDate:'2026-11-18', description:'Kampung chicken 1.2kg x50', qty:50,  unitPrice:22.00, tax:0,    total:1100.00, billType:'handwritten', status:'Exception',         riskLevel:'Medium',   assignedTo:'Mei Ling', processingDays:5,  isDuplicate:false, matchStatus:'Manual Review Required', anomalyFlags:['Unreadable Fields','Requires Supplier Confirmation'] },
  // 7 — Overdue invoice
  { id:'INV-2026-2033', supplierCode:'SUP-004', supplierName:'Sunrise Beverages Sdn Bhd',poNumber:'PO-2026-0104',invoiceDate:'2026-10-20',dueDate:'2026-11-10',description:'Mineral water 500ml 24pk x300',qty:300,unitPrice:12.50,tax:0,total:3750.00,billType:'typed',status:'Overdue',           riskLevel:'High',     assignedTo:'Siti',     processingDays:14, isDuplicate:false, matchStatus:'Fully Matched',         anomalyFlags:['Payment Overdue'] },
  // 8 — Pending approval (Thursday list)
  { id:'INV-2026-2051', supplierCode:'SUP-007', supplierName:'Bukit Indah Dairy',     poNumber:'PO-2026-0107', invoiceDate:'2026-11-08', dueDate:'2026-12-08', description:'Fresh milk 1L x250',        qty:250, unitPrice:4.80,  tax:0,    total:1200.00, billType:'typed',       status:'Pending Approval',  riskLevel:'Low',      assignedTo:'Siti',     processingDays:6,  isDuplicate:false, matchStatus:'Fully Matched',         anomalyFlags:[] },
  // 9 — Due within 3 days, still pending
  { id:'INV-2026-2055', supplierCode:'SUP-006', supplierName:'Pelangi Seafood Trading',poNumber:'PO-2026-0106',invoiceDate:'2026-11-04', dueDate:'2026-11-27', description:'Frozen prawns 1kg x60',     qty:60,  unitPrice:35.00, tax:0,    total:2100.00, billType:'typed',       status:'Pending Approval',  riskLevel:'Low',      assignedTo:'Siti',     processingDays:7,  isDuplicate:false, matchStatus:'Fully Matched',         anomalyFlags:[] },
  // 10 — Another pending approval
  { id:'INV-2026-2052', supplierCode:'SUP-008', supplierName:'Kampung Baru Grocers',  poNumber:'PO-2026-0108', invoiceDate:'2026-11-08', dueDate:'2026-12-08', description:'Cooking oil 5L x120',       qty:120, unitPrice:28.00, tax:0,    total:3360.00, billType:'typed',       status:'Pending Approval',  riskLevel:'Low',      assignedTo:'Siti',     processingDays:5,  isDuplicate:false, matchStatus:'Fully Matched',         anomalyFlags:[] },
  // 11 — Clean, paid
  { id:'INV-2026-2035', supplierCode:'SUP-009', supplierName:'TropiFresh Fruits',     poNumber:'PO-2026-0109', invoiceDate:'2026-11-06', dueDate:'2026-11-20', description:'Mixed tropical fruits x180', qty:180, unitPrice:5.50,  tax:0,    total:990.00,  billType:'typed',       status:'Paid',              riskLevel:'Low',      assignedTo:'Aina',     processingDays:3,  isDuplicate:false, matchStatus:'Fully Matched',         anomalyFlags:[] },
  // 12 — Paid
  { id:'INV-2026-2036', supplierCode:'SUP-010', supplierName:'Mutiara Spice Traders', poNumber:'PO-2026-0110', invoiceDate:'2026-11-07', dueDate:'2026-12-07', description:'Chilli powder 500g x200',   qty:200, unitPrice:6.80,  tax:0,    total:1360.00, billType:'typed',       status:'Paid',              riskLevel:'Low',      assignedTo:'Aina',     processingDays:4,  isDuplicate:false, matchStatus:'Fully Matched',         anomalyFlags:[] },
  // 13 — Another duplicate scenario (different supplier)
  { id:'INV-2026-2059', supplierCode:'SUP-003', supplierName:'Golden Valley Rice Mill',poNumber:'PO-2026-0116',invoiceDate:'2026-11-13', dueDate:'2026-12-13', description:'Basmati rice 5kg x60',      qty:60,  unitPrice:38.00, tax:0,    total:2280.00, billType:'typed',       status:'Pending Check',     riskLevel:'Medium',   assignedTo:'Aina',     processingDays:4,  isDuplicate:false, matchStatus:'Fully Matched',         anomalyFlags:[] },
  // 14 — Partial delivery match
  { id:'INV-2026-2060', supplierCode:'SUP-003', supplierName:'Golden Valley Rice Mill',poNumber:'PO-2026-0116',invoiceDate:'2026-11-14', dueDate:'2026-12-14', description:'Basmati rice 5kg x60',      qty:60,  unitPrice:38.00, tax:0,    total:2280.00, billType:'typed',       status:'Exception',         riskLevel:'High',     assignedTo:'Mei Ling', processingDays:5,  isDuplicate:true,  duplicateOf:'INV-2026-2059', matchStatus:'Potential Duplicate',   anomalyFlags:['Duplicate Detected','Same Description','Same Amount'] },
  // 15 — Quantity mismatch (basmati, delivered 50 billed 60)
  { id:'INV-2026-2061', supplierCode:'SUP-003', supplierName:'Golden Valley Rice Mill',poNumber:'PO-2026-0116',invoiceDate:'2026-11-15', dueDate:'2026-12-15', description:'Basmati rice 5kg x60',      qty:60,  unitPrice:38.00, tax:0,    total:2280.00, billType:'typed',       status:'Exception',         riskLevel:'High',     assignedTo:'Mei Ling', processingDays:3,  isDuplicate:false, matchStatus:'Quantity Mismatch',     anomalyFlags:['Quantity Mismatch: billed 60, received 50'] },
  // 16 — Paid clean
  { id:'INV-2026-2037', supplierCode:'SUP-013', supplierName:'Sejahtera Palm Oil',    poNumber:'PO-2026-0114', invoiceDate:'2026-11-10', dueDate:'2026-12-10', description:'Palm oil 1L x500',           qty:500, unitPrice:8.50,  tax:0,    total:4250.00, billType:'typed',       status:'Paid',              riskLevel:'Low',      assignedTo:'Aina',     processingDays:4,  isDuplicate:false, matchStatus:'Fully Matched',         anomalyFlags:[] },
  // 17 — Pending Check new invoice
  { id:'INV-2026-2062', supplierCode:'SUP-014', supplierName:'Maju Frozen Foods',     poNumber:'PO-2026-0115', invoiceDate:'2026-11-14', dueDate:'2026-12-14', description:'Frozen fish fillet x90',    qty:90,  unitPrice:24.00, tax:0,    total:2160.00, billType:'typed',       status:'Pending Check',     riskLevel:'Low',      assignedTo:'Aina',     processingDays:2,  isDuplicate:false, matchStatus:'Fully Matched',         anomalyFlags:[] },
  // 18 — Organic produce, paid
  { id:'INV-2026-2038', supplierCode:'SUP-002', supplierName:'Fatimah Organic Farm',  poNumber:'PO-2026-0102', invoiceDate:'2026-11-02', dueDate:'2026-11-16', description:'Organic spinach x150',      qty:150, unitPrice:4.20,  tax:0,    total:630.00,  billType:'typed',       status:'Paid',              riskLevel:'Low',      assignedTo:'Aina',     processingDays:3,  isDuplicate:false, matchStatus:'Fully Matched',         anomalyFlags:[] },
  // 19 — Organic carrots, pending check
  { id:'INV-2026-2063', supplierCode:'SUP-002', supplierName:'Fatimah Organic Farm',  poNumber:'PO-2026-0117', invoiceDate:'2026-11-16', dueDate:'2026-12-16', description:'Organic carrots x120',      qty:120, unitPrice:3.80,  tax:0,    total:456.00,  billType:'typed',       status:'Pending Check',     riskLevel:'Low',      assignedTo:'Aina',     processingDays:1,  isDuplicate:false, matchStatus:'Fully Matched',         anomalyFlags:[] },
  // 20 — Spices, pending verification
  { id:'INV-2026-2064', supplierCode:'SUP-010', supplierName:'Mutiara Spice Traders', poNumber:'PO-2026-0110', invoiceDate:'2026-11-15', dueDate:'2026-12-15', description:'Chilli powder 500g x200',   qty:200, unitPrice:6.80,  tax:0,    total:1360.00, billType:'handwritten', status:'Pending Check',     riskLevel:'Low',      assignedTo:'Aina',     processingDays:2,  isDuplicate:false, matchStatus:'Partially Matched',     anomalyFlags:['Handwritten Invoice'] },
  // 21 — High-value unusual amount
  { id:'INV-2026-2065', supplierCode:'SUP-015', supplierName:'Desa Timur Trading',    poNumber:'PO-2026-0118', invoiceDate:'2026-11-15', dueDate:'2026-12-15', description:'Mixed dry goods',           qty:1,   unitPrice:2800.00,tax:0,   total:2800.00, billType:'typed',       status:'Exception',         riskLevel:'High',     assignedTo:'Mei Ling', processingDays:3,  isDuplicate:false, matchStatus:'Price Mismatch',        anomalyFlags:['Price Mismatch: PO RM1850, billed RM2800','Unusual Amount'] },
  // 22 — Missing PO
  { id:'INV-2026-2066', supplierCode:'SUP-012', supplierName:'Majlis Ayam Kampung',   poNumber:'PO-UNKNOWN',   invoiceDate:'2026-11-16', dueDate:'2026-11-23', description:'Kampung chicken 1.2kg x30', qty:30,  unitPrice:22.00, tax:0,    total:660.00,  billType:'photo',       status:'Exception',         riskLevel:'High',     assignedTo:'Hafiz',    processingDays:2,  isDuplicate:false, matchStatus:'Missing PO',            anomalyFlags:['Missing PO Reference'] },
  // 23 — Paid clean
  { id:'INV-2026-2039', supplierCode:'SUP-001', supplierName:'Ahmad Fresh Produce',   poNumber:'PO-2026-0111', invoiceDate:'2026-11-08', dueDate:'2026-12-08', description:'Long beans x100',           qty:100, unitPrice:3.20,  tax:0,    total:320.00,  billType:'typed',       status:'Paid',              riskLevel:'Low',      assignedTo:'Aina',     processingDays:3,  isDuplicate:false, matchStatus:'Fully Matched',         anomalyFlags:[] },
  // 24 — Cheese, pending approval
  { id:'INV-2026-2053', supplierCode:'SUP-007', supplierName:'Bukit Indah Dairy',     poNumber:'PO-2026-0120', invoiceDate:'2026-11-15', dueDate:'2026-12-15', description:'Cheese slices 200g x150',   qty:150, unitPrice:9.80,  tax:0,    total:1470.00, billType:'typed',       status:'Pending Approval',  riskLevel:'Low',      assignedTo:'Siti',     processingDays:4,  isDuplicate:false, matchStatus:'Fully Matched',         anomalyFlags:[] },
  // 25 — Phone photo, exception
  { id:'INV-2026-2067', supplierCode:'SUP-005', supplierName:'Hassan Poultry Farm',   poNumber:'PO-2026-0105', invoiceDate:'2026-11-15', dueDate:'2026-11-22', description:'Whole chicken 1.5kg x80',   qty:80,  unitPrice:18.00, tax:0,    total:1440.00, billType:'photo',       status:'Exception',         riskLevel:'Critical', assignedTo:'Mei Ling', processingDays:3,  isDuplicate:true,  duplicateOf:'INV-2026-2042', matchStatus:'Potential Duplicate',   anomalyFlags:['Duplicate Detected','Phone Photo','Same PO Reference'] },
  // 26 — Paid clean
  { id:'INV-2026-2040', supplierCode:'SUP-004', supplierName:'Sunrise Beverages Sdn Bhd',poNumber:'PO-2026-0104',invoiceDate:'2026-10-15',dueDate:'2026-11-04',description:'Mineral water 500ml 24pk x300',qty:300,unitPrice:12.50,tax:0,total:3750.00,billType:'typed',status:'Paid',riskLevel:'Low',assignedTo:'Aina',processingDays:4,isDuplicate:false,matchStatus:'Fully Matched',anomalyFlags:[] },
  // 27 — Mixed goods, paid
  { id:'INV-2026-2046', supplierCode:'SUP-015', supplierName:'Desa Timur Trading',    poNumber:'PO-2026-0118', invoiceDate:'2026-11-05', dueDate:'2026-12-05', description:'Mixed dry goods batch A',   qty:1,   unitPrice:1850.00,tax:0,   total:1850.00, billType:'typed',       status:'Paid',              riskLevel:'Low',      assignedTo:'Aina',     processingDays:3,  isDuplicate:false, matchStatus:'Fully Matched',         anomalyFlags:[] },
  // 28 — Herbs, missing delivery
  { id:'INV-2026-2068', supplierCode:'SUP-011', supplierName:'Eco Green Herbs',       poNumber:'PO-2026-0112', invoiceDate:'2026-11-16', dueDate:'2026-11-30', description:'Lemongrass bunches x300',   qty:300, unitPrice:1.80,  tax:0,    total:540.00,  billType:'handwritten', status:'Exception',         riskLevel:'Medium',   assignedTo:'Mei Ling', processingDays:2,  isDuplicate:false, matchStatus:'Price Mismatch',        anomalyFlags:['Price Mismatch: PO RM1.50, billed RM1.80','Missing Delivery Record'] },
  // 29 — Squid, missing delivery + no GR
  { id:'INV-2026-2069', supplierCode:'SUP-006', supplierName:'Pelangi Seafood Trading',poNumber:'PO-2026-0119',invoiceDate:'2026-11-16', dueDate:'2026-11-30', description:'Squid fresh 500g x40',      qty:40,  unitPrice:28.00, tax:0,    total:1120.00, billType:'typed',       status:'Pending Check',     riskLevel:'Medium',   assignedTo:'Aina',     processingDays:1,  isDuplicate:false, matchStatus:'Missing Delivery Record',anomalyFlags:['Missing Delivery Record'] },
  // 30 — New invoice today
  { id:'INV-2026-2070', supplierCode:'SUP-002', supplierName:'Fatimah Organic Farm',  poNumber:'PO-2026-0117', invoiceDate:'2026-11-24', dueDate:'2026-12-24', description:'Organic mixed greens x80',  qty:80,  unitPrice:4.50,  tax:0,    total:360.00,  billType:'typed',       status:'Pending Check',     riskLevel:'Low',      assignedTo:'Aina',     processingDays:1,  isDuplicate:false, matchStatus:'Partially Matched',     anomalyFlags:[] },
];

// ─── Exceptions ───────────────────────────────────────────────
let EXCEPTIONS = [
  { id:'EXC-001', invoiceId:'INV-2026-2058', category:'Potential Duplicate',       riskLevel:'Critical', assignedTo:'Mei Ling', createdDate:'2026-11-05', status:'Open',        aiRec:'Hold invoice. Verify with supplier before payment.',   notes:[] },
  { id:'EXC-002', invoiceId:'INV-2026-2042', category:'Quantity Mismatch',         riskLevel:'High',     assignedTo:'Mei Ling', createdDate:'2026-11-07', status:'Investigating',aiRec:'Request revised invoice from supplier for 70 kg.',     notes:['Contacted Hassan Poultry. Awaiting revised invoice.'] },
  { id:'EXC-003', invoiceId:'INV-2026-2043', category:'Price Mismatch',            riskLevel:'High',     assignedTo:'Mei Ling', createdDate:'2026-11-04', status:'Open',        aiRec:'Verify agreed price with Purchasing Officer Hafiz.',    notes:[] },
  { id:'EXC-004', invoiceId:'INV-2026-2044', category:'Missing Delivery Record',   riskLevel:'Medium',   assignedTo:'Aina',     createdDate:'2026-11-10', status:'Open',        aiRec:'Chase shop for GRN before proceeding.',                notes:[] },
  { id:'EXC-005', invoiceId:'INV-2026-2045', category:'Unreadable Invoice',        riskLevel:'Medium',   assignedTo:'Mei Ling', createdDate:'2026-11-11', status:'Investigating',aiRec:'Phone supplier for clarification on amounts.',         notes:['Called Pak Mail. Getting clearer copy.'] },
  { id:'EXC-006', invoiceId:'INV-2026-2033', category:'Payment Overdue',           riskLevel:'High',     assignedTo:'Siti',     createdDate:'2026-11-10', status:'Escalated',   aiRec:'Approve urgently to avoid supplier dispute.',          notes:['Escalated to Siti for immediate review.'] },
  { id:'EXC-007', invoiceId:'INV-2026-2060', category:'Potential Duplicate',       riskLevel:'High',     assignedTo:'Mei Ling', createdDate:'2026-11-14', status:'Open',        aiRec:'Cross-check with original INV-2026-2059.',             notes:[] },
  { id:'EXC-008', invoiceId:'INV-2026-2061', category:'Quantity Mismatch',         riskLevel:'High',     assignedTo:'Mei Ling', createdDate:'2026-11-15', status:'Open',        aiRec:'Confirm received quantity with shop before paying.',    notes:[] },
  { id:'EXC-009', invoiceId:'INV-2026-2065', category:'Price Mismatch',            riskLevel:'High',     assignedTo:'Mei Ling', createdDate:'2026-11-15', status:'Open',        aiRec:'Verify with Hafiz. Amount significantly exceeds PO.',  notes:[] },
  { id:'EXC-010', invoiceId:'INV-2026-2066', category:'Missing PO',                riskLevel:'High',     assignedTo:'Hafiz',    createdDate:'2026-11-16', status:'Open',        aiRec:'Request PO number from Hafiz before processing.',      notes:[] },
  { id:'EXC-011', invoiceId:'INV-2026-2067', category:'Potential Duplicate',       riskLevel:'Critical', assignedTo:'Mei Ling', createdDate:'2026-11-15', status:'Open',        aiRec:'Likely resubmission of INV-2026-2042. Hold payment.',  notes:[] },
  { id:'EXC-012', invoiceId:'INV-2026-2068', category:'Price Mismatch',            riskLevel:'Medium',   assignedTo:'Mei Ling', createdDate:'2026-11-16', status:'Open',        aiRec:'Price increased from PO. Confirm with Eco Green Herbs.',notes:[] },
];

// ─── Payments ─────────────────────────────────────────────────
let PAYMENTS = [
  { id:'PAY-001', invoiceId:'INV-2026-2041', supplierCode:'SUP-001', supplierName:'Ahmad Fresh Produce',   amount:700.00,  dueDate:'2026-12-01', paymentDate:'2026-11-10', status:'Paid',    method:'Bank Transfer', batchId:'BATCH-NOV-01' },
  { id:'PAY-002', invoiceId:'INV-2026-2035', supplierCode:'SUP-009', supplierName:'TropiFresh Fruits',     amount:990.00,  dueDate:'2026-11-20', paymentDate:'2026-11-13', status:'Paid',    method:'Bank Transfer', batchId:'BATCH-NOV-01' },
  { id:'PAY-003', invoiceId:'INV-2026-2036', supplierCode:'SUP-010', supplierName:'Mutiara Spice Traders', amount:1360.00, dueDate:'2026-12-07', paymentDate:'2026-11-13', status:'Paid',    method:'Bank Transfer', batchId:'BATCH-NOV-01' },
  { id:'PAY-004', invoiceId:'INV-2026-2037', supplierCode:'SUP-013', supplierName:'Sejahtera Palm Oil',    amount:4250.00, dueDate:'2026-12-10', paymentDate:'2026-11-13', status:'Paid',    method:'Bank Transfer', batchId:'BATCH-NOV-01' },
  { id:'PAY-005', invoiceId:'INV-2026-2038', supplierCode:'SUP-002', supplierName:'Fatimah Organic Farm',  amount:630.00,  dueDate:'2026-11-16', paymentDate:'2026-11-10', status:'Paid',    method:'Bank Transfer', batchId:'BATCH-NOV-01' },
  { id:'PAY-006', invoiceId:'INV-2026-2039', supplierCode:'SUP-001', supplierName:'Ahmad Fresh Produce',   amount:320.00,  dueDate:'2026-12-08', paymentDate:'2026-11-20', status:'Paid',    method:'Bank Transfer', batchId:'BATCH-NOV-02' },
  { id:'PAY-007', invoiceId:'INV-2026-2040', supplierCode:'SUP-004', supplierName:'Sunrise Beverages Sdn Bhd',amount:3750.00,dueDate:'2026-11-04',paymentDate:'2026-10-30',status:'Paid',   method:'Bank Transfer', batchId:'BATCH-OCT-04' },
  { id:'PAY-008', invoiceId:'INV-2026-2046', supplierCode:'SUP-015', supplierName:'Desa Timur Trading',    amount:1850.00, dueDate:'2026-12-05', paymentDate:'2026-11-20', status:'Paid',    method:'Bank Transfer', batchId:'BATCH-NOV-02' },
  { id:'PAY-009', invoiceId:'INV-2026-2033', supplierCode:'SUP-004', supplierName:'Sunrise Beverages Sdn Bhd',amount:3750.00,dueDate:'2026-11-10',paymentDate:null,         status:'Overdue', method:'Bank Transfer', batchId:null },
  { id:'PAY-010', invoiceId:'INV-2026-2051', supplierCode:'SUP-007', supplierName:'Bukit Indah Dairy',     amount:1200.00, dueDate:'2026-12-08', paymentDate:null,         status:'Pending', method:'Bank Transfer', batchId:'BATCH-NOV-03' },
  { id:'PAY-011', invoiceId:'INV-2026-2052', supplierCode:'SUP-008', supplierName:'Kampung Baru Grocers',  amount:3360.00, dueDate:'2026-12-08', paymentDate:null,         status:'Pending', method:'Bank Transfer', batchId:'BATCH-NOV-03' },
  { id:'PAY-012', invoiceId:'INV-2026-2053', supplierCode:'SUP-007', supplierName:'Bukit Indah Dairy',     amount:1470.00, dueDate:'2026-12-15', paymentDate:null,         status:'Pending', method:'Bank Transfer', batchId:'BATCH-NOV-03' },
  { id:'PAY-013', invoiceId:'INV-2026-2055', supplierCode:'SUP-006', supplierName:'Pelangi Seafood Trading',amount:2100.00,dueDate:'2026-11-27', paymentDate:null,         status:'Pending', method:'Bank Transfer', batchId:'BATCH-NOV-03' },
];

// ─── Audit Trail ──────────────────────────────────────────────
let AUDIT_TRAIL = [
  { id:'AUD-001', actor:'System',    invoiceId:'INV-2026-2041', action:'Invoice Registered',       timestamp:'2026-11-01 08:14', description:'Invoice registered by Aina.' },
  { id:'AUD-002', actor:'System',    invoiceId:'INV-2026-2041', action:'AI Extraction Simulated',  timestamp:'2026-11-01 08:14', description:'AI extraction completed. All fields high confidence.' },
  { id:'AUD-003', actor:'System',    invoiceId:'INV-2026-2041', action:'Matching Completed',       timestamp:'2026-11-01 08:15', description:'Three-way match: Fully Matched.' },
  { id:'AUD-004', actor:'Aina',      invoiceId:'INV-2026-2041', action:'Invoice Verified',         timestamp:'2026-11-01 09:00', description:'Aina confirmed match results.' },
  { id:'AUD-005', actor:'Siti',      invoiceId:'INV-2026-2041', action:'Invoice Approved',         timestamp:'2026-11-07 10:30', description:'Siti approved for Thursday payment list.' },
  { id:'AUD-006', actor:'System',    invoiceId:'INV-2026-2058', action:'Invoice Registered',       timestamp:'2026-11-05 10:22', description:'Invoice registered by Aina via phone photo upload.' },
  { id:'AUD-007', actor:'System',    invoiceId:'INV-2026-2058', action:'Duplicate Detected',       timestamp:'2026-11-05 10:22', description:'Risk Agent flagged duplicate: matches INV-2026-2041.' },
  { id:'AUD-008', actor:'System',    invoiceId:'INV-2026-2058', action:'Exception Raised',         timestamp:'2026-11-05 10:23', description:'Exception EXC-001 created. Assigned to Mei Ling.' },
  { id:'AUD-009', actor:'System',    invoiceId:'INV-2026-2033', action:'Payment Overdue',          timestamp:'2026-11-11 00:00', description:'Automatic overdue flag. Due date 2026-11-10 passed.' },
  { id:'AUD-010', actor:'Mei Ling',  invoiceId:'INV-2026-2042', action:'Investigation Started',    timestamp:'2026-11-08 09:15', description:'Mei Ling began quantity mismatch investigation.' },
  { id:'AUD-011', actor:'System',    invoiceId:'INV-2026-2051', action:'Invoice Registered',       timestamp:'2026-11-08 11:00', description:'Invoice registered by Aina.' },
  { id:'AUD-012', actor:'System',    invoiceId:'INV-2026-2051', action:'Matching Completed',       timestamp:'2026-11-08 11:01', description:'Three-way match: Fully Matched.' },
  { id:'AUD-013', actor:'Aina',      invoiceId:'INV-2026-2051', action:'Sent to Approval',         timestamp:'2026-11-08 11:30', description:'Invoice moved to Pending Approval.' },
  { id:'AUD-014', actor:'System',    invoiceId:'INV-2026-2065', action:'Risk Assessment',          timestamp:'2026-11-15 14:00', description:'Risk score 85/100. High anomaly: price exceeds PO.' },
  { id:'AUD-015', actor:'Hafiz',     invoiceId:'INV-2026-2066', action:'PO Investigation',         timestamp:'2026-11-16 09:00', description:'Hafiz checking if PO exists for this delivery.' },
];

// ─── Business targets (from stakeholder interview) ────────────
const BUSINESS_TARGETS = {
  processingTimeDays:    { current: 12,  target: 4,   unit: 'days',    label: 'Avg Processing Time' },
  onTimePaymentRate:     { current: 80,  target: 95,  unit: '%',       label: 'On-Time Payment Rate' },
  quarterlyOverpayments: { current: 40000, target: 8000, unit: 'RM',  label: 'Quarterly Overpayments' },
  manualHours:           { current: 95,  target: null, unit: 'hrs/mo', label: 'Manual Data Entry' },
  monthlyInvoices:       { current: 2500,target: null, unit: '/month', label: 'Monthly Invoice Volume' },
  suppliers:             { current: 180, target: null, unit: '',       label: 'Active Suppliers' },
};

// ─── Users ────────────────────────────────────────────────────
const USERS = [
  { id:'aina',     name:'Aina',          role:'Finance Clerk',         dept:'Finance',   avatar:'A', permissions:['register','upload','extract','edit','view'] },
  { id:'meiLing',  name:'Mei Ling',      role:'Verification Officer',  dept:'Finance',   avatar:'M', permissions:['verify','investigate','exception','comment','view'] },
  { id:'siti',     name:'Siti Rahman',   role:'Finance Manager',       dept:'Finance',   avatar:'S', permissions:['approve','reject','hold','dashboard','reports','view'] },
  { id:'hafiz',    name:'Hafiz',         role:'Purchasing Officer',    dept:'Purchasing',avatar:'H', permissions:['purchaseOrders','clarify','view'] },
];

// helper accessors
function getSupplier(code)   { return SUPPLIERS.find(s => s.code === code); }
function getPO(poNum)        { return PURCHASE_ORDERS.find(p => p.poNumber === poNum); }
function getDelivery(poNum)  { return DELIVERY_RECORDS.find(d => d.poNumber === poNum); }
function getInvoice(id)      { return INVOICES.find(i => i.id === id); }
function getException(invId) { return EXCEPTIONS.filter(e => e.invoiceId === invId); }

function addAudit(actor, invoiceId, action, description) {
  const now = new Date();
  const ts = now.toISOString().slice(0,10) + ' ' + now.toTimeString().slice(0,5);
  AUDIT_TRAIL.unshift({ id:'AUD-' + String(AUDIT_TRAIL.length+1).padStart(3,'0'), actor, invoiceId, action, timestamp:ts, description });
}

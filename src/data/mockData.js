// ============================================
// BRIGHTLOOP — MOCK DATA STORE
// ============================================

export const ROLES = { ADMIN: 'admin', STAFF: 'staff', CUSTOMER: 'customer' };

export const mockUsers = [
  { id: 'u1', name: 'ajay', email: 'admin@brightloop.io', password: 'Admin@123', role: ROLES.ADMIN, avatar: 'AR' },
  { id: 'u2', name: 'Jordan Blake', email: 'staff@brightloop.io', password: 'Staff@123', role: ROLES.STAFF, avatar: 'JB' },
  { id: 'u3', name: 'Sam Chen',    email: 'customer@brightloop.io', password: 'Cust@123', role: ROLES.CUSTOMER, avatar: 'SC', customerId: 'c1' },
];

export const mockProducts = [
  { id: 'p1', name: 'Brightloop Core', type: 'Software', salesPrice: 299, costPrice: 80, notes: 'Core ERP suite', status: 'active', variants: [
    { id: 'v1', name: 'Odoo Edition', delta: 560 },
    { id: 'v2', name: 'SAP Edition', delta: 800 },
  ]},
  { id: 'p2', name: 'Analytics Add-on', type: 'Add-on', salesPrice: 99, costPrice: 20, notes: 'Advanced reporting module', status: 'active', variants: [] },
  { id: 'p3', name: 'HR Module', type: 'Software', salesPrice: 149, costPrice: 40, notes: 'Human resources management', status: 'active', variants: [
    { id: 'v3', name: 'Enterprise', delta: 200 },
  ]},
  { id: 'p4', name: 'CRM Pro', type: 'Software', salesPrice: 199, costPrice: 55, notes: 'Customer relationship management', status: 'active', variants: [] },
  { id: 'p5', name: 'Storage Boost', type: 'Add-on', salesPrice: 49, costPrice: 10, notes: 'Extra 500GB cloud storage', status: 'archived', variants: [] },
];

export const mockPlans = [
  { id: 'pl1', name: 'Starter Monthly', productId: 'p1', price: 299, cycle: 'monthly', minQty: 1, startDate: '2024-01-01', endDate: null, autoClose: false, allowPause: true, allowEarlyClose: true, allowRenewal: true, trialDays: 14, status: 'active' },
  { id: 'pl2', name: 'Starter Annual', productId: 'p1', price: 2990, cycle: 'yearly', minQty: 1, startDate: '2024-01-01', endDate: null, autoClose: false, allowPause: false, allowEarlyClose: true, allowRenewal: true, trialDays: 14, status: 'active' },
  { id: 'pl3', name: 'Analytics Monthly', productId: 'p2', price: 99, cycle: 'monthly', minQty: 1, startDate: '2024-03-01', endDate: '2026-12-31', autoClose: true, allowPause: true, allowEarlyClose: true, allowRenewal: true, trialDays: 0, status: 'active' },
  { id: 'pl4', name: 'HR Enterprise Annual', productId: 'p3', price: 1788, cycle: 'yearly', minQty: 5, startDate: '2024-01-01', endDate: null, autoClose: false, allowPause: false, allowEarlyClose: false, allowRenewal: true, trialDays: 0, status: 'active' },
  { id: 'pl5', name: 'CRM Pro Monthly', productId: 'p4', price: 199, cycle: 'monthly', minQty: 1, startDate: '2024-06-01', endDate: null, autoClose: false, allowPause: true, allowEarlyClose: true, allowRenewal: true, trialDays: 7, status: 'active' },
];

export const mockCustomers = [
  { id: 'c1', company: 'Acme Corp', email: 'billing@acme.com', contact: 'Sam Chen', phone: '+1 555-0101', segment: 'Enterprise', owner: 'u2', address: '123 Maple St, NY', taxId: 'US-12345', taxExempt: false, createdAt: '2024-01-15', notes: 'Large enterprise client, annual contracts preferred' },
  { id: 'c2', company: 'TechNova Ltd', email: 'finance@technova.io', contact: 'Maria Lopez', phone: '+1 555-0202', segment: 'SMB', owner: 'u2', address: '456 Oak Ave, CA', taxId: 'US-67890', taxExempt: false, createdAt: '2024-02-20', notes: '' },
  { id: 'c3', company: 'GreenByte Inc', email: 'accounts@greenbyte.co', contact: 'Tom West', phone: '+1 555-0303', segment: 'SMB', owner: 'u2', address: '789 Pine Rd, TX', taxId: '', taxExempt: true, createdAt: '2024-03-05', notes: 'Tax exempt — non-profit' },
  { id: 'c4', company: 'Pinnacle Group', email: 'hello@pinnacle.net', contact: 'Sara Kim', phone: '+1 555-0404', segment: 'Enterprise', owner: 'u2', address: '321 Cedar Blvd, WA', taxId: 'US-11111', taxExempt: false, createdAt: '2024-04-10', notes: '' },
  { id: 'c5', company: 'Startup Labs', email: 'pay@startuplabs.co', contact: 'Jake Ryan', phone: '+1 555-0505', segment: 'Trial', owner: 'u2', address: '654 Elm St, FL', taxId: '', taxExempt: false, createdAt: '2024-09-01', notes: 'On free trial — follow up end of month' },
];

export const mockSubscriptions = [
  { id: 's1', number: 'SUB-001', customerId: 'c1', planId: 'pl2', status: 'active', startDate: '2024-02-01', expiryDate: '2025-02-01', paymentTerms: 'Net 30', qty: 3, unitPrice: 2990, taxes: ['t1'], discountId: 'd1', notes: '', templateId: 'tmpl1' },
  { id: 's2', number: 'SUB-002', customerId: 'c2', planId: 'pl1', status: 'active', startDate: '2024-03-01', expiryDate: '2025-03-01', paymentTerms: 'Net 15', qty: 1, unitPrice: 299, taxes: ['t1'], discountId: null, notes: '', templateId: null },
  { id: 's3', number: 'SUB-003', customerId: 'c3', planId: 'pl3', status: 'active', startDate: '2024-04-01', expiryDate: '2025-04-01', paymentTerms: 'Net 30', qty: 2, unitPrice: 99, taxes: [], discountId: null, notes: 'Tax exempt', templateId: null },
  { id: 's4', number: 'SUB-004', customerId: 'c4', planId: 'pl4', status: 'paused', startDate: '2024-05-01', expiryDate: '2025-05-01', paymentTerms: 'Net 45', qty: 10, unitPrice: 1788, taxes: ['t1', 't2'], discountId: 'd2', notes: 'Paused at customer request', templateId: 'tmpl1' },
  { id: 's5', number: 'SUB-005', customerId: 'c5', planId: 'pl5', status: 'trial', startDate: '2024-09-01', expiryDate: '2024-09-15', paymentTerms: 'Immediate', qty: 1, unitPrice: 199, taxes: ['t1'], discountId: null, notes: '', templateId: null },
  { id: 's6', number: 'SUB-006', customerId: 'c1', planId: 'pl5', status: 'active', startDate: '2024-06-01', expiryDate: '2025-06-01', paymentTerms: 'Net 30', qty: 5, unitPrice: 199, taxes: ['t1'], discountId: null, notes: 'CRM add-on for Acme', templateId: null },
  { id: 's7', number: 'SUB-007', customerId: 'c2', planId: 'pl3', status: 'cancelled', startDate: '2024-01-01', expiryDate: '2024-07-01', paymentTerms: 'Net 15', qty: 1, unitPrice: 99, taxes: ['t1'], discountId: null, notes: 'Cancelled — too expensive', templateId: null },
];

export const mockTaxes = [
  { id: 't1', name: 'GST', rate: 18, scope: 'all', status: 'active' },
  { id: 't2', name: 'Local Surcharge', rate: 2, scope: 'enterprise', status: 'active' },
  { id: 't3', name: 'VAT', rate: 20, scope: 'all', status: 'inactive' },
];

export const mockDiscounts = [
  { id: 'd1', name: 'Volume 10% Off', type: 'percentage', value: 10, minQty: 3, minAmount: 0, startDate: '2024-01-01', endDate: '2025-12-31', maxUses: 50, usedCount: 12, scope: 'subscription', productId: null, status: 'active' },
  { id: 'd2', name: '$500 Enterprise Deal', type: 'fixed', value: 500, minQty: 5, minAmount: 1000, startDate: '2024-05-01', endDate: '2024-12-31', maxUses: 10, usedCount: 3, scope: 'subscription', productId: null, status: 'active' },
  { id: 'd3', name: 'Analytics Promo', type: 'percentage', value: 20, minQty: 1, minAmount: 0, startDate: '2024-03-01', endDate: '2024-06-30', maxUses: 100, usedCount: 100, scope: 'product', productId: 'p2', status: 'expired' },
];

export const mockInvoices = [
  { id: 'i1', number: 'INV-0001', subscriptionId: 's1', customerId: 'c1', status: 'paid', issueDate: '2024-02-01', dueDate: '2024-03-03', lines: [{ product: 'Brightloop Core (Annual)', qty: 3, unitPrice: 2990, tax: 18, discount: 10 }], subtotal: 8970, taxAmount: 1614.6, discountAmount: 897, total: 9687.6, notes: '' },
  { id: 'i2', number: 'INV-0002', subscriptionId: 's2', customerId: 'c2', status: 'paid', issueDate: '2024-03-01', dueDate: '2024-03-16', lines: [{ product: 'Brightloop Core (Monthly)', qty: 1, unitPrice: 299, tax: 18, discount: 0 }], subtotal: 299, taxAmount: 53.82, discountAmount: 0, total: 352.82, notes: '' },
  { id: 'i3', number: 'INV-0003', subscriptionId: 's3', customerId: 'c3', status: 'overdue', issueDate: '2024-04-01', dueDate: '2024-05-01', lines: [{ product: 'Analytics Add-on (Monthly)', qty: 2, unitPrice: 99, tax: 0, discount: 0 }], subtotal: 198, taxAmount: 0, discountAmount: 0, total: 198, notes: 'Tax exempt' },
  { id: 'i4', number: 'INV-0004', subscriptionId: 's1', customerId: 'c1', status: 'confirmed', issueDate: '2025-02-01', dueDate: '2025-03-03', lines: [{ product: 'Brightloop Core (Annual)', qty: 3, unitPrice: 2990, tax: 18, discount: 10 }], subtotal: 8970, taxAmount: 1614.6, discountAmount: 897, total: 9687.6, notes: '' },
  { id: 'i5', number: 'INV-0005', subscriptionId: 's6', customerId: 'c1', status: 'paid', issueDate: '2024-06-01', dueDate: '2024-07-01', lines: [{ product: 'CRM Pro (Monthly)', qty: 5, unitPrice: 199, tax: 18, discount: 0 }], subtotal: 995, taxAmount: 179.1, discountAmount: 0, total: 1174.1, notes: '' },
  { id: 'i6', number: 'INV-0006', subscriptionId: 's2', customerId: 'c2', status: 'overdue', issueDate: '2024-10-01', dueDate: '2024-10-16', lines: [{ product: 'Brightloop Core (Monthly)', qty: 1, unitPrice: 299, tax: 18, discount: 0 }], subtotal: 299, taxAmount: 53.82, discountAmount: 0, total: 352.82, notes: '' },
  { id: 'i7', number: 'INV-0007', subscriptionId: 's6', customerId: 'c1', status: 'draft', issueDate: '2024-11-01', dueDate: '2024-12-01', lines: [{ product: 'CRM Pro (Monthly)', qty: 5, unitPrice: 199, tax: 18, discount: 0 }], subtotal: 995, taxAmount: 179.1, discountAmount: 0, total: 1174.1, notes: '' },
];

export const mockPayments = [
  { id: 'py1', invoiceId: 'i1', customerId: 'c1', amount: 9687.6, method: 'card', date: '2024-02-15', note: 'Auto-charged on renewal', status: 'completed' },
  { id: 'py2', invoiceId: 'i2', customerId: 'c2', amount: 352.82, method: 'bank_transfer', date: '2024-03-10', note: 'Wire from TechNova', status: 'completed' },
  { id: 'py3', invoiceId: 'i5', customerId: 'c1', amount: 1174.1, method: 'card', date: '2024-06-05', note: 'Auto-charged on renewal', status: 'completed' },
];

export const mockTemplates = [
  { id: 'tmpl1', name: 'Enterprise Annual Template', planId: 'pl2', validDays: 30, lines: [{ product: 'Brightloop Core', qty: 1, unitPrice: 2990 }], notes: 'Standard enterprise contract template' },
  { id: 'tmpl2', name: 'SMB Monthly Starter', planId: 'pl1', validDays: 14, lines: [{ product: 'Brightloop Core', qty: 1, unitPrice: 299 }], notes: 'Default SMB onboarding template' },
];

export const mockStaff = [
  { id: 'u2', name: 'Jordan Blake', email: 'staff@brightloop.io', role: ROLES.STAFF, avatar: 'JB', status: 'active', createdAt: '2024-01-01' },
];

// Computed helpers
export const getCustomerById = (id) => mockCustomers.find(c => c.id === id);
export const getPlanById = (id) => mockPlans.find(p => p.id === id);
export const getProductById = (id) => mockProducts.find(p => p.id === id);
export const getInvoicesByCustomer = (cid) => mockInvoices.filter(i => i.customerId === cid);
export const getSubscriptionsByCustomer = (cid) => mockSubscriptions.filter(s => s.customerId === cid);

export const dashboardStats = {
  activeSubscriptions: mockSubscriptions.filter(s => s.status === 'active').length,
  mrr: 12450,
  arr: 149400,
  revenueIn: 11214.52,
  outstanding: 10238.42,
  overdueCount: 2,
  churnRate: 4.2,
  nrr: 112,
};

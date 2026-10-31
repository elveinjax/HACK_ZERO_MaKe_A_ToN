import { createContext, useContext, useState, useEffect } from 'react';
import { mockUsers, mockProducts, mockPlans, mockCustomers, mockSubscriptions,
         mockTaxes, mockDiscounts, mockInvoices, mockPayments, mockTemplates, mockStaff } from '../data/mockData';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [products, setProducts] = useState(mockProducts);
  const [plans, setPlans] = useState(mockPlans);
  const [customers, setCustomers] = useState(mockCustomers);
  const [subscriptions, setSubscriptions] = useState(mockSubscriptions);
  const [taxes, setTaxes] = useState(mockTaxes);
  const [discounts, setDiscounts] = useState(mockDiscounts);
  const [invoices, setInvoices] = useState(mockInvoices);
  const [payments, setPayments] = useState(mockPayments);
  const [templates, setTemplates] = useState(mockTemplates);
  const [staff, setStaff] = useState(mockStaff);
  const [users, setUsers] = useState(mockUsers);

  // ---- Currency conversion state ----
const SUPPORTED_CURRENCIES = ['USD','EUR','GBP','INR','CAD','AUD','JPY'];
  const STATIC_RATES = {
    USD: 1,
    EUR: 0.92,
    GBP: 0.78,
    INR: 82,
    CAD: 1.35,
    AUD: 1.53,
    JPY: 150,
  };
  const [currentCurrency, setCurrentCurrency] = useState('USD');
  const [rates, setRates] = useState(STATIC_RATES);

  // Load static rates on mount (fallback to hard‑coded values)
  // eslint-disable-next-line react-hooks/rules‑of‑hooks
  useEffect(() => {
    setRates(STATIC_RATES);
  }, []);

  // Helper to format money values according to selected currency
  const formatMoney = (amount) => {
    if (amount == null) return '';
    const rate = rates[currentCurrency] || 1;
    const converted = amount * rate;
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: currentCurrency,
    }).format(converted);
  };

  const login = (email, password) => {
    const user = users.find(u => u.email === email && u.password === password);
    if (user) { setCurrentUser(user); return { ok: true, user }; }
    return { ok: false, error: 'Invalid email or password.' };
  };

  const register = (name, email, password) => {
    if (users.find(u => u.email === email)) return { ok: false, error: 'Email already registered.' };
    const newUser = {
      id: `u${Date.now()}`, name, email, password,
      role: 'customer', avatar: name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2),
      customerId: null,
    };
    setUsers(prev => [...prev, newUser]);
    setCurrentUser(newUser);
    return { ok: true, user: newUser };
  };

  const logout = () => setCurrentUser(null);

  // Products
  const addProduct = (p) => setProducts(prev => [...prev, { ...p, id: `p${Date.now()}`, variants: p.variants || [] }]);
  const updateProduct = (id, data) => setProducts(prev => prev.map(p => p.id === id ? { ...p, ...data } : p));
  const archiveProduct = (id) => setProducts(prev => prev.map(p => p.id === id ? { ...p, status: 'archived' } : p));

  // Plans
  const addPlan = (pl) => setPlans(prev => [...prev, { ...pl, id: `pl${Date.now()}`, status: 'active' }]);
  const updatePlan = (id, data) => setPlans(prev => prev.map(p => p.id === id ? { ...p, ...data } : p));

  // Customers
  const addCustomer = (c) => setCustomers(prev => [...prev, { ...c, id: `c${Date.now()}`, createdAt: new Date().toISOString().split('T')[0] }]);
  const updateCustomer = (id, data) => setCustomers(prev => prev.map(c => c.id === id ? { ...c, ...data } : c));

  // Subscriptions
  const addSubscription = (s) => {
    const num = `SUB-${String(subscriptions.length + 1).padStart(3, '0')}`;
    setSubscriptions(prev => [...prev, { ...s, id: `s${Date.now()}`, number: num, status: 'draft' }]);
  };
  const updateSubscription = (id, data) => setSubscriptions(prev => prev.map(s => s.id === id ? { ...s, ...data } : s));

  // Invoices
  const generateInvoices = () => {
    const due = subscriptions.filter(s => s.status === 'active');
    const newInvs = due.map(s => {
      const existing = invoices.find(i => i.subscriptionId === s.id && i.status !== 'paid' && i.status !== 'void');
      if (existing) return null;
      const plan = plans.find(p => p.id === s.planId);
      const customer = customers.find(c => c.id === s.customerId);
      const num = `INV-${String(invoices.length + Math.random() * 100 | 0).padStart(4, '0')}`;
      return {
        id: `i${Date.now()}${Math.random()}`, number: num,
        subscriptionId: s.id, customerId: s.customerId, status: 'draft',
        issueDate: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
        lines: [{ product: plan?.name || 'Plan', qty: s.qty, unitPrice: s.unitPrice, tax: 18, discount: 0 }],
        subtotal: s.qty * s.unitPrice,
        taxAmount: s.qty * s.unitPrice * 0.18,
        discountAmount: 0,
        total: s.qty * s.unitPrice * 1.18,
        notes: '',
      };
    }).filter(Boolean);
    setInvoices(prev => [...prev, ...newInvs]);
    return newInvs.length;
  };
  const addInvoice = (inv) => setInvoices(prev => [...prev, { ...inv, id: `i${Date.now()}`, number: `INV-${String(prev.length + 1).padStart(4,'0')}` }]);
  const updateInvoice = (id, data) => setInvoices(prev => prev.map(i => i.id === id ? { ...i, ...data } : i));

  // Payments
  const addPayment = (py) => {
    const newPy = { ...py, id: `py${Date.now()}`, status: 'completed' };
    setPayments(prev => [...prev, newPy]);
    // Auto-mark invoice paid if fully covered
    const inv = invoices.find(i => i.id === py.invoiceId);
    if (inv && py.amount >= inv.total) updateInvoice(py.invoiceId, { status: 'paid' });
    return newPy;
  };

  // Taxes
  const addTax = (t) => setTaxes(prev => [...prev, { ...t, id: `t${Date.now()}` }]);
  const updateTax = (id, data) => setTaxes(prev => prev.map(t => t.id === id ? { ...t, ...data } : t));

  // Discounts
  const addDiscount = (d) => setDiscounts(prev => [...prev, { ...d, id: `d${Date.now()}`, usedCount: 0, status: 'active' }]);
  const updateDiscount = (id, data) => setDiscounts(prev => prev.map(d => d.id === id ? { ...d, ...data } : d));

  // Staff
  const addStaff = (s) => {
    const newUser = { ...s, id: `u${Date.now()}`, role: 'staff', avatar: s.name.split(' ').map(n=>n[0]).join('').toUpperCase(), status: 'active', createdAt: new Date().toISOString().split('T')[0] };
    setStaff(prev => [...prev, newUser]);
    setUsers(prev => [...prev, { ...newUser, password: s.password }]);
  };
  const deactivateStaff = (id) => setStaff(prev => prev.map(s => s.id === id ? { ...s, status: 'inactive' } : s));

  // Templates
  const addTemplate = (t) => setTemplates(prev => [...prev, { ...t, id: `tmpl${Date.now()}` }]);

  return (
    <AppContext.Provider value={{
      currentUser, login, register, logout,
      products, addProduct, updateProduct, archiveProduct,
      plans, addPlan, updatePlan,
      customers, addCustomer, updateCustomer,
      subscriptions, addSubscription, updateSubscription,
      invoices, generateInvoices, addInvoice, updateInvoice,
      payments, addPayment,
      taxes, addTax, updateTax,
      discounts, addDiscount, updateDiscount,
      staff, addStaff, deactivateStaff,
      templates, addTemplate,
      users,
      // Currency utilities
      currentCurrency,
      setCurrentCurrency,
      rates,
      formatMoney,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);

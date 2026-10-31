import { createContext, useContext, useEffect, useState } from 'react';

const AppContext = createContext(null);

async function request(path, options = {}) {
  const response = await fetch(path, {
    credentials: 'same-origin',
    ...options,
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
    },
  });

  if (response.status === 204) return null;
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || `Request failed (${response.status}).`);
  return result;
}

const initialData = {
  products: [],
  plans: [],
  customers: [],
  subscriptions: [],
  taxes: [],
  discounts: [],
  invoices: [],
  payments: [],
  templates: [],
  staff: [],
  users: [],
};

export function AppProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = async () => {
    const result = await request('/api/bootstrap');
    setData(Object.fromEntries(
      Object.keys(initialData).map((collection) => [collection, result[collection] || []]),
    ));
  };

  useEffect(() => {
    let active = true;

    async function restoreSession() {
      try {
        const { user } = await request('/api/auth/session');
        if (user) {
          const result = await request('/api/bootstrap');
          if (active) {
            setData(Object.fromEntries(
              Object.keys(initialData).map((collection) => [collection, result[collection] || []]),
            ));
            setCurrentUser(user);
          }
        }
      } catch (requestError) {
        if (active) setError(requestError.message);
      } finally {
        if (active) setLoading(false);
      }
    }

    restoreSession();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!['admin', 'staff'].includes(currentUser?.role)) return undefined;

    let active = true;
    const refresh = async () => {
      try {
        const result = await request('/api/bootstrap');
        if (active) {
          setData(Object.fromEntries(
            Object.keys(initialData).map((collection) => [collection, result[collection] || []]),
          ));
        }
      } catch (requestError) {
        if (active) setError(requestError.message);
      }
    };
    const refreshWhenVisible = () => {
      if (document.visibilityState === 'visible') refresh();
    };
    const intervalId = window.setInterval(refreshWhenVisible, 5000);
    window.addEventListener('focus', refreshWhenVisible);

    return () => {
      active = false;
      window.clearInterval(intervalId);
      window.removeEventListener('focus', refreshWhenVisible);
    };
  }, [currentUser?.role]);

  const perform = async (operation) => {
    try {
      const result = await operation();
      setError('');
      return result;
    } catch (requestError) {
      setError(requestError.message);
      return null;
    }
  };

  const login = async (email, password) => {
    try {
      const { user } = await request('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      await loadData();
      setCurrentUser(user);
      setError('');
      return { ok: true, user };
    } catch (requestError) {
      return { ok: false, error: requestError.message };
    }
  };

  const register = async (name, email, password, company, phone, address) => {
    try {
      const { user } = await request('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password, company, phone, address }),
      });
      await loadData();
      setCurrentUser(user);
      setError('');
      return { ok: true, user };
    } catch (requestError) {
      return { ok: false, error: requestError.message };
    }
  };

  const logout = async () => {
    await perform(async () => {
      await request('/api/auth/logout', { method: 'POST' });
      setCurrentUser(null);
      setData(initialData);
    });
  };

  const createRecord = (collection, fields) => perform(async () => {
    const { record } = await request(`/api/data/${collection}`, {
      method: 'POST',
      body: JSON.stringify(fields),
    });
    setData((current) => ({
      ...current,
      [collection]: [...current[collection], record],
    }));
    return record;
  });

  const updateRecord = (collection, id, fields) => perform(async () => {
    const { record } = await request(`/api/data/${collection}/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: JSON.stringify(fields),
    });
    setData((current) => ({
      ...current,
      [collection]: current[collection].map((item) => item.id === id ? record : item),
    }));
    return record;
  });

  const addProduct = (product) => createRecord('products', {
    ...product,
    variants: product.variants || [],
  });
  const updateProduct = (id, fields) => updateRecord('products', id, fields);
  const archiveProduct = (id) => updateProduct(id, { status: 'archived' });

  const addPlan = (plan) => createRecord('plans', { ...plan, status: 'active' });
  const updatePlan = (id, fields) => updateRecord('plans', id, fields);

  const addCustomer = (customer) => createRecord('customers', {
    ...customer,
    createdAt: new Date().toISOString().split('T')[0],
  });
  const updateCustomer = (id, fields) => updateRecord('customers', id, fields);

  const addSubscription = (subscription) => createRecord('subscriptions', {
    ...subscription,
    discountId: subscription.discountId || null,
    templateId: subscription.templateId || null,
    number: `SUB-${String(data.subscriptions.length + 1).padStart(3, '0')}`,
    status: 'draft',
  });
  const updateSubscription = (id, fields) => updateRecord('subscriptions', id, fields);

  const generateInvoices = () => perform(async () => {
    const dueSubscriptions = data.subscriptions.filter((subscription) => subscription.status === 'active');
    const newInvoices = dueSubscriptions.map((subscription) => {
      const existing = data.invoices.find((invoice) => (
        invoice.subscriptionId === subscription.id
        && invoice.status !== 'paid'
        && invoice.status !== 'void'
      ));
      if (existing) return null;

      const plan = data.plans.find((item) => item.id === subscription.planId);
      const subtotal = subscription.qty * subscription.unitPrice;
      return {
        number: `INV-${String((data.invoices.length + Math.random() * 100) | 0).padStart(4, '0')}`,
        subscriptionId: subscription.id,
        customerId: subscription.customerId,
        status: 'draft',
        issueDate: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
        lines: [{
          product: plan?.name || 'Plan',
          qty: subscription.qty,
          unitPrice: subscription.unitPrice,
          tax: 18,
          discount: 0,
        }],
        subtotal,
        taxAmount: subtotal * 0.18,
        discountAmount: 0,
        total: subtotal * 1.18,
        notes: '',
      };
    }).filter(Boolean);

    for (const invoice of newInvoices) {
      const { record } = await request('/api/data/invoices', {
        method: 'POST',
        body: JSON.stringify(invoice),
      });
      setData((current) => ({ ...current, invoices: [...current.invoices, record] }));
    }
    return newInvoices.length;
  });

  const addInvoice = (invoice) => createRecord('invoices', {
    ...invoice,
    number: `INV-${String(data.invoices.length + 1).padStart(4, '0')}`,
  });
  const updateInvoice = (id, fields) => updateRecord('invoices', id, fields);

  const addPayment = (payment) => perform(async () => {
    const { record } = await request('/api/data/payments', {
      method: 'POST',
      body: JSON.stringify(payment),
    });
    setData((current) => ({
      ...current,
      payments: [...current.payments, record],
      invoices: payment.amount >= (current.invoices.find((invoice) => invoice.id === payment.invoiceId)?.total ?? Infinity)
        ? current.invoices.map((invoice) => invoice.id === payment.invoiceId
          ? { ...invoice, status: 'paid' }
          : invoice)
        : current.invoices,
    }));
    return record;
  });

  const addTax = (tax) => createRecord('taxes', tax);
  const updateTax = (id, fields) => updateRecord('taxes', id, fields);
  const addDiscount = (discount) => createRecord('discounts', {
    ...discount,
    usedCount: 0,
    status: 'active',
  });
  const updateDiscount = (id, fields) => updateRecord('discounts', id, fields);

  const addStaff = (staffMember) => perform(async () => {
    const { staff, user } = await request('/api/staff', {
      method: 'POST',
      body: JSON.stringify(staffMember),
    });
    setData((current) => ({
      ...current,
      staff: [...current.staff, staff],
      users: [...current.users, user],
    }));
    return staff;
  });

  const updateStaffStatus = (id, status) => perform(async () => {
    const { staff } = await request(`/api/staff/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    setData((current) => ({
      ...current,
      staff: current.staff.map((member) => member.id === id ? staff : member),
    }));
    return staff;
  });

  const deactivateStaff = (id) => {
    const member = data.staff.find((staffMember) => staffMember.id === id);
    if (!member) return;
    return updateStaffStatus(id, member.status === 'active' ? 'inactive' : 'active');
  };

  const addTemplate = (template) => createRecord('templates', template);

  const monthlyRecurringRevenue = data.subscriptions
    .filter((subscription) => subscription.status === 'active')
    .reduce((total, subscription) => {
      const cycle = data.plans.find((plan) => plan.id === subscription.planId)?.cycle?.toLowerCase();
      const months = cycle?.includes('year') || cycle?.includes('annual')
        ? 12
        : cycle?.includes('quarter')
          ? 3
          : 1;
      return total + subscription.qty * subscription.unitPrice / months;
    }, 0);

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
  const [rates] = useState(STATIC_RATES);

  const formatMoney = (amount) => {
    if (amount == null) return '';
    const rate = rates[currentCurrency] || 1;
    const converted = amount * rate;
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: currentCurrency,
    }).format(converted);
  };

  return (
    <AppContext.Provider value={{
      currentUser,
      login,
      register,
      logout,
      loading,
      error,
      clearError: () => setError(''),
      products: data.products,
      addProduct,
      updateProduct,
      archiveProduct,
      plans: data.plans,
      addPlan,
      updatePlan,
      customers: data.customers,
      addCustomer,
      updateCustomer,
      subscriptions: data.subscriptions,
      addSubscription,
      updateSubscription,
      invoices: data.invoices,
      generateInvoices,
      addInvoice,
      updateInvoice,
      payments: data.payments,
      addPayment,
      taxes: data.taxes,
      addTax,
      updateTax,
      discounts: data.discounts,
      addDiscount,
      updateDiscount,
      staff: data.staff,
      addStaff,
      deactivateStaff,
      templates: data.templates,
      addTemplate,
      users: data.users,
      monthlyRecurringRevenue,
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

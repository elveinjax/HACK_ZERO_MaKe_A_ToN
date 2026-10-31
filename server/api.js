import express from 'express';
import session from 'express-session';
import { randomUUID } from 'node:crypto';
import {
  createUser,
  findUserByEmail,
  getRecord,
  getUser,
  insertRecord,
  isForeignKeyError,
  isUniqueConstraintError,
  listRecords,
  listUsers,
  updateRecord,
  updateUser,
  verifyPassword,
  withTransaction,
} from './db.js';

const app = express();
const collections = new Set([
  'products',
  'plans',
  'customers',
  'subscriptions',
  'taxes',
  'discounts',
  'invoices',
  'payments',
  'templates',
]);
const nullableReferences = {
  plans: ['productId'],
  customers: ['owner'],
  subscriptions: ['discountId', 'templateId'],
  discounts: ['productId'],
  invoices: ['subscriptionId'],
  templates: ['planId'],
};
const staffPasswordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,}$/;

function normalizeReferences(entity, record) {
  for (const field of nullableReferences[entity] || []) {
    if (record[field] === '') record[field] = null;
  }
  return record;
}

app.use(express.json({ limit: '1mb' }));
app.use(session({
  secret: process.env.SESSION_SECRET || randomUUID(),
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, sameSite: 'lax', secure: false, maxAge: 8 * 60 * 60 * 1000 },
}));

function currentUser(req) {
  return req.session.userId ? getUser(req.session.userId) : null;
}

function requireUser(req, res, next) {
  if (!currentUser(req)) return res.status(401).json({ error: 'Please sign in to continue.' });
  next();
}

function requireAdmin(req, res, next) {
  if (currentUser(req)?.role !== 'admin') return res.status(403).json({ error: 'Administrator access is required.' });
  next();
}

function requireStaff(req, res, next) {
  if (!['admin', 'staff'].includes(currentUser(req)?.role)) {
    return res.status(403).json({ error: 'Staff access is required.' });
  }
  next();
}

function sendDatabaseError(res, error) {
  if (isUniqueConstraintError(error)) {
    return res.status(409).json({ error: 'An account with that email already exists.' });
  }
  if (isForeignKeyError(error)) {
    return res.status(400).json({ error: 'This record references data that does not exist.' });
  }
  console.error('Database operation failed:', error);
  return res.status(500).json({ error: 'The database operation failed.' });
}

app.get('/api/auth/session', (req, res) => {
  const user = currentUser(req);
  if (!user) return res.json({ user: null });
  res.json({ user });
});

app.post('/api/auth/login', (req, res) => {
  const email = typeof req.body.email === 'string' ? req.body.email.trim() : '';
  const password = typeof req.body.password === 'string' ? req.body.password : '';
  const account = findUserByEmail(email);

  if (!account || !verifyPassword(password, account.passwordHash)) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  if (account.user.role === 'staff') {
    const staff = getRecord('staff', account.user.id);
    if (!staff || staff.status !== 'active') {
      return res.status(403).json({ error: 'This staff account is inactive.' });
    }
  }

  req.session.userId = account.user.id;
  res.json({ user: account.user });
});

app.post('/api/auth/register', (req, res) => {
  const name = typeof req.body.name === 'string' ? req.body.name.trim() : '';
  const company = typeof req.body.company === 'string' ? req.body.company.trim() : name;
  const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  const password = typeof req.body.password === 'string' ? req.body.password : '';
  const phone = typeof req.body.phone === 'string' ? req.body.phone.trim() : '';
  const address = typeof req.body.address === 'string' ? req.body.address.trim() : '';

  if (!name || !company || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !staffPasswordPattern.test(password)) {
    return res.status(400).json({ error: 'Enter a name, company, valid email, and password that meets all strength requirements.' });
  }

  const customer = {
    id: `c${randomUUID()}`,
    company,
    email,
    contact: name,
    phone,
    segment: 'SMB',
    owner: null,
    address,
    taxId: '',
    taxExempt: false,
    createdAt: new Date().toISOString().slice(0, 10),
    notes: '',
  };
  const user = {
    id: `u${randomUUID()}`,
    name,
    email,
    role: 'customer',
    avatar: name.split(/\s+/).map((part) => part[0]).join('').toUpperCase().slice(0, 2),
    customerId: customer.id,
  };

  try {
    withTransaction(() => {
      insertRecord('customers', customer);
      createUser(user, password);
    });
    req.session.userId = user.id;
    res.status(201).json({ user, customer });
  } catch (error) {
    if (isUniqueConstraintError(error)) return res.status(409).json({ error: 'Email already registered.' });
    return sendDatabaseError(res, error);
  }
});

app.post('/api/auth/logout', (req, res, next) => {
  req.session.destroy((error) => {
    if (error) return next(error);
    res.clearCookie('connect.sid');
    res.status(204).end();
  });
});

app.get('/api/bootstrap', requireUser, (req, res) => {
  const data = Object.fromEntries([...collections, 'staff'].map((entity) => [entity, listRecords(entity)]));
  const user = currentUser(req);
  if (user.role !== 'customer') return res.json({ ...data, users: listUsers() });

  const customerId = user.customerId;
  const subscriptions = data.subscriptions.filter((item) => item.customerId === customerId);
  res.json({
    ...data,
    customers: data.customers.filter((customer) => customer.id === customerId),
    subscriptions,
    invoices: data.invoices.filter((invoice) => invoice.customerId === customerId),
    payments: data.payments.filter((payment) => payment.customerId === customerId),
    plans: data.plans.filter((plan) => subscriptions.some((item) => item.planId === plan.id)),
    products: [],
    taxes: [],
    discounts: [],
    templates: [],
    staff: [],
    users: [user],
  });
});

app.post('/api/staff', requireUser, requireAdmin, (req, res) => {
  const { name, email, password } = req.body;
  if (typeof name !== 'string' || !name.trim()
    || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
    || typeof password !== 'string' || !staffPasswordPattern.test(password)) {
    return res.status(400).json({ error: 'Enter a valid name, email, and strong password.' });
  }

  const trimmedName = name.trim();
  const user = {
    id: `u${randomUUID()}`,
    name: trimmedName,
    email: email.trim().toLowerCase(),
    role: 'staff',
    avatar: trimmedName.split(/\s+/).map((part) => part[0]).join('').toUpperCase(),
    status: 'active',
    createdAt: new Date().toISOString().slice(0, 10),
  };

  try {
    withTransaction(() => {
      createUser(user, password);
      insertRecord('staff', user);
    });
    res.status(201).json({ staff: user, user });
  } catch (error) {
    return sendDatabaseError(res, error);
  }
});

app.patch('/api/staff/:id', requireUser, requireAdmin, (req, res) => {
  const status = req.body.status;
  if (status !== 'active' && status !== 'inactive') {
    return res.status(400).json({ error: 'Staff status must be active or inactive.' });
  }

  try {
    const user = getUser(req.params.id);
    if (!user || user.role !== 'staff') return res.status(404).json({ error: 'Staff member not found.' });

    const staff = withTransaction(() => {
      const updatedStaff = updateRecord('staff', req.params.id, { status });
      if (!updatedStaff) return null;
      updateUser({ ...user, status });
      return updatedStaff;
    });
    res.json({ staff });
  } catch (error) {
    return sendDatabaseError(res, error);
  }
});

app.get('/api/data/:entity', requireStaff, (req, res) => {
  if (!collections.has(req.params.entity)) return res.status(404).json({ error: 'Unknown data collection.' });
  res.json({ records: listRecords(req.params.entity) });
});

app.post('/api/data/:entity', requireStaff, (req, res) => {
  const { entity } = req.params;
  if (!collections.has(entity)) return res.status(404).json({ error: 'Unknown data collection.' });
  if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
    return res.status(400).json({ error: 'A record object is required.' });
  }

  const record = normalizeReferences(entity, {
    ...req.body,
    id: req.body.id || `${entity.slice(0, 2)}${randomUUID()}`,
  });
  try {
    if (entity === 'payments') {
      record.status = 'completed';
      withTransaction(() => {
        insertRecord(entity, record);
        const invoice = getRecord('invoices', record.invoiceId);
        if (invoice && record.amount >= invoice.total) {
          updateRecord('invoices', invoice.id, { status: 'paid' });
        }
      });
    } else {
      insertRecord(entity, record);
    }
    res.status(201).json({ record });
  } catch (error) {
    return sendDatabaseError(res, error);
  }
});

app.patch('/api/data/:entity/:id', requireStaff, (req, res) => {
  const { entity } = req.params;
  if (!collections.has(entity)) return res.status(404).json({ error: 'Unknown data collection.' });
  if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
    return res.status(400).json({ error: 'A record update object is required.' });
  }

  try {
    const record = updateRecord(entity, req.params.id, normalizeReferences(entity, { ...req.body }));
    if (!record) return res.status(404).json({ error: 'Record not found.' });
    res.json({ record });
  } catch (error) {
    return sendDatabaseError(res, error);
  }
});

app.use((error, req, res, next) => {
  if (res.headersSent) return next(error);
  console.error('API request failed:', error);
  res.status(500).json({ error: 'The server could not complete this request.' });
});

export default app;

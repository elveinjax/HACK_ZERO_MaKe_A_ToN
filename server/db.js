import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import Database from 'better-sqlite3';
import {
  mockCustomers,
  mockDiscounts,
  mockInvoices,
  mockPayments,
  mockPlans,
  mockProducts,
  mockStaff,
  mockSubscriptions,
  mockTaxes,
  mockTemplates,
  mockUsers,
} from '../src/data/mockData.js';

const databasePath = process.env.DATABASE_PATH || fileURLToPath(new URL('../data/brightloop.sqlite', import.meta.url));
if (databasePath !== ':memory:') mkdirSync(dirname(databasePath), { recursive: true });
const db = new Database(databasePath);

db.pragma('foreign_keys = ON');
db.pragma('journal_mode = WAL');
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    data TEXT NOT NULL CHECK (json_valid(data)),
    password_hash TEXT NOT NULL,
    email TEXT GENERATED ALWAYS AS (json_extract(data, '$.email')) STORED NOT NULL UNIQUE COLLATE NOCASE,
    customer_id TEXT GENERATED ALWAYS AS (json_extract(data, '$.customerId')) STORED
      REFERENCES customers(id) DEFERRABLE INITIALLY DEFERRED
  );
`);

const entities = {
  products: [],
  plans: ['productId'],
  customers: ['owner'],
  subscriptions: ['customerId', 'planId', 'discountId', 'templateId'],
  taxes: [],
  discounts: ['productId'],
  invoices: ['subscriptionId', 'customerId'],
  payments: ['invoiceId', 'customerId'],
  templates: ['planId'],
  staff: [],
};

const foreignKeys = {
  productId: 'products',
  owner: 'users',
  customerId: 'customers',
  planId: 'plans',
  discountId: 'discounts',
  templateId: 'templates',
  subscriptionId: 'subscriptions',
  invoiceId: 'invoices',
};

for (const [name, references] of Object.entries(entities)) {
  const generatedColumns = references.map((field) => {
    const table = foreignKeys[field];
    return `, "${field}" TEXT GENERATED ALWAYS AS (json_extract(data, '$.${field}')) STORED
      REFERENCES "${table}"(id) DEFERRABLE INITIALLY DEFERRED`;
  }).join('');

  db.exec(`
    CREATE TABLE IF NOT EXISTS "${name}" (
      id TEXT PRIMARY KEY,
      data TEXT NOT NULL CHECK (json_valid(data))
      ${generatedColumns}
    );
  `);
}

const encode = (record) => JSON.stringify(record);
const insertEntity = (table, record) => {
  db.prepare(`INSERT INTO "${table}" (id, data) VALUES (?, ?)`).run(record.id, encode(record));
};

function hashPassword(password) {
  const salt = randomBytes(16);
  const hash = scryptSync(password, salt, 64);
  return `${salt.toString('hex')}:${hash.toString('hex')}`;
}

const userInsert = db.prepare('INSERT INTO users (id, data, password_hash) VALUES (?, ?, ?)');

const userById = new Map(mockUsers.map((user) => [user.id, user]));
for (const staff of mockStaff) {
  const user = userById.get(staff.id);
  if (user) userById.set(staff.id, { ...user, ...staff });
}

const seed = db.transaction(() => {
  for (const product of mockProducts) insertEntity('products', product);
  for (const plan of mockPlans) insertEntity('plans', plan);
  for (const customer of mockCustomers) insertEntity('customers', customer);

  for (const user of userById.values()) {
    const { password, ...publicUser } = user;
    userInsert.run(user.id, encode(publicUser), hashPassword(password));
  }

  for (const discount of mockDiscounts) insertEntity('discounts', discount);
  for (const tax of mockTaxes) insertEntity('taxes', tax);
  for (const template of mockTemplates) insertEntity('templates', template);
  for (const subscription of mockSubscriptions) insertEntity('subscriptions', subscription);
  for (const invoice of mockInvoices) insertEntity('invoices', invoice);
  for (const payment of mockPayments) insertEntity('payments', payment);
  for (const staff of mockStaff) insertEntity('staff', staff);
});

if (db.prepare('SELECT COUNT(*) AS count FROM users').get().count === 0) {
  db.pragma('defer_foreign_keys = ON');
  seed();
}

export function listRecords(entity) {
  return db.prepare(`SELECT data FROM "${entity}" ORDER BY rowid`).all().map(({ data }) => JSON.parse(data));
}

export function listUsers() {
  return db.prepare('SELECT data FROM users ORDER BY rowid').all().map(({ data }) => JSON.parse(data));
}

export function getRecord(entity, id) {
  const row = db.prepare(`SELECT data FROM "${entity}" WHERE id = ?`).get(id);
  return row ? JSON.parse(row.data) : null;
}

export function insertRecord(entity, record) {
  insertEntity(entity, record);
  return record;
}

export function updateRecord(entity, id, updates) {
  const existing = getRecord(entity, id);
  if (!existing) return null;

  const updated = { ...existing, ...updates, id: existing.id };
  db.prepare(`UPDATE "${entity}" SET data = ? WHERE id = ?`).run(encode(updated), id);
  return updated;
}

export function createUser(user, password) {
  userInsert.run(user.id, encode(user), hashPassword(password));
  return user;
}

export function updateUser(user) {
  db.prepare('UPDATE users SET data = ? WHERE id = ?').run(encode(user), user.id);
  return user;
}

export function findUserByEmail(email) {
  const row = db.prepare('SELECT data, password_hash FROM users WHERE email = ? COLLATE NOCASE').get(email);
  return row ? { user: JSON.parse(row.data), passwordHash: row.password_hash } : null;
}

export function getUser(id) {
  const row = db.prepare('SELECT data FROM users WHERE id = ?').get(id);
  return row ? JSON.parse(row.data) : null;
}

export function verifyPassword(password, storedHash) {
  const [saltHex, hashHex] = storedHash.split(':');
  if (!saltHex || !hashHex) return false;
  const expected = Buffer.from(hashHex, 'hex');
  const actual = scryptSync(password, Buffer.from(saltHex, 'hex'), expected.length);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export function withTransaction(callback) {
  return db.transaction(callback)();
}

const linkUnmatchedCustomers = db.transaction(() => {
  const users = db.prepare("SELECT data FROM users WHERE json_extract(data, '$.role') = 'customer'").all();

  for (const { data } of users) {
    const user = JSON.parse(data);
    if (user.customerId) continue;

    const customer = {
      id: `c${randomBytes(12).toString('hex')}`,
      company: user.name,
      email: user.email,
      contact: user.name,
      phone: '',
      segment: 'SMB',
      owner: null,
      address: '',
      taxId: '',
      taxExempt: false,
      createdAt: new Date().toISOString().slice(0, 10),
      notes: '',
    };

    insertEntity('customers', customer);
    updateUser({ ...user, customerId: customer.id });
  }
});

linkUnmatchedCustomers();

export function isUniqueConstraintError(error) {
  return error.code === 'SQLITE_CONSTRAINT_UNIQUE';
}

export function isForeignKeyError(error) {
  return error.code === 'SQLITE_CONSTRAINT_FOREIGNKEY';
}

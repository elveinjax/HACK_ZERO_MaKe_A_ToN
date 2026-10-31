import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, Search, CreditCard, X, CheckCircle, AlertTriangle } from 'lucide-react';

const methodIcons = { card: '💳', bank_transfer: '🏦', wire: '🔗', cash: '💵', cheque: '📝' };
const methodLabel = { card: 'Card', bank_transfer: 'Bank Transfer', wire: 'Wire', cash: 'Cash', cheque: 'Cheque' };

function PaymentModal({ invoices, customers, onClose, onSave }) {
  const [form, setForm] = useState({ invoiceId: '', amount: '', method: 'card', date: new Date().toISOString().split('T')[0], note: '' });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const unpaidInvoices = invoices.filter(i => ['confirmed', 'overdue'].includes(i.status));
  const selectedInv = invoices.find(i => i.id === form.invoiceId);

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">Record Payment</h2>
          <button className="modal-close" onClick={onClose}><X size={16} /></button>
        </div>

        <div className="form-group">
          <label className="form-label">Invoice *</label>
          <select className="form-select" value={form.invoiceId} onChange={e => {
            const inv = invoices.find(i => i.id === e.target.value);
            set('invoiceId', e.target.value);
            if (inv) set('amount', inv.total);
          }}>
            <option value="">Select invoice…</option>
            {unpaidInvoices.map(inv => {
              const cust = customers.find(c => c.id === inv.customerId);
              return <option key={inv.id} value={inv.id}>{inv.number} — {cust?.company} — ${inv.total?.toLocaleString()}</option>;
            })}
          </select>
        </div>

        {selectedInv && (
          <div className="highlight-box" style={{ marginBottom: 'var(--space-md)' }}>
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Invoice Total</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--accent-light)' }}>${selectedInv.total?.toLocaleString()}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Due: {selectedInv.dueDate}</div>
          </div>
        )}

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Amount ($) *</label>
            <input className="form-input" type="number" value={form.amount} onChange={e => set('amount', e.target.value)} placeholder="Amount received" />
          </div>
          <div className="form-group">
            <label className="form-label">Date *</label>
            <input className="form-input" type="date" value={form.date} onChange={e => set('date', e.target.value)} />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Payment Method</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            {Object.entries(methodLabel).map(([key, label]) => (
              <button key={key} type="button" onClick={() => set('method', key)}
                style={{ padding: '10px 8px', borderRadius: 'var(--radius-md)', border: `1px solid ${form.method === key ? 'var(--accent)' : 'var(--border)'}`, background: form.method === key ? 'var(--accent-glow)' : 'var(--bg-elevated)', cursor: 'pointer', fontSize: 13, color: form.method === key ? 'var(--accent-light)' : 'var(--text-secondary)', textAlign: 'center' }}>
                <div style={{ fontSize: 18, marginBottom: 2 }}>{methodIcons[key]}</div>
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Note</label>
          <input className="form-input" value={form.note} onChange={e => set('note', e.target.value)} placeholder="e.g. Wire from Acme Corp" />
        </div>

        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={() => { if (form.invoiceId && form.amount) { onSave({ ...form, amount: Number(form.amount), customerId: selectedInv?.customerId }); onClose(); } }}>
            <CheckCircle size={14} /> Record Payment
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Payments() {
  const { payments, invoices, customers, addPayment } = useApp();
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(false);

  const getCustomer = (id) => customers.find(c => c.id === id);
  const getInvoice = (id) => invoices.find(i => i.id === id);

  const filtered = payments.filter(py => {
    const inv = getInvoice(py.invoiceId);
    const cust = getCustomer(py.customerId);
    const q = search.toLowerCase();
    return inv?.number?.toLowerCase().includes(q) || cust?.company?.toLowerCase().includes(q) || py.method.includes(q);
  });

  const totalCollected = payments.reduce((a, p) => a + p.amount, 0);
  const overdueAmount = invoices.filter(i => i.status === 'overdue').reduce((a, i) => a + i.total, 0);

  return (
    <div className="page-wrapper page-content">
      <div className="page-header">
        <div className="page-title-row">
          <div>
            <h1 className="page-title">Payments</h1>
            <p className="page-subtitle">{payments.length} payments recorded · ${totalCollected.toLocaleString()} total</p>
          </div>
          <button id="record-payment-btn" className="btn btn-primary" onClick={() => setModal(true)}>
            <Plus size={16} /> Record Payment
          </button>
        </div>
      </div>

      {overdueAmount > 0 && (
        <div className="alert alert-error" style={{ marginBottom: 'var(--space-lg)' }}>
          <AlertTriangle size={16} /> ${overdueAmount.toLocaleString()} in overdue invoices require attention.
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-md)', marginBottom: 'var(--space-lg)' }}>
        <div className="card" style={{ padding: 'var(--space-md)' }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Total Collected</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--green)' }}>${totalCollected.toLocaleString()}</div>
        </div>
        <div className="card" style={{ padding: 'var(--space-md)' }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Outstanding</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--amber)' }}>${invoices.filter(i => i.status === 'confirmed').reduce((a, i) => a + i.total, 0).toLocaleString()}</div>
        </div>
        <div className="card" style={{ padding: 'var(--space-md)' }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Overdue</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--red)' }}>${overdueAmount.toLocaleString()}</div>
        </div>
      </div>

      <div className="toolbar">
        <div className="search-box">
          <Search size={16} />
          <input placeholder="Search by invoice, customer, method…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr><th>Date</th><th>Customer</th><th>Invoice</th><th>Method</th><th>Amount</th><th>Note</th><th>Status</th></tr>
          </thead>
          <tbody>
            {filtered.map(py => {
              const inv = getInvoice(py.invoiceId);
              const cust = getCustomer(py.customerId);
              return (
                <tr key={py.id}>
                  <td style={{ fontSize: 13, color: 'var(--text-muted)' }}>{py.date}</td>
                  <td className="td-main">{cust?.company || '—'}</td>
                  <td style={{ fontFamily: 'monospace', fontSize: 13 }}>{inv?.number || '—'}</td>
                  <td>
                    <span style={{ fontSize: 16, marginRight: 6 }}>{methodIcons[py.method]}</span>
                    <span style={{ fontSize: 13 }}>{methodLabel[py.method]}</span>
                  </td>
                  <td className="td-main" style={{ color: 'var(--green)', fontWeight: 700 }}>${py.amount?.toLocaleString()}</td>
                  <td style={{ fontSize: 13, color: 'var(--text-muted)' }}>{py.note || '—'}</td>
                  <td><span className="badge active"><span className="badge-dot" />Completed</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon"><CreditCard size={28} /></div>
            <div className="empty-title">No payments recorded</div>
            <div className="empty-desc">Record payments against outstanding invoices.</div>
            <button className="btn btn-primary" onClick={() => setModal(true)}><Plus size={16} /> Record Payment</button>
          </div>
        )}
      </div>

      {modal && (
        <PaymentModal
          invoices={invoices}
          customers={customers}
          onClose={() => setModal(false)}
          onSave={addPayment}
        />
      )}
    </div>
  );
}

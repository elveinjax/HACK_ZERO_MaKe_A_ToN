import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, Search, BookOpen, X, Edit2, Play, Pause, XCircle, RefreshCw } from 'lucide-react';

const statusOrder = ['Draft', 'Quotation', 'Confirmed', 'Active', 'Closed'];
const statusColor = { draft: 'draft', quotation: 'pending', confirmed: 'confirmed', active: 'active', closed: 'paused', paused: 'paused', trial: 'trial', cancelled: 'cancelled' };

function SubModal({ sub, customers, plans, templates, onClose, onSave }) {
  const [form, setForm] = useState(sub || {
    customerId: '', planId: '', startDate: '', expiryDate: '', paymentTerms: 'Net 30',
    qty: 1, unitPrice: '', notes: '', templateId: '', taxes: [],
  });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const applyTemplate = (tmplId) => {
    const t = templates.find(t => t.id === tmplId);
    if (!t) return;
    const plan = plans.find(p => p.id === t.planId);
    set('planId', t.planId);
    set('unitPrice', plan?.price || '');
    set('templateId', tmplId);
    set('notes', t.notes);
  };

  return (
    <div className="modal-overlay">
      <div className="modal modal-lg">
        <div className="modal-header">
          <h2 className="modal-title">{sub ? 'Edit Subscription' : 'New Subscription'}</h2>
          <button className="modal-close" onClick={onClose}><X size={16} /></button>
        </div>

        {!sub && templates.length > 0 && (
          <div className="form-group">
            <label className="form-label">Start from Template (optional)</label>
            <select className="form-select" value={form.templateId} onChange={e => applyTemplate(e.target.value)}>
              <option value="">— Build from scratch —</option>
              {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
        )}

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Customer *</label>
            <select className="form-select" value={form.customerId} onChange={e => set('customerId', e.target.value)}>
              <option value="">Select customer…</option>
              {customers.map(c => <option key={c.id} value={c.id}>{c.company}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Plan *</label>
            <select className="form-select" value={form.planId} onChange={e => {
              const p = plans.find(pl => pl.id === e.target.value);
              set('planId', e.target.value);
              if (p) set('unitPrice', p.price);
            }}>
              <option value="">Select plan…</option>
              {plans.filter(p => p.status === 'active').map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
        </div>

        <div className="form-row-3">
          <div className="form-group">
            <label className="form-label">Quantity</label>
            <input className="form-input" type="number" min="1" value={form.qty} onChange={e => set('qty', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Unit Price ($)</label>
            <input className="form-input" type="number" value={form.unitPrice} onChange={e => set('unitPrice', e.target.value)} placeholder="Auto-filled from plan" />
          </div>
          <div className="form-group">
            <label className="form-label">Payment Terms</label>
            <select className="form-select" value={form.paymentTerms} onChange={e => set('paymentTerms', e.target.value)}>
              <option>Immediate</option><option>Net 15</option><option>Net 30</option><option>Net 45</option><option>Net 60</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Start Date</label>
            <input className="form-input" type="date" value={form.startDate} onChange={e => set('startDate', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Expiry Date</label>
            <input className="form-input" type="date" value={form.expiryDate} onChange={e => set('expiryDate', e.target.value)} />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Notes</label>
          <textarea className="form-textarea" value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Internal notes…" />
        </div>

        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={() => { onSave(form); onClose(); }}>
            {sub ? 'Save Changes' : 'Create Subscription'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Subscriptions() {
  const { subscriptions, customers, plans, templates, addSubscription, updateSubscription, formatMoney } = useApp();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [modal, setModal] = useState(null);

  const getCustomerName = (id) => customers.find(c => c.id === id)?.company || id;
  const getPlanName = (id) => plans.find(p => p.id === id)?.name || id;

  const filtered = subscriptions.filter(s => {
    const q = search.toLowerCase();
    const match = s.number.toLowerCase().includes(q) || getCustomerName(s.customerId).toLowerCase().includes(q);
    const statusMatch = filter === 'all' || s.status === filter;
    return match && statusMatch;
  });

  const advance = (sub) => {
    const map = { draft: 'quotation', quotation: 'confirmed', confirmed: 'active', active: 'closed' };
    if (map[sub.status]) updateSubscription(sub.id, { status: map[sub.status] });
  };

  return (
    <div className="page-wrapper page-content">
      <div className="page-header">
        <div className="page-title-row">
          <div>
            <h1 className="page-title">Subscriptions</h1>
            <p className="page-subtitle">{subscriptions.filter(s => s.status === 'active').length} active · {subscriptions.length} total</p>
          </div>
          <button id="add-sub-btn" className="btn btn-primary" onClick={() => setModal('add')}>
            <Plus size={16} /> New Subscription
          </button>
        </div>
      </div>

      {/* Status pipeline */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 'var(--space-lg)', overflowX: 'auto', paddingBottom: 4 }}>
        {statusOrder.map((s, i) => (
          <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '8px 16px', textAlign: 'center', minWidth: 100 }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)' }}>{subscriptions.filter(s2 => s2.status === s.toLowerCase()).length}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{s}</div>
            </div>
            {i < statusOrder.length - 1 && <span style={{ color: 'var(--text-dim)', fontSize: 20 }}>→</span>}
          </div>
        ))}
      </div>

      <div className="toolbar">
        <div className="search-box">
          <Search size={16} />
          <input placeholder="Search by number or customer…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        {['all', 'active', 'trial', 'paused', 'cancelled', 'draft'].map(f => (
          <button key={f} className={`btn ${filter === f ? 'btn-primary' : 'btn-ghost'} btn-sm`} onClick={() => setFilter(f)}>{f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}</button>
        ))}
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr><th>#</th><th>Customer</th><th>Plan</th><th>Qty</th><th>Value</th><th>Start</th><th>Expiry</th><th>Terms</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {filtered.map(s => (
              <tr key={s.id}>
                <td className="td-main" style={{ fontFamily: 'monospace', fontSize: 13 }}>{s.number}</td>
                <td className="td-main">{getCustomerName(s.customerId)}</td>
                <td style={{ fontSize: 13 }}>{getPlanName(s.planId)}</td>
                <td>{s.qty}</td>
                <td className="td-main">{formatMoney(s.qty * Number(s.unitPrice))}</td>
                <td style={{ fontSize: 13, color: 'var(--text-muted)' }}>{s.startDate}</td>
                <td style={{ fontSize: 13, color: 'var(--text-muted)' }}>{s.expiryDate}</td>
                <td><span className="inline-badge">{s.paymentTerms}</span></td>
                <td><span className={`badge ${statusColor[s.status]}`}><span className="badge-dot" />{s.status}</span></td>
                <td>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button className="btn btn-ghost btn-sm btn-icon" onClick={() => setModal(s)} title="Edit"><Edit2 size={14} /></button>
                    {s.status === 'active' && <button className="btn btn-ghost btn-sm btn-icon" title="Pause" onClick={() => updateSubscription(s.id, { status: 'paused' })}><Pause size={14} /></button>}
                    {s.status === 'paused' && <button className="btn btn-ghost btn-sm btn-icon" title="Resume" onClick={() => updateSubscription(s.id, { status: 'active' })}><Play size={14} /></button>}
                    {!['active', 'closed', 'cancelled'].includes(s.status) && (
                      <button className="btn btn-ghost btn-sm btn-icon" title="Advance status" onClick={() => advance(s)}><RefreshCw size={14} /></button>
                    )}
                    {s.status === 'active' && <button className="btn btn-ghost btn-sm btn-icon" title="Cancel" onClick={() => updateSubscription(s.id, { status: 'cancelled' })}><XCircle size={14} /></button>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon"><BookOpen size={28} /></div>
            <div className="empty-title">No subscriptions found</div>
            <div className="empty-desc">Create your first subscription or adjust filters.</div>
            <button className="btn btn-primary" onClick={() => setModal('add')}><Plus size={16} /> New Subscription</button>
          </div>
        )}
      </div>

      {modal && (
        <SubModal
          sub={modal === 'add' ? null : modal}
          customers={customers}
          plans={plans}
          templates={templates}
          onClose={() => setModal(null)}
          onSave={form => modal === 'add' ? addSubscription(form) : updateSubscription(modal.id, form)}
        />
      )}
    </div>
  );
}

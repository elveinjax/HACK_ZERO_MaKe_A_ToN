import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, Tag, X, Edit2, ShieldAlert } from 'lucide-react';

function DiscountModal({ discount, products, onClose, onSave }) {
  const [form, setForm] = useState(discount || {
    name: '', type: 'percentage', value: '', minQty: 1, minAmount: 0,
    startDate: '', endDate: '', maxUses: '', scope: 'subscription', productId: '',
  });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="modal-overlay">
      <div className="modal modal-lg">
        <div className="modal-header">
          <h2 className="modal-title">{discount ? 'Edit Discount' : 'Create Discount Rule'}</h2>
          <button className="modal-close" onClick={onClose}><X size={16} /></button>
        </div>

        <div className="alert alert-info" style={{ marginBottom: 'var(--space-md)' }}>
          <ShieldAlert size={16} /> Only admins can create discount rules. They apply automatically on the next invoice.
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Discount Name *</label>
            <input className="form-input" value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Volume 10% Off" />
          </div>
          <div className="form-group">
            <label className="form-label">Type</label>
            <select className="form-select" value={form.type} onChange={e => set('type', e.target.value)}>
              <option value="percentage">Percentage (%)</option>
              <option value="fixed">Fixed Amount ($)</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Value * ({form.type === 'percentage' ? '%' : '$'})</label>
            <input className="form-input" type="number" min="0" value={form.value} onChange={e => set('value', e.target.value)} placeholder={form.type === 'percentage' ? '10' : '500'} />
          </div>
          <div className="form-group">
            <label className="form-label">Max Uses (blank = unlimited)</label>
            <input className="form-input" type="number" min="1" value={form.maxUses} onChange={e => set('maxUses', e.target.value)} placeholder="100" />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Min Quantity</label>
            <input className="form-input" type="number" min="1" value={form.minQty} onChange={e => set('minQty', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Min Amount ($)</label>
            <input className="form-input" type="number" min="0" value={form.minAmount} onChange={e => set('minAmount', e.target.value)} placeholder="0" />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Start Date</label>
            <input className="form-input" type="date" value={form.startDate} onChange={e => set('startDate', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">End Date</label>
            <input className="form-input" type="date" value={form.endDate} onChange={e => set('endDate', e.target.value)} />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Scope</label>
            <select className="form-select" value={form.scope} onChange={e => set('scope', e.target.value)}>
              <option value="subscription">Whole Subscription</option>
              <option value="product">Specific Product</option>
            </select>
          </div>
          {form.scope === 'product' && (
            <div className="form-group">
              <label className="form-label">Product</label>
              <select className="form-select" value={form.productId} onChange={e => set('productId', e.target.value)}>
                <option value="">Select product…</option>
                {products.filter(p => p.status === 'active').map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
          )}
        </div>

        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={() => { onSave(form); onClose(); }}>
            {discount ? 'Save Changes' : 'Create Discount'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Discounts() {
  const { discounts, products, addDiscount, updateDiscount, currentUser } = useApp();
  const [modal, setModal] = useState(null);
  const isAdmin = currentUser?.role === 'admin';

  const getStatus = (d) => {
    if (d.maxUses && d.usedCount >= d.maxUses) return 'expired';
    if (d.endDate && new Date(d.endDate) < new Date()) return 'expired';
    return d.status;
  };

  const getUsagePercent = (d) => d.maxUses ? Math.min((d.usedCount / d.maxUses) * 100, 100) : null;

  return (
    <div className="page-wrapper page-content">
      <div className="page-header">
        <div className="page-title-row">
          <div>
            <h1 className="page-title">Discounts</h1>
            <p className="page-subtitle">Admin-controlled discount rules — auto-applied on invoices</p>
          </div>
          {isAdmin && (
            <button id="add-discount-btn" className="btn btn-primary" onClick={() => setModal('add')}>
              <Plus size={16} /> Create Discount
            </button>
          )}
        </div>
      </div>

      {!isAdmin && (
        <div className="alert alert-error" style={{ marginBottom: 'var(--space-lg)' }}>
          <ShieldAlert size={16} /> Only admins can create or modify discount rules.
        </div>
      )}

      <div className="table-container">
        <table>
          <thead>
            <tr><th>Name</th><th>Type</th><th>Value</th><th>Min Qty</th><th>Dates</th><th>Usage</th><th>Scope</th><th>Status</th>{isAdmin && <th>Actions</th>}</tr>
          </thead>
          <tbody>
            {discounts.map(d => {
              const status = getStatus(d);
              const usagePct = getUsagePercent(d);
              return (
                <tr key={d.id}>
                  <td className="td-main">{d.name}</td>
                  <td><span className="inline-badge">{d.type === 'percentage' ? '%' : '$'}</span></td>
                  <td style={{ fontSize: 18, fontWeight: 800, color: 'var(--accent-light)' }}>
                    {d.type === 'percentage' ? `${d.value}%` : `$${d.value}`}
                  </td>
                  <td>{d.minQty > 1 ? `≥ ${d.minQty} units` : '—'}</td>
                  <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    {d.startDate} → {d.endDate || '∞'}
                  </td>
                  <td style={{ minWidth: 120 }}>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>{d.usedCount} / {d.maxUses || '∞'}</div>
                    {usagePct !== null && (
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${usagePct}%`, background: usagePct >= 100 ? 'var(--red)' : 'var(--grad-brand)' }} />
                      </div>
                    )}
                  </td>
                  <td><span className="inline-badge">{d.scope}</span></td>
                  <td><span className={`badge ${status === 'expired' ? 'overdue' : 'active'}`}><span className="badge-dot" />{status}</span></td>
                  {isAdmin && (
                    <td>
                      <button className="btn btn-ghost btn-sm btn-icon" onClick={() => setModal(d)} title="Edit"><Edit2 size={14} /></button>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
        {discounts.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon"><Tag size={28} /></div>
            <div className="empty-title">No discounts yet</div>
            <div className="empty-desc">Create discount rules to auto-apply on invoices.</div>
            {isAdmin && <button className="btn btn-primary" onClick={() => setModal('add')}><Plus size={16} /> Create Discount</button>}
          </div>
        )}
      </div>

      {modal && isAdmin && (
        <DiscountModal
          discount={modal === 'add' ? null : modal}
          products={products}
          onClose={() => setModal(null)}
          onSave={form => modal === 'add' ? addDiscount(form) : updateDiscount(modal.id, form)}
        />
      )}
    </div>
  );
}

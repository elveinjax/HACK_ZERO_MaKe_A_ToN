import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, Search, Layers, Edit2, X, Check } from 'lucide-react';

function PlanModal({ plan, products, onClose, onSave }) {
  const [form, setForm] = useState(plan || {
    name: '', productId: '', price: '', cycle: 'monthly', minQty: 1,
    startDate: '', endDate: '', autoClose: false, allowPause: true,
    allowEarlyClose: true, allowRenewal: true, trialDays: 0,
  });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="modal-overlay">
      <div className="modal modal-lg">
        <div className="modal-header">
          <h2 className="modal-title">{plan ? 'Edit Plan' : 'Create Plan'}</h2>
          <button className="modal-close" onClick={onClose}><X size={16} /></button>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Plan Name *</label>
            <input className="form-input" value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Starter Monthly" />
          </div>
          <div className="form-group">
            <label className="form-label">Product *</label>
            <select className="form-select" value={form.productId} onChange={e => set('productId', e.target.value)}>
              <option value="">Select product…</option>
              {products.filter(p => p.status === 'active').map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
        </div>

        <div className="form-row-3">
          <div className="form-group">
            <label className="form-label">Price ($) *</label>
            <input className="form-input" type="number" value={form.price} onChange={e => set('price', e.target.value)} placeholder="299" />
          </div>
          <div className="form-group">
            <label className="form-label">Billing Cycle</label>
            <select className="form-select" value={form.cycle} onChange={e => set('cycle', e.target.value)}>
              <option value="daily">Daily</option><option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option><option value="yearly">Yearly</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Min Quantity</label>
            <input className="form-input" type="number" min="1" value={form.minQty} onChange={e => set('minQty', e.target.value)} />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Available From</label>
            <input className="form-input" type="date" value={form.startDate} onChange={e => set('startDate', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Available Until (blank = no end)</label>
            <input className="form-input" type="date" value={form.endDate || ''} onChange={e => set('endDate', e.target.value)} />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Trial Days (0 = no trial)</label>
          <input className="form-input" type="number" min="0" value={form.trialDays} onChange={e => set('trialDays', e.target.value)} style={{ maxWidth: 200 }} />
        </div>

        <div className="divider" />
        <div className="card-title" style={{ marginBottom: 12 }}>Plan Permissions</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {[
            { key: 'autoClose', label: 'Auto-close on end date' },
            { key: 'allowPause', label: 'Allow pause & resume' },
            { key: 'allowEarlyClose', label: 'Allow early closure' },
            { key: 'allowRenewal', label: 'Allow manual renewal' },
          ].map(opt => (
            <label key={opt.key} className="checkbox-label">
              <input type="checkbox" checked={form[opt.key]} onChange={e => set(opt.key, e.target.checked)} />
              {opt.label}
            </label>
          ))}
        </div>

        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={() => { onSave(form); onClose(); }}>
            {plan ? 'Save Changes' : 'Create Plan'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Plans() {
  const { plans, products, addPlan, updatePlan } = useApp();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [modal, setModal] = useState(null);

  const cycleColor = { daily: 'teal', weekly: 'blue', monthly: 'purple', yearly: 'green' };

  const filtered = plans.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || p.status === filter || p.cycle === filter;
    return matchSearch && matchFilter;
  });

  const getProductName = (id) => products.find(p => p.id === id)?.name || id;

  return (
    <div className="page-wrapper page-content">
      <div className="page-header">
        <div className="page-title-row">
          <div>
            <h1 className="page-title">Plans</h1>
            <p className="page-subtitle">{plans.filter(p => p.status === 'active').length} active plans</p>
          </div>
          <button id="add-plan-btn" className="btn btn-primary" onClick={() => setModal('add')}>
            <Plus size={16} /> Create Plan
          </button>
        </div>
      </div>

      <div className="toolbar">
        <div className="search-box">
          <Search size={16} />
          <input placeholder="Search plans…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        {['all', 'monthly', 'yearly', 'weekly', 'daily'].map(f => (
          <button key={f} className={`btn ${filter === f ? 'btn-primary' : 'btn-ghost'} btn-sm`} onClick={() => setFilter(f)}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Plan Name</th><th>Product</th><th>Price</th><th>Cycle</th><th>Min Qty</th><th>Trial</th><th>Permissions</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id}>
                <td className="td-main">{p.name}</td>
                <td>{getProductName(p.productId)}</td>
                <td className="td-main">${Number(p.price).toLocaleString()}</td>
                <td><span className={`badge ${cycleColor[p.cycle] || 'purple'}`}>{p.cycle}</span></td>
                <td>{p.minQty}</td>
                <td>{p.trialDays > 0 ? `${p.trialDays} days` : <span style={{ color: 'var(--text-muted)' }}>—</span>}</td>
                <td>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    {p.allowPause && <span className="inline-badge">Pause</span>}
                    {p.allowEarlyClose && <span className="inline-badge">Early Close</span>}
                    {p.allowRenewal && <span className="inline-badge">Renew</span>}
                    {p.autoClose && <span className="inline-badge">Auto-Close</span>}
                  </div>
                </td>
                <td>
                  <button className="btn btn-ghost btn-sm btn-icon" onClick={() => setModal(p)} title="Edit"><Edit2 size={14} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon"><Layers size={28} /></div>
            <div className="empty-title">No plans found</div>
            <div className="empty-desc">Create your first billing plan.</div>
            <button className="btn btn-primary" onClick={() => setModal('add')}><Plus size={16} /> Create Plan</button>
          </div>
        )}
      </div>

      {modal && (
        <PlanModal
          plan={modal === 'add' ? null : modal}
          products={products}
          onClose={() => setModal(null)}
          onSave={form => modal === 'add' ? addPlan(form) : updatePlan(modal.id, form)}
        />
      )}
    </div>
  );
}

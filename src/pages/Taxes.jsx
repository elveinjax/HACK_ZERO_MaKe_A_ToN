import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, Percent, X, Edit2, ToggleLeft, ToggleRight } from 'lucide-react';

function TaxModal({ tax, onClose, onSave }) {
  const [form, setForm] = useState(tax || { name: '', rate: '', scope: 'all', status: 'active' });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">{tax ? 'Edit Tax Rule' : 'Add Tax Rule'}</h2>
          <button className="modal-close" onClick={onClose}><X size={16} /></button>
        </div>
        <div className="form-group">
          <label className="form-label">Tax Name *</label>
          <input className="form-input" value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. GST, VAT, Sales Tax" />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Rate (%) *</label>
            <input className="form-input" type="number" min="0" max="100" value={form.rate} onChange={e => set('rate', e.target.value)} placeholder="18" />
          </div>
          <div className="form-group">
            <label className="form-label">Scope</label>
            <select className="form-select" value={form.scope} onChange={e => set('scope', e.target.value)}>
              <option value="all">All customers</option>
              <option value="enterprise">Enterprise only</option>
              <option value="smb">SMB only</option>
            </select>
          </div>
        </div>
        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={() => { onSave(form); onClose(); }}>
            {tax ? 'Save Changes' : 'Add Tax Rule'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Taxes() {
  const { taxes, addTax, updateTax } = useApp();
  const [modal, setModal] = useState(null);

  return (
    <div className="page-wrapper page-content">
      <div className="page-header">
        <div className="page-title-row">
          <div>
            <h1 className="page-title">Tax Rules</h1>
            <p className="page-subtitle">Configure automatic tax calculation rules</p>
          </div>
          <button id="add-tax-btn" className="btn btn-primary" onClick={() => setModal('add')}>
            <Plus size={16} /> Add Tax Rule
          </button>
        </div>
      </div>

      <div className="alert alert-info" style={{ marginBottom: 'var(--space-lg)' }}>
        <Percent size={16} /> Tax rules are applied automatically during invoice generation. Tax-exempt customers are always excluded.
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr><th>Tax Name</th><th>Rate</th><th>Scope</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {taxes.map(t => (
              <tr key={t.id}>
                <td className="td-main">{t.name}</td>
                <td>
                  <span style={{ fontSize: 20, fontWeight: 800, color: 'var(--accent-light)' }}>{t.rate}</span>
                  <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>%</span>
                </td>
                <td><span className="inline-badge">{t.scope}</span></td>
                <td><span className={`badge ${t.status === 'active' ? 'active' : 'draft'}`}><span className="badge-dot" />{t.status}</span></td>
                <td>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="btn btn-ghost btn-sm btn-icon" onClick={() => setModal(t)} title="Edit"><Edit2 size={14} /></button>
                    <button className="btn btn-ghost btn-sm btn-icon" onClick={() => updateTax(t.id, { status: t.status === 'active' ? 'inactive' : 'active' })} title="Toggle">
                      {t.status === 'active' ? <ToggleRight size={16} style={{ color: 'var(--green)' }} /> : <ToggleLeft size={16} />}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <TaxModal
          tax={modal === 'add' ? null : modal}
          onClose={() => setModal(null)}
          onSave={form => modal === 'add' ? addTax(form) : updateTax(modal.id, form)}
        />
      )}
    </div>
  );
}

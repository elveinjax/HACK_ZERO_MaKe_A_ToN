import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Plus, Search, Users, Edit2, X, Mail, Phone, MapPin, Building2 } from 'lucide-react';

function CustomerModal({ customer, onClose, onSave }) {
  const [form, setForm] = useState(customer || { company: '', email: '', contact: '', phone: '', segment: 'SMB', address: '', taxId: '', taxExempt: false, notes: '' });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="modal-overlay">
      <div className="modal modal-lg">
        <div className="modal-header">
          <h2 className="modal-title">{customer ? 'Edit Customer' : 'Add Customer'}</h2>
          <button className="modal-close" onClick={onClose}><X size={16} /></button>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Company Name *</label>
            <input className="form-input" value={form.company} onChange={e => set('company', e.target.value)} placeholder="Acme Corp" />
          </div>
          <div className="form-group">
            <label className="form-label">Segment</label>
            <select className="form-select" value={form.segment} onChange={e => set('segment', e.target.value)}>
              <option>SMB</option><option>Enterprise</option><option>Trial</option><option>Non-profit</option>
            </select>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Billing Email *</label>
            <input className="form-input" type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="billing@company.com" />
          </div>
          <div className="form-group">
            <label className="form-label">Contact Person</label>
            <input className="form-input" value={form.contact} onChange={e => set('contact', e.target.value)} placeholder="Jane Smith" />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Phone</label>
            <input className="form-input" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+1 555-0000" />
          </div>
          <div className="form-group">
            <label className="form-label">Tax ID</label>
            <input className="form-input" value={form.taxId} onChange={e => set('taxId', e.target.value)} placeholder="US-12345" />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Billing Address</label>
          <input className="form-input" value={form.address} onChange={e => set('address', e.target.value)} placeholder="123 Main St, City, State" />
        </div>
        <div className="form-group">
          <label className="form-label">Internal Notes</label>
          <textarea className="form-textarea" value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Any notes about this customer…" />
        </div>
        <label className="checkbox-label" style={{ marginBottom: 'var(--space-md)' }}>
          <input type="checkbox" checked={form.taxExempt} onChange={e => set('taxExempt', e.target.checked)} />
          Tax Exempt (no taxes will be applied to invoices)
        </label>
        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={() => { onSave(form); onClose(); }}>
            {customer ? 'Save Changes' : 'Add Customer'}
          </button>
        </div>
      </div>
    </div>
  );
}

const segmentColor = { Enterprise: 'purple', SMB: 'teal', Trial: 'amber', 'Non-profit': 'green' };

export default function Customers() {
  const navigate = useNavigate();
  const { customers, subscriptions, invoices, addCustomer, updateCustomer, formatMoney } = useApp();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [modal, setModal] = useState(null);
  const [detail, setDetail] = useState(null);

  const filtered = customers.filter(c => {
    const q = search.toLowerCase();
    const match = c.company.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || c.contact?.toLowerCase().includes(q);
    const seg = filter === 'all' || c.segment === filter;
    return match && seg;
  });

  const getSubCount = (cid) => subscriptions.filter(s => s.customerId === cid && s.status === 'active').length;
  const getOutstanding = (cid) => invoices.filter(i => i.customerId === cid && ['confirmed', 'overdue'].includes(i.status)).reduce((a, i) => a + i.total, 0);

  return (
    <div className="page-wrapper page-content">
      <div className="page-header">
        <div className="page-title-row">
          <div>
            <h1 className="page-title">Customers</h1>
            <p className="page-subtitle">{customers.length} total customers</p>
          </div>
          <button id="add-customer-btn" className="btn btn-primary" onClick={() => setModal('add')}>
            <Plus size={16} /> Add Customer
          </button>
        </div>
      </div>

      <div className="toolbar">
        <div className="search-box">
          <Search size={16} />
          <input placeholder="Search by company, email, contact…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        {['all', 'Enterprise', 'SMB', 'Trial'].map(f => (
          <button key={f} className={`btn ${filter === f ? 'btn-primary' : 'btn-ghost'} btn-sm`} onClick={() => setFilter(f)}>{f === 'all' ? 'All' : f}</button>
        ))}
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr><th>Company</th><th>Contact</th><th>Segment</th><th>Active Subs</th><th>Outstanding</th><th>Tax</th><th>Since</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {filtered.map(c => (
              <tr key={c.id} onClick={() => setDetail(c)} style={{ cursor: 'pointer' }}>
                <td>
                  <div className="td-main">{c.company}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Mail size={10} />{c.email}
                  </div>
                </td>
                <td>
                  <div style={{ fontSize: 13 }}>{c.contact}</div>
                  {c.phone && <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{c.phone}</div>}
                </td>
                <td><span className={`badge ${segmentColor[c.segment] || 'purple'}`}>{c.segment}</span></td>
                <td className="td-main">{getSubCount(c.id)}</td>
                <td style={{ color: getOutstanding(c.id) > 0 ? 'var(--amber)' : 'var(--text-muted)' }}>
                  {formatMoney(getOutstanding(c.id))}
                </td>
                <td>{c.taxExempt ? <span className="badge teal">Exempt</span> : <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>Taxed</span>}</td>
                <td style={{ fontSize: 13, color: 'var(--text-muted)' }}>{c.createdAt}</td>
                <td>
                  <button className="btn btn-ghost btn-sm btn-icon" onClick={e => { e.stopPropagation(); setModal(c); }} title="Edit"><Edit2 size={14} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon"><Users size={28} /></div>
            <div className="empty-title">No customers found</div>
            <div className="empty-desc">Add your first customer to get started.</div>
            <button className="btn btn-primary" onClick={() => setModal('add')}><Plus size={16} /> Add Customer</button>
          </div>
        )}
      </div>

      {/* Detail Panel */}
      {detail && (
        <div className="modal-overlay" onClick={() => setDetail(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{detail.company}</h2>
              <button className="modal-close" onClick={() => setDetail(null)}><X size={16} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { icon: Mail, label: 'Email', value: detail.email },
                { icon: Phone, label: 'Phone', value: detail.phone || '—' },
                { icon: Building2, label: 'Contact', value: detail.contact || '—' },
                { icon: MapPin, label: 'Address', value: detail.address || '—' },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <item.icon size={16} style={{ color: 'var(--accent-light)', marginTop: 2, flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{item.label}</div>
                    <div style={{ fontSize: 14, color: 'var(--text-primary)' }}>{item.value}</div>
                  </div>
                </div>
              ))}
              <div className="divider" />
              <div style={{ display: 'flex', gap: 'var(--space-lg)' }}>
                <div><div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Active Subs</div><div style={{ fontSize: 20, fontWeight: 700, color: 'var(--accent-light)' }}>{getSubCount(detail.id)}</div></div>
                <div><div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Outstanding</div><div style={{ fontSize: 20, fontWeight: 700, color: 'var(--amber)' }}>{formatMoney(getOutstanding(detail.id))}</div></div>
                <div><div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Tax Exempt</div><div style={{ fontSize: 20, fontWeight: 700, color: detail.taxExempt ? 'var(--green)' : 'var(--text-muted)' }}>{detail.taxExempt ? 'Yes' : 'No'}</div></div>
              </div>
              {detail.notes && <div className="highlight-box" style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{detail.notes}</div>}
            </div>
            <div className="modal-actions">
              <button
                className="btn btn-primary"
                onClick={() => navigate('/subscriptions', { state: { customerId: detail.id } })}
              >
                <Plus size={14} /> New Subscription
              </button>
              <button className="btn btn-secondary" onClick={() => { setModal(detail); setDetail(null); }}><Edit2 size={14} /> Edit</button>
            </div>
          </div>
        </div>
      )}

      {modal && (
        <CustomerModal
          customer={modal === 'add' ? null : modal}
          onClose={() => setModal(null)}
          onSave={form => modal === 'add' ? addCustomer(form) : updateCustomer(modal.id, form)}
        />
      )}
    </div>
  );
}

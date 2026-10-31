import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, ShieldCheck, X, UserX, UserCheck, Building2, Mail, Lock } from 'lucide-react';

function StaffModal({ onClose, onSave }) {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">Add Staff Member</h2>
          <button className="modal-close" onClick={onClose}><X size={16} /></button>
        </div>
        <div className="alert alert-info" style={{ marginBottom: 'var(--space-md)' }}>
          <ShieldCheck size={16} /> Only the Admin can create staff accounts.
        </div>
        <div className="form-group">
          <label className="form-label">Full Name *</label>
          <input className="form-input" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Jane Smith" />
        </div>
        <div className="form-group">
          <label className="form-label">Email Address *</label>
          <input className="form-input" type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="jane@brightloop.io" />
        </div>
        <div className="form-group">
          <label className="form-label">Temporary Password *</label>
          <input className="form-input" type="password" value={form.password} onChange={e => set('password', e.target.value)} placeholder="Min 8 chars, uppercase, special char" />
        </div>
        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={() => { if (form.name && form.email && form.password) { onSave(form); onClose(); } }}>
            Add Staff Member
          </button>
        </div>
      </div>
    </div>
  );
}

const rolePermissions = {
  admin: ['Full system access', 'Create/delete staff', 'Manage products & plans', 'Create discounts', 'View all reports', 'System settings'],
  staff: ['Manage customers', 'Manage subscriptions', 'Create invoices', 'Record payments', 'View reports'],
  customer: ['View own subscriptions', 'Download invoices', 'View payment history', 'Upgrade/cancel plans'],
};

export default function Settings() {
  const { staff, addStaff, deactivateStaff, currentUser } = useApp();
  const [modal, setModal] = useState(false);
  const isAdmin = currentUser?.role === 'admin';

  return (
    <div className="page-wrapper page-content">
      <div className="page-header">
        <div className="page-title-row">
          <div>
            <h1 className="page-title">Staff & Roles</h1>
            <p className="page-subtitle">Manage team access and permissions</p>
          </div>
          {isAdmin && (
            <button id="add-staff-btn" className="btn btn-primary" onClick={() => setModal(true)}>
              <Plus size={16} /> Add Staff Member
            </button>
          )}
        </div>
      </div>

      {/* Role Cards */}
      <div className="grid-3" style={{ marginBottom: 'var(--space-xl)' }}>
        {Object.entries(rolePermissions).map(([role, perms]) => (
          <div key={role} className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 'var(--space-md)' }}>
              <div className={`stat-icon ${role === 'admin' ? 'purple' : role === 'staff' ? 'teal' : 'green'}`} style={{ width: 36, height: 36 }}>
                <ShieldCheck size={18} />
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', textTransform: 'capitalize' }}>{role}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{role === 'admin' ? 'System owner' : role === 'staff' ? 'Internal team' : 'End customer'}</div>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {perms.map(p => (
                <div key={p} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-secondary)' }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', flexShrink: 0 }} /> {p}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Staff Table */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">Staff Members</div>
          <span className="badge purple">{staff.length} total</span>
        </div>
        <div className="table-container">
          <table>
            <thead>
              <tr><th>Name</th><th>Email</th><th>Role</th><th>Member Since</th><th>Status</th>{isAdmin && <th>Actions</th>}</tr>
            </thead>
            <tbody>
              {/* Admin row */}
              <tr>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div className="user-avatar" style={{ width: 28, height: 28, fontSize: 11 }}>{currentUser?.avatar}</div>
                    <span className="td-main">{currentUser?.name} (You)</span>
                  </div>
                </td>
                <td style={{ fontSize: 13 }}>{currentUser?.email}</td>
                <td><span className="badge purple">Admin</span></td>
                <td style={{ fontSize: 13, color: 'var(--text-muted)' }}>2024-01-01</td>
                <td><span className="badge active"><span className="badge-dot" />Active</span></td>
                {isAdmin && <td></td>}
              </tr>
              {staff.map(s => (
                <tr key={s.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div className="user-avatar" style={{ width: 28, height: 28, fontSize: 11 }}>{s.avatar}</div>
                      <span className="td-main">{s.name}</span>
                    </div>
                  </td>
                  <td style={{ fontSize: 13 }}>{s.email}</td>
                  <td><span className="badge teal">Staff</span></td>
                  <td style={{ fontSize: 13, color: 'var(--text-muted)' }}>{s.createdAt}</td>
                  <td><span className={`badge ${s.status === 'active' ? 'active' : 'cancelled'}`}><span className="badge-dot" />{s.status}</span></td>
                  {isAdmin && (
                    <td>
                      <button
                        className={`btn btn-sm ${s.status === 'active' ? 'btn-danger' : 'btn-secondary'}`}
                        onClick={() => deactivateStaff(s.id)}
                        title={s.status === 'active' ? 'Deactivate' : 'Reactivate'}
                      >
                        {s.status === 'active' ? <><UserX size={14} /> Deactivate</> : <><UserCheck size={14} /> Reactivate</>}
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Company Settings */}
      <div className="card" style={{ marginTop: 'var(--space-xl)' }}>
        <div className="card-header">
          <div className="card-title">Company Settings</div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Company Name</label>
            <div style={{ position: 'relative' }}>
              <Building2 size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input className="form-input" style={{ paddingLeft: 38 }} defaultValue="Brightloop Software" />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Billing Email</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input className="form-input" style={{ paddingLeft: 38 }} defaultValue="billing@brightloop.io" />
            </div>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Tax ID</label>
            <input className="form-input" defaultValue="US-BL-99999" />
          </div>
          <div className="form-group">
            <label className="form-label">Default Payment Terms</label>
            <select className="form-select" defaultValue="Net 30">
              <option>Immediate</option><option>Net 15</option><option>Net 30</option><option>Net 45</option>
            </select>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--space-md)' }}>
          <button className="btn btn-primary" onClick={() => alert('Settings saved!')}>Save Settings</button>
        </div>
      </div>

      {modal && isAdmin && (
        <StaffModal onClose={() => setModal(false)} onSave={addStaff} />
      )}
    </div>
  );
}

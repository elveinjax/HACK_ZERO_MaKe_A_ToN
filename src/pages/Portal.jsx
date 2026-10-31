import { useApp } from '../context/AppContext';
import { Globe, FileText, CreditCard, Download, RefreshCw, XCircle, TrendingUp } from 'lucide-react';

export default function Portal() {
  const { currentUser, subscriptions, invoices, payments, plans, customers, formatMoney, currentCurrency, setCurrentCurrency } = useApp();

  const customerId = currentUser?.customerId;
  const customer = customers.find(c => c.id === customerId);
  const mySubs = subscriptions.filter(s => s.customerId === customerId);
  const myInvoices = invoices.filter(i => i.customerId === customerId);
  const myPayments = payments.filter(p => p.customerId === customerId);

  const getPlan = (id) => plans.find(p => p.id === id);

  const statusColor = { active: 'active', paused: 'paused', cancelled: 'cancelled', trial: 'trial', closed: 'draft' };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', padding: 'var(--space-xl)' }}>
    
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', marginBottom: 'var(--space-2xl)' }}>
          <div className="logo-icon" style={{ width: 44, height: 44, fontSize: 22 }}>B</div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' }}>
              <span className="text-gradient">Bright</span>loop Customer Portal
              <select value={currentCurrency} onChange={e=> setCurrentCurrency(e.target.value)} style={{ marginLeft: 'auto', fontSize: 14, padding: '4px', borderRadius: 4, border: '1px solid var(--border)' }}>
                {['USD','EUR','GBP','INR','CAD','AUD','JPY'].map(cur=> <option key={cur} value={cur}>{cur}</option>)}
              </select>
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Welcome back, {customer?.contact || currentUser?.name}</div>
          </div>
        </div>

        {/* Account Summary */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-md)', marginBottom: 'var(--space-xl)' }}>
          <div className="stat-card purple">
            <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Active Subscriptions</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)' }}>{mySubs.filter(s => s.status === 'active').length}</div>
          </div>
          <div className="stat-card teal">
            <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Total Paid</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--green)' }}>{formatMoney(myPayments.reduce((a, p) => a + p.amount, 0))}</div>
          </div>
          <div className="stat-card amber">
            <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Outstanding</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--amber)' }}>{formatMoney(myInvoices.filter(i => ['confirmed', 'overdue'].includes(i.status)).reduce((a, i) => a + i.total, 0))}</div>
            </div>
          </div>


        {/* My Subscriptions */}
        <div className="card" style={{ marginBottom: 'var(--space-xl)' }}>
          <div className="card-header">
            <div>
              <div className="card-title">My Subscriptions</div>
              <div className="card-subtitle">Manage your active plans</div>
            </div>
          </div>

          {mySubs.length === 0 ? (
            <div className="empty-state" style={{ padding: 'var(--space-lg)' }}>
              <div className="empty-title">No subscriptions yet</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {mySubs.map(sub => {
                const plan = getPlan(sub.planId);
                return (
                  <div key={sub.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--space-md)', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{plan?.name || sub.planId}</span>
                        <span className={`badge ${statusColor[sub.status]}`}><span className="badge-dot" />{sub.status}</span>
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                        {sub.number} · Qty: {sub.qty} · Next renewal: {sub.expiryDate}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', marginLeft: 'var(--space-lg)' }}>
                      <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)' }}>{formatMoney(sub.qty * Number(sub.unitPrice))}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>/{plan?.cycle || 'period'}</div>
                    </div>
                    <div style={{ display: 'flex', gap: 6, marginLeft: 'var(--space-md)' }}>
                      {sub.status === 'active' && (
                        <>
                          <button className="btn btn-secondary btn-sm" title="Upgrade" onClick={() => alert('Plan upgrade flow coming soon!')}><TrendingUp size={14} /> Upgrade</button>
                          <button className="btn btn-danger btn-sm" title="Cancel" onClick={() => alert('Are you sure you want to cancel?')}><XCircle size={14} /></button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* My Invoices */}
        <div className="card" style={{ marginBottom: 'var(--space-xl)' }}>
          <div className="card-header">
            <div className="card-title">Invoices & Billing History</div>
          </div>
          <div className="table-container">
            <table>
              <thead>
                <tr><th>Invoice #</th><th>Issued</th><th>Due</th><th>Total</th><th>Status</th><th>Download</th></tr>
              </thead>
              <tbody>
                {myInvoices.map(inv => (
                  <tr key={inv.id}>
                    <td className="td-main" style={{ fontFamily: 'monospace', fontSize: 13 }}>{inv.number}</td>
                    <td style={{ fontSize: 13, color: 'var(--text-muted)' }}>{inv.issueDate}</td>
                    <td style={{ fontSize: 13, color: inv.status === 'overdue' ? 'var(--red)' : 'var(--text-muted)' }}>{inv.dueDate}</td>
                    <td className="td-main">{formatMoney(inv.total)}</td>
                    <td>
                      <span className={`badge ${inv.status === 'paid' ? 'active' : inv.status === 'overdue' ? 'overdue' : 'pending'}`}>
                        <span className="badge-dot" />{inv.status}
                      </span>
                    </td>
                    <td>
                      <button className="btn btn-ghost btn-sm btn-icon" onClick={() => alert(`Downloading ${inv.number}.pdf…`)} title="Download PDF">
                        <Download size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Payment History */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Payment History</div>
          </div>
          {myPayments.length === 0 ? (
            <div className="empty-state" style={{ padding: 'var(--space-lg)' }}>
              <div className="empty-title">No payments yet</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {myPayments.map(py => (
                <div key={py.id} style={{ display: 'flex', justifyContent: 'space-between', padding: 'var(--space-md)', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{py.note || 'Payment'}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{py.date} · {py.method.replace('_', ' ')}</div>
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--green)' }}>+${py.amount?.toLocaleString()}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ textAlign: 'center', marginTop: 'var(--space-2xl)', color: 'var(--text-muted)', fontSize: 13 }}>
          Need help? Contact us at <a href="mailto:support@brightloop.io" style={{ color: 'var(--accent-light)' }}>support@brightloop.io</a>
        </div>
      </div>

  );
}

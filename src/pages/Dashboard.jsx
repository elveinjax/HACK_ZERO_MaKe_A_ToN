import { useApp } from '../context/AppContext';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingUp, TrendingDown, Users, FileText, CreditCard, AlertTriangle, Activity, ArrowUpRight } from 'lucide-react';
import { dashboardStats } from '../data/mockData';

const mrrData = [
  { month: 'May', mrr: 9800 }, { month: 'Jun', mrr: 10200 }, { month: 'Jul', mrr: 10800 },
  { month: 'Aug', mrr: 11100 }, { month: 'Sep', mrr: 11600 }, { month: 'Oct', mrr: 12450 },
];

const revenueData = [
  { month: 'May', revenue: 9200, collected: 8800 },
  { month: 'Jun', revenue: 10100, collected: 9700 },
  { month: 'Jul', revenue: 10700, collected: 10200 },
  { month: 'Aug', revenue: 11000, collected: 10500 },
  { month: 'Sep', revenue: 11500, collected: 10900 },
  { month: 'Oct', revenue: 12450, collected: 11214 },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '10px 14px' }}>
      <p style={{ color: 'var(--text-muted)', fontSize: 12, marginBottom: 4 }}>{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color, fontSize: 14, fontWeight: 600 }}>
          ${p.value?.toLocaleString()}
        </p>
      ))}
    </div>
  );
};

export default function Dashboard() {
  const { subscriptions, invoices, customers, formatMoney } = useApp();
  const active = subscriptions.filter(s => s.status === 'active').length;
  const overdue = invoices.filter(i => i.status === 'overdue').length;
  const outstanding = invoices.filter(i => ['confirmed', 'overdue'].includes(i.status)).reduce((a, i) => a + i.total, 0);

  const recentSubs = subscriptions.slice(0, 5);
  const overdueInvs = invoices.filter(i => i.status === 'overdue').slice(0, 4);

  return (
    <div className="page-wrapper page-content">
      <div className="page-header">
        <div className="page-title-row">
          <div>
            <h1 className="page-title">Dashboard</h1>
            <p className="page-subtitle">Your business at a glance — October 2024</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="badge active"><span className="badge-dot" />Live</span>
          </div>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="stat-grid">
        <div className="stat-card purple">
          <div className="stat-card-header">
            <div>
              <div className="stat-value">{formatMoney(dashboardStats.mrr)}</div>
              <div className="stat-label">Monthly Recurring Revenue</div>
            </div>
            <div className="stat-icon purple"><TrendingUp size={20} /></div>
          </div>
          <div className="stat-change up"><TrendingUp size={12} /> +7.3% vs last month</div>
        </div>

        <div className="stat-card teal">
          <div className="stat-card-header">
            <div>
              <div className="stat-value">{active}</div>
              <div className="stat-label">Active Subscriptions</div>
            </div>
            <div className="stat-icon teal"><Activity size={20} /></div>
          </div>
          <div className="stat-change up"><TrendingUp size={12} /> +2 this month</div>
        </div>

        <div className="stat-card green">
          <div className="stat-card-header">
            <div>
              <div className="stat-value">{formatMoney(dashboardStats.revenueIn)}</div>
              <div className="stat-label">Revenue Collected</div>
            </div>
            <div className="stat-icon green"><CreditCard size={20} /></div>
          </div>
          <div className="stat-change up"><TrendingUp size={12} /> +$1,202 vs last month</div>
        </div>

        <div className="stat-card amber">
          <div className="stat-card-header">
            <div>
              <div className="stat-value">{formatMoney(outstanding)}</div>
              <div className="stat-label">Outstanding</div>
            </div>
            <div className="stat-icon amber"><FileText size={20} /></div>
          </div>
          <div className="stat-change down"><TrendingDown size={12} /> {overdue} overdue</div>
        </div>

        <div className="stat-card red">
          <div className="stat-card-header">
            <div>
              <div className="stat-value">{overdue}</div>
              <div className="stat-label">Overdue Invoices</div>
            </div>
            <div className="stat-icon red"><AlertTriangle size={20} /></div>
          </div>
          <div className="stat-change down"><TrendingDown size={12} /> Action required</div>
        </div>

        <div className="stat-card purple">
          <div className="stat-card-header">
            <div>
              <div className="stat-value">{customers.length}</div>
              <div className="stat-label">Total Customers</div>
            </div>
            <div className="stat-icon blue"><Users size={20} /></div>
          </div>
          <div className="stat-change up"><TrendingUp size={12} /> +1 this month</div>
        </div>
      </div>

      {/* Charts row */}
      <div className="grid-2" style={{ marginBottom: 'var(--space-xl)' }}>
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">MRR Growth</div>
              <div className="card-subtitle">Monthly recurring revenue trend</div>
            </div>
            <span className="badge purple">+27% YTD</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={mrrData}>
              <defs>
                <linearGradient id="mrrGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="mrr" stroke="#8b5cf6" strokeWidth={2.5} fill="url(#mrrGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Revenue vs Collected</div>
              <div className="card-subtitle">Billed vs cash received</div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={revenueData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="revenue" fill="rgba(139,92,246,0.6)" radius={[4,4,0,0]} name="Billed" />
              <Bar dataKey="collected" fill="rgba(34,197,94,0.6)" radius={[4,4,0,0]} name="Collected" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom tables */}
      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <div className="card-title">Recent Subscriptions</div>
            <a href="/subscriptions" style={{ fontSize: 13, color: 'var(--accent-light)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>View all <ArrowUpRight size={14} /></a>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {recentSubs.map(s => (
              <div key={s.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{s.number}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{s.customerId} · {s.planId}</div>
                </div>
                <span className={`badge ${s.status}`}><span className="badge-dot" />{s.status}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title">Overdue Invoices</div>
            <a href="/invoices" style={{ fontSize: 13, color: 'var(--red)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>Chase <ArrowUpRight size={14} /></a>
          </div>
          {overdueInvs.length === 0 ? (
            <div className="empty-state" style={{ padding: 'var(--space-lg)' }}>
              <div style={{ color: 'var(--green)', fontSize: 13 }}>✓ No overdue invoices</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {overdueInvs.map(inv => (
                <div key={inv.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{inv.number}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Due {inv.dueDate}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--red)' }}>{formatMoney(inv.total)}</div>
                    <span className="badge overdue">Overdue</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

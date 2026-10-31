import { useApp } from '../context/AppContext';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Legend } from 'recharts';
import { TrendingUp, TrendingDown, Download } from 'lucide-react';
import { dashboardStats } from '../data/mockData';

const mrrData = [
  { month: 'May', new: 800, expansion: 200, contraction: -100, churned: -200, net: 700 },
  { month: 'Jun', new: 600, expansion: 400, contraction: -50, churned: -150, net: 800 },
  { month: 'Jul', new: 900, expansion: 300, contraction: -200, churned: -100, net: 900 },
  { month: 'Aug', new: 700, expansion: 500, contraction: -150, churned: -250, net: 800 },
  { month: 'Sep', new: 1100, expansion: 200, contraction: -100, churned: -200, net: 1000 },
  { month: 'Oct', new: 1300, expansion: 600, contraction: -50, churned: -100, net: 1750 },
];

const segData = [
  { name: 'Enterprise', value: 72, color: '#8b5cf6' },
  { name: 'SMB', value: 20, color: '#14b8a6' },
  { name: 'Trial', value: 8, color: '#f59e0b' },
];

const agingData = [
  { bucket: '0-30 days', amount: 5200, count: 3 },
  { bucket: '31-60 days', amount: 3100, count: 2 },
  { bucket: '61-90 days', amount: 1800, count: 1 },
  { bucket: '90+ days', amount: 1138, count: 1 },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '10px 14px' }}>
      <p style={{ color: 'var(--text-muted)', fontSize: 12, marginBottom: 4 }}>{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color || p.fill, fontSize: 13, fontWeight: 600 }}>
          {p.name}: {typeof p.value === 'number' && Math.abs(p.value) > 0 ? formatMoney(Math.abs(p.value)) : p.value}
        </p>
      ))}
    </div>
  );
};

export default function Reports() {
  const { subscriptions, invoices, customers, payments, formatMoney } = useApp();

  const active = subscriptions.filter(s => s.status === 'active').length;
  const churn = subscriptions.filter(s => s.status === 'cancelled').length;
  const totalCollected = payments.reduce((a, p) => a + p.amount, 0);
  const totalBilled = invoices.reduce((a, i) => a + i.total, 0);
  const overdueTotal = invoices.filter(i => i.status === 'overdue').reduce((a, i) => a + i.total, 0);

  return (
    <div className="page-wrapper page-content">
      <div className="page-header">
        <div className="page-title-row">
          <div>
            <h1 className="page-title">Revenue Reports</h1>
            <p className="page-subtitle">Finance overview — October 2024</p>
          </div>
          <button className="btn btn-secondary" onClick={() => alert('Exporting CSV…')}>
            <Download size={16} /> Export CSV
          </button>
        </div>
      </div>

      {/* Top KPIs */}
      <div className="stat-grid" style={{ marginBottom: 'var(--space-xl)' }}>
        <div className="stat-card purple">
          <div className="stat-card-header">
            <div>
              <div className="stat-value">{formatMoney(dashboardStats.mrr)}</div>
              <div className="stat-label">MRR</div>
            </div>
            <div className="stat-icon purple"><TrendingUp size={20} /></div>
          </div>
          <div className="stat-change up"><TrendingUp size={12} /> +7.3%</div>
        </div>
        <div className="stat-card teal">
          <div className="stat-card-header">
            <div>
              <div className="stat-value">{formatMoney(dashboardStats.mrr * 12)}</div>
              <div className="stat-label">ARR</div>
            </div>
            <div className="stat-icon teal"><TrendingUp size={20} /></div>
          </div>
          <div className="stat-change up"><TrendingUp size={12} /> Annualised</div>
        </div>
        <div className="stat-card green">
          <div className="stat-card-header">
            <div>
              <div className="stat-value">{dashboardStats.churnRate}%</div>
              <div className="stat-label">Churn Rate</div>
            </div>
            <div className="stat-icon red"><TrendingDown size={20} /></div>
          </div>
          <div className="stat-change down"><TrendingDown size={12} /> {churn} cancelled</div>
        </div>
        <div className="stat-card amber">
          <div className="stat-card-header">
            <div>
              <div className="stat-value">{dashboardStats.nrr}%</div>
              <div className="stat-label">Net Revenue Retention</div>
            </div>
            <div className="stat-icon green"><TrendingUp size={20} /></div>
          </div>
          <div className="stat-change up"><TrendingUp size={12} /> Above 100% = growth</div>
        </div>
      </div>

      {/* MRR Movement */}
      <div className="card" style={{ marginBottom: 'var(--space-xl)' }}>
        <div className="card-header">
          <div>
            <div className="card-title">MRR Movement</div>
            <div className="card-subtitle">New · Expansion · Contraction · Churned</div>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={mrrData} barGap={2}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="month" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={v => formatMoney(v)} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 12, color: 'var(--text-muted)' }} />
            <Bar dataKey="new" fill="rgba(34,197,94,0.7)" radius={[3,3,0,0]} name="New" />
            <Bar dataKey="expansion" fill="rgba(139,92,246,0.7)" radius={[3,3,0,0]} name="Expansion" />
            <Bar dataKey="contraction" fill="rgba(245,158,11,0.7)" radius={[3,3,0,0]} name="Contraction" />
            <Bar dataKey="churned" fill="rgba(239,68,68,0.7)" radius={[3,3,0,0]} name="Churned" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid-2" style={{ marginBottom: 'var(--space-xl)' }}>
        {/* Revenue by Segment */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Revenue by Segment</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xl)' }}>
            <PieChart width={160} height={160}>
              <Pie data={segData} cx={75} cy={75} innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
                {segData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
            </PieChart>
            <div style={{ flex: 1 }}>
              {segData.map(s => (
                <div key={s.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: s.color }} />
                    <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{s.name}</span>
                  </div>
                  <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{s.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Invoice Aging */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Invoice Aging</div>
            <div className="card-subtitle">Outstanding invoices by days overdue</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {agingData.map(a => (
              <div key={a.bucket}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{a.bucket}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{formatMoney(a.amount)} <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>({a.count})</span></span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${(a.amount / 11238) * 100}%`, background: a.bucket === '90+ days' ? 'var(--red)' : a.bucket.startsWith('61') ? 'var(--amber)' : 'var(--grad-brand)' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Cash vs Billed */}
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Cash Collected vs Revenue Billed</div>
            <div className="card-subtitle">All time</div>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-lg)' }}>
          {[
            { label: 'Total Billed', value: formatMoney(totalBilled), color: 'var(--accent-light)' },
            { label: 'Cash Collected', value: formatMoney(totalCollected), color: 'var(--green)' },
            { label: 'Still Outstanding', value: formatMoney(totalBilled - totalCollected), color: 'var(--amber)' },
          ].map(m => (
            <div key={m.label} style={{ textAlign: 'center', padding: 'var(--space-lg)', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-lg)' }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: m.color }}>{m.value}</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 6 }}>{m.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

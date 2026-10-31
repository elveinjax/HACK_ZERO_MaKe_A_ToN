import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Search, Receipt, Zap, X, Send, Printer, CheckCircle, XCircle, Eye } from 'lucide-react';

const statusColor = { draft: 'draft', confirmed: 'confirmed', paid: 'active', overdue: 'overdue', void: 'cancelled' };

function InvoiceDetail({ invoice, customer, onClose, onUpdate }) {
  return (
    <div className="modal-overlay">
      <div className="modal modal-lg">
        <div className="modal-header">
          <h2 className="modal-title">{invoice.number}</h2>
          <button className="modal-close" onClick={onClose}><X size={16} /></button>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-lg)' }}>
          <div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Bill To</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>{customer?.company}</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{customer?.email}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span className={`badge ${statusColor[invoice.status]}`}><span className="badge-dot" />{invoice.status}</span>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 6 }}>Issued: {invoice.issueDate}</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Due: {invoice.dueDate}</div>
          </div>
        </div>

        <div className="table-container" style={{ marginBottom: 'var(--space-lg)' }}>
          <table>
            <thead><tr><th>Description</th><th>Qty</th><th>Unit Price</th><th>Tax %</th><th>Discount %</th><th>Total</th></tr></thead>
            <tbody>
              {invoice.lines.map((line, i) => (
                <tr key={i}>
                  <td className="td-main">{line.product}</td>
                  <td>{line.qty}</td>
                  <td className="td-main">{formatMoney(line.unitPrice)}</td>
                  <td>{line.tax}%</td>
                  <td>{line.discount}%</td>
                  <td className="td-main">{formatMoney(line.qty * line.unitPrice * (1 - line.discount / 100))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', width: 300 }}>
            <span style={{ color: 'var(--text-muted)' }}>Subtotal</span>
            <span>{formatMoney(invoice.subtotal)}</span>
          </div>
          {invoice.discountAmount > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', width: 300 }}>
            <span style={{ color: 'var(--text-muted)' }}>Discount</span>
            <span style={{ color: 'var(--green)' }}>-${invoice.discountAmount?.toLocaleString()}</span>
          </div>}
          <div style={{ display: 'flex', justifyContent: 'space-between', width: 300 }}>
            <span style={{ color: 'var(--text-muted)' }}>Tax</span>
            <span>{formatMoney(invoice.taxAmount)}</span>
          </div>
          <div className="divider" style={{ width: 300 }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', width: 300 }}>
            <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Total</span>
            <span style={{ fontWeight: 800, fontSize: 18, color: 'var(--text-primary)' }}>{formatMoney(invoice.total)}</span>
          </div>
        </div>

        <div className="modal-actions">
          {invoice.status === 'draft' && <>
            <button className="btn btn-secondary" onClick={() => { onUpdate(invoice.id, { status: 'void' }); onClose(); }}><XCircle size={14} /> Void</button>
            <button className="btn btn-secondary" onClick={() => { onUpdate(invoice.id, { status: 'confirmed' }); onClose(); }}><CheckCircle size={14} /> Confirm</button>
          </>}
          {invoice.status === 'confirmed' && <>
            <button className="btn btn-secondary" onClick={() => alert('Invoice sent via email!')}><Send size={14} /> Send</button>
            <button className="btn btn-primary" onClick={() => { onUpdate(invoice.id, { status: 'paid' }); onClose(); }}><CheckCircle size={14} /> Mark Paid</button>
          </>}
          <button className="btn btn-ghost" onClick={() => alert('Printing…')}><Printer size={14} /> Print</button>
        </div>
      </div>
    </div>
  );
}

export default function Invoices() {
  const { invoices, customers, subscriptions, generateInvoices, updateInvoice, formatMoney } = useApp();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState(null);
  const [genMsg, setGenMsg] = useState('');

  const getCustomer = (id) => customers.find(c => c.id === id);

  const filtered = invoices.filter(inv => {
    const customer = getCustomer(inv.customerId);
    const q = search.toLowerCase();
    const match = inv.number.toLowerCase().includes(q) || customer?.company?.toLowerCase().includes(q);
    const statusMatch = filter === 'all' || inv.status === filter;
    return match && statusMatch;
  });

  const handleGenerate = async () => {
    const count = await generateInvoices();
    if (count == null) return;
    setGenMsg(`Generated ${count} invoice(s) for active subscriptions.`);
    setTimeout(() => setGenMsg(''), 4000);
  };

  const total = (status) => invoices.filter(i => i.status === status).reduce((a, i) => a + i.total, 0);

  return (
    <div className="page-wrapper page-content">
      <div className="page-header">
        <div className="page-title-row">
          <div>
            <h1 className="page-title">Invoices</h1>
            <p className="page-subtitle">{invoices.length} invoices · ${total('paid').toLocaleString()} collected</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button id="generate-invoices-btn" className="btn btn-primary" onClick={handleGenerate}>
              <Zap size={16} /> Generate All Due
            </button>
          </div>
        </div>
      </div>

      {genMsg && <div className="alert alert-success"><CheckCircle size={16} />{genMsg}</div>}

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-md)', marginBottom: 'var(--space-lg)' }}>
        {[
          { label: 'Draft', status: 'draft', color: 'var(--text-muted)' },
          { label: 'Confirmed', status: 'confirmed', color: 'var(--amber)' },
          { label: 'Paid', status: 'paid', color: 'var(--green)' },
          { label: 'Overdue', status: 'overdue', color: 'var(--red)' },
        ].map(s => (
          <div key={s.status} className="card" style={{ padding: 'var(--space-md)', cursor: 'pointer' }} onClick={() => setFilter(s.status)}>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>{s.label}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: s.color }}>{invoices.filter(i => i.status === s.status).length}</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>${total(s.status).toLocaleString()}</div>
          </div>
        ))}
      </div>

      <div className="toolbar">
        <div className="search-box">
          <Search size={16} />
          <input placeholder="Search by invoice # or customer…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        {['all', 'draft', 'confirmed', 'paid', 'overdue', 'void'].map(f => (
          <button key={f} className={`btn ${filter === f ? 'btn-primary' : 'btn-ghost'} btn-sm`} onClick={() => setFilter(f)}>{f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}</button>
        ))}
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr><th>Invoice #</th><th>Customer</th><th>Issue Date</th><th>Due Date</th><th>Subtotal</th><th>Tax</th><th>Total</th><th>Status</th><th>View</th></tr>
          </thead>
          <tbody>
            {filtered.map(inv => {
              const cust = getCustomer(inv.customerId);
              return (
                <tr key={inv.id} onClick={() => setSelected(inv)} style={{ cursor: 'pointer' }}>
                  <td className="td-main" style={{ fontFamily: 'monospace', fontSize: 13 }}>{inv.number}</td>
                  <td className="td-main">{cust?.company || '—'}</td>
                  <td style={{ fontSize: 13, color: 'var(--text-muted)' }}>{inv.issueDate}</td>
                  <td style={{ fontSize: 13, color: inv.status === 'overdue' ? 'var(--red)' : 'var(--text-muted)' }}>{inv.dueDate}</td>
                  <td>{formatMoney(inv.subtotal)}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{formatMoney(inv.taxAmount)}</td>
                  <td className="td-main">{formatMoney(inv.total)}</td>
                  <td><span className={`badge ${statusColor[inv.status]}`}><span className="badge-dot" />{inv.status}</span></td>
                  <td><button className="btn btn-ghost btn-sm btn-icon" onClick={e => { e.stopPropagation(); setSelected(inv); }}><Eye size={14} /></button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon"><Receipt size={28} /></div>
            <div className="empty-title">No invoices found</div>
            <div className="empty-desc">Generate invoices from active subscriptions.</div>
            <button className="btn btn-primary" onClick={handleGenerate}><Zap size={16} /> Generate All Due</button>
          </div>
        )}
      </div>

      {selected && (
        <InvoiceDetail
          invoice={selected}
          customer={getCustomer(selected.customerId)}
          onClose={() => setSelected(null)}
          onUpdate={updateInvoice}
        />
      )}
    </div>
  );
}

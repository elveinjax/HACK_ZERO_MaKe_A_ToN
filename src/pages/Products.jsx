import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, Search, Package, Edit2, Archive, X, ChevronDown, ChevronUp } from 'lucide-react';

function ProductModal({ product, onClose, onSave }) {
  const [form, setForm] = useState(product || { name: '', type: 'Software', salesPrice: '', costPrice: '', notes: '', variants: [] });
  const [variantName, setVariantName] = useState('');
  const [variantDelta, setVariantDelta] = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const addVariant = () => {
    if (!variantName) return;
    setForm(f => ({ ...f, variants: [...(f.variants || []), { id: `v${Date.now()}`, name: variantName, delta: Number(variantDelta) || 0 }] }));
    setVariantName(''); setVariantDelta('');
  };

  const removeVariant = (id) => setForm(f => ({ ...f, variants: f.variants.filter(v => v.id !== id) }));

  return (
    <div className="modal-overlay">
      <div className="modal modal-lg">
        <div className="modal-header">
          <h2 className="modal-title">{product ? 'Edit Product' : 'Add Product'}</h2>
          <button className="modal-close" onClick={onClose}><X size={16} /></button>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Product Name *</label>
            <input className="form-input" value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Brightloop Core" />
          </div>
          <div className="form-group">
            <label className="form-label">Type</label>
            <select className="form-select" value={form.type} onChange={e => set('type', e.target.value)}>
              <option>Software</option><option>Add-on</option><option>Service</option><option>Hardware</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Sales Price ($) *</label>
            <input className="form-input" type="number" value={form.salesPrice} onChange={e => set('salesPrice', e.target.value)} placeholder="299" />
          </div>
          <div className="form-group">
            <label className="form-label">Cost Price ($)</label>
            <input className="form-input" type="number" value={form.costPrice} onChange={e => set('costPrice', e.target.value)} placeholder="80" />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Internal Notes</label>
          <textarea className="form-textarea" value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Any internal notes about this product…" />
        </div>

        <div className="divider" />
        <div style={{ marginBottom: 'var(--space-md)' }}>
          <div className="card-title" style={{ marginBottom: 12 }}>Product Variants</div>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12 }}>Variants add a price adjustment to the base price. E.g., "Odoo Edition" adds +$560.</p>

          {(form.variants || []).map(v => (
            <div key={v.id} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, background: 'var(--bg-elevated)', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
              <span style={{ flex: 1, fontSize: 14, color: 'var(--text-primary)' }}>{v.name}</span>
              <span style={{ fontSize: 13, color: v.delta >= 0 ? 'var(--green)' : 'var(--red)', fontWeight: 600 }}>{v.delta >= 0 ? '+' : ''}{v.delta}</span>
              <button onClick={() => removeVariant(v.id)} style={{ background: 'none', border: 'none', color: 'var(--red)', cursor: 'pointer' }}><X size={14} /></button>
            </div>
          ))}

          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <input className="form-input" style={{ flex: 2 }} value={variantName} onChange={e => setVariantName(e.target.value)} placeholder="Variant name (e.g. Odoo Edition)" />
            <input className="form-input" style={{ flex: 1 }} type="number" value={variantDelta} onChange={e => setVariantDelta(e.target.value)} placeholder="Price delta (e.g. 560)" />
            <button className="btn btn-secondary" onClick={addVariant}><Plus size={16} /></button>
          </div>
        </div>

        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={() => { onSave(form); onClose(); }}>
            {product ? 'Save Changes' : 'Add Product'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Products() {
  const { products, addProduct, updateProduct, archiveProduct } = useApp();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [modal, setModal] = useState(null); // null | 'add' | product obj
  const [expanded, setExpanded] = useState({});

  const filtered = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || p.status === filter || p.type === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div className="page-wrapper page-content">
      <div className="page-header">
        <div className="page-title-row">
          <div>
            <h1 className="page-title">Products</h1>
            <p className="page-subtitle">{products.filter(p => p.status === 'active').length} active products</p>
          </div>
          <button id="add-product-btn" className="btn btn-primary" onClick={() => setModal('add')}>
            <Plus size={16} /> Add Product
          </button>
        </div>
      </div>

      <div className="toolbar">
        <div className="search-box">
          <Search size={16} />
          <input placeholder="Search products…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        {['all', 'active', 'archived', 'Software', 'Add-on'].map(f => (
          <button key={f} className={`btn ${filter === f ? 'btn-primary' : 'btn-ghost'} btn-sm`} onClick={() => setFilter(f)}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Product</th><th>Type</th><th>Sales Price</th><th>Cost Price</th><th>Variants</th><th>Status</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <>
                <tr key={p.id}>
                  <td>
                    <div className="td-main">{p.name}</div>
                    {p.notes && <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{p.notes}</div>}
                  </td>
                  <td><span className="inline-badge"><Package size={12} />{p.type}</span></td>
                  <td className="td-main">${p.salesPrice?.toLocaleString()}</td>
                  <td style={{ color: 'var(--text-muted)' }}>${p.costPrice?.toLocaleString()}</td>
                  <td>
                    {p.variants?.length > 0 ? (
                      <button className="btn btn-ghost btn-sm" onClick={() => setExpanded(e => ({ ...e, [p.id]: !e[p.id] }))}>
                        {p.variants.length} variants {expanded[p.id] ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </button>
                    ) : <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>None</span>}
                  </td>
                  <td><span className={`badge ${p.status}`}><span className="badge-dot" />{p.status}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-ghost btn-sm btn-icon" onClick={() => setModal(p)} title="Edit"><Edit2 size={14} /></button>
                      {p.status === 'active' && <button className="btn btn-ghost btn-sm btn-icon" onClick={() => archiveProduct(p.id)} title="Archive"><Archive size={14} /></button>}
                    </div>
                  </td>
                </tr>
                {expanded[p.id] && p.variants?.map(v => (
                  <tr key={v.id} style={{ background: 'rgba(139,92,246,0.03)' }}>
                    <td colSpan={2} style={{ paddingLeft: 40, fontSize: 13, color: 'var(--text-muted)' }}>↳ {v.name}</td>
                    <td style={{ fontSize: 13, color: 'var(--green)', fontWeight: 600 }}>${(Number(p.salesPrice) + v.delta).toLocaleString()} (+{v.delta})</td>
                    <td colSpan={4} />
                  </tr>
                ))}
              </>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon"><Package size={28} /></div>
            <div className="empty-title">No products found</div>
            <div className="empty-desc">Add your first product to get started.</div>
            <button className="btn btn-primary" onClick={() => setModal('add')}><Plus size={16} /> Add Product</button>
          </div>
        )}
      </div>

      {modal && (
        <ProductModal
          product={modal === 'add' ? null : modal}
          onClose={() => setModal(null)}
          onSave={form => modal === 'add' ? addProduct(form) : updateProduct(modal.id, form)}
        />
      )}
    </div>
  );
}

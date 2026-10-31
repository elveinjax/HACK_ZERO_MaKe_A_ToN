import { NavLink, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  LayoutDashboard, Package, FileText, Users, CreditCard,
  BarChart3, Settings, Tag, Percent, Globe, LogOut,
  BookOpen, Receipt, Layers, ShieldCheck
} from 'lucide-react';

const adminNav = [
  { label: 'Dashboard', icon: LayoutDashboard, to: '/dashboard' },
  { section: 'Catalog' },
  { label: 'Products', icon: Package, to: '/products' },
  { label: 'Plans', icon: Layers, to: '/plans' },
  { label: 'Taxes', icon: Percent, to: '/taxes' },
  { label: 'Discounts', icon: Tag, to: '/discounts' },
  { section: 'Business' },
  { label: 'Customers', icon: Users, to: '/customers' },
  { label: 'Subscriptions', icon: BookOpen, to: '/subscriptions' },
  { label: 'Invoices', icon: Receipt, to: '/invoices' },
  { label: 'Payments', icon: CreditCard, to: '/payments' },
  { section: 'Insights' },
  { label: 'Reports', icon: BarChart3, to: '/reports' },
  { section: 'Admin' },
  { label: 'Staff & Roles', icon: ShieldCheck, to: '/settings' },
];

const staffNav = [
  { label: 'Dashboard', icon: LayoutDashboard, to: '/dashboard' },
  { section: 'Business' },
  { label: 'Customers', icon: Users, to: '/customers' },
  { label: 'Subscriptions', icon: BookOpen, to: '/subscriptions' },
  { label: 'Invoices', icon: Receipt, to: '/invoices' },
  { label: 'Payments', icon: CreditCard, to: '/payments' },
  { section: 'Insights' },
  { label: 'Reports', icon: BarChart3, to: '/reports' },
];

const customerNav = [
  { label: 'My Portal', icon: Globe, to: '/portal' },
];

export default function Sidebar() {
  const { currentUser, logout } = useApp();
  const navigate = useNavigate();

  if (!currentUser) return null;

  const nav = currentUser.role === 'admin' ? adminNav
    : currentUser.role === 'staff' ? staffNav
    : customerNav;

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-mark">
          <div className="logo-icon">B</div>
          <span className="logo-text"><span>Bright</span>loop</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {nav.map((item, i) =>
          item.section ? (
            <span key={i} className="nav-section-label">{item.section}</span>
          ) : (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
            >
              <item.icon className="nav-icon" size={18} />
              {item.label}
            </NavLink>
          )
        )}
      </nav>

      <div className="sidebar-footer">
        <div className="user-pill" onClick={handleLogout} title="Click to logout">
          <div className="user-avatar">{currentUser.avatar}</div>
          <div className="user-info">
            <div className="user-name">{currentUser.name}</div>
            <div className="user-role">{currentUser.role} · Logout</div>
          </div>
          <LogOut size={15} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
        </div>
      </div>
    </aside>
  );
}

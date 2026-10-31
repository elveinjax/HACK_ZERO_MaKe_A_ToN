import { Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import TopBar from './components/TopBar';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Plans from './pages/Plans';
import Customers from './pages/Customers';
import Subscriptions from './pages/Subscriptions';
import Invoices from './pages/Invoices';
import Payments from './pages/Payments';
import Taxes from './pages/Taxes';
import Discounts from './pages/Discounts';
import Reports from './pages/Reports';
import Portal from './pages/Portal';
import Settings from './pages/Settings';

function AppRoutes() {
  const { currentUser, loading, error, clearError } = useApp();

  if (loading) {
    return <div className="auth-page">Connecting to Brightloop…</div>;
  }

  const databaseNotice = error ? (
    <div className="alert alert-error" role="alert">
      {error}
      <button type="button" onClick={clearError} style={{ marginLeft: 12 }}>Dismiss</button>
    </div>
  ) : null;

  if (!currentUser) {
    return (
      <>
        {databaseNotice}
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </>
    );
  }

  if (currentUser.role === 'customer') {
    return (
      <div className="app-layout">
        <Sidebar />
        <div className="main-content">
          {databaseNotice}
          <Routes>
            <Route path="/portal" element={<Portal />} />
            <Route path="*" element={<Navigate to="/portal" replace />} />
          </Routes>
        </div>
      </div>
    );
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <TopBar />
        {databaseNotice}
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/products" element={<Products />} />
          <Route path="/plans" element={<Plans />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/subscriptions" element={<Subscriptions />} />
          <Route path="/invoices" element={<Invoices />} />
          <Route path="/payments" element={<Payments />} />
          <Route path="/taxes" element={<Taxes />} />
          <Route path="/discounts" element={<Discounts />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppRoutes />
    </AppProvider>
  );
}

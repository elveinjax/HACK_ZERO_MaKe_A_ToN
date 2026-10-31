import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Mail, Lock, Eye, EyeOff, AlertCircle, Zap } from 'lucide-react';

export default function Login() {
  const { login } = useApp();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const demoAccounts = [
    { label: 'Admin', email: 'admin@brightloop.io', password: 'Admin@123', color: 'purple' },
    { label: 'Staff', email: 'staff@brightloop.io', password: 'Staff@123', color: 'teal' },
    { label: 'Customer', email: 'customer@brightloop.io', password: 'Cust@123', color: 'green' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    await new Promise(r => setTimeout(r, 600));
    const result = await login(email, password);
    setLoading(false);
    if (result.ok) {
      navigate(result.user.role === 'customer' ? '/portal' : '/dashboard', { replace: true });
    } else {
      setError(result.error);
    }
  };

  const quickLogin = async (acc) => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 400));
    const result = await login(acc.email, acc.password);
    setLoading(false);
    if (result.ok) navigate(result.user.role === 'customer' ? '/portal' : '/dashboard', { replace: true });
    else setError(result.error);
  };

  return (
    <div className="auth-page">
      <div className="auth-bg-orb auth-bg-orb-1" />
      <div className="auth-bg-orb auth-bg-orb-2" />

      <div className="auth-card">
        <div className="auth-logo">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
            <div className="logo-icon" style={{ width: 44, height: 44, fontSize: 22 }}>B</div>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: 'var(--text-primary)' }}>
              <span className="text-gradient">Bright</span>loop
            </span>
          </div>
        </div>

        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-subtitle">Sign in to your Brightloop account</p>

        {error && (
          <div className="alert alert-error">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input id="login-email" className="form-input" style={{ paddingLeft: 38 }} type="email" placeholder="you@company.com" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input id="login-password" className="form-input" style={{ paddingLeft: 38, paddingRight: 40 }} type={showPwd ? 'text' : 'password'} placeholder="Your password" value={password} onChange={e => setPassword(e.target.value)} required />
              <button type="button" onClick={() => setShowPwd(!showPwd)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div style={{ textAlign: 'right', marginBottom: 'var(--space-lg)', marginTop: '-8px' }}>
            <Link to="/register" style={{ fontSize: 13, color: 'var(--accent-light)', textDecoration: 'none' }}>Forgot password?</Link>
          </div>

          <button id="login-submit" type="submit" className="btn btn-primary w-full" style={{ justifyContent: 'center', height: 44 }} disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <div className="auth-divider"><Zap size={14} /> Quick demo login</div>

        <div style={{ display: 'flex', gap: 8 }}>
          {demoAccounts.map(acc => (
            <button key={acc.label} id={`demo-${acc.label.toLowerCase()}`} onClick={() => quickLogin(acc)} className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center', fontSize: 13 }} disabled={loading}>
              {acc.label}
            </button>
          ))}
        </div>

        <div className="auth-footer">
          No account? <Link to="/register">Create one free</Link>
        </div>
      </div>
    </div>
  );
}

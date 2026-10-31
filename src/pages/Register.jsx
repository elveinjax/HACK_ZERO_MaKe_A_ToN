import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Mail, Lock, User, Building2, Phone, MapPin, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';

function getStrength(pwd) {
  let score = 0;
  if (pwd.length >= 8) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[a-z]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  return score;
}

const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
const strengthColors = ['', '#ef4444', '#f59e0b', '#14b8a6', '#22c55e'];

export default function Register() {
  const { register } = useApp();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const strength = getStrength(password);
  const rules = [
    { label: 'At least 8 characters', ok: password.length >= 8 },
    { label: 'Uppercase letter', ok: /[A-Z]/.test(password) },
    { label: 'Lowercase letter', ok: /[a-z]/.test(password) },
    { label: 'Special character', ok: /[^A-Za-z0-9]/.test(password) },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (strength < 4) { setError('Password does not meet all requirements.'); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 600));
    const result = await register(name, email, password, company, phone, address);
    setLoading(false);
    if (result.ok) navigate('/portal');
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

        <h1 className="auth-title">Create your account</h1>
        <p className="auth-subtitle">Start your subscription journey today</p>

        {error && (
          <div className="alert alert-error">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full name</label>
            <div style={{ position: 'relative' }}>
              <Building2 size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input id="reg-name" className="form-input" style={{ paddingLeft: 38 }} type="text" placeholder="Jane Smith" value={name} onChange={e => setName(e.target.value)} required />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Company name</label>
            <div style={{ position: 'relative' }}>
              <User size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input id="reg-company" className="form-input" style={{ paddingLeft: 38 }} type="text" placeholder="Your company" value={company} onChange={e => setCompany(e.target.value)} required />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email address</label>
            <div style={{ position: 'relative' }}>
              <Phone size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input id="reg-email" className="form-input" style={{ paddingLeft: 38 }} type="email" placeholder="you@company.com" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Phone number <span style={{ color: 'var(--text-muted)' }}>(optional)</span></label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input id="reg-phone" className="form-input" style={{ paddingLeft: 38 }} type="tel" placeholder="+1 555-0100" value={phone} onChange={e => setPhone(e.target.value)} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Billing address <span style={{ color: 'var(--text-muted)' }}>(optional)</span></label>
            <div style={{ position: 'relative' }}>
              <MapPin size={16} style={{ position: 'absolute', left: 12, top: 14, color: 'var(--text-muted)' }} />
              <input id="reg-address" className="form-input" style={{ paddingLeft: 38 }} type="text" placeholder="Street, city, state" value={address} onChange={e => setAddress(e.target.value)} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input id="reg-password" className="form-input" style={{ paddingLeft: 38, paddingRight: 40 }} type={showPwd ? 'text' : 'password'} placeholder="Create a strong password" value={password} onChange={e => setPassword(e.target.value)} required />
              <button type="button" onClick={() => setShowPwd(!showPwd)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {password && (
              <div className="password-strength">
                <div className="strength-bar">
                  <div className="strength-fill" style={{ width: `${strength * 25}%`, background: strengthColors[strength] }} />
                </div>
                <div className="strength-text" style={{ color: strengthColors[strength] }}>{strengthLabels[strength]}</div>
                <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {rules.map(r => (
                    <div key={r.label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: r.ok ? 'var(--green)' : 'var(--text-muted)' }}>
                      <CheckCircle size={12} style={{ opacity: r.ok ? 1 : 0.3 }} /> {r.label}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button id="reg-submit" type="submit" className="btn btn-primary w-full" style={{ justifyContent: 'center', height: 44, marginTop: 8 }} disabled={loading}>
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
}

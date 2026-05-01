import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { showToast } from '../components/UI';

export default function Login() {
  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!email || !password) return showToast('Please fill all fields', 'error');
    if (mode === 'register' && !name) return showToast('Name required', 'error');
    setLoading(true);
    try {
      if (mode === 'register') await register(name, email, password);
      else await login(email, password);
      navigate('/');
    } catch (e) {
      showToast(e.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSubmit();
  };

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="logo-mark">🌿</div>
          <span>EcoLearn</span>
        </div>
        <h2 className="auth-title">Welcome back</h2>
        <p className="auth-sub">Sign in to continue your sustainability journey</p>
        <div className="auth-tabs">
          <button className={`auth-tab ${mode === 'login' ? 'active' : ''}`} onClick={() => setMode('login')}>Sign In</button>
          <button className={`auth-tab ${mode === 'register' ? 'active' : ''}`} onClick={() => setMode('register')}>Create Account</button>
        </div>
        <div onKeyDown={handleKeyDown}>
          {mode === 'register' && (
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input className="form-input" placeholder="Your full name" type="text" value={name} onChange={e => setName(e.target.value)} />
            </div>
          )}
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" placeholder="you@email.com" type="email" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-input" placeholder="••••••••" type="password" value={password} onChange={e => setPassword(e.target.value)} />
          </div>
          <button className="btn btn-teal btn-full" style={{ marginTop: '0.5rem' }} onClick={handleSubmit} disabled={loading}>
            {loading ? 'Please wait...' : mode === 'register' ? 'Create Account' : 'Sign In'}
          </button>
          <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: 12, color: 'var(--muted)' }}>
            Demo — Admin: <b>admin@ecolearn.com</b> · Student: <b>student@ecolearn.com</b><br />Password: <b>Admin@123</b>
          </p>
        </div>
      </div>
    </div>
  );
}

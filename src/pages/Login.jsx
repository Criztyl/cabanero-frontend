import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, BookOpen, GraduationCap, BarChart2, Shield } from 'lucide-react';
import { AppContext } from '../context/AppContext';
import '../styles/global.css';

const FEATURES = [
  { icon: BookOpen,       text: 'Browse full curriculum across all degree programs' },
  { icon: GraduationCap, text: 'Manage enrollment for 1,280+ active students'       },
  { icon: BarChart2,     text: 'Real-time analytics and academic performance data'  },
  { icon: Shield,        text: 'Secure, role-based access for staff and students'   },
];

function Login() {
  const navigate = useNavigate();
  const { login } = useContext(AppContext);
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [role,     setRole]     = useState('student');
  const [loading,  setLoading]  = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      login(email, password, role);
      navigate('/dashboard');
      setLoading(false);
    }, 800);
  };

  return (
    <div className="auth-split-page">

      {/* Shared dot-grid texture across the whole page */}
      <div className="auth-grid-texture" />

      {/* ── LEFT  BRANDING PANEL ─────────────────── */}
      <div className="auth-split-left">
        <div className="auth-left-glow" />

        <div className="auth-brand-logo">STRUCTURA</div>
        <p className="auth-brand-tagline">Academic Management Platform</p>

        <h1 className="auth-brand-headline">
          The Future of<br />
          <span>Academic Excellence</span>
        </h1>

        <p className="auth-brand-sub">
          STRUCTURA centralizes your institution's programs, curriculum, and student
          data into one powerful, modern platform — designed for speed, clarity, and control.
        </p>

        <ul className="auth-features">
          {FEATURES.map(({ icon: Icon, text }, i) => (
            <li key={i}>
              <span className="auth-feature-icon"><Icon size={16} /></span>
              {text}
            </li>
          ))}
        </ul>

        <div className="auth-stats">
          {[['5','Programs'],['21','Subjects'],['1,280','Students'],['4','Departments']].map(([num,lbl]) => (
            <div className="auth-stat-item" key={lbl}>
              <span className="auth-stat-num">{num}</span>
              <span className="auth-stat-label">{lbl}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── RIGHT FORM PANEL ─────────────────────── */}
      <div className="auth-split-right">
        <div className="auth-box">

          <div style={{ marginBottom: '28px' }}>
            <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#fff', marginBottom: '6px' }}>
              Welcome back
            </h2>
            <p style={{ color: '#52525b', fontSize: '0.85rem' }}>
              Sign in to access your academic portal
            </p>
          </div>

          <form onSubmit={handleSubmit}>

            <div className="form-group">
              <label>Sign in as</label>
              <select value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="student">Student</option>
                <option value="admin">Administrator</option>
              </select>
            </div>

            <div className="form-group">
              <label>Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={15} style={{
                  position: 'absolute', left: '14px', top: '50%',
                  transform: 'translateY(-50%)', color: '#3f3f46', pointerEvents: 'none'
                }} />
                <input
                  type="email"
                  placeholder="you@structura.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ paddingLeft: '42px' }}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={15} style={{
                  position: 'absolute', left: '14px', top: '50%',
                  transform: 'translateY(-50%)', color: '#3f3f46', pointerEvents: 'none'
                }} />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ paddingLeft: '42px' }}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="auth-btn"
              disabled={loading}
              style={{ marginTop: '20px' }}
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>

          </form>

          <div className="auth-footer">
            Don't have an account?{' '}
            <Link to="/signup">Create one</Link>
          </div>

        </div>
      </div>

    </div>
  );
}

export default Login;
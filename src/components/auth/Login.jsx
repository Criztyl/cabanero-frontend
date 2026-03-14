import { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, BookOpen, GraduationCap, BarChart2, Shield } from 'lucide-react';
import { AppContext } from '../../context/AppContext';
import "../../styles/global.css";

const FEATURES = [
  { icon: BookOpen,      text: 'Browse full curriculum across all degree programs' },
  { icon: GraduationCap, text: 'Manage enrollment for 1,280+ active students'      },
  { icon: BarChart2,     text: 'Real-time analytics and academic performance data' },
  { icon: Shield,        text: 'Secure, role-based access for staff and students'  },
];

function Login() {
  const navigate = useNavigate();
  const { login } = useContext(AppContext);

  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  // ← These must be at component level, NOT inside handleSubmit
  const [liveStats, setLiveStats] = useState({
    programs: 5, subjects: 21, students: '1,280', departments: 4
  });

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/public/stats')
      .then(r => r.json())
      .then(data => setLiveStats({
        programs:    data.programs    ?? 5,
        subjects:    data.subjects    ?? 21,
        students:    data.students?.toLocaleString() ?? '1,280',
        departments: data.departments ?? 4,
      }))
      .catch(() => {}); // keep defaults on error
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await fetch("http://127.0.0.1:8000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem("token", data.token);
        login(data.user, data.token, data.user.role);
        navigate('/dashboard');
      } else {
        setError(data.message || "Invalid credentials. Please try again.");
      }
    } catch (err) {
      console.error("Connection Error:", err);
      setError("Unable to connect to the server. Is Laravel running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-split-page">
      <div className="auth-grid-texture" />

      {/* LEFT BRANDING PANEL */}
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
          data into one powerful, modern platform.
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
          {[
            [liveStats.programs,    'Programs'],
            [liveStats.subjects,    'Subjects'],
            [liveStats.students,    'Students'],
            [liveStats.departments, 'Departments'],
          ].map(([num, lbl]) => (
            <div className="auth-stat-item" key={lbl}>
              <span className="auth-stat-num">{num}</span>
              <span className="auth-stat-label">{lbl}</span>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT FORM PANEL */}
      <div className="auth-split-right">
        <div className="auth-box">
          <div style={{ marginBottom: '28px' }}>
            <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#fff', marginBottom: '6px' }}>
              Welcome back
            </h2>
            <p style={{ color: '#a1a1aa', fontSize: '0.85rem' }}>
              Sign in to access your academic portal
            </p>
          </div>

          {error && (
            <div style={{
              color: '#ff4d4d',
              backgroundColor: 'rgba(255, 77, 77, 0.1)',
              padding: '12px', borderRadius: '8px',
              fontSize: '0.85rem', marginBottom: '20px',
              border: '1px solid rgba(255, 77, 77, 0.2)',
              textAlign: 'center'
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Email */}
            <div className="form-group">
              <label>Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={15} style={{
                  position: 'absolute', left: '14px', top: '50%',
                  transform: 'translateY(-50%)', color: '#71717a', pointerEvents: 'none'
                }} />
                <input
                  type="email"
                  placeholder="you@school.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ paddingLeft: '42px' }}
                  required
                />
              </div>
            </div>

            {/* Password with eye toggle */}
            <div className="form-group">
              <label>Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={15} style={{
                  position: 'absolute', left: '14px', top: '50%',
                  transform: 'translateY(-50%)', color: '#71717a', pointerEvents: 'none'
                }} />
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ paddingLeft: '42px', paddingRight: '42px' }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(prev => !prev)}
                  style={{
                    position: 'absolute', right: '14px', top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'transparent', border: 'none',
                    color: '#71717a', cursor: 'pointer', padding: 0,
                    display: 'flex', alignItems: 'center',
                  }}
                  tabIndex={-1}
                  aria-label={showPass ? 'Hide password' : 'Show password'}
                >
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="auth-btn"
              disabled={loading}
              style={{ marginTop: '20px' }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
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
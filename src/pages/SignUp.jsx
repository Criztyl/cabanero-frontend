import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User } from 'lucide-react';
import { AppContext } from '../context/AppContext';
import '../styles/global.css';

const FEATURES = [
  { icon: BookOpen,       text: 'Browse full curriculum across all degree programs' },
  { icon: GraduationCap, text: 'Manage enrollment for 1,280+ active students'       },
  { icon: BarChart2,     text: 'Real-time analytics and academic performance data'  },
  { icon: Shield,        text: 'Secure, role-based access for staff and students'   },
];

function SignUp() {
  const navigate = useNavigate();
  const { login } = useContext(AppContext);

  const [formData, setFormData] = useState({
    fullName: '', email: '', password: '',
    confirmPassword: '', studentId: '', department: '', agreeTerms: false
  });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (formData.password !== formData.confirmPassword) { setError('Passwords do not match'); return; }
    if (!formData.agreeTerms) { setError('You must agree to the terms'); return; }
    setLoading(true);
    setTimeout(() => {
      if (formData.email && formData.password) {
        login(formData.email, formData.password, 'student');
        navigate('/dashboard');
      }
      setLoading(false);
    }, 1000);
  };

  return (
    /* Reuse the split layout — narrower left panel for signup */
    <div className="auth-split-page">

      {/* Shared background texture */}
      <div className="auth-grid-texture" />

      {/* ── LEFT  — minimal branding ─────────────── */}
      <div className="auth-split-left" style={{ flex: '0 0 38%', padding: '72px 56px' }}>
        <div className="auth-left-glow" />

        <div className="auth-brand-logo">STRUCTURA</div>
        <p className="auth-brand-tagline">Academic Management Platform</p>

        <h1 className="auth-brand-headline" style={{ fontSize: '2.2rem' }}>
          Join the<br />
          <span>Academic Community</span>
        </h1>

        <p className="auth-brand-sub">
          Create your account and gain access to programs, subjects, and your personalized academic dashboard.
        </p>

        {/* Minimal stats — no feature list to keep it light */}
        <div className="auth-stats" style={{ marginTop: 'auto' }}>
          {[['5','Programs'],['21','Subjects'],['1,280','Students']].map(([num,lbl]) => (
            <div className="auth-stat-item" key={lbl}>
              <span className="auth-stat-num">{num}</span>
              <span className="auth-stat-label">{lbl}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── RIGHT — sign-up form ──────────────────── */}
      <div className="auth-split-right" style={{ padding: '40px 48px', alignItems: 'center' }}>
        <div className="auth-box" style={{ maxWidth: '560px' }}>

          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', marginBottom: '5px' }}>
              Create Account
            </h2>
            <p style={{ color: '#52525b', fontSize: '0.85rem' }}>
              Fill in your details to get started
            </p>
          </div>

          {error && (
            <div style={{
              color: '#ff4466', background: 'rgba(255,68,102,0.08)',
              border: '1px solid rgba(255,68,102,0.2)',
              borderRadius: '10px', padding: '10px 14px',
              marginBottom: '16px', fontSize: '0.82rem'
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="signup-fields-container">

              <div className="form-group">
                <label>Full Name</label>
                <div style={{ position: 'relative' }}>
                  <User size={15} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#3f3f46', pointerEvents: 'none' }} />
                  <input type="text" name="fullName" placeholder="John Doe"
                    value={formData.fullName} onChange={handleChange}
                    style={{ paddingLeft: '42px' }} required />
                </div>
              </div>

              <div className="form-group">
                <label>Email Address</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={15} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#3f3f46', pointerEvents: 'none' }} />
                  <input type="email" name="email" placeholder="student@structura.edu"
                    value={formData.email} onChange={handleChange}
                    style={{ paddingLeft: '42px' }} required />
                </div>
              </div>

              <div className="form-group">
                <label>Student ID</label>
                <input type="text" name="studentId" placeholder="2024-001234"
                  value={formData.studentId} onChange={handleChange} required />
              </div>

              <div className="form-group">
                <label>Department</label>
                <select name="department" value={formData.department} onChange={handleChange} required>
                  <option value="">Select Department</option>
                  <option value="IT">Information Technology</option>
                  <option value="CS">Computer Science</option>
                </select>
              </div>

              <div className="form-group">
                <label>Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={15} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#3f3f46', pointerEvents: 'none' }} />
                  <input type="password" name="password" placeholder="••••••••"
                    value={formData.password} onChange={handleChange}
                    style={{ paddingLeft: '42px' }} required />
                </div>
              </div>

              <div className="form-group">
                <label>Confirm Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={15} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#3f3f46', pointerEvents: 'none' }} />
                  <input type="password" name="confirmPassword" placeholder="••••••••"
                    value={formData.confirmPassword} onChange={handleChange}
                    style={{ paddingLeft: '42px' }} required />
                </div>
              </div>

            </div>{/* end signup-fields-container */}

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '14px 0 20px' }}>
              <input
                type="checkbox" id="terms" name="agreeTerms"
                checked={formData.agreeTerms} onChange={handleChange}
                style={{ width: '16px', height: '16px', accentColor: '#ff0055', cursor: 'pointer' }}
              />
              <label htmlFor="terms" style={{ fontSize: '0.82rem', color: '#71717a', cursor: 'pointer' }}>
                I agree to the <span style={{ color: '#00d4ff' }}>Terms &amp; Conditions</span>
              </label>
            </div>

            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? 'Creating Account…' : 'Create Account'}
            </button>
          </form>

          <div className="auth-footer">
            Already have an account?{' '}
            <Link to="/login">Sign In</Link>
          </div>

        </div>
      </div>

    </div>
  );
}

export default SignUp;
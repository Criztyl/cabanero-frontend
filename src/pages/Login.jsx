import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock } from 'lucide-react';
import { AppContext } from '../context/AppContext';
import '../styles/global.css';

function Login() {
  const navigate = useNavigate();
  const { login } = useContext(AppContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [loading, setLoading] = useState(false);

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
    <div className="auth-container">
      <div className="auth-box">
        {/* Header Section */}
        <div style={{ textAlign: 'center', marginBottom: '35px' }}>
          <h1 style={{ 
            color: 'var(--primary-color)', 
            letterSpacing: '3px', 
            fontWeight: 900,
            fontSize: '32px',
            textShadow: '0 0 15px rgba(0, 212, 255, 0.2)'
          }}>
            STRUCTURA
          </h1>
          <h2 style={{ fontSize: '22px', marginTop: '12px', color: 'var(--text-primary)' }}>
            Welcome Back
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '5px' }}>
            Access your academic portal
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Role Selection */}
          <div className="form-group">
            <label>I AM A...</label>
            <select 
              value={role} 
              onChange={(e) => setRole(e.target.value)}
              style={{ cursor: 'pointer' }}
            >
              <option value="student">Student</option>
              <option value="admin">Administrator</option>
            </  select>
          </div>

          {/* Email Address */}
          <div className="form-group">
            <label>Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail 
                size={18} 
                style={{ 
                  position: 'absolute', 
                  left: '14px', 
                  top: '50%', 
                  transform: 'translateY(-50%)',
                  color: 'var(--text-tertiary)' 
                }} 
              />
              <input 
                type="email" 
                placeholder="admin@structura.edu" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                style={{ paddingLeft: '45px' }} 
                required 
              />
            </div>
          </div>

          {/* Password */}
          <div className="form-group">
            <label>Password</label>
            <div style={{ position: 'relative' }}>
              <Lock 
                size={18} 
                style={{ 
                  position: 'absolute', 
                  left: '14px', 
                  top: '50%', 
                  transform: 'translateY(-50%)',
                  color: 'var(--text-tertiary)' 
                }} 
              />
              <input 
                type="password" 
                placeholder="••••••••" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                style={{ paddingLeft: '45px' }} 
                required 
              />
            </div>
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            className="auth-btn" 
            disabled={loading}
            style={{ 
              marginTop: '15px',
              opacity: loading ? 0.7 : 1,
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Entering...' : 'Sign In'}
          </button>
        </form>

        {/* Footer Link */}
        <div className="auth-footer" style={{ marginTop: '30px' }}>
          <p style={{ color: 'var(--text-secondary)' }}>
            Don't have an account? <Link to="/signup" style={{ color: 'var(--primary-color)', textDecoration: 'none', fontWeight: 600 }}>Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
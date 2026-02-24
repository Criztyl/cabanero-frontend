import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User } from 'lucide-react';
import { AppContext } from '../context/AppContext';
import '../styles/global.css';

function SignUp() {
  const navigate = useNavigate();
  const { login } = useContext(AppContext);
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    studentId: '',
    department: '',
    agreeTerms: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!formData.agreeTerms) {
      setError('You must agree to the terms');
      return;
    }

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
    <div className="auth-container">
      <div className="auth-box">
        <div className="auth-header" style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div className="auth-logo" style={{ color: 'var(--primary-color)', fontSize: '32px', fontWeight: 900, letterSpacing: '2px' }}>STRUCTURA</div>
          <h2 style={{ fontSize: '22px', marginTop: '10px' }}>Create Account</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Join our academic community</p>
        </div>

        {error && <div style={{ color: '#ff7675', marginBottom: '15px', textAlign: 'center', fontSize: '13px' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          {/* THE GRID CONTAINER FOR DESKTOP WIDTH */}
          <div className="signup-fields-container">
            <div className="form-group">
              <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Full Name</label>
              <div style={{ position: 'relative' }}>
                <User size={16} style={{ position: 'absolute', left: '15px', top: '16px', color: 'var(--text-tertiary)' }} />
                <input type="text" name="fullName" placeholder="John Doe" value={formData.fullName} onChange={handleChange} style={{ paddingLeft: '48px' }} required />
              </div>
            </div>

            <div className="form-group">
              <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: '15px', top: '16px', color: 'var(--text-tertiary)' }} />
                <input type="email" name="email" placeholder="student@structura.edu" value={formData.email} onChange={handleChange} style={{ paddingLeft: '48px' }} required />
              </div>
            </div>

            <div className="form-group">
              <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Student ID</label>
              <input type="text" name="studentId" placeholder="2024-001234" value={formData.studentId} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Department</label>
              <select name="department" value={formData.department} onChange={handleChange} required>
                <option value="">Select Dept</option>
                <option value="IT">IT</option>
                <option value="CS">Computer Science</option>
              </select>
            </div>

            <div className="form-group">
              <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Password</label>
              <input type="password" name="password" placeholder="••••••••" value={formData.password} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Confirm Password</label>
              <input type="password" name="confirmPassword" placeholder="••••••••" value={formData.confirmPassword} onChange={handleChange} required />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '15px 0' }}>
            <input type="checkbox" id="terms" name="agreeTerms" checked={formData.agreeTerms} onChange={handleChange} />
            <label htmlFor="terms" style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>I agree to the Terms & Conditions</label>
          </div>

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="auth-footer" style={{ textAlign: 'center', marginTop: '25px' }}>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
            Already have an account? <Link to="/login" style={{ color: 'var(--primary-color)', textDecoration: 'none', fontWeight: 600 }}>Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default SignUp;
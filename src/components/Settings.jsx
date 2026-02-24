import { useState, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { User, Lock, Bell, Moon, Sun, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './Settings.css';

function Settings() {
  const navigate = useNavigate();
  const { currentUser, updateUser, logout, darkMode, toggleDarkMode } = useContext(AppContext);
  const [activeTab, setActiveTab] = useState('profile');
  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    department: currentUser?.department || '',
    phone: '+63 (977) 123-4567'
  });
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    pushNotifications: true,
    courseUpdates: true
  });

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProfileSave = () => {
    updateUser({
      name: formData.name,
      email: formData.email,
      department: formData.department
    });
    alert('Profile updated successfully!');
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleNotificationChange = (e) => {
    const { name, checked } = e.target;
    setNotifications(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  return (
    <div className="settings-container">
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px'
      }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '5px' }}>Settings</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Manage your account and preferences</p>
        </div>
      </div>

      <div className="settings-layout">
        {/* Tabs */}
        <div className="settings-tabs">
          <button
            className={`settings-tab ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <User size={18} />
            <span>Profile</span>
          </button>
          <button
            className={`settings-tab ${activeTab === 'theme' ? 'active' : ''}`}
            onClick={() => setActiveTab('theme')}
          >
            <Moon size={18} />
            <span>Appearance</span>
          </button>
          <button
            className={`settings-tab ${activeTab === 'notifications' ? 'active' : ''}`}
            onClick={() => setActiveTab('notifications')}
          >
            <Bell size={18} />
            <span>Notifications</span>
          </button>
          <button
            className={`settings-tab ${activeTab === 'security' ? 'active' : ''}`}
            onClick={() => setActiveTab('security')}
          >
            <Lock size={18} />
            <span>Security</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="settings-content">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="settings-panel">
              <h2 style={{ marginBottom: '20px' }}>Profile Information</h2>

              {/* Avatar Section */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '20px',
                marginBottom: '30px',
                paddingBottom: '30px',
                borderBottom: '1px solid var(--border-color)'
              }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, var(--primary-color), var(--primary-dark))`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '32px',
                  fontWeight: 700
                }}>
                  {currentUser?.name?.charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 600, marginBottom: '4px' }}>{currentUser?.name}</p>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '10px' }}>
                    {currentUser?.role === 'admin' ? 'Administrator' : 'Student'}
                  </p>
                  <button className="btn btn-secondary" style={{ fontSize: '12px' }}>
                    Change Avatar
                  </button>
                </div>
              </div>

              {/* Form Fields */}
              <div style={{ display: 'grid', gap: '20px' }}>
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleProfileChange}
                    placeholder="Your name"
                  />
                </div>

                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleProfileChange}
                    placeholder="your.email@structura.edu"
                  />
                </div>

                <div className="form-group">
                  <label>Department</label>
                  <input
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleProfileChange}
                    placeholder="Your department"
                  />
                </div>

                <div className="form-group">
                  <label>Phone Number</label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="Your phone number"
                  />
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                  <button className="btn btn-primary" onClick={handleProfileSave}>
                    Save Changes
                  </button>
                  <button className="btn btn-secondary">
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Theme Tab */}
          {activeTab === 'theme' && (
            <div className="settings-panel">
              <h2 style={{ marginBottom: '20px' }}>Appearance Settings</h2>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '20px'
              }}>
                {/* Light Theme */}
                <div className={`theme-card ${!darkMode ? 'active' : ''}`} onClick={() => !darkMode || toggleDarkMode()}>
                  <div style={{
                    background: '#ffffff',
                    border: '1px solid #e0e0e0',
                    borderRadius: '12px',
                    padding: '40px',
                    marginBottom: '12px',
                    textAlign: 'center'
                  }}>
                    <Sun size={32} color="#6c5ce7" />
                  </div>
                  <h3>Light</h3>
                  <p>Choose a light interface</p>
                </div>

                {/* Dark Theme */}
                <div className={`theme-card ${darkMode ? 'active' : ''}`} onClick={() => darkMode || toggleDarkMode()}>
                  <div style={{
                    background: '#121212',
                    border: '1px solid #333333',
                    borderRadius: '12px',
                    padding: '40px',
                    marginBottom: '12px',
                    textAlign: 'center'
                  }}>
                    <Moon size={32} color="#8b7aff" />
                  </div>
                  <h3>Dark</h3>
                  <p>Choose a dark interface</p>
                </div>
              </div>

              {/* Additional Appearance Options */}
              <div style={{
                marginTop: '40px',
                paddingTop: '30px',
                borderTop: '1px solid var(--border-color)'
              }}>
                <h3 style={{ marginBottom: '20px' }}>Compact View</h3>
                <div className="checkbox-group">
                  <input type="checkbox" id="compact" defaultChecked={false} />
                  <label htmlFor="compact">Enable compact sidebar</label>
                </div>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="settings-panel">
              <h2 style={{ marginBottom: '20px' }}>Notification Preferences</h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{
                  background: 'var(--glass-bg)',
                  border: '1px solid var(--glass-border)',
                  padding: '20px',
                  borderRadius: '12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <h3 style={{ marginBottom: '4px' }}>Email Notifications</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
                      Receive updates via email
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    name="emailNotifications"
                    checked={notifications.emailNotifications}
                    onChange={handleNotificationChange}
                  />
                </div>

                <div style={{
                  background: 'var(--glass-bg)',
                  border: '1px solid var(--glass-border)',
                  padding: '20px',
                  borderRadius: '12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <h3 style={{ marginBottom: '4px' }}>Push Notifications</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
                      Receive browser notifications
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    name="pushNotifications"
                    checked={notifications.pushNotifications}
                    onChange={handleNotificationChange}
                  />
                </div>

                <div style={{
                  background: 'var(--glass-bg)',
                  border: '1px solid var(--glass-border)',
                  padding: '20px',
                  borderRadius: '12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <h3 style={{ marginBottom: '4px' }}>Course Updates</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
                      Updates from your enrolled courses
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    name="courseUpdates"
                    checked={notifications.courseUpdates}
                    onChange={handleNotificationChange}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="settings-panel">
              <h2 style={{ marginBottom: '20px' }}>Security Settings</h2>

              {/* Change Password */}
              <div style={{ marginBottom: '30px', paddingBottom: '30px', borderBottom: '1px solid var(--border-color)' }}>
                <h3 style={{ marginBottom: '20px' }}>Change Password</h3>
                <div style={{ display: 'grid', gap: '15px', maxWidth: '400px' }}>
                  <div className="form-group">
                    <label>Current Password</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                    />
                  </div>
                  <div className="form-group">
                    <label>New Password</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                    />
                  </div>
                  <div className="form-group">
                    <label>Confirm Password</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                    />
                  </div>
                  <button className="btn btn-primary">Update Password</button>
                </div>
              </div>

              {/* Danger Zone */}
              <div>
                <h3 style={{ marginBottom: '20px', color: 'var(--danger-color)' }}>Danger Zone</h3>
                <button className="btn btn-danger" onClick={handleLogout}>
                  <LogOut size={16} />
                  Logout from Account
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Settings;

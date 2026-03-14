import { useState, useContext } from 'react';
import { User, Moon, Bell, Shield, Save, Check } from 'lucide-react';
import { AppContext } from '../../context/AppContext';
import api from '../../services/api';

const TAB_ICONS = { Profile: User, Appearance: Moon, Notifications: Bell, Security: Shield };

export default function Settings() {
  // ← use the correct names from AppContext
  const {
    currentUser, setCurrentUser,
    darkMode, toggleDarkMode,
    compactSidebar, toggleCompact,
    notifications, saveNotifications,
  } = useContext(AppContext);

  const [activeTab, setActiveTab] = useState('Profile');
  const [saved,     setSaved]     = useState('');
  const [error,     setError]     = useState('');
  const [saving,    setSaving]    = useState(false);

  const [profile, setProfile] = useState({
    name:       currentUser?.name       || '',
    email:      currentUser?.email      || '',
    department: currentUser?.department || '',
    phone:      currentUser?.phone      || '',
  });

  const [passwords, setPasswords] = useState({
    current_password: '', new_password: '', confirm_password: ''
  });

  const [notifPrefs, setNotifPrefs] = useState({
    emailNotifications: notifications?.emailNotifications ?? true,
    pushNotifications:  notifications?.pushNotifications  ?? true,
    courseUpdates:      notifications?.courseUpdates       ?? true,
  });

  const showSaved = (msg = 'Changes saved!') => {
    setSaved(msg); setTimeout(() => setSaved(''), 3000);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault(); setError(''); setSaving(true);
    try {
      // ← correct route: /user/profile
      const res = await api.put('/user/profile', profile);
      setCurrentUser(res.data);
      localStorage.setItem('user', JSON.stringify(res.data));
      showSaved('Profile updated!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save profile.');
    } finally { setSaving(false); }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault(); setError(''); setSaving(true);
    if (passwords.new_password !== passwords.confirm_password) {
      setError('New passwords do not match.'); setSaving(false); return;
    }
    try {
      // ← correct route: POST /user/password with new_password_confirmation
      await api.post('/user/password', {
        current_password:      passwords.current_password,
        new_password:          passwords.new_password,
        new_password_confirmation: passwords.confirm_password,
      });
      setPasswords({ current_password:'', new_password:'', confirm_password:'' });
      showSaved('Password changed!');
    } catch (err) {
      setError(err.response?.data?.message || 'Incorrect current password.');
    } finally { setSaving(false); }
  };

  const handleSaveNotifications = () => {
    saveNotifications(notifPrefs); // ← correct: saveNotifications not updateNotifications
    showSaved('Preferences saved!');
  };

  const inputStyle = {
    width:'100%', background:'rgba(255,255,255,0.05)',
    border:'1px solid var(--glass-border)', borderRadius:'10px',
    padding:'10px 14px', color:'#fff', fontSize:'14px',
    outline:'none', boxSizing:'border-box',
  };
  const labelStyle = {
    fontSize:'12px', color:'var(--text-muted)', display:'block',
    marginBottom:'6px', textTransform:'uppercase', letterSpacing:'0.5px'
  };

  const Toggle = ({ on, onToggle }) => (
    <div onClick={onToggle} style={{
      width:'44px', height:'24px', borderRadius:'12px', position:'relative',
      background: on ? 'var(--primary-color)' : 'rgba(255,255,255,0.15)',
      transition:'background 0.2s', cursor:'pointer', flexShrink:0
    }}>
      <div style={{
        position:'absolute', top:'3px', left: on ? '23px' : '3px',
        width:'18px', height:'18px', borderRadius:'50%',
        background:'#fff', transition:'left 0.2s'
      }} />
    </div>
  );

  return (
    <div className="dashboard-wrapper-inner">
      <div style={{ marginBottom:'28px' }}>
        <h1 style={{ fontSize:'clamp(20px,5vw,28px)', fontWeight:800, margin:0 }}>Settings</h1>
        <p style={{ color:'var(--text-muted)', marginTop:'5px', fontSize:'14px' }}>
          Manage your account and preferences
        </p>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'220px 1fr', gap:'20px' }}>
        {/* Tab sidebar */}
        <div className="program-card" style={{ padding:'12px', height:'fit-content' }}>
          {Object.entries(TAB_ICONS).map(([tab, Icon]) => (
            <button key={tab}
              onClick={() => { setActiveTab(tab); setError(''); setSaved(''); }}
              style={{
                display:'flex', alignItems:'center', gap:'12px', width:'100%',
                padding:'10px 14px', borderRadius:'10px', border:'none',
                background: activeTab===tab ? 'rgba(255,0,85,0.15)' : 'transparent',
                borderLeft: activeTab===tab ? '3px solid var(--primary-color)' : '3px solid transparent',
                color: activeTab===tab ? '#fff' : 'var(--text-muted)',
                cursor:'pointer', fontSize:'14px', fontWeight: activeTab===tab ? 600 : 400,
                textAlign:'left', transition:'all 0.2s', marginBottom:'2px'
              }}>
              <Icon size={16} />
              {tab}
            </button>
          ))}
        </div>

        {/* Content panel */}
        <div className="program-card" style={{ cursor:'default' }}>
          {saved && (
            <div style={{ display:'flex', alignItems:'center', gap:'8px',
                          background:'rgba(0,255,133,0.1)', border:'1px solid rgba(0,255,133,0.2)',
                          borderRadius:'10px', padding:'10px 14px', marginBottom:'20px',
                          color:'#00ff85', fontSize:'14px' }}>
              <Check size={16} /> {saved}
            </div>
          )}
          {error && (
            <div style={{ background:'rgba(255,68,102,0.1)', border:'1px solid rgba(255,68,102,0.2)',
                          borderRadius:'10px', padding:'10px 14px', marginBottom:'20px',
                          color:'#ff4466', fontSize:'14px' }}>
              {error}
            </div>
          )}

          {/* ── PROFILE ── */}
          {activeTab === 'Profile' && (
            <form onSubmit={handleSaveProfile}>
              <h2 style={{ fontSize:'18px', fontWeight:700, marginBottom:'24px' }}>
                Profile Information
              </h2>
              <div style={{ display:'flex', alignItems:'center', gap:'16px', marginBottom:'24px' }}>
                <div style={{ width:'64px', height:'64px', borderRadius:'50%',
                              background:'var(--primary-color)', display:'flex',
                              alignItems:'center', justifyContent:'center',
                              fontSize:'24px', fontWeight:700, flexShrink:0 }}>
                  {currentUser?.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p style={{ fontWeight:600, fontSize:'16px' }}>{currentUser?.name}</p>
                  <p style={{ color:'var(--text-muted)', fontSize:'13px', textTransform:'capitalize' }}>
                    {currentUser?.role || 'Student'}
                  </p>
                </div>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px' }}>
                {[
                  { label:'Full Name',  name:'name',       type:'text'  },
                  { label:'Email',      name:'email',      type:'email' },
                  { label:'Department', name:'department', type:'text'  },
                  { label:'Phone',      name:'phone',      type:'text'  },
                ].map(f => (
                  <div key={f.name}>
                    <label style={labelStyle}>{f.label}</label>
                    <input type={f.type} value={profile[f.name]}
                      onChange={e => setProfile(p => ({...p, [f.name]: e.target.value}))}
                      style={inputStyle} />
                  </div>
                ))}
              </div>
              <button type="submit" disabled={saving}
                style={{ marginTop:'24px', display:'flex', alignItems:'center', gap:'8px',
                         background:'var(--primary-color)', border:'none', borderRadius:'10px',
                         padding:'10px 24px', color:'#fff', fontWeight:600,
                         cursor:'pointer', fontSize:'14px' }}>
                <Save size={15} /> {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          )}

          {/* ── APPEARANCE ── */}
          {activeTab === 'Appearance' && (
            <div>
              <h2 style={{ fontSize:'18px', fontWeight:700, marginBottom:'24px' }}>
                Appearance Settings
              </h2>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr',
                            gap:'16px', marginBottom:'24px' }}>
                {[
                  { label:'Light', value:'light', icon:'☀️', desc:'Light interface' },
                  { label:'Dark',  value:'dark',  icon:'🌙', desc:'Dark interface'  },
                ].map(t => (
                  <div key={t.value} onClick={toggleDarkMode}  // ← toggleDarkMode not toggleTheme
                    style={{
                      border:`2px solid ${(!darkMode && t.value==='light') || (darkMode && t.value==='dark')
                        ? 'var(--primary-color)' : 'var(--glass-border)'}`,
                      borderRadius:'12px', padding:'24px', cursor:'pointer', textAlign:'center',
                      background: (!darkMode && t.value==='light') || (darkMode && t.value==='dark')
                        ? 'rgba(255,0,85,0.08)' : 'transparent',
                      transition:'all 0.2s'
                    }}>
                    <div style={{ fontSize:'32px', marginBottom:'12px' }}>{t.icon}</div>
                    <p style={{ fontWeight:600, marginBottom:'4px' }}>{t.label}</p>
                    <p style={{ fontSize:'12px', color:'var(--text-muted)' }}>{t.desc}</p>
                  </div>
                ))}
              </div>

              <div style={{ borderTop:'1px solid var(--glass-border)', paddingTop:'20px' }}>
                <h3 style={{ fontSize:'15px', fontWeight:600, marginBottom:'6px' }}>
                  Compact Sidebar
                </h3>
                <p style={{ fontSize:'12px', color:'var(--text-muted)', marginBottom:'16px' }}>
                  💡 Tip: You can also click the <strong>STRUCTURA</strong> logo in the sidebar
                  to quickly toggle compact mode without coming to Settings.
                </p>
                <label style={{ display:'flex', alignItems:'center', gap:'12px', cursor:'pointer' }}>
                  <Toggle on={compactSidebar} onToggle={toggleCompact} />
                  <div>
                    <p style={{ fontSize:'14px', fontWeight:500 }}>Enable compact sidebar</p>
                    <p style={{ fontSize:'12px', color:'var(--text-muted)' }}>
                      Collapse sidebar to icons only
                    </p>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* ── NOTIFICATIONS ── */}
          {activeTab === 'Notifications' && (
            <div>
              <h2 style={{ fontSize:'18px', fontWeight:700, marginBottom:'24px' }}>
                Notification Preferences
              </h2>
              {[
                { key:'emailNotifications', label:'Email Notifications', desc:'Receive updates via email'          },
                { key:'pushNotifications',  label:'Push Notifications',  desc:'Receive browser notifications'     },
                { key:'courseUpdates',      label:'Course Updates',       desc:'Updates from your enrolled courses'},
              ].map(n => (
                <div key={n.key} style={{
                  display:'flex', justifyContent:'space-between', alignItems:'center',
                  padding:'16px', borderRadius:'12px', border:'1px solid var(--glass-border)',
                  marginBottom:'12px'
                }}>
                  <div>
                    <p style={{ fontSize:'14px', fontWeight:500 }}>{n.label}</p>
                    <p style={{ fontSize:'12px', color:'var(--text-muted)', marginTop:'2px' }}>{n.desc}</p>
                  </div>
                  <Toggle
                    on={notifPrefs[n.key]}
                    onToggle={() => setNotifPrefs(p => ({...p, [n.key]: !p[n.key]}))}
                  />
                </div>
              ))}
              <button onClick={handleSaveNotifications}
                style={{ marginTop:'8px', display:'flex', alignItems:'center', gap:'8px',
                         background:'var(--primary-color)', border:'none', borderRadius:'10px',
                         padding:'10px 24px', color:'#fff', fontWeight:600,
                         cursor:'pointer', fontSize:'14px' }}>
                <Save size={15} /> Save Preferences
              </button>
            </div>
          )}

          {/* ── SECURITY ── */}
          {activeTab === 'Security' && (
            <form onSubmit={handleChangePassword}>
              <h2 style={{ fontSize:'18px', fontWeight:700, marginBottom:'24px' }}>
                Security Settings
              </h2>
              <h3 style={{ fontSize:'15px', fontWeight:600, marginBottom:'16px' }}>
                Change Password
              </h3>
              <div style={{ display:'flex', flexDirection:'column', gap:'14px', maxWidth:'400px' }}>
                {[
                  { label:'Current Password', name:'current_password' },
                  { label:'New Password',      name:'new_password'     },
                  { label:'Confirm Password',  name:'confirm_password' },
                ].map(f => (
                  <div key={f.name}>
                    <label style={labelStyle}>{f.label}</label>
                    <input type="password" value={passwords[f.name]}
                      onChange={e => setPasswords(p => ({...p, [f.name]: e.target.value}))}
                      placeholder="••••••••" style={inputStyle} required />
                  </div>
                ))}
              </div>
              <button type="submit" disabled={saving}
                style={{ marginTop:'24px', display:'flex', alignItems:'center', gap:'8px',
                         background:'var(--primary-color)', border:'none', borderRadius:'10px',
                         padding:'10px 24px', color:'#fff', fontWeight:600,
                         cursor:'pointer', fontSize:'14px' }}>
                <Shield size={15} /> {saving ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
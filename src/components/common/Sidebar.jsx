import { NavLink, useNavigate } from 'react-router-dom';
import { useContext, useState } from 'react';
import {
  LayoutDashboard, BookOpen, Library, Settings,
  LogOut, Users, CalendarDays
} from 'lucide-react';
import { AppContext } from '../../context/AppContext';

function Sidebar() {
  const navigate = useNavigate();
  const { logout, userRole, compactSidebar } = useContext(AppContext);
  const [showConfirm, setShowConfirm] = useState(false);

  const isAdmin = userRole === 'admin';

  const NAV_ITEMS = [
    { to: '/dashboard',            icon: LayoutDashboard, label: 'Overview',     all:   true  },
    { to: '/dashboard/programs',   icon: BookOpen,        label: 'Programs',     all:   true  },
    { to: '/dashboard/subjects',   icon: Library,         label: 'Subjects',     all:   true  },
    { to: '/dashboard/students',   icon: Users,           label: 'Students',     admin: true  },
    { to: '/dashboard/calendar',   icon: CalendarDays,    label: 'School Days',  all:   true  },
  ];

  const visibleItems = NAV_ITEMS.filter(item => item.all || (item.admin && isAdmin));

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      <aside className="sidebar" style={{
        width: compactSidebar ? '68px' : 'var(--sidebar-width)',
        transition: 'width 0.25s ease',
        overflow: 'hidden',
      }}>
        {/* Logo */}
        <div className="sidebar-logo" style={{
          justifyContent: compactSidebar ? 'center' : 'flex-start',
          fontSize: compactSidebar ? '1rem' : undefined,
          letterSpacing: compactSidebar ? '0' : undefined,
        }}>
          {compactSidebar ? 'S' : 'STRUCTURA'}
        </div>

        {/* Role Badge */}
        {!compactSidebar && (
          <div style={{
            marginBottom: '16px', marginTop: '-16px',
            padding: '4px 12px',
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            background: isAdmin ? 'rgba(255,0,85,0.1)' : 'rgba(0,212,255,0.1)',
            border: `1px solid ${isAdmin ? 'rgba(255,0,85,0.3)' : 'rgba(0,212,255,0.3)'}`,
            borderRadius: '20px',
            fontSize: '10px', fontWeight: 700,
            textTransform: 'uppercase', letterSpacing: '1px',
            color: isAdmin ? 'var(--primary-color)' : 'var(--secondary-color)',
          }}>
            <div style={{
              width: '6px', height: '6px', borderRadius: '50%',
              background: isAdmin ? 'var(--primary-color)' : 'var(--secondary-color)',
            }} />
            {isAdmin ? 'Administrator' : 'Student'}
          </div>
        )}

        {/* Nav */}
        <nav className="nav-list">
          {visibleItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/dashboard'}
              title={compactSidebar ? label : undefined}
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
              style={{ justifyContent: compactSidebar ? 'center' : undefined }}
            >
              <Icon size={18} style={{ flexShrink: 0 }} />
              {!compactSidebar && label}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          <NavLink
            to="/dashboard/settings"
            title={compactSidebar ? 'Settings' : undefined}
            className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            style={{ justifyContent: compactSidebar ? 'center' : undefined }}
          >
            <Settings size={18} style={{ flexShrink: 0 }} />
            {!compactSidebar && 'Settings'}
          </NavLink>

          <button
            className="sidebar-logout-btn"
            title={compactSidebar ? 'Logout' : undefined}
            onClick={() => setShowConfirm(true)}
            style={{ justifyContent: compactSidebar ? 'center' : undefined }}
          >
            <LogOut size={18} style={{ flexShrink: 0 }} />
            {!compactSidebar && 'Logout'}
          </button>
        </div>
      </aside>

      {/* Logout Confirmation Modal */}
      {showConfirm && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999,
        }}>
          <div style={{
            background: 'var(--bg-panel)',
            border: '1px solid var(--glass-border)',
            borderRadius: '20px', padding: '32px',
            width: '360px', textAlign: 'center',
          }}>
            <div style={{
              width: '56px', height: '56px', borderRadius: '50%',
              background: 'rgba(255,68,102,0.1)',
              border: '1px solid rgba(255,68,102,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px',
            }}>
              <LogOut size={24} color="var(--danger-color)" />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '8px' }}>
              Sign Out?
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '24px' }}>
              Are you sure you want to sign out of STRUCTURA?
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                className="btn btn-secondary"
                style={{ flex: 1 }}
                onClick={() => setShowConfirm(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-danger"
                style={{ flex: 1 }}
                onClick={handleLogout}
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Sidebar;
import { NavLink, useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { LayoutDashboard, BookOpen, Library, Settings, LogOut } from 'lucide-react';
import { AppContext } from '../context/AppContext';

const NAV_ITEMS = [
  { to: '/dashboard',          icon: LayoutDashboard, label: 'Overview'  },
  { to: '/dashboard/programs', icon: BookOpen,        label: 'Programs'  },
  { to: '/dashboard/subjects', icon: Library,         label: 'Subjects'  },
];

function Sidebar() {
  const navigate      = useNavigate();
  const { logout }    = useContext(AppContext);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="sidebar">

      {/* Logo */}
      <div className="sidebar-logo">
        STRUCTURA
      </div>

      {/* Main nav */}
      <nav className="nav-list">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/dashboard'}
            className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Footer: Settings + Logout */}
      <div className="sidebar-footer">
        <NavLink
          to="/dashboard/settings"
          className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
        >
          <Settings size={18} />
          Settings
        </NavLink>

        <button className="sidebar-logout-btn" onClick={handleLogout}>
          <LogOut size={18} />
          Logout
        </button>
      </div>

    </aside>
  );
}

export default Sidebar;
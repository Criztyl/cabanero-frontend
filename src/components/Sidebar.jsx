import { useContext } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { LayoutDashboard, BookOpen, FileText, Settings, ShieldCheck } from 'lucide-react';
import { AppContext } from '../context/AppContext';
import './Sidebar.css'; // <--- ADD THIS LINE

const Sidebar = () => {
  const { currentUser } = useContext(AppContext);
  const location = useLocation();

  const isActive = (path) => {
    // Exact match for dashboard overview, startsWith for others
    if (path === '/dashboard') return location.pathname === '/dashboard';
    return location.pathname.startsWith(path);
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">Structura</div>

      <nav className="nav-list">
        <Link to="/dashboard" className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}>
          <LayoutDashboard size={20} />
          <span>Overview</span>
        </Link>

        <Link to="/dashboard/programs" className={`nav-link ${isActive('/dashboard/programs') ? 'active' : ''}`}>
          <FileText size={20} />
          <span>Programs</span>
        </Link>

        <Link to="/dashboard/subjects" className={`nav-link ${isActive('/dashboard/subjects') ? 'active' : ''}`}>
          <BookOpen size={20} />
          <span>Subjects</span>
        </Link>

        {currentUser?.role === 'admin' && (
          <Link to="/dashboard/manage" className={`nav-link ${isActive('/dashboard/manage') ? 'active' : ''}`}>
            <ShieldCheck size={20} />
            <span>Management</span>
          </Link>
        )}
      </nav>

      <div className="sidebar-footer">
        <Link to="/dashboard/settings" className={`nav-link ${isActive('/dashboard/settings') ? 'active' : ''}`}>
          <Settings size={20} />
          <span>Settings</span>
        </Link>
      </div>
    </aside>
  );
};

export default Sidebar;
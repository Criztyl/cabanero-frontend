import { NavLink, useNavigate } from 'react-router-dom';
import { useContext, useState } from 'react';
import {
  LayoutDashboard, BookOpen, Library, Settings,
  LogOut, Users, CalendarDays, Bell, ClipboardList,
  PanelLeftClose, PanelLeftOpen
} from 'lucide-react';
import { AppContext } from '../../context/AppContext';
import ConfirmDialog from './ConfirmDialog';

function Sidebar() {
  const navigate = useNavigate();
  const { logout, userRole, compactSidebar, toggleCompact, unreadCount } = useContext(AppContext);
  const [showConfirm, setShowConfirm] = useState(false);
  const isAdmin = userRole === 'admin';

  const NAV_ITEMS = [
    { to:'/dashboard',          icon:LayoutDashboard, label:'Overview',    all:true   },
    { to:'/dashboard/programs', icon:BookOpen,        label:'Programs',    all:true   },
    { to:'/dashboard/subjects', icon:Library,         label:'Subjects',    all:true   },
    { to:'/dashboard/students', icon:Users,           label:'Students',    admin:true },
    { to:'/dashboard/requests', icon:ClipboardList,   label:'Requests',    admin:true },
    { to:'/dashboard/calendar', icon:CalendarDays,    label:'School Days', all:true   },
  ];

  const visibleItems = NAV_ITEMS.filter(i => i.all || (i.admin && isAdmin));

  return (
    <>
      <aside className="sidebar" style={{
        width: compactSidebar ? '68px' : 'var(--sidebar-width)',
        transition:'width 0.25s ease', overflow:'hidden',
      }}>
        {/* Logo — click to toggle compact */}
        <div className="sidebar-logo" onClick={toggleCompact}
          title={compactSidebar ? 'Expand sidebar' : 'Collapse sidebar'}
          style={{
            justifyContent: compactSidebar ? 'center' : 'space-between',
            cursor:'pointer', userSelect:'none',
            display:'flex', alignItems:'center', gap:'8px',
          }}>
          <span>{compactSidebar ? 'S' : 'STRUCTURA'}</span>
          {!compactSidebar && <PanelLeftClose size={15} style={{ opacity:0.5 }} />}
          {compactSidebar  && <PanelLeftOpen  size={15} style={{ opacity:0.5 }} />}
        </div>

        {/* Role badge */}
        {!compactSidebar && (
          <div style={{
            marginBottom:'16px', marginTop:'-16px', padding:'4px 12px',
            display:'inline-flex', alignItems:'center', gap:'6px',
            background: isAdmin ? 'rgba(255,0,85,0.1)' : 'rgba(0,212,255,0.1)',
            border:`1px solid ${isAdmin ? 'rgba(255,0,85,0.3)' : 'rgba(0,212,255,0.3)'}`,
            borderRadius:'20px', fontSize:'10px', fontWeight:700,
            textTransform:'uppercase', letterSpacing:'1px',
            color: isAdmin ? 'var(--primary-color)' : 'var(--secondary-color)',
          }}>
            <div style={{ width:'6px', height:'6px', borderRadius:'50%',
                          background: isAdmin ? 'var(--primary-color)' : 'var(--secondary-color)' }} />
            {isAdmin ? 'Administrator' : 'Student'}
          </div>
        )}

        {/* Main nav */}
        <nav className="nav-list" style={{ flex:1 }}>
          {visibleItems.map(({ to, icon:Icon, label }) => (
            <NavLink key={to} to={to} end={to==='/dashboard'}
              title={compactSidebar ? label : undefined}
              className={({ isActive }) => `nav-link${isActive?' active':''}`}
              style={{ justifyContent: compactSidebar ? 'center' : undefined }}>
              <Icon size={18} style={{ flexShrink:0 }} />
              {!compactSidebar && label}
            </NavLink>
          ))}
        </nav>

        {/* Footer: Notifications → divider → Settings → divider → Logout */}
        <div className="sidebar-footer">

          {/* Notifications with badge */}
          <NavLink to="/dashboard/notifications"
            title={compactSidebar ? 'Notifications' : undefined}
            className={({ isActive }) => `nav-link${isActive?' active':''}`}
            style={{ justifyContent: compactSidebar ? 'center' : undefined }}>
            <div style={{ position:'relative', flexShrink:0 }}>
              <Bell size={18} />
              {unreadCount > 0 && (
                <span style={{
                  position:'absolute', top:'-6px', right:'-6px',
                  background:'var(--primary-color)', color:'#fff',
                  borderRadius:'50%', width:'16px', height:'16px',
                  fontSize:'9px', fontWeight:700,
                  display:'flex', alignItems:'center', justifyContent:'center',
                }}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </div>
            {!compactSidebar && 'Notifications'}
          </NavLink>

          <div style={{ height:'1px', background:'var(--glass-border)', margin:'8px 0' }} />

          <NavLink to="/dashboard/settings"
            title={compactSidebar ? 'Settings' : undefined}
            className={({ isActive }) => `nav-link${isActive?' active':''}`}
            style={{ justifyContent: compactSidebar ? 'center' : undefined }}>
            <Settings size={18} style={{ flexShrink:0 }} />
            {!compactSidebar && 'Settings'}
          </NavLink>

          <div style={{ height:'1px', background:'var(--glass-border)', margin:'8px 0' }} />

          <button className="sidebar-logout-btn"
            title={compactSidebar ? 'Logout' : undefined}
            onClick={() => setShowConfirm(true)}
            style={{ justifyContent: compactSidebar ? 'center' : undefined }}>
            <LogOut size={18} style={{ flexShrink:0 }} />
            {!compactSidebar && 'Logout'}
          </button>
        </div>
      </aside>

      <ConfirmDialog
        isOpen={showConfirm}
        icon="👋" title="Sign Out?"
        message="Are you sure you want to sign out of STRUCTURA?"
        confirmLabel="Sign Out" cancelLabel="Cancel" danger
        onConfirm={() => { logout(); navigate('/login'); }}
        onCancel={() => setShowConfirm(false)}
      />
    </>
  );
}

export default Sidebar;
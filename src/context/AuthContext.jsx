import { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [currentUser,    setCurrentUser]    = useState(null);
  const [userRole,       setUserRole]       = useState(null);
  const [loading,        setLoading]        = useState(true);
  const [darkMode,       setDarkMode]       = useState(true);
  const [compactSidebar, setCompactSidebar] = useState(false);
  const [notifications,  setNotifications]  = useState({
    emailNotifications: true, pushNotifications: true, courseUpdates: true,
  });
  const [myEnrollment,   setMyEnrollment]   = useState(null);
  const [unreadCount,    setUnreadCount]    = useState(0);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  useEffect(() => {
    document.documentElement.setAttribute('data-compact', compactSidebar ? 'true' : 'false');
    localStorage.setItem('compactSidebar', JSON.stringify(compactSidebar));
  }, [compactSidebar]);

  useEffect(() => {
    const token        = localStorage.getItem('token');
    const savedUser    = localStorage.getItem('user');
    const savedRole    = localStorage.getItem('role');
    const savedDark    = localStorage.getItem('darkMode');
    const savedCompact = localStorage.getItem('compactSidebar');
    const savedNotifs  = localStorage.getItem('notifications');

    if (savedDark    !== null) setDarkMode(JSON.parse(savedDark));
    if (savedCompact !== null) setCompactSidebar(JSON.parse(savedCompact));
    if (savedNotifs  !== null) try { setNotifications(JSON.parse(savedNotifs)); } catch {}

    if (token && savedUser) {
      try {
        const user = JSON.parse(savedUser);
        setCurrentUser(user);
        setUserRole(savedRole || user.role || 'student');
        api.get('/me').then(res => {
          setCurrentUser(res.data);
          setUserRole(res.data.role);
          localStorage.setItem('user', JSON.stringify(res.data));
          localStorage.setItem('role', res.data.role);
        }).catch(() => {});
      } catch { localStorage.clear(); }
    }
    setLoading(false);
  }, []);

  // Poll unread notifications every 30s
  useEffect(() => {
    if (!currentUser) return;
    const fetch = () => api.get('/notifications/unread')
                           .then(r => setUnreadCount(r.data.count))
                           .catch(() => {});
    fetch();
    const t = setInterval(fetch, 30000);
    return () => clearInterval(t);
  }, [currentUser]);

  const login = (user, token, role) => {
    const resolvedRole = role || user.role || 'student';
    localStorage.setItem('token', token);
    localStorage.setItem('user',  JSON.stringify(user));
    localStorage.setItem('role',  resolvedRole);
    setCurrentUser(user);
    setUserRole(resolvedRole);
  };

  const logout = () => {
    api.post('/logout').catch(() => {});
    ['token','user','role'].forEach(k => localStorage.removeItem(k));
    setCurrentUser(null); setUserRole(null);
    setMyEnrollment(null); setUnreadCount(0);
  };

  const toggleDarkMode = () => setDarkMode(p => !p);
  const toggleCompact  = () => setCompactSidebar(p => !p);

  const saveNotifications = (prefs) => {
    setNotifications(prefs);
    localStorage.setItem('notifications', JSON.stringify(prefs));
  };

  const fetchMyEnrollment = async () => {
    try {
      const res = await api.get('/my-enrollment');
      setMyEnrollment(res.data);
      return res.data;
    } catch { return null; }
  };

  const requestEnrollment = async (programCode, programName) => {
    const res = await api.post('/enrollment/request', {
      program_code: programCode, program_name: programName,
    });
    await fetchMyEnrollment();
    return res.data;
  };

  const isAdminUser = userRole === 'admin';

  return (
    <AppContext.Provider value={{
      currentUser, setCurrentUser, userRole, loading,
      isAdminUser,
      darkMode, toggleDarkMode,
      compactSidebar, toggleCompact,
      notifications, saveNotifications,
      myEnrollment, setMyEnrollment, fetchMyEnrollment,
      unreadCount, setUnreadCount,
      login, logout,
      requestEnrollment,
    }}>
      {children}
    </AppContext.Provider>
  );
}
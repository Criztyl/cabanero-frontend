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
    emailNotifications: true,
    pushNotifications:  true,
    courseUpdates:      true,
  });
  const [myEnrollment, setMyEnrollment] = useState({ program: null, courses: [] });

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
    if (savedNotifs  !== null) setNotifications(JSON.parse(savedNotifs));

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
      } catch {
        localStorage.clear();
      }
    }
    setLoading(false);
  }, []);

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
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
    setCurrentUser(null);
    setUserRole(null);
    setMyEnrollment({ program: null, courses: [] });
  };

  const toggleDarkMode = () => setDarkMode(prev => !prev);
  const toggleCompact  = () => setCompactSidebar(prev => !prev);

  const saveNotifications = (prefs) => {
    setNotifications(prefs);
    localStorage.setItem('notifications', JSON.stringify(prefs));
  };

  const fetchMyEnrollment = async () => {
    try {
      const res = await api.get('/my-enrollment');
      setMyEnrollment(res.data);
    } catch {}
  };

  const enrollInProgram = async (programCode, programName) => {
    const res = await api.post('/enroll', { program_code: programCode, program_name: programName });
    await fetchMyEnrollment();
    return res.data;
  };

  // ── The key addition: isAdminUser boolean ──────────────
  const isAdminUser = userRole === 'admin';

  return (
    <AppContext.Provider value={{
      currentUser, setCurrentUser, userRole, loading,
      isAdminUser,          // ← safe boolean: true if admin
      darkMode, toggleDarkMode,
      compactSidebar, toggleCompact,
      notifications, saveNotifications,
      myEnrollment, fetchMyEnrollment,
      login, logout,
      enrollInProgram,
    }}>
      {children}
    </AppContext.Provider>
  );
}
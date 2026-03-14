import { createContext, useState, useEffect } from 'react';

export const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole,    setUserRole]    = useState(null);
  const [loading,     setLoading]     = useState(true);

  // Restore session on page refresh
  useEffect(() => {
    const token     = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    const savedRole = localStorage.getItem('role');
    if (token && savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
        setUserRole(savedRole);
      } catch { localStorage.clear(); }
    }
    setLoading(false);
  }, []);

  // Called by Login.jsx AFTER it already fetched the token from Laravel
  const login = (user, token, role) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('role', role || 'student');
    setCurrentUser(user);
    setUserRole(role || 'student');
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
    setCurrentUser(null);
    setUserRole(null);
  };

  return (
    <AppContext.Provider value={{ currentUser, userRole, loading, login, logout }}>
      {children}
    </AppContext.Provider>
  );
}
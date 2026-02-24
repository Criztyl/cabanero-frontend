import React, { createContext, useState, useEffect } from 'react';

// This Context is like a mailbox that holds:
// 1. User info (currentUser, isLoggedIn)
// 2. Dark mode setting
// 3. Functions to change these values

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // User state - tracks who is logged in
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Dark mode state
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });

  // Apply dark mode to HTML element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
    }
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  // Login function
  const login = (email, password, role = 'student') => {
    // Mock login - in real app, this would connect to backend
    const user = {
      id: Math.random(),
      email,
      name: email.split('@')[0],
      role, // 'student' or 'admin'
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
      department: 'IT Department'
    };
    setCurrentUser(user);
    setIsLoggedIn(true);
    localStorage.setItem('user', JSON.stringify(user));
  };

  // Logout function
  const logout = () => {
    setCurrentUser(null);
    setIsLoggedIn(false);
    localStorage.removeItem('user');
  };

  // Update user profile
  const updateUser = (updates) => {
    const updatedUser = { ...currentUser, ...updates };
    setCurrentUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        isLoggedIn,
        darkMode,
        login,
        logout,
        updateUser,
        toggleDarkMode
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

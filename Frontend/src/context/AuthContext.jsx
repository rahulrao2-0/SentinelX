import React, { createContext, useState, useContext } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('sentinelx_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const isAuthenticated = Boolean(user);

  const login = (userData) => {
    setUser(userData);
    try {
      localStorage.setItem('sentinelx_user', JSON.stringify(userData));
    } catch {
      // storage error fallback
    }
  };

  const logout = () => {
    setUser(null);
    try {
      localStorage.removeItem('sentinelx_user');
    } catch {
      // storage error fallback
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

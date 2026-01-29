import React, { createContext, useState, useContext, useEffect } from 'react';
import { checkAndClearInvalidTokens } from '../utils/authFix';
import config from '../config/environment';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check and clear invalid tokens first
    const hasValidToken = checkAndClearInvalidTokens();

    if (hasValidToken) {
      const token = localStorage.getItem('authToken');
      const userData = localStorage.getItem('user');

      if (token && userData) {
        try {
          setUser(JSON.parse(userData));
        } catch (e) {
          console.error('Invalid user data in localStorage');
          localStorage.removeItem('user');
        }
      }
    }
    setLoading(false);
  }, []);

  const refreshToken = async () => {
    try {
      const refresh = localStorage.getItem('refreshToken');
      if (!refresh) {
        throw new Error('No refresh token found');
      }

      const response = await fetch(`${config.API_BASE_URL}auth/token/refresh/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('authToken', data.access);
        return data.access;
      } else {
        // Refresh token is invalid, logout user
        logout();
        throw new Error('Session expired');
      }
    } catch (error) {
      logout();
      throw error;
    }
  };

  const login = async (email, password) => {
    try {
      const response = await fetch(`${config.API_BASE_URL}auth/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Check if 2FA setup is required (staff without 2FA)
        if (data.requires_2fa_setup) {
          // Store user data since they're authenticated but need to set up 2FA
          setUser(data.user);
          return {
            success: true,
            requires_2fa_setup: true,
            access: data.access,
            refresh: data.refresh,
            user: data.user,
            message: data.message
          };
        }

        // Check if 2FA verification is required (staff with 2FA enabled)
        if (data.requires_2fa) {
          // Return temp token for 2FA verification
          return {
            success: true,
            requires_2fa: true,
            temp_token: data.temp_token
          };
        }

        // Normal login without 2FA (non-staff users)
        if (data.access) {
          setUser(data.user);
          localStorage.setItem('authToken', data.access);
          localStorage.setItem('refreshToken', data.refresh);
          localStorage.setItem('user', JSON.stringify(data.user));
          return {
            success: true
          };
        }
      }

      return { success: false, error: data.detail || 'Login failed' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  };

  const value = {
    user,
    setUser,
    login,
    logout,
    refreshToken,
    loading,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
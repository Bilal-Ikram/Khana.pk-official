import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from 'react-hot-toast';

const AuthContext = createContext();
const API_URL = 'http://localhost:3001/api';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem("token"));

  useEffect(() => {
    // Check if user is logged in on mount
    if (token) {
      console.log('Token found in localStorage, fetching user data');
      fetchUserData(token);
    } else {
      console.log('No token found in localStorage');
      setLoading(false);
    }
  }, [token]);

  const fetchUserData = async (token) => {
    try {
      console.log('Fetching user data with token');
      const response = await fetch(`${API_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const userData = await response.json();
        console.log('User data fetched successfully');
        setUser(userData.user);
      } else {
        // Token is invalid or expired
        console.error('Failed to fetch user data:', response.status);
        handleLogout();
        toast.error('Your session has expired. Please log in again.');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      handleLogout();
      toast.error('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateUser = (userData) => {
    setUser(userData);
  };

  const handleLogin = async (email, password) => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password, role: 'customer' })
      });

      if (!response.ok) {
        const errorData = await response.json();
        return { success: false, error: errorData.message || 'Login failed' };
      }

      const data = await response.json();
      localStorage.setItem("token", data.token);
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem("user", JSON.stringify(data.user));
      toast.success('Login successful!');
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.message || 'Failed to login. Please try again.');
      return { success: false, error: 'Failed to login. Please try again.' };
    }
  };

  const handleRegister = async (userData) => {
    try {
      const response = await fetch(`${API_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token);
        setToken(data.token);
        setUser(data.user);
        localStorage.setItem("user", JSON.stringify(data.user));
        toast.success('Registration successful!');
        return { success: true };
      } else {
        return { success: false, error: data.message };
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Failed to register. Please try again.');
      return { success: false, error: 'Failed to register. Please try again.' };
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
    toast.success('Logged out successfully!');
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        token,
        loading,
        login: handleLogin,
        register: handleRegister,
        logout: handleLogout,
        updateUser
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
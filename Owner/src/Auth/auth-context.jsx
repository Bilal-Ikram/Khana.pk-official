import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [restaurant, setRestaurant] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://khana-backend-88zs.onrender.com';

  const refreshRestaurant = async () => {
    try {
      if (!token) {
        console.log('No token available for restaurant refresh');
        return null;
      }

      // If we already have restaurant data, don't refresh
      if (restaurant) {
        console.log('Restaurant data already exists, skipping refresh');
        return restaurant;
      }

      console.log('Refreshing restaurant data...');
      const response = await fetch(`${BACKEND_URL}/api/restaurants/owner`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 404) {
        console.log('No restaurant found for seller - this is normal for new sellers');
        setRestaurant(null);
        return null;
      }

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Restaurant refresh failed:', errorData);
        throw new Error(errorData.message || 'Failed to fetch restaurant data');
      }

      const data = await response.json();
      console.log('Restaurant data refreshed:', data);
      setRestaurant(data);
      return data;
    } catch (error) {
      console.error('Error refreshing restaurant:', error);
      setRestaurant(null);
      // Only show error toast for non-404 errors
      if (!error.message.includes('Restaurant not found')) {
        toast.error(error.message || 'Failed to refresh restaurant data');
      }
      return null;
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      if (token) {
        try {
          setLoading(true);
          // Verify token and get user data
          const response = await fetch(`${BACKEND_URL}/api/auth/me`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Token verification failed');
          }

          const { user: userData } = await response.json();
          setUser(userData);
          
          // Fetch restaurant data if user is a seller
          if (userData.role === 'seller') {
            await refreshRestaurant();
          }
        } catch (error) {
          console.error('Auth initialization error:', error);
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
          setRestaurant(null);
          toast.error(error.message || 'Authentication failed');
          navigate('/login');
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    initializeAuth();
  }, [token, navigate]);

  const register = async (formData) => {
  try {
    setLoading(true);
    const response = await fetch(`${BACKEND_URL}/api/auth/seller/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Registration error response:', data);
      throw new Error(data.message || 'Registration failed');
    }

    localStorage.setItem('token', data.token);
    setToken(data.token);
    setUser(data.user);

    if (data.user.role === 'seller') {
      await refreshRestaurant();
    }

    toast.success('Registration successful!');
    return { success: true };
  } catch (error) {
    console.error('Registration exception:', error.message);
    toast.error(error.message || 'Registration failed');
    return { success: false, error: error.message };
  } finally {
    setLoading(false);
  }
};


  const login = async (email, password) => {
    try {
      setLoading(true);
      const response = await fetch(`${BACKEND_URL}/api/auth/seller/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }

      const data = await response.json();

      localStorage.setItem('token', data.token);
      setToken(data.token);
      setUser(data.user);
      
      // If user is a seller, fetch restaurant data
      if (data.user.role === 'seller') {
        await refreshRestaurant();
      }

      toast.success('Login successful!');
      navigate('/seller/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.message || 'Login failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setRestaurant(null);
    navigate('/login');
  };

  const value = {
    user,
    restaurant,
    token,
    loading,
    register,
    login,
    logout,
    refreshRestaurant,
    setRestaurant
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
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

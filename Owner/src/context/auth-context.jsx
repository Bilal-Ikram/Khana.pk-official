// ... existing code ...

const register = async (userData) => {
  try {
    setLoading(true);
    const response = await fetch('https://khana-backend-88zs.onrender.com/api/auth/seller/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
      credentials: 'include'
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Registration failed');
    }
    
    const data = await response.json();
    setUser(data.user);
    localStorage.setItem('token', data.token);
    return data;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  } finally {
    setLoading(false);
  }
};

// ... existing code ...

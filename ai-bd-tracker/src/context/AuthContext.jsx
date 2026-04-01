import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

/** FastAPI often returns JSON; proxies may return HTML/plain text on 5xx — never assume JSON. */
async function readJsonSafe(response) {
  const text = await response.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return { detail: text.trim().slice(0, 400) };
  }
}

function detailFromBody(data) {
  if (!data || data.detail == null) return null;
  const d = data.detail;
  if (typeof d === 'string') return d;
  if (Array.isArray(d)) {
    return d.map((e) => (e && e.msg) ? e.msg : JSON.stringify(e)).join('; ');
  }
  return String(d);
}

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
  const [token, setToken] = useState(localStorage.getItem('token') || null);

  useEffect(() => {
    // Check if user is logged in on initial load
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      // Optionally fetch user details here
      fetchUserDetails(storedToken).catch(err => {
        console.error('Error fetching user details:', err);
        // Token might be invalid, clear it
        logout();
      });
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserDetails = async (authToken) => {
    try {
      const response = await fetch('/api/v1/users/me', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        // Token might be invalid, clear it
        logout();
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        const errorData = await readJsonSafe(response);
        throw new Error(detailFromBody(errorData) || `Login failed (${response.status})`);
      }

      const data = await readJsonSafe(response);
      const authToken = data.access_token;

      setToken(authToken);
      localStorage.setItem('token', authToken);

      await fetchUserDetails(authToken);
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: error.message };
    }
  };

  const register = async (userData) => {
    try {
      const response = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });

      if (!response.ok) {
        const errorData = await readJsonSafe(response);
        throw new Error(detailFromBody(errorData) || `Registration failed (${response.status})`);
      }

      const responseData = await readJsonSafe(response);

      return { success: true, user: responseData };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, message: error.message };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
  };

  const updateUserProfile = async (updateData) => {
    if (!token) {
      throw new Error('Not authenticated');
    }

    try {
      const response = await fetch('/api/v1/users/me', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        const errorData = await readJsonSafe(response);
        throw new Error(detailFromBody(errorData) || `Update failed (${response.status})`);
      }

      const updatedUser = await readJsonSafe(response);
      setUser(updatedUser);
      return { success: true, user: updatedUser };
    } catch (error) {
      console.error('Update profile error:', error);
      return { success: false, message: error.message };
    }
  };

  const value = {
    user,
    token,
    login,
    register,
    logout,
    updateUserProfile,
    loading,
    isAuthenticated: !!token
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from './ToastContext';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('aura_token') || '');
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  // Load user profile on mount if token exists
  useEffect(() => {
    const fetchUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await fetch('/api/auth/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (data.success && data.user) {
          setUser(data.user);
        } else {
          localStorage.removeItem('aura_token');
          setToken('');
          setUser(null);
        }
      } catch (err) {
        console.error('Failed to restore auth session:', err);
        localStorage.removeItem('aura_token');
        setToken('');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [token]);

  const login = async (email, password) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Login failed');
      }

      localStorage.setItem('aura_token', data.token);
      setToken(data.token);
      setUser(data.user);
      addToast({ message: `Welcome back, ${data.user.name}!`, type: 'success' });
      return { success: true, user: data.user };
    } catch (err) {
      addToast({ message: err.message, type: 'error' });
      return { success: false, error: err.message };
    }
  };

  const register = async ({ name, email, password, phone }) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, phone }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Registration failed');
      }

      localStorage.setItem('aura_token', data.token);
      setToken(data.token);
      setUser(data.user);
      addToast({ message: 'Account created successfully! Welcome to AURA.', type: 'success' });
      return { success: true, user: data.user };
    } catch (err) {
      addToast({ message: err.message, type: 'error' });
      return { success: false, error: err.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('aura_token');
    setToken('');
    setUser(null);
    addToast({ message: 'You have been logged out.', type: 'info' });
  };

  const updateProfile = async (profileData) => {
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profileData),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to update profile');
      }
      setUser(data.user);
      addToast({ message: 'Profile updated successfully!', type: 'success' });
      return { success: true };
    } catch (err) {
      addToast({ message: err.message, type: 'error' });
      return { success: false, error: err.message };
    }
  };

  const addAddress = async (addressData) => {
    try {
      const res = await fetch('/api/auth/addresses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(addressData),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to add address');
      }
      setUser((prev) => ({ ...prev, addresses: data.addresses }));
      addToast({ message: 'Shipping address saved!', type: 'success' });
      return { success: true, addresses: data.addresses };
    } catch (err) {
      addToast({ message: err.message, type: 'error' });
      return { success: false, error: err.message };
    }
  };

  const removeAddress = async (addressId) => {
    try {
      const res = await fetch(`/api/auth/addresses/${addressId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to remove address');
      }
      setUser((prev) => ({ ...prev, addresses: data.addresses }));
      addToast({ message: 'Address removed.', type: 'info' });
      return { success: true };
    } catch (err) {
      addToast({ message: err.message, type: 'error' });
      return { success: false, error: err.message };
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to change password');
      }
      addToast({ message: 'Password changed successfully!', type: 'success' });
      return { success: true };
    } catch (err) {
      addToast({ message: err.message, type: 'error' });
      return { success: false, error: err.message };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAdmin: user?.role === 'admin',
        login,
        register,
        logout,
        updateProfile,
        addAddress,
        removeAddress,
        changePassword,
      }}
    >
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

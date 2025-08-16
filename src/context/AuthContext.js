import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../utils/api';
import { toast } from 'react-toastify';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, []);

  // const login = async (credentials) => {
  //   try {
  //     const response = await authAPI.login(credentials);
  //     const { token: newToken, user: newUser } = response.data;
      
  //     localStorage.setItem('token', newToken);
  //     localStorage.setItem('user', JSON.stringify(newUser));
      
  //     setToken(newToken);
  //     setUser(newUser);
  //     setIsAuthenticated(true);
  //     setLoading(false);
      
  //     toast.success('Login successful!');
  //     return { success: true };
  //   } catch (error) {
  //     const errorMessage = error.response?.data?.message || 'Login failed';
  //     toast.error(errorMessage);
  //     return {
  //       success: false,
  //       error: errorMessage,
  //     };
  //   }
  // };

  const login = async (credentials) => {
  try {
    const response = await authAPI.login(credentials);
    const { token: newToken, user: newUser } = response.data;

    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));

    setToken(newToken);
    setUser(newUser);
    setIsAuthenticated(true);

    toast.success('Login successful!');
    return { success: true };
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Login failed';
      toast.error(errorMessage);
    return {
      success: false,
      error: errorMessage,
    };
  }
};

  const register = async (userData) => {
    try {
      // setLoading(true);
      const response = await authAPI.register(userData);
      const { token: newToken, user: newUser } = response.data;
      
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(newUser));
      
      setToken(newToken);
      setUser(newUser);
      setIsAuthenticated(true);
      // setLoading(false);
      
      toast.success('Registration successful!');
      return { success: true };
    } catch (error) {
      // setLoading(false);
      const errorMessage = error.response?.data?.message || 'Registration failed';
      toast.error(errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    setLoading(false);
    toast.info('Logged out successfully');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        loading,
        login,
        register,
        logout,
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
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import axios from '../utils/api';
import { guestStorage } from '../utils/guestStorage';

const AuthContext = createContext();

const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  loading: true,
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
      localStorage.setItem('token', action.payload.token);
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
      };
    case 'LOGOUT':
      localStorage.removeItem('token');
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
      };
    case 'LOAD_USER_SUCCESS':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        loading: false,
      };
    case 'LOAD_USER_FAIL':
      localStorage.removeItem('token');
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
      };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Set auth token for axios
  useEffect(() => {
    if (state.token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${state.token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [state.token]);

  // Load user on app start
  useEffect(() => {
    const initAuth = async () => {
      if (state.token && !state.user) {
        console.log('Loading user with token:', state.token.substring(0, 10) + '...');
        await loadUser();
      } else if (!state.token) {
        console.log('No token found, setting loading to false');
        dispatch({ type: 'SET_LOADING', payload: false });
      } else if (state.user) {
        console.log('User already loaded:', state.user.email);
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };
    
    initAuth();
  }, []);

  const loadUser = async () => {
    try {
      console.log('Starting loadUser...');
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await axios.get('/api/v1/auth/profile');
      console.log('User profile loaded successfully:', response.data.user);
      dispatch({
        type: 'LOAD_USER_SUCCESS',
        payload: response.data.user,
      });
    } catch (error) {
      console.error('Load user error:', error.response?.status, error.response?.data);
      dispatch({ type: 'LOAD_USER_FAIL' });
    }
  };

  const login = async (email, password) => {
    try {
      const response = await axios.post('/api/v1/auth/login', {
        email,
        password,
      });
      
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: {
          user: response.data.user,
          token: response.data.token,
        },
      });
      
      // Handle guest itinerary transfer after successful login
      await handleGuestItineraryTransfer();
      
      // Handle pending edit itinerary
      const pendingEditItinerary = sessionStorage.getItem('pendingEditItinerary');
      if (pendingEditItinerary) {
        sessionStorage.removeItem('pendingEditItinerary');
        return { 
          success: true, 
          redirectTo: '/itineraries/create',
          pendingEditItinerary: JSON.parse(pendingEditItinerary)
        };
      }
      
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Login failed',
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await axios.post('/api/v1/auth/register', userData);
      
      // Don't auto-login after registration
      return { 
        success: true,
        message: 'Registration successful! Please login with your credentials.'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Registration failed',
      };
    }
  };

  const logout = () => {
    dispatch({ type: 'LOGOUT' });
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await axios.put('/api/v1/auth/profile', profileData);
      dispatch({
        type: 'LOAD_USER_SUCCESS',
        payload: response.data.user,
      });
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Profile update failed',
      };
    }
  };

  const handleGuestItineraryTransfer = async () => {
    try {
      const guestItineraries = guestStorage.getItineraries();
      if (guestItineraries.length === 0) return;

      // Transfer guest itineraries to user account
      const transferResults = await guestStorage.transferToUserAccount(
        async (itineraryData) => {
          return await axios.post('/api/v1/trip-itineraries', itineraryData);
        }
      );

      const successCount = transferResults.filter(result => result.success).length;
      if (successCount > 0) {
        console.log(`Successfully transferred ${successCount} guest itineraries to user account`);
      }
    } catch (error) {
      console.error('Error transferring guest itineraries:', error);
    }
  };

  const value = {
    ...state,
    login,
    register,
    logout,
    loadUser,
    updateProfile,
    handleGuestItineraryTransfer,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

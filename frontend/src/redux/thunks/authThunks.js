import { createAsyncThunk } from '@reduxjs/toolkit';
import authService from '../../services/authService';
import { setUser, setLoading, setError, setTempToken, logout as logoutAction } from '../slices/authSlice';

export const signup = createAsyncThunk('auth/signup', async (data, { dispatch }) => {
  try {
    dispatch(setLoading(true));
    const res = await authService.signup(data);
    dispatch(setError(null));
    return res.data;
  } catch (err) {
    dispatch(setError(err.response?.data?.message || 'Signup failed'));
    throw err;
  }
});

export const login = createAsyncThunk('auth/login', async (data, { dispatch }) => {
  try {
    dispatch(setLoading(true));
    const res = await authService.login(data);
    if (res.data.data?.tempToken) {
      dispatch(setTempToken(res.data.data.tempToken));
    } else {
      dispatch(setUser(res.data.data?.user));
    }
    dispatch(setError(null));
    return res.data;
  } catch (err) {
    dispatch(setError(err.response?.data?.message || 'Login failed'));
    throw err;
  }
});

export const verify2FA = createAsyncThunk('auth/verify2FA', async (data, { dispatch }) => {
  try {
    dispatch(setLoading(true));
    const res = await authService.verify2FA(data);
    dispatch(setUser(res.data.data?.user));
    dispatch(setTempToken(null));
    dispatch(setError(null));
    return res.data;
  } catch (err) {
    dispatch(setError(err.response?.data?.message || '2FA verification failed'));
    throw err;
  }
});

export const logout = createAsyncThunk('auth/logout', async (_, { dispatch }) => {
  try {
    await authService.logout();
    dispatch(logoutAction());
  } catch (err) {
    dispatch(logoutAction());
  }
});

export const forgotPassword = createAsyncThunk('auth/forgotPassword', async (data, { dispatch }) => {
  try {
    dispatch(setLoading(true));
    const res = await authService.forgotPassword(data);
    dispatch(setError(null));
    return res.data;
  } catch (err) {
    dispatch(setError(err.response?.data?.message || 'Failed'));
    throw err;
  }
});

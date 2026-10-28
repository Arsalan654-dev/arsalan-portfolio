import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null,
  isAuthenticated: false,
  loading: true,
  error: null,
  tempToken: null,
  tempEmail: null
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    hydrate: (state, action) => {
      state.user = action.payload.user;
      state.isAuthenticated = !!action.payload.user;
      state.loading = false;
    },
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
      state.loading = false;
      state.error = null;
      localStorage.setItem('user', JSON.stringify(action.payload));
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    setTempToken: (state, action) => {
      state.tempToken = action.payload;
    },
    setTempEmail: (state, action) => {
      state.tempEmail = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
      state.tempToken = null;
      state.tempEmail = null;
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    },
    clearError: (state) => {
      state.error = null;
    }
  }
});

export const { hydrate, setUser, setLoading, setError, setTempToken, setTempEmail, logout, clearError } = authSlice.actions;
export default authSlice.reducer;

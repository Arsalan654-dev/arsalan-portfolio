'use client';
import { useSelector, useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { setUser } from '../redux/slices/authSlice';
import userService from '../services/userService';

export const useAuth = () => {
  const dispatch = useDispatch();
  const { user, isAuthenticated, loading, error } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated && !user) {
      userService.getProfile()
        .then(res => dispatch(setUser(res.data.data)))
        .catch(() => {});
    }
  }, [isAuthenticated, user, dispatch]);

  return { user, isAuthenticated, loading, error };
};

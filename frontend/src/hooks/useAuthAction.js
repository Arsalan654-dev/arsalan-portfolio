'use client';

import { useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { addPendingAction } from '@/redux/slices/pendingActionsSlice';
import toast from 'react-hot-toast';

export function useAuthAction() {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated);
  const dispatch = useDispatch();

  const requireAuth = useCallback((actionType, payload, callback) => {
    if (!isAuthenticated) {
      dispatch(addPendingAction({ type: actionType, payload }));
      setShowLoginModal(true);
      toast.error('Please login to continue');
      return false;
    }
    if (callback) callback();
    return true;
  }, [isAuthenticated, dispatch]);

  const closeLoginModal = useCallback(() => {
    setShowLoginModal(false);
  }, []);

  return { showLoginModal, closeLoginModal, requireAuth, isAuthenticated };
}

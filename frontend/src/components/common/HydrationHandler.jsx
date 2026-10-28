'use client';

import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { hydrate as hydrateAuth } from '@/redux/slices/authSlice';
import { hydrate as hydrateTheme } from '@/redux/slices/themeSlice';
import { hydrate as hydrateLang } from '@/redux/slices/langSlice';
import { fetchCart, addToCartAPI } from '@/redux/slices/cartSlice';
import { fetchWishlist, addToWishlistAPI } from '@/redux/slices/wishlistSlice';
import { clearPendingActions } from '@/redux/slices/pendingActionsSlice';
import { setAccessToken } from '@/services/axiosInstance';
import toast from 'react-hot-toast';

export default function HydrationHandler({ children }) {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated);
  const pendingActions = useSelector(state => state.pendingActions.actions);
  const processedRef = useRef(new Set());

  useEffect(() => {
    let user = null;
    try {
      const saved = localStorage.getItem('user');
      if (saved) user = JSON.parse(saved);
    } catch {}
    dispatch(hydrateAuth({ user }));

    const token = localStorage.getItem('token');
    if (token) setAccessToken(token);

    const theme = localStorage.getItem('theme') || 'dark';
    dispatch(hydrateTheme({ theme }));
    document.documentElement.setAttribute('data-theme', theme);

    const lang = localStorage.getItem('lang') || 'en';
    dispatch(hydrateLang({ lang }));
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }, [dispatch]);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchCart());
      dispatch(fetchWishlist());
    }
  }, [dispatch, isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated && pendingActions.length > 0) {
      pendingActions.forEach(action => {
        if (processedRef.current.has(action.id)) return;
        processedRef.current.add(action.id);

        if (action.type === 'addToCart') {
          dispatch(addToCartAPI(action.payload));
          toast.success('Item added to cart!');
        } else if (action.type === 'addToWishlist') {
          dispatch(addToWishlistAPI(action.payload.itemId));
          toast.success('Item added to wishlist!');
        }
      });
      dispatch(clearPendingActions());
      processedRef.current.clear();
    }
  }, [isAuthenticated, pendingActions, dispatch]);

  return children;
}

'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import LoadingSpinner from './LoadingSpinner';

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { isAuthenticated, user, loading } = useSelector((state) => state.auth);
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace('/login');
    }
    if (!loading && adminOnly && user?.role !== 'admin') {
      router.replace('/');
    }
  }, [isAuthenticated, user, loading, adminOnly, router]);

  if (loading) return <LoadingSpinner />;
  if (!isAuthenticated) return null;
  if (adminOnly && user?.role !== 'admin') return null;

  return children;
}

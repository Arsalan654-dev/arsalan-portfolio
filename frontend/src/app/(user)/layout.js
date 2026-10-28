'use client';
import ProtectedRoute from '@/components/common/ProtectedRoute';

export default function UserLayout({ children }) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}

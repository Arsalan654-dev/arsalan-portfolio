'use client';

import { useState } from 'react';
import ProtectedRoute from '@/components/common/ProtectedRoute';
import AdminSidebar from '@/components/layout/AdminSidebar';
import AdminHeader from '@/components/layout/AdminHeader';

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <ProtectedRoute adminOnly>
      <div className="admin-layout">
        <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="admin-main">
          <AdminHeader onToggleSidebar={() => setSidebarOpen(prev => !prev)} />
          <main className="admin-content">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}

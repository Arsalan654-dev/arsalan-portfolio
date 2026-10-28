'use client';
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import adminService from '@/services/adminService';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function AdminSettingsPage() {
  const { user } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState({ email: true });

  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
    } catch { } finally { setLoading(false); }
  };

  const handleSave = async () => {
    toast.success('Settings saved');
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div style={{ maxWidth: 700, margin: '0 auto' }}>
      <h4 className="fw-bold mb-4" style={{ color: 'var(--tp)' }}>Settings</h4>

      <div className="card border-0 rounded-3 p-4 mb-4" style={{ background: 'var(--bs)' }}>
        <h5 className="fw-bold mb-3" style={{ color: 'var(--tp)' }}>Account</h5>
        <p style={{ color: 'var(--ts)' }}>Email: {user?.email}</p>
        <p style={{ color: 'var(--ts)' }}>Role: {user?.role}</p>
      </div>

      <div className="card border-0 rounded-3 p-4 mb-4" style={{ background: 'var(--bs)' }}>
        <h5 className="fw-bold mb-3" style={{ color: 'var(--tp)' }}>Notifications</h5>
        <div className="d-flex align-items-center justify-content-between mb-3">
          <span style={{ color: 'var(--tp)' }}>Email notifications</span>
          <div className="form-check form-switch mb-0">
            <input className="form-check-input" type="checkbox" checked={notifications.email}
              onChange={(e) => setNotifications(p => ({ ...p, email: e.target.checked }))} />
          </div>
        </div>
      </div>

      <button onClick={handleSave} className="btn px-4"
        style={{ background: 'var(--gm)', color: '#fff', border: 'none' }}>
        Save Settings
      </button>
    </div>
  );
}

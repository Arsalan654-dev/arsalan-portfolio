'use client';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import adminService from '@/services/adminService';
import { formatCurrency, formatDate } from '@/utils/helpers';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function DashboardPage() {
  const [metrics, setMetrics] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  // eslint-disable-next-line react-hooks/immutability
  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [metricsRes, analyticsRes, activitiesRes] = await Promise.all([
        adminService.dashboard.getMetrics(),
        adminService.dashboard.getAnalytics(),
        adminService.dashboard.getRecentActivities()
      ]);
      setMetrics(metricsRes.data?.data || metricsRes.data);
      setAnalytics(analyticsRes.data?.data || analyticsRes.data);
      setActivities(activitiesRes.data?.data || activitiesRes.data || []);
    } catch (err) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  const metricCards = [
    { label: 'Total Users', value: metrics?.totalUsers || 0, icon: 'fa-users', color: '#8b5cf6' },
    { label: 'Total Projects', value: metrics?.totalProjects || 0, icon: 'fa-project-diagram', color: '#38bdf8' },
    { label: 'Total Services', value: metrics?.totalServices || 0, icon: 'fa-cogs', color: '#10b981' },
    { label: 'Total Orders', value: metrics?.totalOrders || 0, icon: 'fa-shopping-bag', color: '#f59e0b' },
    { label: 'Revenue', value: formatCurrency(metrics?.totalRevenue || 0), icon: 'fa-dollar-sign', color: '#ef4444' },
  ];

  const cardStyle = (color) => ({
    background: 'var(--bs)',
    border: `1px solid ${color}20`,
    borderRadius: '12px',
    borderLeft: `4px solid ${color}`
  });

  return (
    <div>
      <h4 className="fw-bold mb-4" style={{ color: 'var(--tp)' }}>Dashboard</h4>

      <div className="row g-3 mb-4">
        {metricCards.map((m, i) => (
          <div className="col-xl-2 col-lg-4 col-md-6" key={i}>
            <div className="card p-3 h-100" style={cardStyle(m.color)}>
              <div className="d-flex align-items-center gap-3">
                <div className="d-flex align-items-center justify-content-center rounded-circle"
                  style={{ width: 48, height: 48, background: `${m.color}20` }}>
                  <i className={`fas ${m.icon}`} style={{ color: m.color, fontSize: '1.2rem' }}></i>
                </div>
                <div>
                  <small style={{ color: 'var(--ts)' }}>{m.label}</small>
                  <h5 className="fw-bold mb-0" style={{ color: 'var(--tp)' }}>{m.value}</h5>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="row g-4">
        <div className="col-lg-8">
          <div className="card border-0 rounded-3 p-4 h-100" style={{ background: 'var(--bs)' }}>
            <h5 className="fw-bold mb-3" style={{ color: 'var(--tp)' }}>Orders Over Time</h5>
            {analytics?.orders?.length > 0 ? (
              <div style={{ height: 250, display: 'flex', alignItems: 'flex-end', gap: '4px' }}>
                {analytics.orders.map((item, i) => {
                  const max = Math.max(...analytics.orders.map(o => o.count), 1);
                  const h = (item.count / max) * 200;
                  return (
                    <div key={i} className="d-flex flex-column align-items-center flex-grow-1">
                      <small style={{ color: 'var(--ts)', fontSize: '0.6rem' }}>{item.count}</small>
                      <div style={{ width: '100%', height: h, background: 'var(--gm)', borderRadius: '4px 4px 0 0', minHeight: 4 }} />
                      <small style={{ color: 'var(--ts)', fontSize: '0.6rem', marginTop: 4 }}>{new Date(item._id).toLocaleDateString()}</small>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p style={{ color: 'var(--ts)' }}>No data available</p>
            )}
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card border-0 rounded-3 p-4 h-100" style={{ background: 'var(--bs)' }}>
            <h5 className="fw-bold mb-3" style={{ color: 'var(--tp)' }}>Revenue</h5>
            <h2 className="fw-bold" style={{ color: 'var(--ap)' }}>{formatCurrency(metrics?.totalRevenue || 0)}</h2>
            <hr style={{ borderColor: 'var(--bdr)' }} />
            <h5 className="fw-bold mb-3" style={{ color: 'var(--tp)' }}>Ratings Distribution</h5>
            {analytics?.ratingsDistribution?.map((r, i) => (
              <div key={i} className="d-flex align-items-center gap-2 mb-2">
                <small style={{ color: 'var(--ts)', width: 60 }}>{r._id || r.rating} Star</small>
                <div className="flex-grow-1" style={{ height: 8, background: 'var(--bdr)', borderRadius: 4 }}>
                  <div style={{ width: `${r.percentage || r.count || 0}%`, height: '100%', background: 'var(--gm)', borderRadius: 4 }} />
                </div>
                <small style={{ color: 'var(--ts)' }}>{r.count || 0}</small>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card border-0 rounded-3 p-4 mt-4" style={{ background: 'var(--bs)' }}>
        <h5 className="fw-bold mb-3" style={{ color: 'var(--tp)' }}>Recent Activities</h5>
        {activities.length === 0 ? (
          <p style={{ color: 'var(--ts)' }}>No recent activities</p>
        ) : (
          <div style={{ maxHeight: 300, overflowY: 'auto' }}>
            {activities.map((act, i) => (
              <div key={act._id || i} className="d-flex align-items-center gap-3 py-2 border-bottom" style={{ borderColor: 'var(--bdr)' }}>
                <div className="d-flex align-items-center justify-content-center rounded-circle"
                  style={{ width: 36, height: 36, background: 'var(--ap)20', minWidth: 36 }}>
                  <i className="fas fa-circle" style={{ color: 'var(--ap)', fontSize: '0.5rem' }}></i>
                </div>
                <div className="flex-grow-1">
                  <p className="mb-0" style={{ color: 'var(--tp)', fontSize: '0.9rem' }}>{act.message || act.action}</p>
                  <small style={{ color: 'var(--ts)' }}>{formatDate(act.createdAt)}</small>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

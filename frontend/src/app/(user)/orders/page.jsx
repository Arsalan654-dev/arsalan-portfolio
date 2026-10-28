'use client';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import userService from '@/services/userService';
import OrderCard from '@/components/orders/OrderCard';
import Pagination from '@/components/common/Pagination';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // eslint-disable-next-line react-hooks/immutability
  useEffect(() => { loadOrders(); }, [page]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const res = await userService.getOrders({ page });
      const data = res.data?.data || res.data || [];
      setOrders(Array.isArray(data) ? data : data.orders || []);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="container py-5">
      <h3 className="fw-bold mb-4" style={{ color: 'var(--tp)' }}>My Orders</h3>
      {orders.length === 0 ? (
        <div className="text-center py-5">
          <i className="fas fa-box-open" style={{ fontSize: '3rem', color: 'var(--bdr)' }}></i>
          <p className="mt-3" style={{ color: 'var(--ts)' }}>No orders yet</p>
        </div>
      ) : (
        <>
          {orders.map((order) => (
            <OrderCard key={order._id} order={order} />
          ))}
          {totalPages > 1 && (
            <Pagination page={page} totalPages={totalPages} totalItems={0} onPageChange={setPage} />
          )}
        </>
      )}
    </div>
  );
}

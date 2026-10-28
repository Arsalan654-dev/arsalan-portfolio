'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import adminService from '@/services/adminService';
import OrderDetail from '@/components/orders/OrderDetail';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function AdminOrderDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) { router.push('/admin/orders'); return; }
    // eslint-disable-next-line react-hooks/immutability
    loadOrder();
  }, [id]);

  const loadOrder = async () => {
    try {
      setLoading(true);
      const res = await adminService.orders.getById(id);
      setOrder(res.data?.data || res.data);
    } catch {
      toast.error('Order not found');
      router.push('/admin/orders');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="d-flex align-items-center gap-3 mb-4">
        <button onClick={() => router.back()} className="btn btn-sm"
          style={{ color: 'var(--ap)', border: '1px solid var(--ap)', background: 'transparent' }}>
          <i className="fas fa-arrow-left me-1"></i>Back
        </button>
        <h4 className="fw-bold mb-0" style={{ color: 'var(--tp)' }}>
          Order #{order?.orderNumber || order?._id?.slice(-8).toUpperCase()}
        </h4>
      </div>
      <OrderDetail order={order} />
    </div>
  );
}

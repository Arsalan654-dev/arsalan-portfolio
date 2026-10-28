'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import userService from '@/services/userService';
import OrderDetail from '@/components/orders/OrderDetail';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function OrderDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) { router.push('/orders'); return; }
    // eslint-disable-next-line react-hooks/immutability
    loadOrder();
  }, [id]);

  const loadOrder = async () => {
    try {
      setLoading(true);
      const res = await userService.getOrderDetail(id);
      setOrder(res.data?.data || res.data);
    } catch {
      toast.error('Order not found');
      router.push('/orders');
    } finally {
      setLoading(false);
    }
  };

  const handlePayNow = async () => {
    router.push(`/payment?orderId=${id}`);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <OrderDetail order={order} />
      {order?.paymentStatus === 'not paid' && (
        <div className="container text-center pb-5">
          <button onClick={handlePayNow} className="btn btn-lg fw-semibold px-5"
            style={{ background: 'var(--gm)', color: '#fff', border: 'none' }}>
            Pay Now
          </button>
        </div>
      )}
    </div>
  );
}

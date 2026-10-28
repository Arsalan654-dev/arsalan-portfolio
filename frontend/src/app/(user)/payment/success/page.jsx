'use client';
import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import userService from '@/services/userService';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get('orderId');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) { router.push('/orders'); return; }
    (async () => {
      try {
        const res = await userService.getOrderDetail(orderId);
        setOrder(res.data?.data || res.data);
      } catch {
      } finally {
        setLoading(false);
      }
    })();
  }, [orderId]);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="container py-5 text-center">
      <div className="card border-0 rounded-3 p-5 mx-auto" style={{ maxWidth: 500, background: 'var(--bs)' }}>
        <div style={{ fontSize: '4rem', color: '#10b981' }}>
          <i className="fas fa-check-circle"></i>
        </div>
        <h3 className="fw-bold mt-3" style={{ color: 'var(--tp)' }}>Payment Successful!</h3>
        <p style={{ color: 'var(--ts)' }}>Thank you for your purchase. Your order has been confirmed.</p>
        <p style={{ color: 'var(--ts)' }}>Order #{order?.orderNumber || orderId?.slice(-8).toUpperCase()}</p>
        {order?.totalAmount > 0 && (
          <p className="fw-bold" style={{ color: 'var(--ap)' }}>Total: ${order.totalAmount}</p>
        )}
        <div className="d-flex gap-2 justify-content-center mt-4">
          <Link href="/orders" className="btn px-4" style={{ background: 'var(--gm)', color: '#fff', border: 'none' }}>
            View Orders
          </Link>
          <Link href="/projects" className="btn px-4" style={{ border: '1px solid var(--ap)', color: 'var(--ap)', background: 'transparent' }}>
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
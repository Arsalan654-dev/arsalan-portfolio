'use client';
import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import Link from 'next/link';
import toast from 'react-hot-toast';
import userService from '@/services/userService';
import StripeProvider from '@/components/common/StripeProvider';
import { formatCurrency } from '@/utils/helpers';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { useDispatch } from 'react-redux';
import { clearCart } from '@/redux/slices/cartSlice';

function PaymentForm({ order, orderId }) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const dispatch = useDispatch();
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) {
      toast.error('Stripe is not ready. Please refresh the page.');
      return;
    }

    setProcessing(true);
    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment/success?orderId=${orderId}`
        },
        redirect: 'if_required'
      });

      if (error) {
        toast.error(error.message || 'Payment failed. Please check your card details.');
        setProcessing(false);
        return;
      }

      if (paymentIntent && paymentIntent.status === 'succeeded') {
        try {
          await userService.payOrder(orderId);
        } catch (payErr) {
          console.error('payOrder error:', payErr);
        }
        dispatch(clearCart());
        toast.success('Payment successful!');
        router.push(`/payment/success?orderId=${orderId}`);
      } else if (paymentIntent) {
        toast.error(`Payment status: ${paymentIntent.status}. Please try again.`);
      }
    } catch (err) {
      console.error('Payment error:', err);
      toast.error(err.message || err.response?.data?.message || 'Payment failed');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      <button type="submit" disabled={!stripe || processing} className="btn w-100 mt-4 py-3 fw-semibold"
        style={{ background: 'var(--gm)', color: '#fff', border: 'none' }}>
        {processing ? <><span className="spinner-border spinner-border-sm me-2" />Processing...</> : `Pay ${formatCurrency(order.totalAmount || 0)}`}
      </button>
    </form>
  );
}

export default function PaymentPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get('orderId');
  const [order, setOrder] = useState(null);
  const [clientSecret, setClientSecret] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!orderId) { router.push('/orders'); return; }
    (async () => {
      try {
        setLoading(true);
        const orderRes = await userService.getOrderDetail(orderId);
        const orderData = orderRes.data?.data || orderRes.data;
        setOrder(orderData);

        if (orderData?.paymentStatus === 'paid') {
          router.push(`/payment/success?orderId=${orderId}`);
          return;
        }

        const piRes = await userService.createPaymentIntent(orderId);
        setClientSecret(piRes.data?.data?.clientSecret || '');
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load payment');
      } finally {
        setLoading(false);
      }
    })();
  }, [orderId]);

  if (loading) return <LoadingSpinner />;

  if (error) {
    return (
      <div className="container py-5 text-center">
        <div className="card border-0 rounded-3 p-5 mx-auto" style={{ maxWidth: 500, background: 'var(--bs)' }}>
          <i className="fas fa-exclamation-triangle" style={{ fontSize: '4rem', color: '#ef4444' }}></i>
          <h4 className="fw-bold mt-3" style={{ color: 'var(--tp)' }}>Payment Error</h4>
          <p style={{ color: 'var(--ts)' }}>{error}</p>
          <Link href="/orders" className="btn" style={{ background: 'var(--gm)', color: '#fff', border: 'none' }}>
            View Orders
          </Link>
        </div>
      </div>
    );
  }

  const inputStyle = { background: 'var(--bs)', color: 'var(--tp)', borderColor: 'var(--bdr)', borderRadius: '8px' };

  return (
    <div className="container py-5">
      <h3 className="fw-bold mb-4" style={{ color: 'var(--tp)' }}>Payment</h3>
      <div className="row g-4">
        <div className="col-lg-7">
          <div className="card border-0 rounded-3 p-4" style={{ background: 'var(--bs)' }}>
            <h5 className="fw-bold mb-3" style={{ color: 'var(--tp)' }}>Card Details</h5>
            {clientSecret ? (
              <StripeProvider clientSecret={clientSecret}>
                <PaymentForm order={order} orderId={orderId} />
              </StripeProvider>
            ) : (
              <div className="text-center py-4">
                <div className="spinner-border" style={{ color: 'var(--ap)' }} role="status" />
                <p className="mt-2" style={{ color: 'var(--ts)' }}>Initializing payment...</p>
              </div>
            )}
          </div>
        </div>

        <div className="col-lg-5">
          <div className="card border-0 rounded-3 p-4" style={{ background: 'var(--bs)' }}>
            <h5 className="fw-bold mb-3" style={{ color: 'var(--tp)' }}>Order Summary</h5>
            <p style={{ color: 'var(--ts)' }}>Order #{order?.orderNumber || order?._id?.slice(-8).toUpperCase()}</p>
            <hr style={{ borderColor: 'var(--bdr)' }} />
            {order?.items?.map((item, i) => (
              <div key={i} className="d-flex justify-content-between mb-2">
                <span style={{ color: 'var(--ts)' }}>{item.item?.title || item.title || 'Item'} x{item.quantity || 1}</span>
                <span style={{ color: 'var(--tp)' }}>{formatCurrency((item.price || 0) * (item.quantity || 1))}</span>
              </div>
            ))}
            {order?.discountAmount > 0 && (
              <div className="d-flex justify-content-between mb-2">
                <span style={{ color: '#10b981' }}>Discount</span>
                <span style={{ color: '#10b981' }}>-{formatCurrency(order.discountAmount)}</span>
              </div>
            )}
            <hr style={{ borderColor: 'var(--bdr)' }} />
            <div className="d-flex justify-content-between">
              <span className="fw-bold fs-5" style={{ color: 'var(--tp)' }}>Total</span>
              <span className="fw-bold fs-5" style={{ color: 'var(--ap)' }}>{formatCurrency(order?.totalAmount || 0)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

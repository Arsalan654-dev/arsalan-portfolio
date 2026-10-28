'use client';
import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import userService from '@/services/userService';
import { clearCart } from '@/redux/slices/cartSlice';
import { formatCurrency, getImageUrl } from '@/utils/helpers';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { fetchCart } from '@/redux/slices/cartSlice';

export default function CheckoutPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { items, loading: cartLoading } = useSelector((state) => state.cart);
  const [loading, setLoading] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoError, setPromoError] = useState('');
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  useEffect(() => {
    (async () => {
      try {
        const res = await userService.getProfile();
        setProfile(res.data?.data || res.data);
      } catch {}
    })();
  }, []);

  useEffect(() => {
    if (!cartLoading && items.length === 0) {
      toast.error('Cart is empty');
      router.push('/cart');
    }
  }, [items, cartLoading]);

  const subtotal = items.reduce((sum, item) => sum + (item.item?.price || item.price || 0) * (item.quantity || 1), 0);
  const total = Math.max(0, subtotal - discount);

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) { setPromoError('Enter a code'); return; }
    try {
      const res = await userService.validatePromo({ code: promoCode.trim() });
      const data = res.data?.data || res.data;
      if (data.valid) {
        const disc = subtotal * (data.discountPercentage / 100);
        setDiscount(disc);
        setPromoApplied(true);
        setPromoError('');
        toast.success(`Promo applied! ${data.discountPercentage}% off`);
      } else {
        setPromoError('Invalid promo code');
      }
    } catch {
      setPromoError('Failed to validate promo code');
    }
  };

  const handlePlaceOrder = async () => {
    try {
      setLoading(true);
      const orderData = {
        items: items.map(i => ({ item: i.item?._id || i._id, quantity: i.quantity })),
        promoCode: promoApplied ? promoCode.trim() : undefined,
        discount
      };
      const res = await userService.checkout(orderData);
      const orderId = res.data?.data?.order?._id || res.data?.data?._id || res.data?._id;
      toast.success('Order placed successfully!');
      router.push(`/payment?orderId=${orderId}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = { background: 'var(--bs)', color: 'var(--tp)', borderColor: 'var(--bdr)', borderRadius: '8px' };

  if (cartLoading) return <LoadingSpinner />;

  return (
    <div className="container py-5">
      <h3 className="fw-bold mb-4" style={{ color: 'var(--tp)' }}>Checkout</h3>
      <div className="row g-4">
        <div className="col-lg-8">
          <div className="card border-0 rounded-3 p-4 mb-4" style={{ background: 'var(--bs)' }}>
            <h5 className="fw-bold mb-3" style={{ color: 'var(--tp)' }}>Order Items</h5>
            {items.map((item, idx) => (
              <div key={idx} className="d-flex align-items-center gap-3 py-2 border-bottom" style={{ borderColor: 'var(--bdr)' }}>
                <img src={getImageUrl(item.item?.pictures?.find(p => p && (p.startsWith('http://') || p.startsWith('https://'))) || item.item?.pictures?.[0] || '/next.svg')} alt={item.item?.title || item.title}
                  style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: '8px' }} />
                <div className="flex-grow-1">
                  <p className="fw-medium mb-0" style={{ color: 'var(--tp)' }}>{item.item?.title || item.title}</p>
                  <small style={{ color: 'var(--ts)' }}>Qty: {item.quantity} x {formatCurrency(item.item?.price || item.price || 0)}</small>
                </div>
                <span className="fw-bold" style={{ color: 'var(--ap)' }}>{formatCurrency((item.item?.price || item.price || 0) * item.quantity)}</span>
              </div>
            ))}
          </div>

          <div className="card border-0 rounded-3 p-4" style={{ background: 'var(--bs)' }}>
            <h5 className="fw-bold mb-3" style={{ color: 'var(--tp)' }}>Billing Information</h5>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label" style={{ color: 'var(--tp)' }}>Name</label>
                <input type="text" className="form-control" value={profile?.name || ''} readOnly style={inputStyle} />
              </div>
              <div className="col-md-6">
                <label className="form-label" style={{ color: 'var(--tp)' }}>Email</label>
                <input type="email" className="form-control" value={profile?.email || ''} readOnly style={inputStyle} />
              </div>
              <div className="col-md-6">
                <label className="form-label" style={{ color: 'var(--tp)' }}>Phone</label>
                <input type="text" className="form-control" value={profile?.mobileNumber || 'Not provided'} readOnly style={inputStyle} />
              </div>
              <div className="col-md-6">
                <label className="form-label" style={{ color: 'var(--tp)' }}>Country</label>
                <input type="text" className="form-control" value={profile?.country?.country_name || 'Not provided'} readOnly style={inputStyle} />
              </div>
              <div className="col-12">
                <label className="form-label" style={{ color: 'var(--tp)' }}>Address</label>
                <input type="text" className="form-control" value={profile?.address || 'Not provided'} readOnly style={inputStyle} />
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card border-0 rounded-3 p-4" style={{ background: 'var(--bs)' }}>
            <h5 className="fw-bold mb-3" style={{ color: 'var(--tp)' }}>Summary</h5>
            <div className="d-flex justify-content-between mb-2">
              <span style={{ color: 'var(--ts)' }}>Subtotal</span>
              <span style={{ color: 'var(--tp)' }}>{formatCurrency(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div className="d-flex justify-content-between mb-2">
                <span style={{ color: '#10b981' }}>Discount</span>
                <span style={{ color: '#10b981' }}>-{formatCurrency(discount)}</span>
              </div>
            )}
            <hr style={{ borderColor: 'var(--bdr)' }} />
            <div className="d-flex justify-content-between mb-3">
              <span className="fw-bold fs-5" style={{ color: 'var(--tp)' }}>Total</span>
              <span className="fw-bold fs-5" style={{ color: 'var(--ap)' }}>{formatCurrency(total)}</span>
            </div>

            <div className="mb-3">
              <div className="input-group">
                <input type="text" className="form-control" placeholder="Promo code"
                  value={promoCode} onChange={(e) => { setPromoCode(e.target.value); setPromoError(''); }}
                  style={inputStyle} disabled={promoApplied} />
                <button onClick={handleApplyPromo} className="btn"
                  style={{ background: promoApplied ? '#10b981' : 'var(--ap)', color: '#fff', border: 'none' }}
                  disabled={promoApplied}>
                  {promoApplied ? 'Applied' : 'Apply'}
                </button>
              </div>
              {promoError && <small style={{ color: '#ef4444' }}>{promoError}</small>}
            </div>

            <button onClick={handlePlaceOrder} disabled={loading} className="btn w-100 py-3 fw-semibold"
              style={{ background: 'var(--gm)', color: '#fff', border: 'none' }}>
              {loading ? <><span className="spinner-border spinner-border-sm me-2" />Processing...</> : 'Place Order'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

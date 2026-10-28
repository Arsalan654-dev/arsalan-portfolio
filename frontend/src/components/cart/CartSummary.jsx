'use client';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { formatCurrency } from '../../utils/helpers';
import userService from '../../services/userService';
import toast from 'react-hot-toast';

export default function CartSummary({ onCheckout }) {
  const items = useSelector(state => state.cart.items);
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoError, setPromoError] = useState('');
  const [promoLoading, setPromoLoading] = useState(false);

  const subtotal = items.reduce((sum, item) => sum + (item.item?.price || item.price || 0) * item.quantity, 0);
  const total = Math.max(0, subtotal - discount);

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) {
      setPromoError('Please enter a promo code');
      return;
    }

    setPromoLoading(true);
    setPromoError('');
    try {
      const { data } = await userService.validatePromo({ code: promoCode.trim() });
      if (data.success && data.data) {
        const discountAmount = subtotal * (data.data.discountPercentage / 100);
        setDiscount(discountAmount);
        setPromoApplied(true);
        toast.success(`Promo code applied! ${data.data.discountPercentage}% off`);
      } else {
        setPromoError(data.message || 'Invalid promo code');
        setPromoApplied(false);
        setDiscount(0);
      }
    } catch (err) {
      setPromoError(err.response?.data?.message || 'Invalid promo code');
      setPromoApplied(false);
      setDiscount(0);
    } finally {
      setPromoLoading(false);
    }
  };

  return (
    <div className="card border-0 rounded-3 p-4 sticky-top" style={{ background: 'var(--bs)', top: '2rem' }}>
      <h5 className="fw-bold mb-4" style={{ color: '#fff' }}>Order Summary</h5>

      <div className="mb-3">
        <div className="d-flex justify-content-between mb-2">
          <span style={{ color: 'var(--ts)' }}>Subtotal ({items.length} items)</span>
          <span style={{ color: '#fff' }}>{formatCurrency(subtotal)}</span>
        </div>
        {discount > 0 && (
          <div className="d-flex justify-content-between mb-2">
            <span style={{ color: '#10b981' }}>Discount</span>
            <span style={{ color: '#10b981' }}>-{formatCurrency(discount)}</span>
          </div>
        )}
        <hr style={{ borderColor: 'var(--bdr)' }} />
        <div className="d-flex justify-content-between">
          <span className="fw-bold fs-5" style={{ color: '#fff' }}>Total</span>
          <span className="fw-bold fs-5" style={{ color: 'var(--ap)' }}>{formatCurrency(total)}</span>
        </div>
      </div>

      <div className="mb-3">
        <div className="input-group">
          <input
            type="text"
            className="form-control"
            placeholder="Promo code"
            value={promoCode}
            onChange={e => { setPromoCode(e.target.value); setPromoError(''); }}
            style={{ background: 'var(--bt)', border: '1px solid var(--bdr)', color: '#fff' }}
            disabled={promoApplied}
          />
          <button
            onClick={handleApplyPromo}
            className="btn fw-semibold"
            style={{ background: promoApplied ? '#10b981' : 'var(--ap)', color: '#fff', border: 'none' }}
            disabled={promoApplied || promoLoading}
          >
            {promoLoading ? 'Checking...' : promoApplied ? 'Applied' : 'Apply'}
          </button>
        </div>
        {promoError && <small style={{ color: '#ef4444' }}>{promoError}</small>}
        {promoApplied && <small style={{ color: '#10b981' }}>Promo code applied!</small>}
      </div>

      <button
        onClick={onCheckout}
        className="btn w-100 fw-semibold py-3"
        style={{ background: 'linear-gradient(135deg, var(--ap), #2563eb)', color: '#fff', border: 'none' }}
        disabled={items.length === 0}
      >
        Proceed to Checkout
      </button>
    </div>
  );
}

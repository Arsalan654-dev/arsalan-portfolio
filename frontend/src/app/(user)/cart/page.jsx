'use client';
import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import CartItem from '@/components/cart/CartItem';
import CartSummary from '@/components/cart/CartSummary';
import { fetchCart } from '@/redux/slices/cartSlice';

export default function CartPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { items, loading } = useSelector((state) => state.cart);

  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  const handleCheckout = () => {
    if (items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }
    router.push('/checkout');
  };

  if (loading && items.length === 0) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border" style={{ color: 'var(--ap)' }} role="status" />
      </div>
    );
  }

  return (
    <div className="container py-5">
      <h3 className="fw-bold mb-4" style={{ color: 'var(--tp)' }}>Shopping Cart</h3>
      {items.length === 0 ? (
        <div className="text-center py-5">
          <i className="fas fa-shopping-cart" style={{ fontSize: '3rem', color: 'var(--bdr)' }}></i>
          <p className="mt-3" style={{ color: 'var(--ts)' }}>Your cart is empty</p>
          <Link href="/projects" className="btn" style={{ background: 'var(--gm)', color: '#fff', border: 'none' }}>
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="row g-4">
          <div className="col-lg-8">
            {items.map((item) => (
              <CartItem key={item._id || item.item?._id} item={item} />
            ))}
          </div>
          <div className="col-lg-4">
            <CartSummary onCheckout={handleCheckout} />
          </div>
        </div>
      )}
    </div>
  );
}

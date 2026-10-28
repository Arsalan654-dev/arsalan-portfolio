'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import userService from '@/services/userService';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { getImageUrl, formatCurrency } from '@/utils/helpers';

export default function WishlistPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // eslint-disable-next-line react-hooks/immutability
  useEffect(() => { loadWishlist(); }, []);

  const loadWishlist = async () => {
    try {
      setLoading(true);
      const res = await userService.getWishlist();
      setItems(res.data?.data || res.data || []);
    } catch (err) {
      toast.error('Failed to load wishlist');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (id) => {
    try {
      await userService.removeFromWishlist(id);
      setItems(prev => prev.filter(i => i._id !== id));
      toast.success('Removed from wishlist');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="container py-5">
      <h3 className="fw-bold mb-4" style={{ color: 'var(--tp)' }}>My Wishlist</h3>
      {items.length === 0 ? (
        <div className="text-center py-5">
          <i className="fas fa-heart" style={{ fontSize: '3rem', color: 'var(--bdr)' }}></i>
          <p className="mt-3" style={{ color: 'var(--ts)' }}>Your wishlist is empty</p>
          <Link href="/projects" className="btn" style={{ background: 'var(--gm)', color: '#fff', border: 'none' }}>
            Browse Projects
          </Link>
        </div>
      ) : (
        <div className="row g-4">
          {items.map((item) => (
            <div key={item._id} className="col-lg-4 col-md-6">
              <div className="card border-0 rounded-3 h-100" style={{ background: 'var(--bs)' }}>
                <div className="position-relative">
                  <img
                    src={getImageUrl(item.pictures?.[0] || item.images?.[0] || item.image)}
                    alt={item.title}
                    className="w-100 rounded-top-3"
                    style={{ height: 200, objectFit: 'cover' }}
                  />
                  <span className="position-absolute top-0 end-0 m-2 badge" style={{ background: 'var(--ap)' }}>
                    {item.type || 'item'}
                  </span>
                </div>
                <div className="card-body d-flex flex-column">
                  <h5 className="fw-bold mb-2" style={{ color: 'var(--tp)' }}>{item.title}</h5>
                  <p className="small mb-2" style={{ color: 'var(--ts)' }}>
                    {item.description?.slice(0, 100)}...
                  </p>
                  <div className="d-flex justify-content-between align-items-center mt-auto">
                    <span className="fw-bold fs-5" style={{ color: 'var(--ap)' }}>
                      {formatCurrency(item.price || 0)}
                    </span>
                    <div className="d-flex gap-2">
                      <Link
                        href={`/${item.type === 'service' ? 'services' : 'projects'}/${item.slug || item._id}`}
                        className="btn btn-sm" style={{ background: 'var(--gm)', color: '#fff', border: 'none' }}>
                        View
                      </Link>
                      <button
                        onClick={() => handleRemove(item._id)}
                        className="btn btn-sm" style={{ color: '#ef4444', border: '1px solid #ef4444', background: 'transparent' }}>
                        <i className="fas fa-trash-alt"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

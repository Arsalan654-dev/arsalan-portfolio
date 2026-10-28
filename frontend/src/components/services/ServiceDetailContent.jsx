'use client';
import { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Link from 'next/link';
import toast from 'react-hot-toast';
import publicService from '../../services/publicService';
import { addToCartAPI } from '../../redux/slices/cartSlice';
import { addToWishlistAPI } from '../../redux/slices/wishlistSlice';
import { addPendingAction } from '../../redux/slices/pendingActionsSlice';
import { getImageUrl, formatCurrency, formatDate } from '../../utils/helpers';
import LoginModal from '../common/LoginModal';
import ReviewForm from '../common/ReviewForm';
import ServiceCard from './ServiceCard';

export default function ServiceDetailContent({ slug }) {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated);
  const wishlistItems = useSelector(state => state.wishlist.items);
  const [service, setService] = useState(null);
  const [related, setRelated] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [activeImage, setActiveImage] = useState(0);
  const [addedToCart, setAddedToCart] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const fetchReviews = async (sid) => {
    try {
      const revRes = await publicService.getItemReviews('services', sid || service?._id);
      if (revRes.data.success) setReviews(revRes.data.data || []);
    } catch {}
  };

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await publicService.getServiceBySlug(slug);
        if (data.success) {
          setService(data.data);
          const sid = data.data._id;
          const [relRes, revRes] = await Promise.all([
            publicService.getRelatedServices(sid),
            publicService.getItemReviews('services', sid)
          ]);
          if (relRes.data.success) setRelated(relRes.data.data || []);
          if (revRes.data.success) setReviews(revRes.data.data || []);
        }
      } catch (err) {
        console.error('Failed to load service', err);
        toast.error('Failed to load service');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [slug]);

  const handleAddToCart = useCallback(() => {
    if (!isAuthenticated) {
      dispatch(addPendingAction({ type: 'addToCart', payload: { itemId: service._id, itemType: 'services' } }));
      setShowLoginModal(true);
      toast.error('Please login to add to cart');
      return;
    }
    dispatch(addToCartAPI({ itemId: service._id, itemType: 'services' }));
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  }, [dispatch, service, isAuthenticated]);

  const handleAddToWishlist = useCallback(() => {
    if (!isAuthenticated) {
      dispatch(addPendingAction({ type: 'addToWishlist', payload: { itemId: service._id } }));
      setShowLoginModal(true);
      toast.error('Please login to add to wishlist');
      return;
    }
    dispatch(addToWishlistAPI(service._id));
  }, [dispatch, service, isAuthenticated]);

  const isInWishlist = service ? wishlistItems.some(i => i._id === service._id) : false;

  if (loading) {
    return (
      <div className="text-center py-5" style={{ background: 'var(--bp)', minHeight: '60vh' }}>
        <div className="spinner-border" style={{ color: 'var(--ap)' }} role="status" />
      </div>
    );
  }

  if (!service) {
    return (
      <div className="text-center py-5" style={{ background: 'var(--bp)', minHeight: '60vh' }}>
        <h3 style={{ color: '#fff' }}>Service not found</h3>
        <Link href="/services" className="btn mt-3" style={{ border: '1px solid var(--ap)', color: 'var(--ap)' }}>Back to Services</Link>
      </div>
    );
  }

  const images = service.pictures || service.images || [];
  const currentImage = images[activeImage] || service.image;

  return (
    <section style={{ background: 'var(--bp)', minHeight: '80vh' }}>
      <div className="container py-5">
        <div className="row g-4">
          <div className="col-lg-7">
            <div className="position-relative rounded-3 overflow-hidden mb-3" style={{ background: 'var(--bs)', height: '400px', cursor: 'pointer' }}
              onClick={() => setLightboxIndex(activeImage)}>
              <img src={getImageUrl(currentImage)} alt={service.title} className="w-100 h-100" style={{ objectFit: 'cover' }} />
            </div>
            {images.length > 1 && (
              <div className="d-flex gap-2 overflow-auto pb-2">
                {images.map((img, i) => (
                  <img
                    key={i}
                    src={getImageUrl(img)}
                    alt={`${service.title} ${i + 1}`}
                    className="rounded-2"
                    style={{ width: '80px', height: '60px', objectFit: 'cover', cursor: 'pointer', border: activeImage === i ? '2px solid var(--ap)' : '2px solid transparent', opacity: activeImage === i ? 1 : 0.5 }}
                    onClick={() => setActiveImage(i)}
                  />
                ))}
              </div>
            )}
            {service.videos?.length > 0 && (
              <div className="mt-3">
                <h5 className="fw-bold mb-2" style={{ color: '#fff' }}>Videos</h5>
                <div className="d-flex gap-2 overflow-auto">
                  {service.videos.map((vid, i) => (
                    <video key={i} controls className="rounded-2" style={{ width: '200px', height: '120px', objectFit: 'cover', background: '#000' }}>
                      <source src={getImageUrl(vid)} type="video/mp4" />
                    </video>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-4">
              <h5 className="fw-bold mb-2" style={{ color: '#fff' }}>Description</h5>
              <p style={{ color: 'var(--ts)', lineHeight: 1.7 }}>{service.description}</p>
            </div>

            {service.longDescription && (
              <div className="mt-3">
                <p style={{ color: 'var(--ts)', lineHeight: 1.7 }}>{service.longDescription}</p>
              </div>
            )}

            {reviews.length > 0 && (
              <div className="mt-4">
                <h5 className="fw-bold mb-3" style={{ color: '#fff' }}>Reviews & Ratings</h5>
                {reviews.map((review, i) => (
                  <div key={review._id || i} className="p-3 rounded-3 mb-2" style={{ background: 'var(--bs)', border: '1px solid var(--bt)' }}>
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <span className="fw-medium" style={{ color: 'var(--tp)' }}>{review.user?.name || 'Anonymous'}</span>
                      <span style={{ color: '#f59e0b' }}>
                        {Array.from({ length: 5 }, (_, j) => j < (review.rating || 0) ? '★' : '☆').join('')}
                      </span>
                    </div>
                    {review.reviewText && <p className="mb-1" style={{ color: 'var(--ts)', fontSize: '0.9rem' }}>{review.reviewText}</p>}
                    <small style={{ color: '#71717a' }}>{formatDate(review.createdAt)}</small>
                  </div>
                ))}
              </div>
            )}

            <ReviewForm itemId={service._id} itemType="services" onReviewAdded={() => fetchReviews()} />
          </div>

          <div className="col-lg-5">
            <div className="card border-0 rounded-3 p-4 sticky-top" style={{ background: 'var(--bs)', top: '2rem' }}>
              <h2 className="fw-bold mb-1" style={{ color: '#fff' }}>{service.title}</h2>
              {service.category && (
                <span className="badge rounded-pill px-3 py-2 mb-2 d-inline-flex align-self-start fw-normal" style={{ background: '#7c3aed20', color: 'var(--ap)', border: '1px solid var(--ap)' }}>
                  {service.category.category_title || service.category.name || ''}
                </span>
              )}

              <div className="d-flex align-items-center gap-2 mb-3">
                <span style={{ color: '#f59b0b' }}>
                  {Array.from({ length: 5 }, (_, j) => j < Math.round(service.averageRating || service.rating || 0) ? '★' : '☆').join('')}
                </span>
                <span style={{ color: 'var(--ts)' }}>({(service.averageRating || service.rating || 0).toFixed(1)})</span>
                {service.totalReviews > 0 && <small style={{ color: 'var(--ts)' }}>({service.totalReviews} reviews)</small>}
              </div>

              <h3 className="fw-bold mb-3" style={{ color: 'var(--ap)' }}>
                {service.price ? formatCurrency(service.price) : 'Contact for price'}
              </h3>

              <div className="mb-3">
                {service.technologies?.length > 0 && (
                  <div className="mb-2">
                    <small className="fw-medium" style={{ color: 'var(--ts)' }}>Technologies</small>
                    <div className="d-flex flex-wrap gap-1 mt-1">
                      {service.technologies.map(t => (
                        <span key={t._id || t} className="badge rounded-pill px-2 py-1 fw-normal" style={{ background: '#2563eb20', color: '#2563eb', border: '1px solid #2563eb', fontSize: '0.8rem' }}>{t.technology_title || t.name || ''}</span>
                      ))}
                    </div>
                  </div>
                )}
                {service.skills?.length > 0 && (
                  <div className="mb-2">
                    <small className="fw-medium" style={{ color: 'var(--ts)' }}>Skills</small>
                    <div className="d-flex flex-wrap gap-1 mt-1">
                      {service.skills.map(s => (
                        <span key={s._id || s} className="badge rounded-pill px-2 py-1 fw-normal" style={{ background: '#06b6d420', color: '#06b6d4', border: '1px solid #06b6d4', fontSize: '0.8rem' }}>{s.skill_title || s.name || ''}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="d-grid gap-2">
                <button
                  onClick={handleAddToCart}
                  className="btn fw-semibold py-2"
                  style={{ background: addedToCart ? '#10b981' : 'linear-gradient(135deg, var(--ap), #2563eb)', color: '#fff', border: 'none' }}
                >
                  {addedToCart ? '✓ Added to Cart' : 'Add to Cart'}
                </button>
                <button
                  onClick={handleAddToWishlist}
                  className="btn fw-semibold py-2"
                  style={{ border: '1px solid var(--ap)', color: isInWishlist ? 'var(--ap)' : 'var(--ap)', background: isInWishlist ? '#7c3aed20' : 'transparent' }}
                >
                  {isInWishlist ? '♥ In Wishlist' : '♡ Add to Wishlist'}
                </button>
                {service.liveUrl && (
                  <a
                    href={service.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn fw-semibold py-2"
                    style={{ border: '1px solid #10b981', color: '#10b981', background: 'transparent' }}
                  >
                    Live Preview &nearr;
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {related.length > 0 && (
          <div className="mt-5">
            <h4 className="fw-bold mb-3" style={{ color: '#fff' }}>Related Services</h4>
            <div className="row g-4">
              {related.slice(0, 3).map(s => (
                <div key={s._id} className="col-lg-4 col-md-6">
                  <ServiceCard service={s} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {lightboxIndex !== null && images.length > 0 && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ background: 'rgba(0,0,0,0.95)', zIndex: 9999 }}>
          <button onClick={() => setLightboxIndex(null)} className="position-absolute top-0 end-0 btn text-white fs-3 p-3 border-0">&times;</button>
          <button onClick={() => setLightboxIndex(i => (i - 1 + images.length) % images.length)} className="position-absolute start-0 top-50 translate-middle-y btn text-white fs-1 border-0 p-3">&lsaquo;</button>
          <img src={getImageUrl(images[lightboxIndex])} alt="" style={{ maxWidth: '90%', maxHeight: '90%', objectFit: 'contain' }} />
          <button onClick={() => setLightboxIndex(i => (i + 1) % images.length)} className="position-absolute end-0 top-50 translate-middle-y btn text-white fs-1 border-0 p-3">&rsaquo;</button>
        </div>
      )}

      <LoginModal show={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </section>
  );
}

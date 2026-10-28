'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import adminService from '@/services/adminService';
import StarRating from '@/components/common/StarRating';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { formatDate, formatCurrency } from '@/utils/helpers';

export default function AdminServiceDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);

  // eslint-disable-next-line react-hooks/immutability
  useEffect(() => { loadService(); }, [id]);

  const loadService = async () => {
    try {
      setLoading(true);
      const res = await adminService.services.getById(id);
      setService(res.data?.data || res.data);
    } catch {
      toast.error('Service not found');
      router.push('/admin/services');
    } finally { setLoading(false); }
  };

  if (loading) return <LoadingSpinner />;
  if (!service) return null;

  const images = service.pictures || service.images || [];
  const reviews = service.reviews || [];

  return (
    <div>
      <div className="d-flex align-items-center gap-3 mb-4">
        <button onClick={() => router.back()} className="btn btn-sm" style={{ color: 'var(--ap)', border: '1px solid var(--ap)', background: 'transparent' }}>
          <i className="fas fa-arrow-left me-1"></i>Back
        </button>
        <h4 className="fw-bold mb-0" style={{ color: 'var(--tp)' }}>{service.title}</h4>
        <Link href={`/admin/services/edit/${service._id}`} className="btn btn-sm ms-auto"
          style={{ background: 'var(--gm)', color: '#fff', border: 'none' }}>
          <i className="fas fa-edit me-1"></i>Edit
        </Link>
      </div>

      <div className="row g-4">
        <div className="col-lg-8">
          {images.length > 0 && (
            <div className="card border-0 rounded-3 overflow-hidden mb-4" style={{ background: 'var(--bs)' }}>
              <img src={images[activeImage]} alt={service.title}
                style={{ width: '100%', height: 400, objectFit: 'cover' }} />
              {images.length > 1 && (
                <div className="d-flex gap-2 p-3" style={{ overflowX: 'auto' }}>
                  {images.map((img, i) => (
                    <img key={i} src={img} alt=""
                      onClick={() => setActiveImage(i)}
                      style={{ width: 80, height: 60, objectFit: 'cover', borderRadius: 6, cursor: 'pointer',
                        border: activeImage === i ? '3px solid var(--ap)' : '3px solid transparent', opacity: activeImage === i ? 1 : 0.6 }}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {service.video && (
            <div className="card border-0 rounded-3 p-3 mb-4" style={{ background: 'var(--bs)' }}>
              <h5 className="fw-bold mb-2" style={{ color: 'var(--tp)' }}>Video</h5>
              <video src={service.video} controls style={{ width: '100%', maxHeight: 400, borderRadius: 8 }} />
            </div>
          )}

          <div className="card border-0 rounded-3 p-4 mb-4" style={{ background: 'var(--bs)' }}>
            <h5 className="fw-bold mb-2" style={{ color: 'var(--tp)' }}>Description</h5>
            <p style={{ color: 'var(--ts)', whiteSpace: 'pre-wrap' }}>{service.description}</p>
          </div>

          {reviews.length > 0 && (
            <div className="card border-0 rounded-3 p-4" style={{ background: 'var(--bs)' }}>
              <h5 className="fw-bold mb-3" style={{ color: 'var(--tp)' }}>Reviews ({reviews.length})</h5>
              {reviews.map((review, i) => (
                <div key={review._id || i} className="border-bottom pb-3 mb-3" style={{ borderColor: 'var(--bdr)' }}>
                  <div className="d-flex align-items-center gap-2 mb-1">
                    <StarRating rating={review.rating || review.rate} />
                    <span className="fw-medium" style={{ color: 'var(--tp)' }}>{review.user?.name || 'Anonymous'}</span>
                  </div>
                  <p style={{ color: 'var(--ts)', fontSize: '0.9rem' }}>{review.comment}</p>
                  <small style={{ color: 'var(--ts)' }}>{formatDate(review.createdAt)}</small>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="col-lg-4">
          <div className="card border-0 rounded-3 p-4 sticky-top" style={{ background: 'var(--bs)', top: '5rem' }}>
            <h5 className="fw-bold mb-3" style={{ color: 'var(--tp)' }}>Details</h5>
            <div className="mb-2">
              <small style={{ color: 'var(--ts)' }}>Price</small>
              <p className="fw-bold fs-4 mb-0" style={{ color: 'var(--ap)' }}>{formatCurrency(service.price || 0)}</p>
            </div>
            <div className="mb-2">
              <small style={{ color: 'var(--ts)' }}>Slug</small>
              <p className="mb-0" style={{ color: 'var(--tp)' }}>{service.slug || '—'}</p>
            </div>
            <div className="mb-2">
              <small style={{ color: 'var(--ts)' }}>Category</small>
              <p className="mb-0" style={{ color: 'var(--tp)' }}>{service.category?.category_title || '-'}</p>
            </div>
            <div className="mb-2">
              <small style={{ color: 'var(--ts)' }}>Created</small>
              <p className="mb-0" style={{ color: 'var(--tp)' }}>{formatDate(service.createdAt)}</p>
            </div>
            {service.technologies?.length > 0 && (
              <div className="mb-2">
                <small style={{ color: 'var(--ts)' }}>Technologies</small>
                <div className="d-flex flex-wrap gap-1 mt-1">
                  {(service.technologies || []).map(t => (
                    <span key={t._id || t} className="badge rounded-pill" style={{ background: 'var(--ap)20', color: 'var(--ap)', border: '1px solid var(--ap)' }}>
                      {t.technology_title || t}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {service.skills?.length > 0 && (
              <div className="mb-2">
                <small style={{ color: 'var(--ts)' }}>Skills</small>
                <div className="d-flex flex-wrap gap-1 mt-1">
                  {(service.skills || []).map(s => (
                    <span key={s._id || s} className="badge rounded-pill" style={{ background: 'var(--ab)20', color: 'var(--ab)', border: '1px solid var(--ab)' }}>
                      {s.skill_title || s}
                    </span>
                  ))}
                </div>
              </div>
            )}
            <div className="mb-2">
              <small style={{ color: 'var(--ts)' }}>Rating</small>
              <div className="d-flex align-items-center gap-2">
                <StarRating rating={service.averageRating || 0} />
                <span style={{ color: 'var(--ts)' }}>({service.reviewCount || 0})</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';
import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import publicService from '../../services/publicService';
import { getImageUrl } from '../../utils/helpers';

export default function BannerSlider() {
  const [banners, setBanners] = useState([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await publicService.getBanners();
        if (data.success) setBanners(data.data || []);
      } catch (err) {
        toast.error('Failed to load banners');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const getPerView = () => {
    if (typeof window === 'undefined') return 4;
    if (window.innerWidth < 576) return 2;
    if (window.innerWidth < 768) return 3;
    return 4;
  };

  const [perView, setPerView] = useState(4);

  useEffect(() => {
    const handleResize = () => setPerView(getPerView());
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const maxIndex = Math.max(0, banners.length - perView);

  const next = useCallback(() => {
    setCurrent(c => c >= maxIndex ? 0 : c + 1);
  }, [maxIndex]);

  useEffect(() => {
    if (banners.length < 2) return;
    const timer = setInterval(next, 4000);
    return () => clearInterval(timer);
  }, [banners.length, next]);

  if (loading) {
    return (
      <section className="py-5 text-center" style={{ background: 'var(--bp)' }}>
        <div className="spinner-border" style={{ color: 'var(--ap)' }} role="status" />
      </section>
    );
  }

  if (banners.length === 0) return null;

  return (
    <section className="py-5" style={{ background: 'var(--bp)' }}>
      <div className="container">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="fw-bold mb-1" style={{ color: 'var(--tp)' }}>Banners</h2>
            <p style={{ color: 'var(--ts)' }}>Featured promotions and highlights</p>
          </div>
        </div>
        <div className="position-relative overflow-hidden">
          <div className="d-flex" style={{ transform: `translateX(-${current * (100 / perView)}%)`, transition: 'transform 0.5s ease' }}>
            {banners.map((banner, i) => (
              <div key={banner._id || i} className="flex-shrink-0" style={{ width: `${100 / perView}%`, padding: '0 6px' }}>
                <div style={{
                  borderRadius: '10px',
                  border: '1px solid var(--bdr)',
                  background: 'var(--bs)',
                  overflow: 'hidden',
                  aspectRatio: '1 / 1',
                  transition: 'all 0.3s ease',
                }}>
                  <img
                    src={getImageUrl(banner.image)}
                    alt={banner.title || 'Banner'}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                {(banner.title || banner.description) && (
                  <div className="mt-2 px-1">
                    {banner.title && <h6 className="fw-bold mb-0" style={{ color: 'var(--tp)', fontSize: '0.8rem' }}>{banner.title}</h6>}
                    {banner.description && <p className="mb-0" style={{ color: 'var(--ts)', fontSize: '0.7rem' }}>{banner.description}</p>}
                  </div>
                )}
              </div>
            ))}
          </div>
          {banners.length > perView && (
            <div className="d-flex justify-content-center gap-2 mt-3">
              {Array.from({ length: maxIndex + 1 }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className="btn p-0 rounded-circle"
                  style={{
                    width: '8px', height: '8px',
                    background: i === current ? 'var(--ap)' : 'var(--bdr)',
                    border: 'none', transition: 'all 0.3s'
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

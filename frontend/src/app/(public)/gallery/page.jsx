'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import publicService from '@/services/publicService';
import { getImageUrl } from '@/utils/helpers';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function GalleryPage() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await publicService.getGallery();
        if (data.success) setImages(data.data || []);
      } catch (err) {
        console.error('Failed to load gallery', err);
        toast.error('Failed to load gallery');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) return <LoadingSpinner text="Loading gallery..." />;

  return (
    <section style={{ background: 'var(--bs)', minHeight: '80vh' }}>
      <div className="container py-5">
        <div className="text-center mb-5">
          <h1 className="fw-bold" style={{ background: 'var(--gm)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            Gallery
          </h1>
          <p className="mb-0" style={{ color: 'var(--ts)' }}>A collection of memories and moments</p>
        </div>
        {images.length === 0 ? (
          <div className="text-center py-5">
            <p style={{ color: 'var(--ts)', fontSize: '1.1rem' }}>No gallery images yet.</p>
          </div>
        ) : (
          <div className="row g-3">
            {images.map((item, i) => {
              const imgUrl = item.image || item.url || item;
              const altText = item.title || item.alt || `Gallery ${i + 1}`;
              return (
                <div key={item._id || i} className="col-6 col-md-4 col-lg-3">
                  <div
                    className="rounded-3 overflow-hidden position-relative gallery-thumb"
                    style={{ cursor: 'pointer', background: 'var(--bc)' }}
                    onClick={() => setLightbox(i)}
                  >
                    <img
                      src={getImageUrl(imgUrl)}
                      alt={altText}
                      className="w-100 h-100"
                      style={{ objectFit: 'cover', transition: 'transform 0.3s' }}
                      onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                      onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                    />
                    {item.title && (
                      <div className="position-absolute bottom-0 start-0 w-100 p-3" style={{ background: 'linear-gradient(transparent, rgba(0,0,0,0.8))' }}>
                        <p className="mb-0 fw-medium text-white">{item.title}</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {lightbox !== null && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ background: 'rgba(0,0,0,0.95)', zIndex: 9999 }}>
          <button
            onClick={() => setLightbox(null)}
            className="position-absolute top-0 end-0 btn text-white fs-3 p-3 border-0"
          >&times;</button>
          <button
            onClick={() => setLightbox(i => (i - 1 + images.length) % images.length)}
            className="position-absolute start-0 top-50 translate-middle-y btn text-white fs-1 border-0 p-3"
          >&lsaquo;</button>
          <img
            src={getImageUrl(images[lightbox]?.image || images[lightbox]?.url || images[lightbox])}
            alt=""
            style={{ maxWidth: '90%', maxHeight: '90%', objectFit: 'contain' }}
          />
          <button
            onClick={() => setLightbox(i => (i + 1) % images.length)}
            className="position-absolute end-0 top-50 translate-middle-y btn text-white fs-1 border-0 p-3"
          >&rsaquo;</button>
        </div>
      )}
    </section>
  );
}

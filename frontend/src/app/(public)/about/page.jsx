'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import publicService from '@/services/publicService';
import { getImageUrl } from '@/utils/helpers';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function AboutPage() {
  const [about, setAbout] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await publicService.getAbout();
        if (data.success) setAbout(data.data);
      } catch (err) {
        console.error('Failed to load about', err);
        toast.error('Failed to load about');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) return <LoadingSpinner text="Loading about..." />;

  if (!about) {
    return (
      <section style={{ background: 'var(--bs)', minHeight: '80vh' }} className="d-flex align-items-center justify-content-center">
        <p style={{ color: 'var(--ts)' }}>About content not available.</p>
      </section>
    );
  }

  return (
    <section style={{ background: 'var(--bs)', minHeight: '80vh' }}>
      <div className="container py-5">
        <div className="text-center mb-5">
          <h1 className="fw-bold" style={{ background: 'var(--gm)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            About Me
          </h1>
        </div>
        <div className="row g-5 align-items-center">
          {about.images?.length > 0 && (
            <div className="col-lg-5">
              <div className="position-relative">
                <img
                  src={getImageUrl(about.images[0])}
                  alt={about.name || 'About'}
                  className="w-100 rounded-3 shadow-lg"
                  style={{ objectFit: 'cover', maxHeight: '500px' }}
                />
                {about.images.length > 1 && (
                  <div className="d-flex gap-2 mt-3 overflow-auto">
                    {about.images.slice(1).map((img, i) => (
                      <img key={i} src={getImageUrl(img)} alt="" className="rounded-2" style={{ width: '80px', height: '60px', objectFit: 'cover' }} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
          <div className={about.images?.length > 0 ? 'col-lg-7' : 'col-lg-12'}>
            <h2 className="fw-bold mb-3" style={{ color: 'var(--tp)' }}>{about.name || 'Arsalan Akhtar'}</h2>
            {about.title && <p className="fs-5 fw-medium mb-3" style={{ color: 'var(--ap)' }}>{about.title}</p>}
            {about.description && (
              <p className="mb-4" style={{ color: 'var(--ts)', lineHeight: 1.8, fontSize: '1.05rem' }}>{about.description}</p>
            )}
            {about.longDescription && (
              <p className="mb-4" style={{ color: 'var(--ts)', lineHeight: 1.8, fontSize: '1.05rem' }}>{about.longDescription}</p>
            )}
            {about.skills?.length > 0 && (
              <div className="mb-4">
                <h5 className="fw-semibold mb-3" style={{ color: 'var(--tp)' }}>Skills</h5>
                <div className="d-flex flex-wrap gap-2">
                  {about.skills.map((s, i) => (
                    <span key={i} className="badge rounded-pill px-3 py-2 fw-normal" style={{ background: 'var(--ap)', color: '#fff' }}>{s.skill_title || s.name || s || ''}</span>
                  ))}
                </div>
              </div>
            )}
            {about.experience && (
              <div className="d-flex gap-4 flex-wrap">
                <div>
                  <span className="fw-bold fs-4" style={{ color: 'var(--ap)' }}>{about.experience.years}+</span>
                  <p className="mb-0" style={{ color: 'var(--ts)', fontSize: '0.9rem' }}>Years Experience</p>
                </div>
                {about.experience.projects && (
                  <div>
                    <span className="fw-bold fs-4" style={{ color: 'var(--ap)' }}>{about.experience.projects}+</span>
                    <p className="mb-0" style={{ color: 'var(--ts)', fontSize: '0.9rem' }}>Projects Done</p>
                  </div>
                )}
                {about.experience.clients && (
                  <div>
                    <span className="fw-bold fs-4" style={{ color: 'var(--ap)' }}>{about.experience.clients}+</span>
                    <p className="mb-0" style={{ color: 'var(--ts)', fontSize: '0.9rem' }}>Happy Clients</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

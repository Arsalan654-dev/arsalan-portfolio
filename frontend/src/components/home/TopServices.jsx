'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import publicService from '../../services/publicService';
import ServiceCard from '../services/ServiceCard';

export default function TopServices() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState(0);
  const [perView, setPerView] = useState(4);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await publicService.getServices({ limit: 8, sort: '-rating' });
        if (data.success) setServices(data.data || []);
      } catch (err) {
        toast.error('Failed to load services');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 576) setPerView(2);
      else if (window.innerWidth < 768) setPerView(3);
      else setPerView(4);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const maxIndex = Math.max(0, services.length - perView);

  const next = useCallback(() => {
    setCurrent(c => c >= maxIndex ? 0 : c + 1);
  }, [maxIndex]);

  useEffect(() => {
    if (services.length < 2) return;
    const timer = setInterval(next, 4000);
    return () => clearInterval(timer);
  }, [services.length, next]);

  return (
    <section className="py-5" style={{ background: 'var(--bs)' }}>
      <div className="container">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="fw-bold mb-1" style={{ color: 'var(--tp)' }}>Top Services</h2>
            <p style={{ color: 'var(--ts)' }}>Professional services I offer</p>
          </div>
          <Link href="/services" className="btn fw-semibold" style={{ border: '1px solid var(--ap)', color: 'var(--ap)', background: 'transparent' }}>
            View All &rarr;
          </Link>
        </div>
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border" style={{ color: 'var(--ap)' }} role="status" />
          </div>
        ) : (
          <div className="position-relative overflow-hidden">
            <div className="d-flex" style={{ transform: `translateX(-${current * (100 / perView)}%)`, transition: 'transform 0.5s ease' }}>
              {services.map(service => (
                <div key={service._id} className="flex-shrink-0" style={{ width: `${100 / perView}%`, padding: '0 6px' }}>
                  <ServiceCard service={service} />
                </div>
              ))}
            </div>
            {services.length > perView && (
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
        )}
      </div>
    </section>
  );
}

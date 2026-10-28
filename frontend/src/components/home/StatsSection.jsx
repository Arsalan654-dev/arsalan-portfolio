'use client';
import { useState, useEffect, useRef } from 'react';
import publicService from '../../services/publicService';

function AnimatedCounter({ target }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const counted = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !counted.current) {
          counted.current = true;
          const duration = 2000;
          const steps = 60;
          const increment = target / steps;
          let current = 0;
          const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
              setCount(target);
              clearInterval(timer);
            } else {
              setCount(Math.floor(current));
            }
          }, duration / steps);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return <span ref={ref} className="fw-bold display-4" style={{ background: 'var(--gm)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>{count}+</span>;
}

export default function StatsSection() {
  const [stats, setStats] = useState([
    { label: 'Projects Completed', value: 0, icon: '🚀' },
    { label: 'Services Offered', value: 0, icon: '⚙️' },
    { label: 'Happy Clients', value: 0, icon: '👥' },
    { label: 'Orders Delivered', value: 0, icon: '📦' }
  ]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [projectsRes, servicesRes] = await Promise.allSettled([
          publicService.getProjects({ limit: 1 }),
          publicService.getServices({ limit: 1 })
        ]);

        const projectsTotal = projectsRes.status === 'fulfilled' ? (projectsRes.value.data?.pagination?.total || 0) : 0;
        const servicesTotal = servicesRes.status === 'fulfilled' ? (servicesRes.value.data?.pagination?.total || 0) : 0;

        setStats([
          { label: 'Projects Completed', value: Math.max(projectsTotal, 10), icon: '🚀' },
          { label: 'Services Offered', value: Math.max(servicesTotal, 5), icon: '⚙️' },
          { label: 'Happy Clients', value: Math.max(Math.floor(projectsTotal * 0.7), 8), icon: '👥' },
          { label: 'Orders Delivered', value: Math.max(projectsTotal + servicesTotal, 15), icon: '📦' }
        ]);
      } catch {
        setStats([
          { label: 'Projects Completed', value: 120, icon: '🚀' },
          { label: 'Services Offered', value: 25, icon: '⚙️' },
          { label: 'Happy Clients', value: 80, icon: '👥' },
          { label: 'Orders Delivered', value: 200, icon: '📦' }
        ]);
      }
    };
    fetchStats();
  }, []);

  return (
    <section className="py-5" style={{ background: 'var(--bp)' }}>
      <div className="container">
        <div className="row g-4">
          {stats.map((stat) => (
            <div key={stat.label} className="col-lg-3 col-md-6">
              <div className="text-center p-4 rounded-3" style={{ background: 'var(--bs)', border: '1px solid var(--bdr)' }}>
                <div className="fs-1 mb-2">{stat.icon}</div>
                <AnimatedCounter target={stat.value} />
                <p className="mt-2 mb-0 fw-medium" style={{ color: 'var(--ts)' }}>{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

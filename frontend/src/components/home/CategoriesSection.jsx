'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import publicService from '../../services/publicService';

const fallbackIcons = ['💻', '🎨', '📱', '🌐', '⚡', '🔧', '🚀', '📊', '🛡️', '🎮', '📈', '🤖'];

export default function CategoriesSection() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await publicService.getCategories();
        if (data.success) setCategories(data.data || []);
      } catch (err) {
        console.error('Failed to load categories', err);
        toast.error('Failed to load categories');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const categoryColors = ['#7c3aed', '#2563eb', '#06b6d4', '#d946ef', '#f59e0b', '#10b981', '#ef4444', '#f97316', '#ec4899', '#14b8a6', '#8b5cf6', '#0ea5e9'];

  if (loading) {
    return (
      <section className="py-5 text-center" style={{ background: 'var(--bp)' }}>
        <div className="spinner-border" style={{ color: 'var(--ap)' }} role="status" />
      </section>
    );
  }

  if (categories.length === 0) return null;

  return (
    <section className="py-5" style={{ background: 'var(--bp)' }}>
      <div className="container">
        <div className="text-center mb-4">
          <h2 className="fw-bold mb-1" style={{ color: 'var(--tp)' }}>Categories</h2>
          <p style={{ color: 'var(--ts)' }}>Browse by category</p>
        </div>
        <div className="d-flex flex-wrap justify-content-center gap-3">
          {categories.map((cat, i) => {
            const color = categoryColors[i % categoryColors.length];
            const icon = cat.icon || fallbackIcons[i % fallbackIcons.length];
            return (
              <Link
                key={cat._id || i}
                href={`/projects?category=${cat.slug || cat._id}`}
                className="btn fw-semibold px-4 py-2 rounded-pill d-inline-flex align-items-center gap-2"
                style={{
                  background: `${color}15`,
                  border: `1px solid ${color}50`,
                  color: color,
                  transition: 'all 0.3s',
                  fontSize: '0.95rem'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = `${color}30`;
                  e.currentTarget.style.borderColor = color;
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = `0 4px 15px ${color}30`;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = `${color}15`;
                  e.currentTarget.style.borderColor = `${color}50`;
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <span style={{ fontSize: '1.2rem' }}>{icon}</span>
                {cat.category_title}
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

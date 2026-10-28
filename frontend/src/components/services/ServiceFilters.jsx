'use client';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import publicService from '../../services/publicService';

export default function ServiceFilters({ onFilter }) {
  const [categories, setCategories] = useState([]);
  const [technologies, setTechnologies] = useState([]);
  const [filters, setFilters] = useState({
    category: '',
    technology: '',
    skill: '',
    search: '',
    sort: '-createdAt'
  });

  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const [catRes, techRes] = await Promise.all([
          publicService.getCategories(),
          publicService.getTechnologies()
        ]);
        if (catRes.data.success) setCategories(catRes.data.data || []);
        if (techRes.data.success) setTechnologies(techRes.data.data || []);
      } catch (err) {
        console.error('Failed to load filters', err);
        toast.error('Failed to load filters');
      }
    };
    fetchFilters();
  }, []);

  const handleChange = (key, value) => {
    const updated = { ...filters, [key]: value };
    setFilters(updated);
    if (onFilter) onFilter(updated);
  };

  const handleReset = () => {
    const reset = { category: '', technology: '', skill: '', search: '', sort: '-createdAt' };
    setFilters(reset);
    if (onFilter) onFilter(reset);
  };

  return (
    <div className="card border-0 rounded-3 mb-4" style={{ background: 'var(--bs)' }}>
      <div className="card-body">
        <div className="row g-3 align-items-end">
          <div className="col-lg-2 col-md-6">
            <label className="form-label fw-medium mb-1" style={{ color: 'var(--ts)', fontSize: '0.85rem' }}>Search</label>
            <input
              type="text"
              className="form-control"
              placeholder="Search services..."
              value={filters.search}
              onChange={e => handleChange('search', e.target.value)}
              style={{ background: 'var(--bt)', border: '1px solid var(--bdr)', color: '#fff' }}
            />
          </div>
          <div className="col-lg-2 col-md-6">
            <label className="form-label fw-medium mb-1" style={{ color: 'var(--ts)', fontSize: '0.85rem' }}>Category</label>
            <select
              className="form-select"
              value={filters.category}
              onChange={e => handleChange('category', e.target.value)}
              style={{ background: 'var(--bt)', border: '1px solid var(--bdr)', color: '#fff' }}
            >
              <option value="">All Categories</option>
              {categories.map(c => (
                <option key={c._id} value={c.slug || c._id}>{c.category_title || c.name || c.title || ''}</option>
              ))}
            </select>
          </div>
          <div className="col-lg-2 col-md-6">
            <label className="form-label fw-medium mb-1" style={{ color: 'var(--ts)', fontSize: '0.85rem' }}>Technology</label>
            <select
              className="form-select"
              value={filters.technology}
              onChange={e => handleChange('technology', e.target.value)}
              style={{ background: 'var(--bt)', border: '1px solid var(--bdr)', color: '#fff' }}
            >
              <option value="">All Technologies</option>
              {technologies.map(t => (
                <option key={t._id} value={t.slug || t._id}>{t.technology_title || t.name || t.title || ''}</option>
              ))}
            </select>
          </div>
          <div className="col-lg-2 col-md-6">
            <label className="form-label fw-medium mb-1" style={{ color: 'var(--ts)', fontSize: '0.85rem' }}>Skill Level</label>
            <select
              className="form-select"
              value={filters.skill}
              onChange={e => handleChange('skill', e.target.value)}
              style={{ background: 'var(--bt)', border: '1px solid var(--bdr)', color: '#fff' }}
            >
              <option value="">All Levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="expert">Expert</option>
            </select>
          </div>
          <div className="col-lg-2 col-md-6">
            <label className="form-label fw-medium mb-1" style={{ color: 'var(--ts)', fontSize: '0.85rem' }}>Sort By</label>
            <select
              className="form-select"
              value={filters.sort}
              onChange={e => handleChange('sort', e.target.value)}
              style={{ background: 'var(--bt)', border: '1px solid var(--bdr)', color: '#fff' }}
            >
              <option value="-createdAt">Newest</option>
              <option value="createdAt">Oldest</option>
              <option value="-rating">Highest Rated</option>
              <option value="rating">Lowest Rated</option>
              <option value="-price">Price: High to Low</option>
              <option value="price">Price: Low to High</option>
            </select>
          </div>
          <div className="col-lg-2 col-md-6">
            <button
              onClick={handleReset}
              className="btn w-100 fw-semibold"
              style={{ border: '1px solid #ef4444', color: '#ef4444', background: 'transparent' }}
            >
              Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

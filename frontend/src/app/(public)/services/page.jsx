'use client';

import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import publicService from '@/services/publicService';
import ServiceFilters from '@/components/services/ServiceFilters';
import ServiceCard from '@/components/services/ServiceCard';
import Pagination from '@/components/common/Pagination';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function ServicesPage() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [filters, setFilters] = useState({
    category: '', technology: '', skill: '', search: '', sort: '-createdAt'
  });

  const fetchServices = useCallback(async (p, f) => {
    setLoading(true);
    try {
      const params = { page: p, limit: 9, ...f };
      Object.keys(params).forEach(k => { if (!params[k]) delete params[k]; });
      const { data } = await publicService.getServices(params);
      if (data.success) {
        setServices(data.data?.services || data.data || []);
        setTotalPages(data.data?.totalPages || data.totalPages || 1);
        setTotalItems(data.data?.totalItems || data.totalItems || 0);
      }
    } catch (err) {
      console.error('Failed to fetch services', err);
      toast.error('Failed to load services');
    } finally {
      setLoading(false);
    }
  }, []);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchServices(page, filters); }, [page, filters, fetchServices]);

  const handleFilter = (newFilters) => {
    setFilters(newFilters);
    setPage(1);
  };

  return (
    <section style={{ background: 'var(--bs)', minHeight: '80vh' }}>
      <div className="container py-4">
        <div className="text-center mb-4">
          <h1 className="fw-bold" style={{ background: 'var(--gm)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            My Services
          </h1>
          <p className="mb-0" style={{ color: 'var(--ts)' }}>Professional services I offer</p>
        </div>
        <ServiceFilters onFilter={handleFilter} />
        {loading ? (
          <LoadingSpinner text="Loading services..." />
        ) : services.length === 0 ? (
          <div className="text-center py-5">
            <p style={{ color: 'var(--ts)', fontSize: '1.1rem' }}>No services found.</p>
          </div>
        ) : (
          <>
            <div className="row g-4">
              {services.map(s => (
                <div key={s._id} className="col-lg-4 col-md-6">
                  <ServiceCard service={s} />
                </div>
              ))}
            </div>
            <Pagination page={page} totalPages={totalPages} totalItems={totalItems} onPageChange={setPage} />
          </>
        )}
      </div>
    </section>
  );
}

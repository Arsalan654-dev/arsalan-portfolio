'use client';
import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import adminService from '@/services/adminService';
import DataTable from '@/components/common/DataTable';
import FormModal from '@/components/common/FormModal';
import ConfirmModal from '@/components/common/ConfirmModal';
import { formatDate } from '@/utils/helpers';

export default function CitiesPage() {
  const [data, setData] = useState([]);
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({});
  const [sortField, setSortField] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ open: false, item: null });
  const [bulkDeleteModal, setBulkDeleteModal] = useState({ open: false, items: [] });

  const fetchCountries = async () => {
    try {
      const res = await adminService.countries.getAll({ limit: 200 });
      const d = res.data?.data || res.data;
      setCountries(Array.isArray(d) ? d : d.countries || d.items || []);
    } catch {}
  };

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const params = { page, limit: 10, search, ...filters };
      if (sortField) { params.sortField = sortField; params.sortOrder = sortOrder; }
      const res = await adminService.cities.getAll(params);
      const pag = res.data?.pagination;
      const d = res.data?.data || res.data;
      setData(Array.isArray(d) ? d : d.cities || d.items || []);
      setTotalPages(pag?.pages || pag?.totalPages || 1);
      setTotalItems(pag?.total || pag?.totalItems || 0);
    } catch {
      toast.error('Failed to load cities');
    } finally { setLoading(false); }
  }, [page, search, filters, sortField, sortOrder]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchCountries(); }, []);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchData(); }, [fetchData]);

  const columns = [
    { key: 'city_name', header: 'Name', sortable: true },
    { key: 'country', header: 'Country', render: (r) => r.country?.country_name || '-' },
    { key: 'createdAt', header: 'Created', sortable: true, render: (r) => formatDate(r.createdAt) },
    { key: 'actions', header: 'Actions', sortable: false, render: (r) => (
      <div className="d-flex gap-2">
        <button onClick={(e) => { e.stopPropagation(); setEditItem(r); setModalOpen(true); }}
          className="btn btn-sm" style={{ color: 'var(--ap)', border: '1px solid var(--ap)', background: 'transparent' }}>
          <i className="fas fa-edit"></i></button>
        <button onClick={(e) => { e.stopPropagation(); setDeleteModal({ open: true, item: r }); }}
          className="btn btn-sm" style={{ color: '#ef4444', border: '1px solid #ef4444', background: 'transparent' }}>
          <i className="fas fa-trash-alt"></i></button>
      </div>
    )}
  ];

  const fields = [
    { name: 'city_name', label: 'City Name', required: true },
    { name: 'country', label: 'Country', type: 'select', required: true,
      options: countries.map(c => ({ label: c.country_name, value: c._id })) }
  ];

  const handleSubmit = async (formData) => {
    try {
      setModalLoading(true);
      if (editItem) { await adminService.cities.update(editItem._id, formData); toast.success('Updated'); }
      else { await adminService.cities.create(formData); toast.success('Created'); }
      setModalOpen(false); setEditItem(null); fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally { setModalLoading(false); }
  };

  const handleDelete = async () => {
    try {
      await adminService.cities.delete(deleteModal.item._id);
      toast.success('Deleted'); setDeleteModal({ open: false, item: null }); fetchData();
    } catch { toast.error('Delete failed'); }
  };

  const handleBulkDelete = async () => {
    try {
      await adminService.cities.deleteAll({ ids: bulkDeleteModal.items.map(i => i._id) });
      toast.success('Deleted'); setBulkDeleteModal({ open: false, items: [] }); fetchData();
    } catch { toast.error('Bulk delete failed'); }
  };

  const countryOptions = countries.map(c => ({ label: c.country_name, value: c._id }));

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold mb-0" style={{ color: 'var(--tp)' }}>Cities</h4>
        <button onClick={() => { setEditItem(null); setModalOpen(true); }} className="btn"
          style={{ background: 'var(--gm)', color: '#fff', border: 'none' }}>
          <i className="fas fa-plus me-2"></i>Add City
        </button>
      </div>
      <DataTable columns={columns} data={data} loading={loading} searchPlaceholder="Search cities..."
        onSearch={(v) => { setSearch(v); setPage(1); }}
        filterOptions={[{ label: 'Country', key: 'country', options: countryOptions }]}
        onFilter={(f) => setFilters(f)} onSort={(f, o) => { setSortField(f); setSortOrder(o); }}
        page={page} totalPages={totalPages} totalItems={totalItems} perPage={10} onPageChange={setPage}
        onBulkAction={(a, items) => setBulkDeleteModal({ open: true, items })} />
      <FormModal isOpen={modalOpen} onClose={() => { setModalOpen(false); setEditItem(null); }}
        onSubmit={handleSubmit} fields={fields} initialValues={editItem || {}}
        title={editItem ? 'Edit City' : 'Add City'} loading={modalLoading} />
      <ConfirmModal isOpen={deleteModal.open} onClose={() => setDeleteModal({ open: false, item: null })}
        onConfirm={handleDelete} title="Delete?" message={`Delete "${deleteModal.item?.city_name}"?`} />
      <ConfirmModal isOpen={bulkDeleteModal.open} onClose={() => setBulkDeleteModal({ open: false, items: [] })}
        onConfirm={handleBulkDelete} title="Delete Selected?" message={`Delete ${bulkDeleteModal.items.length} cities?`} />
    </div>
  );
}

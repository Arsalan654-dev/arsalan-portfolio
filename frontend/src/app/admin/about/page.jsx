'use client';
import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import adminService from '@/services/adminService';
import DataTable from '@/components/common/DataTable';
import FormModal from '@/components/common/FormModal';
import ConfirmModal from '@/components/common/ConfirmModal';
import { formatDate } from '@/utils/helpers';

export default function AboutPage() {
  const [data, setData] = useState([]);
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

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const params = { page, limit: 10, search, ...filters };
      if (sortField) { params.sortField = sortField; params.sortOrder = sortOrder; }
      const res = await adminService.about.getAll(params);
      const pag = res.data?.pagination;
      const d = res.data?.data || res.data;
      setData(Array.isArray(d) ? d : d.about || d.items || []);
      setTotalPages(pag?.pages || pag?.totalPages || 1);
      setTotalItems(pag?.total || pag?.totalItems || 0);
    } catch {
      toast.error('Failed to load about entries');
    } finally { setLoading(false); }
  }, [page, search, filters, sortField, sortOrder]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchData(); }, [fetchData]);

  const columns = [
    { key: 'title', header: 'Title', sortable: true },
    { key: 'description', header: 'Description', render: (r) => <span style={{ color: 'var(--ts)' }}>{r.description?.slice(0, 80) || '—'}</span> },
    { key: 'image', header: 'Image', render: (r) => r.image ? <img src={r.image} alt="" style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 8 }} /> : '—' },
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
    { name: 'title', label: 'Title', required: true },
    { name: 'description', label: 'Description', type: 'textarea', required: true },
    { name: 'image', label: 'Image URL', placeholder: 'https://example.com/image.jpg' }
  ];

  const handleSubmit = async (formData) => {
    try {
      setModalLoading(true);
      if (editItem) { await adminService.about.update(editItem._id, formData); toast.success('Updated'); }
      else { await adminService.about.create(formData); toast.success('Created'); }
      setModalOpen(false); setEditItem(null); fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally { setModalLoading(false); }
  };

  const handleDelete = async () => {
    try {
      await adminService.about.delete(deleteModal.item._id);
      toast.success('Deleted'); setDeleteModal({ open: false, item: null }); fetchData();
    } catch { toast.error('Delete failed'); }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold mb-0" style={{ color: 'var(--tp)' }}>About Us</h4>
        <button onClick={() => { setEditItem(null); setModalOpen(true); }} className="btn"
          style={{ background: 'var(--gm)', color: '#fff', border: 'none' }}>
          <i className="fas fa-plus me-2"></i>Add Entry
        </button>
      </div>
      <DataTable columns={columns} data={data} loading={loading} searchPlaceholder="Search..."
        onSearch={(v) => { setSearch(v); setPage(1); }} filterOptions={[]}
        onFilter={(f) => setFilters(f)} onSort={(f, o) => { setSortField(f); setSortOrder(o); }}
        page={page} totalPages={totalPages} totalItems={totalItems} perPage={10} onPageChange={setPage} />
      <FormModal isOpen={modalOpen} onClose={() => { setModalOpen(false); setEditItem(null); }}
        onSubmit={handleSubmit} fields={fields} initialValues={editItem || {}}
        title={editItem ? 'Edit Entry' : 'Add Entry'} loading={modalLoading} />
      <ConfirmModal isOpen={deleteModal.open} onClose={() => setDeleteModal({ open: false, item: null })}
        onConfirm={handleDelete} title="Delete?" message={`Delete "${deleteModal.item?.title}"?`} />
    </div>
  );
}

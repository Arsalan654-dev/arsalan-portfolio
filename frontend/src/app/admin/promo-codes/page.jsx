'use client';
import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import adminService from '@/services/adminService';
import DataTable from '@/components/common/DataTable';
import FormModal from '@/components/common/FormModal';
import ConfirmModal from '@/components/common/ConfirmModal';
import { formatDate } from '@/utils/helpers';

export default function PromoCodesPage() {
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
  const [bulkDeleteModal, setBulkDeleteModal] = useState({ open: false, items: [] });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const params = { page, limit: 10, search, ...filters };
      if (sortField) { params.sortField = sortField; params.sortOrder = sortOrder; }
      const res = await adminService.promoCode.getAll(params);
      const pag = res.data?.pagination;
      const d = res.data?.data || res.data;
      setData(Array.isArray(d) ? d : d.promoCodes || d.items || []);
      setTotalPages(pag?.pages || pag?.totalPages || 1);
      setTotalItems(pag?.total || pag?.totalItems || 0);
    } catch {
      toast.error('Failed to load promo codes');
    } finally { setLoading(false); }
  }, [page, search, filters, sortField, sortOrder]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchData(); }, [fetchData]);

  const columns = [
    { key: 'code', header: 'Code', sortable: true, render: (r) => (
      <span className="badge rounded-pill" style={{ background: 'var(--ap)20', color: 'var(--ap)', border: '1px solid var(--ap)', fontSize: '0.85rem' }}>
        {r.code}
      </span>
    )},
    { key: 'discountPercent', header: 'Discount %', sortable: true, render: (r) => <span style={{ color: '#10b981', fontWeight: 600 }}>{r.discountPercent}%</span> },
    { key: 'isActive', header: 'Active', render: (r) => (
      <span className={`badge rounded-pill fw-normal px-3 py-2`} style={{
        background: r.isActive ? '#10b98120' : '#ef444420',
        color: r.isActive ? '#10b981' : '#ef4444',
        border: `1px solid ${r.isActive ? '#10b981' : '#ef4444'}`
      }}>{r.isActive ? 'Active' : 'Inactive'}</span>
    )},
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
    { name: 'code', label: 'Promo Code', required: true, placeholder: 'e.g. SAVE20' },
    { name: 'discountPercent', label: 'Discount Percent', type: 'number', required: true, min: 0, max: 100 },
    { name: 'isActive', label: 'Active', type: 'select', options: [{ label: 'Yes', value: true }, { label: 'No', value: false }] }
  ];

  const handleSubmit = async (formData) => {
    try {
      setModalLoading(true);
      if (editItem) { await adminService.promoCode.update(editItem._id, formData); toast.success('Updated'); }
      else { await adminService.promoCode.create(formData); toast.success('Created'); }
      setModalOpen(false); setEditItem(null); fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally { setModalLoading(false); }
  };

  const handleDelete = async () => {
    try {
      await adminService.promoCode.delete(deleteModal.item._id);
      toast.success('Deleted'); setDeleteModal({ open: false, item: null }); fetchData();
    } catch { toast.error('Delete failed'); }
  };

  const handleBulkDelete = async () => {
    try {
      await adminService.promoCode.deleteAll({ ids: bulkDeleteModal.items.map(i => i._id) });
      toast.success('Deleted'); setBulkDeleteModal({ open: false, items: [] }); fetchData();
    } catch { toast.error('Bulk delete failed'); }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold mb-0" style={{ color: 'var(--tp)' }}>Promo Codes</h4>
        <button onClick={() => { setEditItem(null); setModalOpen(true); }} className="btn"
          style={{ background: 'var(--gm)', color: '#fff', border: 'none' }}>
          <i className="fas fa-plus me-2"></i>Add Promo Code
        </button>
      </div>
      <DataTable columns={columns} data={data} loading={loading} searchPlaceholder="Search promo codes..."
        onSearch={(v) => { setSearch(v); setPage(1); }} filterOptions={[]}
        onFilter={(f) => setFilters(f)} onSort={(f, o) => { setSortField(f); setSortOrder(o); }}
        page={page} totalPages={totalPages} totalItems={totalItems} perPage={10} onPageChange={setPage}
        onBulkAction={(a, items) => setBulkDeleteModal({ open: true, items })} />
      <FormModal isOpen={modalOpen} onClose={() => { setModalOpen(false); setEditItem(null); }}
        onSubmit={handleSubmit} fields={fields} initialValues={editItem || {}}
        title={editItem ? 'Edit Promo Code' : 'Add Promo Code'} loading={modalLoading} />
      <ConfirmModal isOpen={deleteModal.open} onClose={() => setDeleteModal({ open: false, item: null })}
        onConfirm={handleDelete} title="Delete?" message={`Delete promo code "${deleteModal.item?.code}"?`} />
      <ConfirmModal isOpen={bulkDeleteModal.open} onClose={() => setBulkDeleteModal({ open: false, items: [] })}
        onConfirm={handleBulkDelete} title="Delete Selected?" message={`Delete ${bulkDeleteModal.items.length} items?`} />
    </div>
  );
}

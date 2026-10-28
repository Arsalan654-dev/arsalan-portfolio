'use client';
import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import adminService from '@/services/adminService';
import DataTable from '@/components/common/DataTable';
import FormModal from '@/components/common/FormModal';
import ConfirmModal from '@/components/common/ConfirmModal';
import { formatDate } from '@/utils/helpers';

export default function CategoriesPage() {
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
      const res = await adminService.categories.getAll(params);
      const pag = res.data?.pagination;
      const d = res.data?.data || res.data;
      setData(Array.isArray(d) ? d : d.categories || d.items || []);
      setTotalPages(pag?.pages || pag?.totalPages || 1);
      setTotalItems(pag?.total || d.totalItems || 0);
    } catch (err) {
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  }, [page, search, filters, sortField, sortOrder]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchData(); }, [fetchData]);

  const columns = [
    { key: 'category_title', header: 'Title', sortable: true },
    { key: 'slug', header: 'Slug', render: (r) => <span style={{ color: 'var(--ts)', fontSize: '0.85rem' }}>{r.slug}</span> },
    { key: 'createdAt', header: 'Created', sortable: true, render: (r) => formatDate(r.createdAt) },
    {
      key: 'actions', header: 'Actions', sortable: false,
      render: (r) => (
        <div className="d-flex gap-2">
          <button onClick={(e) => { e.stopPropagation(); openEdit(r); }}
            className="btn btn-sm" style={{ color: 'var(--ap)', border: '1px solid var(--ap)', background: 'transparent' }}>
            <i className="fas fa-edit"></i>
          </button>
          <button onClick={(e) => { e.stopPropagation(); setDeleteModal({ open: true, item: r }); }}
            className="btn btn-sm" style={{ color: '#ef4444', border: '1px solid #ef4444', background: 'transparent' }}>
            <i className="fas fa-trash-alt"></i>
          </button>
        </div>
      )
    }
  ];

  const fields = [
    { name: 'category_title', label: 'Title', required: true }
  ];

  const openEdit = (item) => {
    setEditItem(item);
    setModalOpen(true);
  };

  const handleSubmit = async (formData) => {
    try {
      setModalLoading(true);
      if (editItem) {
        await adminService.categories.update(editItem._id, formData);
        toast.success('Category updated');
      } else {
        await adminService.categories.create(formData);
        toast.success('Category created');
      }
      setModalOpen(false);
      setEditItem(null);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.item) return;
    try {
      await adminService.categories.delete(deleteModal.item._id);
      toast.success('Category deleted');
      setDeleteModal({ open: false, item: null });
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  const handleBulkDelete = async () => {
    try {
      await adminService.categories.deleteAll({ ids: bulkDeleteModal.items.map(i => i._id) });
      toast.success('Categories deleted');
      setBulkDeleteModal({ open: false, items: [] });
      fetchData();
    } catch (err) {
      toast.error('Bulk delete failed');
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold mb-0" style={{ color: 'var(--tp)' }}>Categories</h4>
        <button onClick={() => { setEditItem(null); setModalOpen(true); }} className="btn"
          style={{ background: 'var(--gm)', color: '#fff', border: 'none' }}>
          <i className="fas fa-plus me-2"></i>Add Category
        </button>
      </div>

      <DataTable
        columns={columns}
        data={data}
        loading={loading}
        searchPlaceholder="Search by ID, title..."
        onSearch={(v) => { setSearch(v); setPage(1); }}
        filterOptions={[
          { label: 'Date', key: 'date', options: [
            { label: 'Today', value: 'today' },
            { label: 'This Week', value: 'week' },
            { label: 'This Month', value: 'month' }
          ]}
        ]}
        onFilter={(f) => setFilters(f)}
        onSort={(field, order) => { setSortField(field); setSortOrder(order); }}
        page={page}
        totalPages={totalPages}
        totalItems={totalItems}
        perPage={10}
        onPageChange={setPage}
        onBulkAction={(action, items) => {
          if (action === 'delete') setBulkDeleteModal({ open: true, items });
        }}
      />

      <FormModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditItem(null); }}
        onSubmit={handleSubmit}
        fields={fields}
        initialValues={editItem || {}}
        title={editItem ? 'Edit Category' : 'Add Category'}
        loading={modalLoading}
        submitText={editItem ? 'Update' : 'Create'}
      />

      <ConfirmModal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, item: null })}
        onConfirm={handleDelete}
        title="Delete Category?"
        message={`Are you sure you want to delete "${deleteModal.item?.category_title}"?`}
      />

      <ConfirmModal
        isOpen={bulkDeleteModal.open}
        onClose={() => setBulkDeleteModal({ open: false, items: [] })}
        onConfirm={handleBulkDelete}
        title="Delete Selected?"
        message={`Delete ${bulkDeleteModal.items.length} selected categories?`}
      />
    </div>
  );
}

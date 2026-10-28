'use client';
import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import adminService from '@/services/adminService';
import DataTable from '@/components/common/DataTable';
import FormModal from '@/components/common/FormModal';
import ConfirmModal from '@/components/common/ConfirmModal';
import { formatDate } from '@/utils/helpers';
import { getCdnIconByTitle } from '@/utils/cdnIcons';

export default function SkillsPage() {
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
      const res = await adminService.skills.getAll(params);
      const pag = res.data?.pagination;
      const d = res.data?.data || res.data;
      setData(Array.isArray(d) ? d : d.skills || d.items || []);
      setTotalPages(pag?.pages || pag?.totalPages || 1);
      setTotalItems(pag?.total || pag?.totalItems || 0);
    } catch {
      toast.error('Failed to load skills');
    } finally { setLoading(false); }
  }, [page, search, filters, sortField, sortOrder]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const getIconDisplay = (title) => {
    const cdnUrl = getCdnIconByTitle(title);
    if (cdnUrl) {
      return <img src={cdnUrl} alt="" style={{ width: 28, height: 28, objectFit: 'contain', borderRadius: '6px', padding: '2px', background: 'var(--gc)' }} />;
    }
    const letter = (title || '?')[0].toUpperCase();
    return (
      <div style={{
        width: 28, height: 28, borderRadius: '8px',
        background: 'var(--gm)', color: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '0.7rem', fontWeight: 700
      }}>
        {letter}
      </div>
    );
  };

  const columns = [
    {
      key: 'skill_title', header: 'Title', sortable: true,
      render: (r) => (
        <div className="d-flex align-items-center gap-2">
          {getIconDisplay(r.skill_title)}
          <span className="fw-medium">{r.skill_title}</span>
        </div>
      )
    },
    { key: 'skill_option', header: 'Level', sortable: true, render: (r) => {
      const level = r.skill_option || 'intermediate';
      const colors = { expert: '#8b5cf6', intermediate: '#2563eb', beginner: '#06b6d4' };
      return <span className="badge rounded-pill px-2 py-1" style={{ background: `${colors[level]}20`, color: colors[level], fontSize: '0.75rem' }}>{level.charAt(0).toUpperCase() + level.slice(1)}</span>;
    }},
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
    { name: 'skill_title', label: 'Title', required: true },
    { name: 'skill_option', label: 'Skill Level', type: 'select', required: true,
      options: [
        { label: 'Expert', value: 'expert' },
        { label: 'Intermediate', value: 'intermediate' },
        { label: 'Beginner', value: 'beginner' }
      ]
    }
  ];

  const handleSubmit = async (formData) => {
    try {
      setModalLoading(true);
      if (editItem) { await adminService.skills.update(editItem._id, formData); toast.success('Updated'); }
      else { await adminService.skills.create(formData); toast.success('Created'); }
      setModalOpen(false); setEditItem(null); fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally { setModalLoading(false); }
  };

  const handleDelete = async () => {
    try {
      await adminService.skills.delete(deleteModal.item._id);
      toast.success('Deleted'); setDeleteModal({ open: false, item: null }); fetchData();
    } catch { toast.error('Delete failed'); }
  };

  const handleBulkDelete = async () => {
    try {
      await adminService.skills.deleteAll({ ids: bulkDeleteModal.items.map(i => i._id) });
      toast.success('Deleted'); setBulkDeleteModal({ open: false, items: [] }); fetchData();
    } catch { toast.error('Bulk delete failed'); }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold mb-0" style={{ color: 'var(--tp)' }}>Skills</h4>
        <button onClick={() => { setEditItem(null); setModalOpen(true); }} className="btn"
          style={{ background: 'var(--gm)', color: '#fff', border: 'none' }}>
          <i className="fas fa-plus me-2"></i>Add Skill
        </button>
      </div>
      <DataTable columns={columns} data={data} loading={loading} searchPlaceholder="Search skills..."
        onSearch={(v) => { setSearch(v); setPage(1); }}
        filterOptions={[{ label: 'Skill Level', key: 'skill_option', options: [
          { label: 'Expert', value: 'expert' },
          { label: 'Intermediate', value: 'intermediate' },
          { label: 'Beginner', value: 'beginner' }
        ]}]}
        onFilter={(f) => setFilters(f)} onSort={(f, o) => { setSortField(f); setSortOrder(o); }}
        page={page} totalPages={totalPages} totalItems={totalItems} perPage={10} onPageChange={setPage}
        onBulkAction={(a, items) => setBulkDeleteModal({ open: true, items })} />
      <FormModal isOpen={modalOpen} onClose={() => { setModalOpen(false); setEditItem(null); }}
        onSubmit={handleSubmit} fields={fields} initialValues={editItem || {}}
        title={editItem ? 'Edit Skill' : 'Add Skill'} loading={modalLoading} />
      <ConfirmModal isOpen={deleteModal.open} onClose={() => setDeleteModal({ open: false, item: null })}
        onConfirm={handleDelete} title="Delete?" message={`Delete "${deleteModal.item?.skill_title}"?`} />
      <ConfirmModal isOpen={bulkDeleteModal.open} onClose={() => setBulkDeleteModal({ open: false, items: [] })}
        onConfirm={handleBulkDelete} title="Delete Selected?" message={`Delete ${bulkDeleteModal.items.length} items?`} />
    </div>
  );
}

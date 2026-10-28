'use client';
import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import adminService from '@/services/adminService';
import DataTable from '@/components/common/DataTable';
import FormModal from '@/components/common/FormModal';
import ConfirmModal from '@/components/common/ConfirmModal';
import { formatDate } from '@/utils/helpers';
import { getCdnIconByTitle } from '@/utils/cdnIcons';

export default function TechnologiesPage() {
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
  const [bulkIconModal, setBulkIconModal] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const params = { page, limit: 10, search, ...filters };
      if (sortField) { params.sortField = sortField; params.sortOrder = sortOrder; }
      const res = await adminService.technologies.getAll(params);
      const pag = res.data?.pagination;
      const d = res.data?.data || res.data;
      setData(Array.isArray(d) ? d : d.technologies || d.items || []);
      setTotalPages(pag?.pages || pag?.totalPages || 1);
      setTotalItems(pag?.total || pag?.totalItems || 0);
    } catch {
      toast.error('Failed to load technologies');
    } finally {
      setLoading(false);
    }
  }, [page, search, filters, sortField, sortOrder]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const getIconDisplay = (icon, title) => {
    const url = icon || getCdnIconByTitle(title);
    if (url && (url.startsWith('http') || url.startsWith('/'))) {
      return (
        <img
          src={url}
          alt={title}
          onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
          style={{ width: 36, height: 36, objectFit: 'contain', borderRadius: '8px', padding: '4px', background: 'var(--gc)' }}
        />
      );
    }
    const letter = (title || '?')[0].toUpperCase();
    return (
      <div style={{
        width: 36, height: 36, borderRadius: '10px',
        background: 'var(--gm)', color: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '0.8rem', fontWeight: 700
      }}>
        {letter}
      </div>
    );
  };

  const columns = [
    {
      key: 'technology_title', header: 'Technology', sortable: true,
      render: (r) => (
        <div className="d-flex align-items-center gap-2">
          <div style={{ position: 'relative' }}>
            {getIconDisplay(r.icon, r.technology_title)}
            <div style={{
              display: 'none', width: 36, height: 36, borderRadius: '10px',
              background: 'var(--gm)', color: '#fff',
              alignItems: 'center', justifyContent: 'center',
              fontSize: '0.8rem', fontWeight: 700
            }}>
              {(r.technology_title || '?')[0].toUpperCase()}
            </div>
          </div>
          <span className="fw-medium">{r.technology_title}</span>
        </div>
      )
    },
    {
      key: 'icon', header: 'Icon URL', sortable: false,
      render: (r) => {
        const url = r.icon || getCdnIconByTitle(r.technology_title);
        if (!url) return <span style={{ color: 'var(--ts)', fontSize: '0.8rem' }}>No icon</span>;
        return (
          <span style={{ color: 'var(--ts)', fontSize: '0.75rem', wordBreak: 'break-all', maxWidth: '200px', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {url}
          </span>
        );
      }
    },
    {
      key: 'skill_option', header: 'Level', sortable: true,
      render: (r) => {
        const level = r.skill_option || 'intermediate';
        const colors = { expert: '#8b5cf6', intermediate: '#2563eb', beginner: '#06b6d4' };
        return (
          <span className="badge rounded-pill px-2 py-1" style={{ background: `${colors[level]}20`, color: colors[level], fontSize: '0.75rem' }}>
            {level.charAt(0).toUpperCase() + level.slice(1)}
          </span>
        );
      }
    },
    { key: 'createdAt', header: 'Created', sortable: true, render: (r) => formatDate(r.createdAt) },
    {
      key: 'actions', header: 'Actions', sortable: false,
      render: (r) => (
        <div className="d-flex gap-2">
          <button onClick={(e) => { e.stopPropagation(); setEditItem(r); setModalOpen(true); }}
            className="btn btn-sm" style={{ color: 'var(--ap)', border: '1px solid var(--ap)', background: 'transparent' }}>
            <i className="fas fa-edit"></i></button>
          <button onClick={(e) => { e.stopPropagation(); setDeleteModal({ open: true, item: r }); }}
            className="btn btn-sm" style={{ color: '#ef4444', border: '1px solid #ef4444', background: 'transparent' }}>
            <i className="fas fa-trash-alt"></i></button>
        </div>
      )
    }
  ];

  const fields = [
    { name: 'technology_title', label: 'Name', required: true },
    { name: 'icon', label: 'Icon CDN URL (auto-filled if empty)', placeholder: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/...' },
    {
      name: 'skill_option', label: 'Skill Level', type: 'select',
      options: [
        { value: 'expert', label: 'Expert' },
        { value: 'intermediate', label: 'Intermediate' },
        { value: 'beginner', label: 'Beginner' }
      ],
      placeholder: 'Select level'
    }
  ];

  const handleSubmit = async (formData) => {
    try {
      setModalLoading(true);
      if (!formData.icon || formData.icon.trim() === '') {
        const cdnUrl = getCdnIconByTitle(formData.technology_title);
        if (cdnUrl) formData.icon = cdnUrl;
      }
      if (editItem) { await adminService.technologies.update(editItem._id, formData); toast.success('Updated'); }
      else { await adminService.technologies.create(formData); toast.success('Created'); }
      setModalOpen(false); setEditItem(null); fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally { setModalLoading(false); }
  };

  const handleBulkIconAssign = async () => {
    try {
      let updated = 0;
      for (const item of data) {
        if (!item.icon) {
          const cdnUrl = getCdnIconByTitle(item.technology_title);
          if (cdnUrl) {
            await adminService.technologies.update(item._id, { icon: cdnUrl });
            updated++;
          }
        }
      }
      toast.success(`Icons assigned to ${updated} technologies`);
      setBulkIconModal(false);
      fetchData();
    } catch {
      toast.error('Failed to assign icons');
    }
  };

  const handleDelete = async () => {
    try {
      await adminService.technologies.delete(deleteModal.item._id);
      toast.success('Deleted'); setDeleteModal({ open: false, item: null }); fetchData();
    } catch { toast.error('Delete failed'); }
  };

  const handleBulkDelete = async () => {
    try {
      await adminService.technologies.deleteAll({ ids: bulkDeleteModal.items.map(i => i._id) });
      toast.success('Deleted'); setBulkDeleteModal({ open: false, items: [] }); fetchData();
    } catch { toast.error('Bulk delete failed'); }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold mb-0" style={{ color: 'var(--tp)' }}>Technologies</h4>
        <div className="d-flex gap-2">
          <button onClick={() => setBulkIconModal(true)} className="btn fw-semibold"
            style={{ border: '1px solid var(--ap)', color: 'var(--ap)', background: 'transparent', fontSize: '0.85rem' }}>
            <i className="fas fa-magic me-1"></i>Auto Assign Icons
          </button>
          <button onClick={() => { setEditItem(null); setModalOpen(true); }} className="btn"
            style={{ background: 'var(--gm)', color: '#fff', border: 'none' }}>
            <i className="fas fa-plus me-2"></i>Add Technology
          </button>
        </div>
      </div>
      <DataTable columns={columns} data={data} loading={loading} searchPlaceholder="Search technologies..."
        onSearch={(v) => { setSearch(v); setPage(1); }} filterOptions={[]}
        onFilter={(f) => setFilters(f)} onSort={(f, o) => { setSortField(f); setSortOrder(o); }}
        page={page} totalPages={totalPages} totalItems={totalItems} perPage={10} onPageChange={setPage}
        onBulkAction={(a, items) => setBulkDeleteModal({ open: true, items })} />
      <FormModal isOpen={modalOpen} onClose={() => { setModalOpen(false); setEditItem(null); }}
        onSubmit={handleSubmit} fields={fields} initialValues={editItem || {}}
        title={editItem ? 'Edit Technology' : 'Add Technology'} loading={modalLoading} />
      <ConfirmModal isOpen={deleteModal.open} onClose={() => setDeleteModal({ open: false, item: null })}
        onConfirm={handleDelete} title="Delete?" message={`Delete "${deleteModal.item?.technology_title}"?`} />
      <ConfirmModal isOpen={bulkDeleteModal.open} onClose={() => setBulkDeleteModal({ open: false, items: [] })}
        onConfirm={handleBulkDelete} title="Delete Selected?" message={`Delete ${bulkDeleteModal.items.length} items?`} />
      {bulkIconModal && (
        <div className="admin-modal-overlay" onClick={() => setBulkIconModal(false)}>
          <div className="admin-modal" style={{ maxWidth: '420px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-head">
              <h3>Auto Assign CDN Icons</h3>
              <button className="modal-close" onClick={() => setBulkIconModal(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <p style={{ color: 'var(--ts)', fontSize: '0.9rem' }}>
                This will auto-assign Devicon CDN icons to all technologies that don&apos;t have an icon set yet.
                Icons are matched by technology name.
              </p>
              <div className="mt-3">
                <strong style={{ color: 'var(--tp)' }}>Technologies without icons:</strong>
                <ul className="mt-2" style={{ maxHeight: '200px', overflow: 'auto' }}>
                  {data.filter(t => !t.icon).map(t => (
                    <li key={t._id} className="d-flex align-items-center gap-2 py-1" style={{ color: 'var(--ts)', fontSize: '0.85rem' }}>
                      <i className="fas fa-arrow-right" style={{ color: 'var(--ap)', fontSize: '0.7rem' }}></i>
                      {t.technology_title}
                      {getCdnIconByTitle(t.technology_title) && (
                        <img src={getCdnIconByTitle(t.technology_title)} alt="" style={{ width: 20, height: 20, objectFit: 'contain' }} />
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="modal-foot">
              <button className="btn" onClick={() => setBulkIconModal(false)} style={{ background: 'var(--bs)', color: 'var(--tp)', border: '1px solid var(--bdr)' }}>Cancel</button>
              <button className="btn" onClick={handleBulkIconAssign} style={{ background: 'var(--ap)', color: '#fff', border: 'none' }}>
                <i className="fas fa-magic me-1"></i>Assign Icons
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

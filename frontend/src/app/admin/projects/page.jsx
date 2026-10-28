'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import adminService from '@/services/adminService';
import DataTable from '@/components/common/DataTable';
import ConfirmModal from '@/components/common/ConfirmModal';
import { formatDate, formatCurrency } from '@/utils/helpers';

export default function ProjectsPage() {
  const router = useRouter();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({});
  const [sortField, setSortField] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');
  const [deleteModal, setDeleteModal] = useState({ open: false, item: null });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const params = { page, limit: 10, search, ...filters };
      if (sortField) { params.sortField = sortField; params.sortOrder = sortOrder; }
      const res = await adminService.projects.getAll(params);
      const pag = res.data?.pagination;
      const d = res.data?.data || res.data;
      setData(Array.isArray(d) ? d : d.projects || d.items || []);
      setTotalPages(pag?.pages || pag?.totalPages || 1);
      setTotalItems(pag?.total || pag?.totalItems || 0);
    } catch {
      toast.error('Failed to load projects');
    } finally { setLoading(false); }
  }, [page, search, filters, sortField, sortOrder]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchData(); }, [fetchData]);

  const handleDelete = async () => {
    try {
      await adminService.projects.delete(deleteModal.item._id);
      toast.success('Deleted'); setDeleteModal({ open: false, item: null }); fetchData();
    } catch { toast.error('Delete failed'); }
  };

  const columns = [
    { key: 'title', header: 'Title', sortable: true, render: (r) => (
      <div className="d-flex align-items-center gap-2">
        {r.images?.[0] && <img src={r.images[0]} alt="" style={{ width: 36, height: 36, objectFit: 'cover', borderRadius: 6 }} />}
        <span style={{ color: 'var(--tp)' }}>{r.title}</span>
      </div>
    )},
    { key: 'category', header: 'Category', render: (r) => r.category?.category_title || '-' },
    { key: 'price', header: 'Price', sortable: true, render: (r) => formatCurrency(r.price || 0) },
    { key: 'createdAt', header: 'Created', sortable: true, render: (r) => formatDate(r.createdAt) },
    { key: 'actions', header: 'Actions', sortable: false, render: (r) => (
      <div className="d-flex gap-2">
        <Link href={`/admin/projects/${r._id}`} className="btn btn-sm"
          style={{ color: 'var(--ab)', border: '1px solid var(--ab)', background: 'transparent' }}>
          <i className="fas fa-eye"></i></Link>
        <Link href={`/admin/projects/edit/${r._id}`} className="btn btn-sm"
          style={{ color: 'var(--ap)', border: '1px solid var(--ap)', background: 'transparent' }}>
          <i className="fas fa-edit"></i></Link>
        <button onClick={(e) => { e.stopPropagation(); setDeleteModal({ open: true, item: r }); }}
          className="btn btn-sm" style={{ color: '#ef4444', border: '1px solid #ef4444', background: 'transparent' }}>
          <i className="fas fa-trash-alt"></i></button>
      </div>
    )}
  ];

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold mb-0" style={{ color: 'var(--tp)' }}>Projects</h4>
        <Link href="/admin/projects/create" className="btn"
          style={{ background: 'var(--gm)', color: '#fff', border: 'none' }}>
          <i className="fas fa-plus me-2"></i>Create Project
        </Link>
      </div>
      <DataTable columns={columns} data={data} loading={loading} searchPlaceholder="Search projects..."
        onSearch={(v) => { setSearch(v); setPage(1); }} filterOptions={[]}
        onFilter={(f) => setFilters(f)} onSort={(f, o) => { setSortField(f); setSortOrder(o); }}
        page={page} totalPages={totalPages} totalItems={totalItems} perPage={10} onPageChange={setPage}
        onRowClick={(r) => router.push(`/admin/projects/${r._id}`)} />
      <ConfirmModal isOpen={deleteModal.open} onClose={() => setDeleteModal({ open: false, item: null })}
        onConfirm={handleDelete} title="Delete Project?" message={`Delete "${deleteModal.item?.title}"?`} />
    </div>
  );
}

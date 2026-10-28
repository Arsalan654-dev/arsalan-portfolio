'use client';
import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import adminService from '@/services/adminService';
import DataTable from '@/components/common/DataTable';
import FormModal from '@/components/common/FormModal';
import { formatDate } from '@/utils/helpers';

export default function UsersPage() {
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
  const [modalLoading, setModalLoading] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const params = { page, limit: 10, search, ...filters };
      if (sortField) { params.sortField = sortField; params.sortOrder = sortOrder; }
      const res = await adminService.users.getAll(params);
      const pag = res.data?.pagination;
      const d = res.data?.data || res.data;
      setData(Array.isArray(d) ? d : d.users || d.items || []);
      setTotalPages(pag?.pages || pag?.totalPages || 1);
      setTotalItems(pag?.total || pag?.totalItems || 0);
    } catch {
      toast.error('Failed to load users');
    } finally { setLoading(false); }
  }, [page, search, filters, sortField, sortOrder]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchData(); }, [fetchData]);

  const handleToggleActive = async (user) => {
    try {
      if (user.isActive) {
        await adminService.users.disable(user._id);
        toast.success('User disabled');
      } else {
        await adminService.users.enable(user._id);
        toast.success('User enabled');
      }
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to toggle');
    }
  };

  const handleCreate = async (formData) => {
    try {
      setModalLoading(true);
      await adminService.users.create(formData);
      toast.success('User created. Verification email sent.');
      setModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create user');
    } finally { setModalLoading(false); }
  };

  const columns = [
    { key: 'name', header: 'Name', sortable: true, render: (r) => (
      <div className="d-flex align-items-center gap-2">
        <div className="d-flex align-items-center justify-content-center rounded-circle"
          style={{ width: 32, height: 32, background: 'var(--gm)', color: '#fff', fontSize: '0.8rem', fontWeight: 600 }}>
          {r.name?.charAt(0)?.toUpperCase() || '?'}
        </div>
        <span style={{ color: 'var(--tp)' }}>{r.name}</span>
      </div>
    )},
    { key: 'email', header: 'Email', sortable: true },
    { key: 'mobile', header: 'Mobile', render: (r) => r.mobile || '—' },
    { key: 'isActive', header: 'Status', render: (r) => (
      <span className={`badge rounded-pill fw-normal px-3 py-2`} style={{
        background: r.isActive ? '#10b98120' : '#ef444420',
        color: r.isActive ? '#10b981' : '#ef4444',
        border: `1px solid ${r.isActive ? '#10b981' : '#ef4444'}`
      }}>
        {r.isActive ? 'Active' : 'Inactive'}
      </span>
    )},
    { key: 'createdAt', header: 'Joined', sortable: true, render: (r) => formatDate(r.createdAt) },
    { key: 'actions', header: 'Actions', sortable: false, render: (r) => (
      <button onClick={(e) => { e.stopPropagation(); handleToggleActive(r); }}
        className="btn btn-sm" style={{
          color: r.isActive ? '#ef4444' : '#10b981',
          border: `1px solid ${r.isActive ? '#ef4444' : '#10b981'}`,
          background: 'transparent'
        }}>
        <i className={`fas ${r.isActive ? 'fa-ban' : 'fa-check'} me-1`}></i>
        {r.isActive ? 'Disable' : 'Enable'}
      </button>
    )}
  ];

  const fields = [
    { name: 'name', label: 'Name', required: true },
    { name: 'email', label: 'Email', type: 'email', required: true },
    { name: 'password', label: 'Password', type: 'password', required: true },
    { name: 'mobile', label: 'Mobile' }
  ];

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold mb-0" style={{ color: 'var(--tp)' }}>Users</h4>
        <button onClick={() => setModalOpen(true)} className="btn"
          style={{ background: 'var(--gm)', color: '#fff', border: 'none' }}>
          <i className="fas fa-plus me-2"></i>Create User
        </button>
      </div>
      <DataTable columns={columns} data={data} loading={loading} searchPlaceholder="Search by name or email..."
        onSearch={(v) => { setSearch(v); setPage(1); }}
        filterOptions={[
          { label: 'Status', key: 'isActive', options: [
            { label: 'Active', value: 'true' },
            { label: 'Inactive', value: 'false' }
          ]}
        ]}
        onFilter={(f) => setFilters(f)} onSort={(f, o) => { setSortField(f); setSortOrder(o); }}
        page={page} totalPages={totalPages} totalItems={totalItems} perPage={10} onPageChange={setPage} />
      <FormModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onSubmit={handleCreate}
        fields={fields} title="Create User" loading={modalLoading} submitText="Create & Send Verification" />
    </div>
  );
}

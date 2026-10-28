'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import adminService from '@/services/adminService';
import DataTable from '@/components/common/DataTable';
import Modal from '@/components/common/Modal';
import ConfirmModal from '@/components/common/ConfirmModal';
import { formatDate, formatCurrency } from '@/utils/helpers';
import { ORDER_STATUS } from '@/utils/constants';

export default function OrdersPage() {
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
  const [emailModal, setEmailModal] = useState({ open: false, order: null });
  const [emailBody, setEmailBody] = useState('');
  const [emailFile, setEmailFile] = useState(null);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ open: false, item: null });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const params = { page, limit: 10, search, ...filters };
      if (sortField) { params.sortField = sortField; params.sortOrder = sortOrder; }
      const res = await adminService.orders.getAll(params);
      const pag = res.data?.pagination;
      const d = res.data?.data || res.data;
      setData(Array.isArray(d) ? d : d.orders || d.items || []);
      setTotalPages(pag?.pages || pag?.totalPages || 1);
      setTotalItems(pag?.total || pag?.totalItems || 0);
    } catch {
      toast.error('Failed to load orders');
    } finally { setLoading(false); }
  }, [page, search, filters, sortField, sortOrder]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchData(); }, [fetchData]);

  const openEmailModal = (order) => {
    setEmailBody(`Dear ${order.user?.name || 'Customer'},\n\nYour order #${order.orderNumber || order._id?.slice(-8).toUpperCase()} is being processed.\n\nBest regards,\nArsalan Portfolio`);
    setEmailFile(null);
    setEmailModal({ open: true, order });
  };

  const handleSendEmail = async () => {
    if (!emailBody.trim()) { toast.error('Email body is required'); return; }
    try {
      setSendingEmail(true);
      const fd = new FormData();
      fd.append('body', emailBody);
      if (emailFile) fd.append('attachment', emailFile);
      await adminService.orders.sendEmail(emailModal.order._id, fd);
      toast.success('Email sent successfully');
      setEmailModal({ open: false, order: null });
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send email');
    } finally { setSendingEmail(false); }
  };

  const handleDelete = async () => {
    try {
      await adminService.orders.delete(deleteModal.item._id);
      toast.success('Order deleted');
      setDeleteModal({ open: false, item: null });
      fetchData();
    } catch { toast.error('Delete failed'); }
  };

  const columns = [
    { key: 'orderNumber', header: 'Order #', render: (r) => (
      <span style={{ color: 'var(--tp)', fontWeight: 600 }}>
        {r.orderNumber || r._id?.slice(-8).toUpperCase()}
      </span>
    )},
    { key: 'user', header: 'Customer', render: (r) => r.user?.name || r.user?.email || '—' },
    { key: 'totalAmount', header: 'Total', render: (r) => formatCurrency(r.totalAmount || r.total || 0) },
    { key: 'orderStatus', header: 'Status', render: (r) => (
      <span className={`badge rounded-pill fw-normal px-3 py-2`} style={{
        background: (r.orderStatus === 'sent' ? '#10b981' : '#f59e0b') + '20',
        color: r.orderStatus === 'sent' ? '#10b981' : '#f59e0b',
        border: `1px solid ${r.orderStatus === 'sent' ? '#10b981' : '#f59e0b'}`
      }}>{r.orderStatus || 'pending'}</span>
    )},
    { key: 'paymentStatus', header: 'Payment', render: (r) => (
      <span className={`badge rounded-pill fw-normal px-3 py-2`} style={{
        background: (r.paymentStatus === 'paid' ? '#10b981' : '#ef4444') + '20',
        color: r.paymentStatus === 'paid' ? '#10b981' : '#ef4444',
        border: `1px solid ${r.paymentStatus === 'paid' ? '#10b981' : '#ef4444'}`
      }}>{r.paymentStatus || 'pending'}</span>
    )},
    { key: 'createdAt', header: 'Date', sortable: true, render: (r) => formatDate(r.createdAt) },
    { key: 'actions', header: 'Actions', sortable: false, render: (r) => (
      <div className="d-flex gap-2">
        <button onClick={(e) => { e.stopPropagation(); router.push(`/admin/orders/${r._id}`); }}
          className="btn btn-sm" style={{ color: 'var(--ab)', border: '1px solid var(--ab)', background: 'transparent' }}>
          <i className="fas fa-eye"></i></button>
        <button onClick={(e) => { e.stopPropagation(); openEmailModal(r); }}
          className="btn btn-sm" style={{ color: 'var(--ap)', border: '1px solid var(--ap)', background: 'transparent' }}>
          <i className="fas fa-envelope"></i></button>
        {r.orderStatus === 'sent' && (
          <button onClick={(e) => { e.stopPropagation(); setDeleteModal({ open: true, item: r }); }}
            className="btn btn-sm" style={{ color: '#ef4444', border: '1px solid #ef4444', background: 'transparent' }}>
            <i className="fas fa-trash-alt"></i></button>
        )}
      </div>
    )}
  ];

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold mb-0" style={{ color: 'var(--tp)' }}>Orders</h4>
      </div>
      <DataTable columns={columns} data={data} loading={loading} searchPlaceholder="Search by order # or customer..."
        onSearch={(v) => { setSearch(v); setPage(1); }}
        filterOptions={[
          { label: 'Status', key: 'orderStatus', options: ORDER_STATUS.map(s => ({ label: s.charAt(0).toUpperCase() + s.slice(1), value: s })) }
        ]}
        onFilter={(f) => setFilters(f)} onSort={(f, o) => { setSortField(f); setSortOrder(o); }}
        page={page} totalPages={totalPages} totalItems={totalItems} perPage={10} onPageChange={setPage}
        onRowClick={(r) => router.push(`/admin/orders/${r._id}`)} />

      <Modal isOpen={emailModal.open} onClose={() => setEmailModal({ open: false, order: null })}
        title={`Send Email - ${emailModal.order?.orderNumber || ''}`} size="lg"
        footer={
          <div className="d-flex gap-2">
            <button onClick={() => setEmailModal({ open: false, order: null })}
              className="btn" style={{ background: 'var(--bs)', color: 'var(--tp)', border: '1px solid var(--bdr)' }}>Cancel</button>
            <button onClick={handleSendEmail} disabled={sendingEmail} className="btn"
              style={{ background: 'var(--ap)', color: '#fff', border: 'none' }}>
              {sendingEmail ? <><span className="spinner-border spinner-border-sm me-2" />Sending...</> : 'Send Email'}
            </button>
          </div>
        }>
        <div className="mb-3">
          <label className="form-label" style={{ color: 'var(--tp)' }}>Email Body</label>
          <textarea className="form-control" rows={8} value={emailBody}
            onChange={(e) => setEmailBody(e.target.value)}
            style={{ background: 'var(--bs)', color: 'var(--tp)', borderColor: 'var(--bdr)', borderRadius: '8px' }} />
        </div>
        <div>
          <label className="form-label" style={{ color: 'var(--tp)' }}>Attachment (Optional)</label>
          <input type="file" className="form-control" onChange={(e) => setEmailFile(e.target.files?.[0])}
            style={{ background: 'var(--bs)', color: 'var(--tp)', borderColor: 'var(--bdr)', borderRadius: '8px' }} />
        </div>
      </Modal>

      <ConfirmModal isOpen={deleteModal.open} onClose={() => setDeleteModal({ open: false, item: null })}
        onConfirm={handleDelete} title="Delete Order?" message="Only sent orders can be deleted." />
    </div>
  );
}

'use client';
import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import adminService from '@/services/adminService';
import DataTable from '@/components/common/DataTable';
import Modal from '@/components/common/Modal';
import ConfirmModal from '@/components/common/ConfirmModal';
import { formatDate } from '@/utils/helpers';

export default function ContactQueriesPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [viewModal, setViewModal] = useState({ open: false, item: null });
  const [replyModal, setReplyModal] = useState({ open: false, item: null });
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ open: false, item: null });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const params = { page, limit: 10, search, sort: sortOrder === 'desc' ? `-${sortField}` : sortField };
      const res = await adminService.contactQueries.getAll(params);
      const pag = res.data?.pagination;
      const d = res.data?.data || res.data;
      setData(Array.isArray(d) ? d : d.queries || d.items || []);
      setTotalPages(pag?.pages || pag?.totalPages || 1);
      setTotalItems(pag?.total || pag?.totalItems || 0);
    } catch {
      toast.error('Failed to load queries');
    } finally { setLoading(false); }
  }, [page, search, sortField, sortOrder]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSort = (field, order) => {
    setSortField(field);
    setSortOrder(order);
    setPage(1);
  };

  const handleReply = async () => {
    if (!replyText.trim()) { toast.error('Reply body is required'); return; }
    try {
      setSendingReply(true);
      await adminService.contactQueries.reply(replyModal.item._id, { body: replyText });
      toast.success('Reply sent');
      setReplyModal({ open: false, item: null });
      setReplyText('');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send reply');
    } finally { setSendingReply(false); }
  };

  const handleDelete = async () => {
    try {
      await adminService.contactQueries.delete(deleteModal.item._id);
      toast.success('Deleted');
      setDeleteModal({ open: false, item: null });
      fetchData();
    } catch { toast.error('Delete failed'); }
  };

  const columns = [
    { key: 'name', header: 'Name', accessor: 'name', sortable: true },
    { key: 'email', header: 'Email', accessor: 'email' },
    { key: 'subject', header: 'Subject', render: (r) => <span style={{ color: 'var(--ts)' }}>{r.subject?.slice(0, 40) || '—'}</span> },
    { key: 'createdAt', header: 'Date', accessor: 'createdAt', sortable: true, render: (r) => formatDate(r.createdAt) },
    { key: 'actions', header: 'Actions', sortable: false, render: (r) => (
      <div className="d-flex gap-2">
        <button onClick={(e) => { e.stopPropagation(); setViewModal({ open: true, item: r }); }}
          className="btn btn-sm" style={{ color: 'var(--ab)', border: '1px solid var(--ab)', background: 'transparent' }}>
          <i className="fas fa-eye"></i></button>
        <button onClick={(e) => { e.stopPropagation(); setReplyModal({ open: true, item: r }); setReplyText(''); }}
          className="btn btn-sm" style={{ color: 'var(--ap)', border: '1px solid var(--ap)', background: 'transparent' }}>
          <i className="fas fa-reply"></i></button>
        <button onClick={(e) => { e.stopPropagation(); setDeleteModal({ open: true, item: r }); }}
          className="btn btn-sm" style={{ color: '#ef4444', border: '1px solid #ef4444', background: 'transparent' }}>
          <i className="fas fa-trash-alt"></i></button>
      </div>
    )}
  ];

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold mb-0" style={{ color: 'var(--tp)' }}>Contact Queries</h4>
      </div>

      <DataTable columns={columns} data={data} loading={loading} searchPlaceholder="Search by name, email..."
        onSearch={(v) => { setSearch(v); setPage(1); }} filterOptions={[]}
        sortField={sortField} sortOrder={sortOrder} onSort={handleSort}
        page={page} totalPages={totalPages} totalItems={totalItems} perPage={10} onPageChange={setPage} />

      <Modal isOpen={viewModal.open} onClose={() => setViewModal({ open: false, item: null })}
        title={`Query from ${viewModal.item?.name || ''}`} size="lg">
        <div className="mb-3">
          <small style={{ color: 'var(--ts)' }}>Email</small>
          <p style={{ color: 'var(--tp)' }}>{viewModal.item?.email}</p>
        </div>
        <div className="mb-3">
          <small style={{ color: 'var(--ts)' }}>Subject</small>
          <p style={{ color: 'var(--tp)' }}>{viewModal.item?.subject || '—'}</p>
        </div>
        <div className="mb-3">
          <small style={{ color: 'var(--ts)' }}>Message</small>
          <p style={{ color: 'var(--tp)', whiteSpace: 'pre-wrap', background: 'var(--bs)', padding: '1rem', borderRadius: '8px' }}>
            {viewModal.item?.message || viewModal.item?.body || '—'}
          </p>
        </div>
        <div>
          <small style={{ color: 'var(--ts)' }}>Submitted</small>
          <p style={{ color: 'var(--tp)' }}>{formatDate(viewModal.item?.createdAt)}</p>
        </div>
      </Modal>

      <Modal isOpen={replyModal.open} onClose={() => setReplyModal({ open: false, item: null })}
        title={`Reply to ${replyModal.item?.name || ''}`} size="lg"
        footer={
          <div className="d-flex gap-2">
            <button onClick={() => setReplyModal({ open: false, item: null })}
              className="btn" style={{ background: 'var(--bs)', color: 'var(--tp)', border: '1px solid var(--bdr)' }}>Cancel</button>
            <button onClick={handleReply} disabled={sendingReply} className="btn"
              style={{ background: 'var(--ap)', color: '#fff', border: 'none' }}>
              {sendingReply ? <><span className="spinner-border spinner-border-sm me-2" />Sending...</> : 'Send Reply'}
            </button>
          </div>
        }>
        <div className="mb-3">
          <label className="form-label" style={{ color: 'var(--tp)' }}>To: {replyModal.item?.email}</label>
          <textarea className="form-control" rows={8} value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Type your reply here..."
            style={{ background: 'var(--bs)', color: 'var(--tp)', borderColor: 'var(--bdr)', borderRadius: '8px' }} />
        </div>
      </Modal>

      <ConfirmModal isOpen={deleteModal.open} onClose={() => setDeleteModal({ open: false, item: null })}
        onConfirm={handleDelete} title="Delete Query?" />
    </div>
  );
}

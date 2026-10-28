'use client';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import adminService from '@/services/adminService';
import ConfirmModal from '@/components/common/ConfirmModal';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function ResumePage() {
  const [resume, setResume] = useState(null);
  
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ open: false });
  
  // eslint-disable-next-line react-hooks/immutability
  useEffect(() => { fetchResume(); }, []);
  const fetchResume = async () => {
    try {
      setLoading(true);
      const res = await adminService.resume.get();
      const data = res.data?.data || res.data;
      setResume(data?.url || data?.file || data || null);
    } catch {} finally { setLoading(false); }
  };
  
  const handleUpload = async () => {
    if (!file) { toast.error('Select a file'); return; }
    try {
      setUploading(true);
      const fd = new FormData();
      fd.append('resume', file);
      await adminService.resume.upload(fd);
      toast.success('Resume uploaded');
      setFile(null);
      fetchResume();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally { setUploading(false); }
  };

  const handleDelete = async () => {
    try {
      await adminService.resume.delete();
      toast.success('Resume deleted');
      setDeleteModal({ open: false });
      setResume(null);
    } catch { toast.error('Delete failed'); }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      <h4 className="fw-bold mb-4" style={{ color: 'var(--tp)' }}>Resume</h4>

      <div className="card border-0 rounded-3 p-4 mb-4" style={{ background: 'var(--bs)' }}>
        <h5 className="fw-bold mb-3" style={{ color: 'var(--tp)' }}>Upload New Resume</h5>
        <input type="file" accept=".pdf,.doc,.docx" onChange={(e) => setFile(e.target.files?.[0])}
          className="form-control mb-3"
          style={{ background: 'var(--bs)', color: 'var(--tp)', borderColor: 'var(--bdr)', borderRadius: '8px' }} />
        <button onClick={handleUpload} disabled={uploading || !file} className="btn w-100"
          style={{ background: 'var(--gm)', color: '#fff', border: 'none' }}>
          {uploading ? <><span className="spinner-border spinner-border-sm me-2" />Uploading...</> : 'Upload Resume'}
        </button>
      </div>

      {resume && (
        <div className="card border-0 rounded-3 p-4" style={{ background: 'var(--bs)' }}>
          <div className="d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center gap-3">
              <i className="fas fa-file-pdf" style={{ fontSize: '2rem', color: '#ef4444' }}></i>
              <div>
                <p className="fw-medium mb-0" style={{ color: 'var(--tp)' }}>Current Resume</p>
                <a href={typeof resume === 'string' ? resume : resume?.url} target="_blank" rel="noopener noreferrer"
                  style={{ color: 'var(--ab)', fontSize: '0.85rem' }}>
                  <i className="fas fa-external-link-alt me-1"></i>View / Download
                </a>
              </div>
            </div>
            <button onClick={() => setDeleteModal({ open: true })} className="btn btn-sm"
              style={{ color: '#ef4444', border: '1px solid #ef4444', background: 'transparent' }}>
              <i className="fas fa-trash-alt me-1"></i>Delete
            </button>
          </div>
        </div>
      )}

      <ConfirmModal isOpen={deleteModal.open} onClose={() => setDeleteModal({ open: false })}
        onConfirm={handleDelete} title="Delete Resume?" message="This action cannot be undone." />
    </div>
  );
}

'use client';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import adminService from '@/services/adminService';
import ImageUploader from '@/components/common/ImageUploader';
import ConfirmModal from '@/components/common/ConfirmModal';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function BannersPage() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ open: false, item: null });
  const [newFiles, setNewFiles] = useState([]);

  // eslint-disable-next-line react-hooks/immutability
  useEffect(() => { fetchBanners(); }, []);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const res = await adminService.banners.getAll();
      const d = res.data?.data || res.data;
      setBanners(Array.isArray(d) ? d : d.banners || []);
    } catch {
      toast.error('Failed to load banners');
    } finally { setLoading(false); }
  };

  const handleUpload = async () => {
    if (newFiles.length === 0) { toast.error('Select images first'); return; }
    try {
      setUploading(true);
      const fd = new FormData();
      newFiles.forEach(f => fd.append('images', f));
      await adminService.banners.upload(fd);
      toast.success('Banners uploaded');
      setNewFiles([]);
      fetchBanners();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally { setUploading(false); }
  };

  const handleDelete = async () => {
    try {
      await adminService.banners.delete(deleteModal.item._id);
      toast.success('Deleted');
      setDeleteModal({ open: false, item: null });
      fetchBanners();
    } catch { toast.error('Delete failed'); }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold mb-0" style={{ color: 'var(--tp)' }}>Banners</h4>
        <div className="d-flex gap-2 align-items-center">
          {newFiles.length > 0 && (
            <>
              <span style={{ color: 'var(--ts)', fontSize: '0.85rem' }}>{newFiles.length} selected</span>
              <button onClick={handleUpload} disabled={uploading} className="btn"
                style={{ background: '#10b981', color: '#fff', border: 'none' }}>
                {uploading ? <><span className="spinner-border spinner-border-sm me-1" />Uploading...</> : <><i className="fas fa-upload me-1"></i>Upload</>}
              </button>
            </>
          )}
        </div>
      </div>

      <div className="card border-0 rounded-3 p-4 mb-4" style={{ background: 'var(--bs)' }}>
        <ImageUploader images={[]} onImagesChange={setNewFiles} maxFiles={10} />
      </div>

      {banners.length === 0 ? (
        <div className="text-center py-5">
          <i className="fas fa-images" style={{ fontSize: '3rem', color: 'var(--bdr)' }}></i>
          <p className="mt-2" style={{ color: 'var(--ts)' }}>No banners</p>
        </div>
      ) : (
        <div className="row g-3">
          {banners.map((banner) => (
            <div key={banner._id} className="col-lg-4 col-md-6">
              <div className="card border-0 rounded-3 overflow-hidden" style={{ background: 'var(--bs)' }}>
                <div className="position-relative">
                  <img src={banner.url || banner.image || banner} alt="Banner"
                    style={{ width: '100%', height: 200, objectFit: 'cover' }} />
                  <button onClick={() => setDeleteModal({ open: true, item: banner })}
                    className="btn btn-sm position-absolute top-0 end-0 m-2"
                    style={{ background: 'rgba(0,0,0,0.6)', color: '#ef4444', border: 'none', borderRadius: '50%', width: 32, height: 32 }}>
                    <i className="fas fa-trash-alt"></i>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmModal isOpen={deleteModal.open} onClose={() => setDeleteModal({ open: false, item: null })}
        onConfirm={handleDelete} title="Delete Banner?" message="This banner will be permanently deleted." />
    </div>
  );
}

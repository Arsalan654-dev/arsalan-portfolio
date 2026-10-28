'use client';
import { useState, useRef } from 'react';

export default function VideoUploader({
  video = null,
  onVideoChange,
  maxSize = 50 * 1024 * 1024,
  accept = 'video/*'
}) {
  const [preview, setPreview] = useState(video?.url || video || null);
  const [fileName, setFileName] = useState(video?.name || '');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleFile = async (file) => {
    if (!file) return;

    setError('');

    if (file.size > maxSize) {
      setError(`Video exceeds ${maxSize / 1024 / 1024}MB limit`);
      return;
    }

    if (!file.type.startsWith('video/')) {
      setError('Please select a valid video file');
      return;
    }

    setUploading(true);
    setProgress(0);

    for (let p = 10; p <= 100; p += 15) {
      await new Promise(r => setTimeout(r, 100));
      setProgress(p);
    }

    const url = URL.createObjectURL(file);
    setPreview(url);
    setFileName(file.name);
    setUploading(false);
    setProgress(100);

    if (onVideoChange) onVideoChange({ file, url, name: file.name });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    handleFile(file);
  };

  const handleSelect = (e) => {
    handleFile(e.target.files?.[0]);
    e.target.value = '';
  };

  const removeVideo = () => {
    if (preview?.startsWith('blob:')) URL.revokeObjectURL(preview);
    setPreview(null);
    setFileName('');
    setProgress(0);
    setError('');
    if (onVideoChange) onVideoChange(null);
  };

  return (
    <div>
      {!preview ? (
        <div
          onDragOver={(e) => { e.preventDefault(); e.currentTarget.style.borderColor = 'var(--ap)'; }}
          onDragLeave={(e) => { e.currentTarget.style.borderColor = 'var(--bdr)'; }}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: `2px dashed ${error ? '#dc3545' : 'var(--bdr)'}`,
            borderRadius: '12px',
            padding: '2.5rem 2rem',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          <i className="fas fa-video" style={{ fontSize: '2.5rem', color: 'var(--ap)' }}></i>
          <p className="mt-2 mb-1" style={{ color: 'var(--tp)' }}>
            Drag & drop video here, or click to browse
          </p>
          <small style={{ color: 'var(--ts)' }}>
            Supports MP4, WebM, MOV &bull; Up to {maxSize / 1024 / 1024}MB
          </small>
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleSelect}
            style={{ display: 'none' }}
          />
          {error && (
            <p className="mt-2 mb-0 text-danger" style={{ fontSize: '0.85rem' }}>
              <i className="fas fa-exclamation-circle me-1"></i>{error}
            </p>
          )}
        </div>
      ) : (
        <div
          className="position-relative"
          style={{
            borderRadius: '12px',
            overflow: 'hidden',
            border: '1px solid var(--bdr)',
            background: '#000'
          }}
        >
          <video
            src={preview}
            controls
            style={{ width: '100%', maxHeight: '400px', display: 'block' }}
          />
          <div className="p-2 d-flex align-items-center justify-content-between" style={{ background: 'var(--bs)' }}>
            <small style={{ color: 'var(--ts)' }}>
              <i className="fas fa-file-video me-1"></i>{fileName || 'Video'}
            </small>
            <button
              type="button"
              className="btn btn-sm text-danger"
              onClick={removeVideo}
              style={{ border: 'none', background: 'transparent' }}
            >
              <i className="fas fa-trash-alt"></i> Remove
            </button>
          </div>
        </div>
      )}

      {uploading && (
        <div className="mt-2">
          <div className="d-flex justify-content-between mb-1">
            <small style={{ color: 'var(--ts)' }}>Uploading...</small>
            <small style={{ color: 'var(--ts)' }}>{progress}%</small>
          </div>
          <div style={{ height: '6px', background: 'var(--bdr)', borderRadius: '3px', overflow: 'hidden' }}>
            <div
              style={{
                width: `${progress}%`,
                height: '100%',
                background: 'var(--gm)',
                transition: 'width 0.3s ease',
                borderRadius: '3px'
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

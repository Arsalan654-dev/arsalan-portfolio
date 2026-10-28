'use client';
import { useState, useRef, useCallback } from 'react';

export default function ImageUploader({
  images = [],
  onImagesChange,
  maxFiles = 5,
  maxSize = 5 * 1024 * 1024,
  accept = 'image/*'
}) {
  const [previews, setPreviews] = useState(images);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const processFiles = useCallback(async (files) => {
    const validFiles = [];
    const errors = [];

    for (const file of Array.from(files)) {
      if (previews.length + validFiles.length >= maxFiles) {
        errors.push(`Maximum ${maxFiles} files allowed`);
        break;
      }
      if (file.size > maxSize) {
        errors.push(`${file.name} exceeds ${maxSize / 1024 / 1024}MB limit`);
        continue;
      }
      validFiles.push(file);
    }

    if (validFiles.length === 0) return;

    setUploading(true);
    const newPreviews = validFiles.map(file => ({
      file,
      url: URL.createObjectURL(file),
      progress: 0,
      name: file.name,
      size: file.size
    }));

    for (const item of newPreviews) {
      for (let p = 10; p <= 100; p += 20) {
        await new Promise(r => setTimeout(r, 80));
        item.progress = p;
        setPreviews(prev => [...prev]);
      }
    }

    const updated = [...previews, ...newPreviews];
    setPreviews(updated);
    setUploading(false);
    setDragOver(false);

    if (onImagesChange) {
      onImagesChange(updated.map(p => p.file || p));
    }
  }, [previews, maxFiles, maxSize, onImagesChange]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    processFiles(e.dataTransfer.files);
  }, [processFiles]);

  const handleSelect = (e) => {
    if (e.target.files?.length) processFiles(e.target.files);
    e.target.value = '';
  };

  const removeImage = (index) => {
    const item = previews[index];
    if (item?.url?.startsWith('blob:')) URL.revokeObjectURL(item.url);
    const updated = previews.filter((_, i) => i !== index);
    setPreviews(updated);
    if (onImagesChange) onImagesChange(updated.map(p => p.file || p));
  };

  const reorderImage = (from, to) => {
    const updated = [...previews];
    const [moved] = updated.splice(from, 1);
    updated.splice(to, 0, moved);
    setPreviews(updated);
    if (onImagesChange) onImagesChange(updated.map(p => p.file || p));
  };

  return (
    <div>
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        style={{
          border: `2px dashed ${dragOver ? 'var(--ap)' : 'var(--bdr)'}`,
          borderRadius: '12px',
          padding: '2rem',
          textAlign: 'center',
          cursor: 'pointer',
          background: dragOver ? 'rgba(139,92,246,0.1)' : 'transparent',
          transition: 'all 0.2s ease'
        }}
      >
        <i className="fas fa-cloud-upload-alt" style={{ fontSize: '2.5rem', color: 'var(--ap)' }}></i>
        <p className="mt-2 mb-1" style={{ color: 'var(--tp)' }}>
          Drag & drop images here, or click to browse
        </p>
        <small style={{ color: 'var(--ts)' }}>
          Supports JPG, PNG, WebP &bull; Max {maxFiles} files &bull; Up to {maxSize / 1024 / 1024}MB each
        </small>
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple
          onChange={handleSelect}
          style={{ display: 'none' }}
        />
      </div>

      {uploading && (
        <div className="d-flex align-items-center gap-2 mt-3">
          <div className="spinner-border spinner-border-sm" style={{ color: 'var(--ap)' }}></div>
          <span style={{ color: 'var(--ts)', fontSize: '0.85rem' }}>Processing images...</span>
        </div>
      )}

      {previews.length > 0 && (
        <div className="row g-2 mt-3">
          {previews.map((item, index) => {
            const imageUrl = item?.url || (typeof item === 'string' ? item : '');
            return (
              <div className="col-6 col-md-4 col-lg-3" key={index}>
                <div
                  className="position-relative"
                  style={{
                    borderRadius: '8px',
                    overflow: 'hidden',
                    border: '1px solid var(--bdr)',
                    aspectRatio: '1'
                  }}
                >
                  <img
                    src={imageUrl}
                    alt={item?.name || `Image ${index + 1}`}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />

                  {item.progress !== undefined && item.progress < 100 && (
                    <div
                      className="position-absolute bottom-0 start-0 w-100"
                      style={{
                        height: '4px',
                        background: 'var(--bdr)'
                      }}
                    >
                      <div
                        style={{
                          width: `${item.progress}%`,
                          height: '100%',
                          background: 'var(--gm)',
                          transition: 'width 0.3s ease'
                        }}
                      />
                    </div>
                  )}

                  <div className="position-absolute top-0 end-0 p-1">
                    <button
                      type="button"
                      className="btn btn-sm"
                      onClick={(e) => { e.stopPropagation(); removeImage(index); }}
                      style={{
                        background: 'rgba(0,0,0,0.6)',
                        color: '#fff',
                        borderRadius: '50%',
                        width: '24px',
                        height: '24px',
                        padding: 0,
                        fontSize: '0.7rem',
                        border: 'none'
                      }}
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </div>

                  {index > 0 && (
                    <button
                      type="button"
                      className="position-absolute btn btn-sm"
                      onClick={(e) => { e.stopPropagation(); reorderImage(index, index - 1); }}
                      style={{
                        background: 'rgba(0,0,0,0.6)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '2px 6px',
                        fontSize: '0.7rem',
                        left: '4px',
                        bottom: '4px'
                      }}
                    >
                      <i className="fas fa-chevron-left"></i>
                    </button>
                  )}
                  {index < previews.length - 1 && (
                    <button
                      type="button"
                      className="position-absolute btn btn-sm"
                      onClick={(e) => { e.stopPropagation(); reorderImage(index, index + 1); }}
                      style={{
                        background: 'rgba(0,0,0,0.6)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '2px 6px',
                        fontSize: '0.7rem',
                        left: '32px',
                        bottom: '4px'
                      }}
                    >
                      <i className="fas fa-chevron-right"></i>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import adminService from '@/services/adminService';
import ImageUploader from '@/components/common/ImageUploader';
import VideoUploader from '@/components/common/VideoUploader';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function CreateProjectPage() {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [technologies, setTechnologies] = useState([]);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: '', description: '', slug: '', category: '', price: '',
    livePreviewUrl: '', technologies: [], skills: []
  });
  const [images, setImages] = useState([]);
  const [video, setVideo] = useState(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability
    loadOptions();
  }, []);

  const loadOptions = async () => {
    try {
      const [catRes, techRes, skillRes] = await Promise.all([
        adminService.categories.getAll({ limit: 100 }),
        adminService.technologies.getAll({ limit: 100 }),
        adminService.skills.getAll({ limit: 100 })
      ]);
      setCategories(catRes.data?.data?.categories || catRes.data?.data || catRes.data || []);
      setTechnologies(techRes.data?.data?.technologies || techRes.data?.data || techRes.data || []);
      setSkills(skillRes.data?.data?.skills || skillRes.data?.data || skillRes.data || []);
    } catch {
      toast.error('Failed to load options');
    } finally { setLoading(false); }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      const arr = form[name] || [];
      setForm(prev => ({
        ...prev,
        [name]: checked ? [...arr, value] : arr.filter(v => v !== value)
      }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const fd = new FormData();
      Object.entries(form).forEach(([key, val]) => {
        if (Array.isArray(val)) fd.append(key, JSON.stringify(val));
        else fd.append(key, val);
      });
      images.forEach(img => fd.append('media', img));
      if (video?.file) fd.append('media', video.file);
      await adminService.projects.create(fd);
      toast.success('Project created successfully');
      router.push('/admin/projects');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create project');
    } finally { setSubmitting(false); }
  };

  const inputStyle = { background: 'var(--bs)', color: 'var(--tp)', borderColor: 'var(--bdr)', borderRadius: '8px' };

  if (loading) return <LoadingSpinner />;

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <h4 className="fw-bold mb-4" style={{ color: 'var(--tp)' }}>Create Project</h4>
      <form onSubmit={handleSubmit}>
        <div className="card border-0 rounded-3 p-4 mb-4" style={{ background: 'var(--bs)' }}>
          <h5 className="fw-bold mb-3" style={{ color: 'var(--tp)' }}>Basic Information</h5>
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label" style={{ color: 'var(--tp)' }}>Title *</label>
              <input type="text" name="title" className="form-control" value={form.title} onChange={handleChange} required style={inputStyle} />
            </div>
            <div className="col-md-6">
              <label className="form-label" style={{ color: 'var(--tp)' }}>Slug</label>
              <input type="text" name="slug" className="form-control" value={form.slug} onChange={handleChange} style={inputStyle} />
            </div>
            <div className="col-12">
              <label className="form-label" style={{ color: 'var(--tp)' }}>Description *</label>
              <textarea name="description" className="form-control" rows={5} value={form.description} onChange={handleChange} required style={inputStyle} />
            </div>
            <div className="col-md-4">
              <label className="form-label" style={{ color: 'var(--tp)' }}>Category *</label>
              <select name="category" className="form-select" value={form.category} onChange={handleChange} required style={inputStyle}>
                <option value="">Select Category</option>
                {categories.map(c => (
                  <option key={c._id} value={c._id}>{c.category_title}</option>
                ))}
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label" style={{ color: 'var(--tp)' }}>Price *</label>
              <input type="number" name="price" className="form-control" value={form.price} onChange={handleChange} required min={0} style={inputStyle} />
            </div>
            <div className="col-md-4">
              <label className="form-label" style={{ color: 'var(--tp)' }}>Live Preview URL</label>
              <input type="url" name="livePreviewUrl" className="form-control" value={form.livePreviewUrl} onChange={handleChange} style={inputStyle} />
            </div>
          </div>
        </div>

        <div className="card border-0 rounded-3 p-4 mb-4" style={{ background: 'var(--bs)' }}>
          <h5 className="fw-bold mb-3" style={{ color: 'var(--tp)' }}>Technologies & Skills</h5>
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label" style={{ color: 'var(--tp)' }}>Technologies</label>
              <div style={{ maxHeight: 200, overflowY: 'auto', border: '1px solid var(--bdr)', borderRadius: '8px', padding: '0.5rem' }}>
                {technologies.map(t => (
                  <div key={t._id} className="form-check">
                    <input type="checkbox" className="form-check-input" id={`tech-${t._id}`}
                      name="technologies" value={t._id} checked={form.technologies.includes(t._id)} onChange={handleChange}
                      style={{ accentColor: 'var(--ap)' }} />
                    <label className="form-check-label" htmlFor={`tech-${t._id}`} style={{ color: 'var(--tp)' }}>{t.technology_title}</label>
                  </div>
                ))}
              </div>
            </div>
            <div className="col-md-6">
              <label className="form-label" style={{ color: 'var(--tp)' }}>Skills</label>
              <div style={{ maxHeight: 200, overflowY: 'auto', border: '1px solid var(--bdr)', borderRadius: '8px', padding: '0.5rem' }}>
                {skills.map(s => (
                  <div key={s._id} className="form-check">
                    <input type="checkbox" className="form-check-input" id={`skill-${s._id}`}
                      name="skills" value={s._id} checked={form.skills.includes(s._id)} onChange={handleChange}
                      style={{ accentColor: 'var(--ap)' }} />
                    <label className="form-check-label" htmlFor={`skill-${s._id}`} style={{ color: 'var(--tp)' }}>{s.skill_title}</label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="card border-0 rounded-3 p-4 mb-4" style={{ background: 'var(--bs)' }}>
          <h5 className="fw-bold mb-3" style={{ color: 'var(--tp)' }}>Media</h5>
          <div className="mb-4">
            <label className="form-label" style={{ color: 'var(--tp)' }}>Images</label>
            <ImageUploader images={[]} onImagesChange={setImages} />
          </div>
          <div>
            <label className="form-label" style={{ color: 'var(--tp)' }}>Video (Optional)</label>
            <VideoUploader video={null} onVideoChange={setVideo} />
          </div>
        </div>

        <div className="d-flex gap-3">
          <button type="submit" disabled={submitting} className="btn px-4 py-2"
            style={{ background: 'var(--gm)', color: '#fff', border: 'none' }}>
            {submitting ? <><span className="spinner-border spinner-border-sm me-2" />Creating...</> : 'Create Project'}
          </button>
          <button type="button" onClick={() => router.back()} className="btn px-4 py-2"
            style={{ background: 'var(--bs)', color: 'var(--tp)', border: '1px solid var(--bdr)' }}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

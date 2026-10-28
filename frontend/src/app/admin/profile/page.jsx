'use client';
import { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import adminService from '@/services/adminService';
import userService from '@/services/userService';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function AdminProfilePage() {
  const { user: authUser } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [countries, setCountries] = useState([]);
  const [cities, setCities] = useState([]);
  const [form, setForm] = useState({
    name: '', mobile: '', country: '', city: '', address: ''
  });
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '', newPassword: '', confirmPassword: ''
  });
  const [passwordSaving, setPasswordSaving] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability
    loadProfile();
    // eslint-disable-next-line react-hooks/immutability
    loadCountries();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const res = await adminService.profile.get();
      const data = res.data?.data || res.data;
      setForm({
        name: data.name || '', mobile: data.mobileNumber || data.mobile || '',
        country: data.country?._id || data.country || '',
        city: data.city?._id || data.city || '',
        address: data.address || ''
      });
      if (data.profilePicture || data.avatar) setAvatarPreview(data.profilePicture || data.avatar);
      if (data.country?._id || data.country) {
        loadCities(data.country?._id || data.country);
      }
    } catch {
      toast.error('Failed to load profile');
    } finally { setLoading(false); }
  };

  const loadCountries = async () => {
    try {
      const res = await userService.getCountries();
      setCountries(res.data?.data || res.data || []);
    } catch {}
  };

  const loadCities = async (countryId) => {
    if (!countryId) { setCities([]); return; }
    try {
      const res = await userService.getCities(countryId);
      setCities(res.data?.data || res.data || []);
    } catch {}
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value, ...(name === 'country' ? { city: '' } : {}) }));
    if (name === 'country') loadCities(value);
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatar(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await adminService.profile.update(form);
      if (avatar) {
        const fd = new FormData();
        fd.append('avatar', avatar);
        await adminService.profile.updateAvatar(fd);
      }
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally { setSaving(false); }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    try {
      setPasswordSaving(true);
      await adminService.profile.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      toast.success('Password changed');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally { setPasswordSaving(false); }
  };

  if (loading) return <LoadingSpinner />;

  const inputStyle = { background: 'var(--bs)', color: 'var(--tp)', borderColor: 'var(--bdr)', borderRadius: '8px' };
  const selectedCountry = countries.find(c => c._id === form.country);
  const selectedCountryCode = selectedCountry?.country_code || '';

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <h4 className="fw-bold mb-4" style={{ color: 'var(--tp)' }}>Admin Profile</h4>
      <div className="row g-4">
        <div className="col-lg-8">
          <div className="card border-0 rounded-3 p-4" style={{ background: 'var(--bs)' }}>
            <form onSubmit={handleSubmit}>
              <div className="d-flex align-items-center gap-4 mb-4">
                <div className="position-relative d-inline-block">
                  <img src={avatarPreview || '/next.svg'} alt="Avatar"
                    className="rounded-circle"
                    style={{ width: 100, height: 100, objectFit: 'cover', border: '3px solid var(--ap)' }} />
                  <div className="position-absolute" style={{ bottom: -4, right: -4 }}>
                    <button type="button" onClick={() => fileInputRef.current?.click()}
                      className="btn btn-sm rounded-circle d-flex align-items-center justify-content-center p-2"
                      style={{ width: 32, height: 32, background: 'var(--ap)', color: '#fff', border: 'none', cursor: 'pointer' }}>
                      <i className="fas fa-camera" style={{ fontSize: '0.8rem' }}></i>
                    </button>
                  </div>
                  <input type="file" ref={fileInputRef} accept="image/*" onChange={handleAvatarChange} style={{ display: 'none' }} />
                </div>
                <div>
                  <h5 className="fw-bold mb-1" style={{ color: 'var(--tp)' }}>{form.name || authUser?.name}</h5>
                  <small style={{ color: 'var(--ts)' }}>{authUser?.email}</small>
                </div>
              </div>

              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label" style={{ color: 'var(--tp)' }}>Name</label>
                  <input type="text" name="name" className="form-control" value={form.name} onChange={handleChange} style={inputStyle} />
                </div>
                <div className="col-md-6">
                  <label className="form-label" style={{ color: 'var(--tp)' }}>Mobile</label>
                  <div className="input-group">
                    <input type="text" className="form-control" value={selectedCountryCode} readOnly placeholder="+"
                      style={{ ...inputStyle, maxWidth: 84, background: 'var(--bg)' }} />
                    <input type="text" name="mobile" className="form-control" value={form.mobile} onChange={handleChange} style={inputStyle} />
                  </div>
                </div>
                <div className="col-md-6">
                  <label className="form-label" style={{ color: 'var(--tp)' }}>Country</label>
                  <select name="country" className="form-select" value={form.country} onChange={handleChange} style={inputStyle}>
                    <option value="">Select Country</option>
                    {countries.map(c => (<option key={c._id} value={c._id}>{c.country_name}</option>))}
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label" style={{ color: 'var(--tp)' }}>City</label>
                  <select name="city" className="form-select" value={form.city} onChange={handleChange} style={inputStyle}>
                    <option value="">Select City</option>
                    {cities.map(c => (<option key={c._id} value={c._id}>{c.city_name}</option>))}
                  </select>
                </div>
                <div className="col-12">
                  <label className="form-label" style={{ color: 'var(--tp)' }}>Address</label>
                  <textarea name="address" className="form-control" rows={3} value={form.address} onChange={handleChange} style={inputStyle} />
                </div>
              </div>

              <button type="submit" disabled={saving} className="btn mt-4 px-4"
                style={{ background: 'var(--gm)', color: '#fff', border: 'none' }}>
                {saving ? <><span className="spinner-border spinner-border-sm me-2" />Saving...</> : 'Save Changes'}
              </button>
            </form>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card border-0 rounded-3 p-4" style={{ background: 'var(--bs)' }}>
            <h5 className="fw-bold mb-3" style={{ color: 'var(--tp)' }}>Change Password</h5>
            <form onSubmit={handlePasswordChange}>
              <div className="mb-3">
                <label className="form-label" style={{ color: 'var(--tp)' }}>Current Password</label>
                <input type="password" className="form-control" value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm(p => ({ ...p, currentPassword: e.target.value }))} style={inputStyle} />
              </div>
              <div className="mb-3">
                <label className="form-label" style={{ color: 'var(--tp)' }}>New Password</label>
                <input type="password" className="form-control" value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm(p => ({ ...p, newPassword: e.target.value }))} style={inputStyle} />
              </div>
              <div className="mb-3">
                <label className="form-label" style={{ color: 'var(--tp)' }}>Confirm Password</label>
                <input type="password" className="form-control" value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm(p => ({ ...p, confirmPassword: e.target.value }))} style={inputStyle} />
              </div>
              <button type="submit" disabled={passwordSaving} className="btn w-100"
                style={{ background: 'var(--ap)', color: '#fff', border: 'none' }}>
                {passwordSaving ? <><span className="spinner-border spinner-border-sm me-2" />Changing...</> : 'Change Password'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

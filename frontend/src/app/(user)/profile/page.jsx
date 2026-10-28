'use client';
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import userService from '@/services/userService';
import authService from '@/services/authService';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function ProfilePage() {
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
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [twoFAStep, setTwoFAStep] = useState('idle');
  const [otp, setOtp] = useState('');
  const [twoFALoading, setTwoFALoading] = useState(false);

  const loadCities = async (countryId) => {
    if (!countryId) { setCities([]); return; }
    try {
      const res = await userService.getCities(countryId);
      setCities(res.data?.data || res.data || []);
    } catch {}
  };

  const loadProfile = async () => {
    try {
      setLoading(true);
      const res = await userService.getProfile();
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
      setIs2FAEnabled(data.is2FAEnabled || false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const loadCountries = async () => {
    try {
      const res = await userService.getCountries();
      setCountries(res.data?.data || res.data || []);
    } catch {}
  };

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await userService.getProfile();
        const data = res.data?.data || res.data;
        setForm({
          name: data.name || '', mobile: data.mobileNumber || data.mobile || '',
          country: data.country?._id || data.country || '',
          city: data.city?._id || data.city || '',
          address: data.address || ''
        });
        if (data.profilePicture || data.avatar) setAvatarPreview(data.profilePicture || data.avatar);
        if (data.country?._id || data.country) {
          const cityRes = await userService.getCities(data.country?._id || data.country);
          setCities(cityRes.data?.data || cityRes.data || []);
        }
        setIs2FAEnabled(data.is2FAEnabled || false);
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    })();
    userService.getCountries().then(res => {
      setCountries(res.data?.data || res.data || []);
    }).catch(() => {});
  }, []);

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
      await userService.updateProfile(form);
      if (avatar) {
        const fd = new FormData();
        fd.append('avatar', avatar);
        await userService.updateAvatar(fd);
      }
      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    try {
      setPasswordSaving(true);
      await userService.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      toast.success('Password changed successfully');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleEnable2FA = async () => {
    try {
      setTwoFALoading(true);
      await authService.enable2FA();
      setTwoFAStep('verify');
      toast.success('OTP sent to your email');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setTwoFALoading(false);
    }
  };

  const handleConfirm2FA = async () => {
    if (otp.length !== 6) {
      toast.error('Please enter the 6-digit OTP');
      return;
    }
    try {
      setTwoFALoading(true);
      await authService.confirm2FA({ otp });
      setIs2FAEnabled(true);
      setTwoFAStep('idle');
      setOtp('');
      toast.success('2FA enabled successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid OTP');
    } finally {
      setTwoFALoading(false);
    }
  };

  const handleDisable2FA = async () => {
    try {
      setTwoFALoading(true);
      await authService.disable2FA();
      setTwoFAStep('disableVerify');
      toast.success('OTP sent to your email');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setTwoFALoading(false);
    }
  };

  const handleConfirmDisable2FA = async () => {
    if (otp.length !== 6) {
      toast.error('Please enter the 6-digit OTP');
      return;
    }
    try {
      setTwoFALoading(true);
      await authService.confirmDisable2FA({ otp });
      setIs2FAEnabled(false);
      setTwoFAStep('idle');
      setOtp('');
      toast.success('2FA disabled successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid OTP');
    } finally {
      setTwoFALoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  const inputStyle = { background: 'var(--bs)', color: 'var(--tp)', borderColor: 'var(--bdr)', borderRadius: '8px' };
  const selectedCountry = countries.find(c => c._id === form.country);
  const selectedCountryCode = selectedCountry?.country_code || '';

  return (
    <div className="container py-5">
      <h3 className="fw-bold mb-4" style={{ color: 'var(--tp)' }}>My Profile</h3>
      <div className="row g-4">
        <div className="col-lg-8">
          <div className="card border-0 rounded-3 p-4" style={{ background: 'var(--bs)' }}>
            <form onSubmit={handleSubmit}>
              <div className="d-flex align-items-center gap-4 mb-4">
                <div className="position-relative">
                  <img
                    src={avatarPreview || '/next.svg'}
                    alt="Avatar"
                    className="rounded-circle"
                    style={{ width: 100, height: 100, objectFit: 'cover', border: '3px solid var(--ap)' }}
                  />
                  <label className="position-absolute bottom-0 end-0 btn btn-sm rounded-circle p-1"
                    style={{ background: 'var(--ap)', color: '#fff', border: 'none', cursor: 'pointer' }}>
                    <i className="fas fa-camera" style={{ fontSize: '0.7rem' }}></i>
                    <input type="file" accept="image/*" onChange={handleAvatarChange} style={{ display: 'none' }} />
                  </label>
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
                    {countries.map(c => (
                      <option key={c._id} value={c._id}>{c.country_name}</option>
                    ))}
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label" style={{ color: 'var(--tp)' }}>City</label>
                  <select name="city" className="form-select" value={form.city} onChange={handleChange} style={inputStyle}>
                    <option value="">Select City</option>
                    {cities.map(c => (
                      <option key={c._id} value={c._id}>{c.city_name}</option>
                    ))}
                  </select>
                </div>
                <div className="col-12">
                  <label className="form-label" style={{ color: 'var(--tp)' }}>Address</label>
                  <textarea name="address" className="form-control" rows={3} value={form.address} onChange={handleChange} style={inputStyle} />
                </div>
              </div>

              <button type="submit" className="btn mt-4 px-4" disabled={saving}
                style={{ background: 'var(--gm)', color: '#fff', border: 'none' }}>
                {saving ? <><span className="spinner-border spinner-border-sm me-2" />Saving...</> : 'Save Changes'}
              </button>
            </form>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card border-0 rounded-3 p-4 mb-4" style={{ background: 'var(--bs)' }}>
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
              <button type="submit" className="btn w-100" disabled={passwordSaving}
                style={{ background: 'var(--ap)', color: '#fff', border: 'none' }}>
                {passwordSaving ? <><span className="spinner-border spinner-border-sm me-2" />Changing...</> : 'Change Password'}
              </button>
            </form>
          </div>

          <div className="card border-0 rounded-3 p-4" style={{ background: 'var(--bs)' }}>
            <h5 className="fw-bold mb-3" style={{ color: 'var(--tp)' }}>Two-Factor Authentication</h5>
            <p style={{ color: 'var(--ts)', fontSize: '0.9rem' }}>
              {is2FAEnabled ? '2FA is currently enabled. An OTP will be required on login.' : 'Add an extra layer of security to your account.'}
            </p>
            
            {twoFAStep === 'idle' && (
              <div className="d-flex align-items-center justify-content-between">
                <span className="badge rounded-pill px-3 py-2" style={{ background: is2FAEnabled ? '#10b98120' : '#ef444420', color: is2FAEnabled ? '#10b981' : '#ef4444', border: `1px solid ${is2FAEnabled ? '#10b981' : '#ef4444'}` }}>
                  {is2FAEnabled ? 'Enabled' : 'Disabled'}
                </span>
                {is2FAEnabled ? (
                  <button onClick={handleDisable2FA} disabled={twoFALoading} className="btn btn-sm"
                    style={{ color: '#ef4444', border: '1px solid #ef4444', background: 'transparent' }}>
                    {twoFALoading ? <span className="spinner-border spinner-border-sm" /> : 'Disable'}
                  </button>
                ) : (
                  <button onClick={handleEnable2FA} disabled={twoFALoading} className="btn btn-sm"
                    style={{ background: 'var(--ap)', color: '#fff', border: 'none' }}>
                    {twoFALoading ? <span className="spinner-border spinner-border-sm" /> : 'Enable'}
                  </button>
                )}
              </div>
            )}

            {(twoFAStep === 'verify' || twoFAStep === 'disableVerify') && (
              <div>
                <p className="small mb-2" style={{ color: 'var(--ts)' }}>
                  Enter the 6-digit OTP sent to your email
                </p>
                <input type="text" maxLength={6} value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="form-control text-center fw-bold mb-3" placeholder="000000"
                  style={{ background: 'var(--bs)', border: '2px solid var(--bdr)', color: 'var(--tp)', fontSize: '1.3rem', letterSpacing: '8px' }} />
                <div className="d-flex gap-2">
                  <button onClick={twoFAStep === 'verify' ? handleConfirm2FA : handleConfirmDisable2FA} 
                    disabled={twoFALoading || otp.length !== 6} className="btn flex-grow-1"
                    style={{ background: 'var(--ap)', color: '#fff', border: 'none' }}>
                    {twoFALoading ? <span className="spinner-border spinner-border-sm" /> : 'Verify'}
                  </button>
                  <button onClick={() => { setTwoFAStep('idle'); setOtp(''); }} className="btn"
                    style={{ border: '1px solid var(--bdr)', color: 'var(--ts)', background: 'transparent' }}>
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

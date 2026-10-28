'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { setUser, setTempToken, setTempEmail } from '@/redux/slices/authSlice';
import authService from '@/services/authService';
import { setAccessToken } from '@/services/axiosInstance';
import toast from 'react-hot-toast';

export default function LoginModal({ show, onClose }) {
  const router = useRouter();
  const dispatch = useDispatch();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  if (!show) return null;

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      toast.error('Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      const { data } = await authService.login(form);
      if (data.success) {
        if (data.data?.tempToken) {
          dispatch(setTempToken(data.data.tempToken));
          dispatch(setTempEmail(data.data?.email || form.email));
          onClose();
          toast.success('2FA verification required');
          router.push('/verify-otp');
        } else {
          if (data.data?.accessToken) {
            setAccessToken(data.data.accessToken);
            localStorage.setItem('token', data.data.accessToken);
          }
          dispatch(setUser(data.data?.user));
          onClose();
          toast.success('Login successful!');
        }
      } else {
        toast.error(data.message || 'Login failed');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleSignupClick = () => {
    onClose();
    router.push('/signup');
  };

  return (
    <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" 
      style={{ background: 'rgba(0,0,0,0.7)', zIndex: 10000 }}>
      <div className="card border-0 rounded-3 p-4 position-relative" 
        style={{ background: 'var(--bc)', maxWidth: '420px', width: '90%' }}>
        <button onClick={onClose} className="position-absolute top-0 end-0 btn text-danger fs-4 p-2 border-0">&times;</button>
        
        <div className="text-center mb-4">
          <h4 className="fw-bold" style={{ color: 'var(--tp)' }}>Login Required</h4>
          <p style={{ color: 'var(--ts)', fontSize: '0.9rem' }}>Sign in to continue with your action</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label fw-medium" style={{ color: 'var(--tp)' }}>Email</label>
            <input type="email" name="email" value={form.email} onChange={handleChange}
              className="form-control" placeholder="your@email.com"
              style={{ background: 'var(--bs)', border: '1px solid var(--bdr)', color: 'var(--tp)' }} />
          </div>
          <div className="mb-3">
            <label className="form-label fw-medium" style={{ color: 'var(--tp)' }}>Password</label>
            <input type="password" name="password" value={form.password} onChange={handleChange}
              className="form-control" placeholder="••••••••"
              style={{ background: 'var(--bs)', border: '1px solid var(--bdr)', color: 'var(--tp)' }} />
          </div>
          <button type="submit" disabled={loading} className="btn w-100 fw-semibold py-2 border-0 mb-3" 
            style={{ background: 'var(--ap)', color: '#fff' }}>
            {loading ? <><span className="spinner-border spinner-border-sm me-2" />Signing In...</> : 'Sign In'}
          </button>
        </form>

        <p className="text-center mb-0" style={{ color: 'var(--ts)', fontSize: '0.85rem' }}>
          Don&apos;t have an account?{' '}
          <button onClick={handleSignupClick} className="btn btn-link p-0 fw-semibold" style={{ color: 'var(--ap)', textDecoration: 'none' }}>
            Sign Up
          </button>
        </p>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useDispatch } from 'react-redux';
import { setUser, setTempToken, setTempEmail } from '@/redux/slices/authSlice';
import authService from '@/services/authService';
import { setAccessToken } from '@/services/axiosInstance';
import GuestRoute from '@/components/common/GuestRoute';
import toast from 'react-hot-toast';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faLock, faSignInAlt } from '@fortawesome/free-solid-svg-icons';

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

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
          toast.success('2FA verification required');
          router.push('/verify-otp');
        } else {
          if (data.data?.accessToken) {
            setAccessToken(data.data.accessToken);
            localStorage.setItem('token', data.data.accessToken);
          }
          dispatch(setUser(data.data?.user));
          toast.success('Login successful!');
          if (data.data?.user?.role === 'admin') {
            router.replace('/admin/dashboard');
          } else {
            router.replace('/');
          }
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

  return (
    <GuestRoute>
      <section style={{ background: 'var(--bs)', minHeight: '100vh' }} className="d-flex align-items-center">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-5 col-md-7">
              <div className="text-center mb-4">
                <h2 className="fw-bold" style={{ background: 'var(--gm)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                  Welcome Back
                </h2>
                <p style={{ color: 'var(--ts)' }}>Sign in to your account</p>
              </div>
              <div className="card border-0 rounded-3 p-4" style={{ background: 'var(--bc)' }}>
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label fw-medium" style={{ color: 'var(--tp)' }}>
                      <FontAwesomeIcon icon={faEnvelope} className="me-2" style={{ color: 'var(--ap)' }} />Email
                    </label>
                    <input
                      type="email" name="email" value={form.email} onChange={handleChange}
                      className="form-control" placeholder="your@email.com"
                      style={{ background: 'var(--bs)', border: '1px solid var(--bdr)', color: 'var(--tp)' }}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-medium" style={{ color: 'var(--tp)' }}>
                      <FontAwesomeIcon icon={faLock} className="me-2" style={{ color: 'var(--ap)' }} />Password
                    </label>
                    <input
                      type="password" name="password" value={form.password} onChange={handleChange}
                      className="form-control" placeholder="••••••••"
                      style={{ background: 'var(--bs)', border: '1px solid var(--bdr)', color: 'var(--tp)' }}
                    />
                  </div>
                  <div className="d-flex justify-content-end mb-3">
                    <Link href="/forgot-password" style={{ color: 'var(--ap)', fontSize: '0.85rem' }}>Forgot Password?</Link>
                  </div>
                  <button type="submit" disabled={loading} className="btn w-100 fw-semibold py-2 border-0" style={{ background: 'var(--ap)', color: '#fff' }}>
                    {loading ? (
                      <><span className="spinner-border spinner-border-sm me-2" />Signing In...</>
                    ) : (
                      <><FontAwesomeIcon icon={faSignInAlt} className="me-2" />Sign In</>
                    )}
                  </button>
                </form>
                <p className="text-center mt-3 mb-0" style={{ color: 'var(--ts)', fontSize: '0.9rem' }}>
                  Don&apos;t have an account? <Link href="/signup" style={{ color: 'var(--ap)', fontWeight: 600 }}>Sign Up</Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </GuestRoute>
  );
}

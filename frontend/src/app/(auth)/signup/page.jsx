'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import authService from '@/services/authService';
import GuestRoute from '@/components/common/GuestRoute';
import toast from 'react-hot-toast';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faEnvelope, faLock, faUserPlus } from '@fortawesome/free-solid-svg-icons';

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      toast.error('Please fill in all fields');
      return;
    }
    if (form.password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    setLoading(true);
    try {
      const { data } = await authService.signup(form);
      if (data.success) {
        toast.success('Account created! Please check your email to verify.');
        router.push('/login');
      } else {
        toast.error(data.message || 'Signup failed');
      }
    } catch (err) {
      const data = err.response?.data;
      if (data?.errors?.length) {
        data.errors.forEach(e => toast.error(e.message));
      } else {
        toast.error(data?.message || 'Something went wrong');
      }
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
                  Create Account
                </h2>
                <p style={{ color: 'var(--ts)' }}>Join us and get started</p>
              </div>
              <div className="card border-0 rounded-3 p-4" style={{ background: 'var(--bc)' }}>
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label fw-medium" style={{ color: 'var(--tp)' }}>
                      <FontAwesomeIcon icon={faUser} className="me-2" style={{ color: 'var(--ap)' }} />Name
                    </label>
                    <input
                      type="text" name="name" value={form.name} onChange={handleChange}
                      className="form-control" placeholder="Your name"
                      style={{ background: 'var(--bs)', border: '1px solid var(--bdr)', color: 'var(--tp)' }}
                    />
                  </div>
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
                  <div className="mb-4">
                    <label className="form-label fw-medium" style={{ color: 'var(--tp)' }}>
                      <FontAwesomeIcon icon={faLock} className="me-2" style={{ color: 'var(--ap)' }} />Password
                    </label>
                    <input
                      type="password" name="password" value={form.password} onChange={handleChange}
                      className="form-control"                       placeholder="Min. 8 characters"
                      style={{ background: 'var(--bs)', border: '1px solid var(--bdr)', color: 'var(--tp)' }}
                    />
                  </div>
                  <button type="submit" disabled={loading} className="btn w-100 fw-semibold py-2 border-0" style={{ background: 'var(--bt)', color: '#fff' }}>
                    {loading ? (
                      <><span className="spinner-border spinner-border-sm me-2" />Creating Account...</>
                    ) : (
                      <><FontAwesomeIcon icon={faUserPlus} className="me-2" />Sign Up</>
                    )}
                  </button>
                </form>
                <p className="text-center mt-3 mb-0" style={{ color: 'var(--ts)', fontSize: '0.9rem' }}>
                  Already have an account? <Link href="/login" style={{ color: 'var(--ap)', fontWeight: 600 }}>Sign In</Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </GuestRoute>
  );
}

'use client';

import { Suspense, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import authService from '@/services/authService';
import GuestRoute from '@/components/common/GuestRoute';
import toast from 'react-hot-toast';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock, faCheckCircle, faArrowLeft } from '@fortawesome/free-solid-svg-icons';

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');
  const [form, setForm] = useState({ password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.password || !form.confirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (!token) {
      toast.error('Invalid or missing reset token');
      return;
    }
    setLoading(true);
    try {
      const { data } = await authService.resetPassword({ resetToken: token, newPassword: form.password });
      if (data.success) {
        setSuccess(true);
        toast.success('Password reset successfully!');
      } else {
        toast.error(data.message || 'Failed to reset password');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
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
                  Reset Password
                </h2>
                <p style={{ color: 'var(--ts)' }}>Enter your new password</p>
              </div>
              <div className="card border-0 rounded-3 p-4" style={{ background: 'var(--bc)' }}>
                {success ? (
                  <div className="text-center py-3">
                    <FontAwesomeIcon icon={faCheckCircle} size="3x" style={{ color: '#10b981' }} />
                    <h5 className="fw-bold mt-3" style={{ color: 'var(--tp)' }}>Password Reset!</h5>
                    <p style={{ color: 'var(--ts)', fontSize: '0.9rem' }}>Your password has been updated successfully.</p>
                    <button onClick={() => router.push('/login')} className="btn fw-semibold px-4 py-2 border-0 mt-2" style={{ background: 'var(--bt)', color: '#fff' }}>
                      Go to Login
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                      <label className="form-label fw-medium" style={{ color: 'var(--tp)' }}>
                        <FontAwesomeIcon icon={faLock} className="me-2" style={{ color: 'var(--ap)' }} />New Password
                      </label>
                      <input
                        type="password" name="password" value={form.password} onChange={handleChange}
                        className="form-control" placeholder="Min. 6 characters"
                        style={{ background: 'var(--bs)', border: '1px solid var(--bdr)', color: 'var(--tp)' }}
                      />
                    </div>
                    <div className="mb-4">
                      <label className="form-label fw-medium" style={{ color: 'var(--tp)' }}>
                        <FontAwesomeIcon icon={faLock} className="me-2" style={{ color: 'var(--ap)' }} />Confirm Password
                      </label>
                      <input
                        type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange}
                        className="form-control" placeholder="Repeat password"
                        style={{ background: 'var(--bs)', border: '1px solid var(--bdr)', color: 'var(--tp)' }}
                      />
                    </div>
                    <button type="submit" disabled={loading} className="btn w-100 fw-semibold py-2 border-0" style={{ background: 'var(--bt)', color: '#fff' }}>
                      {loading ? (
                        <><span className="spinner-border spinner-border-sm me-2" />Resetting...</>
                      ) : (
                        <><FontAwesomeIcon icon={faCheckCircle} className="me-2" />Reset Password</>
                      )}
                    </button>
                  </form>
                )}
                {!success && (
                  <p className="text-center mt-3 mb-0" style={{ color: 'var(--ts)', fontSize: '0.9rem' }}>
                    <Link href="/login" style={{ color: 'var(--ap)' }}>
                      <FontAwesomeIcon icon={faArrowLeft} className="me-1" />Back to Login
                    </Link>
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </GuestRoute>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <section style={{ background: 'var(--bs)', minHeight: '100vh' }} className="d-flex align-items-center justify-content-center">
        <div className="spinner-border" style={{ color: 'var(--ap)' }} role="status" />
      </section>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}

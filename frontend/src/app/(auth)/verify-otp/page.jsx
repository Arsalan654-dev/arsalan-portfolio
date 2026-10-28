'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { setUser, setTempToken, setTempEmail } from '@/redux/slices/authSlice';
import authService from '@/services/authService';
import { setAccessToken } from '@/services/axiosInstance';
import GuestRoute from '@/components/common/GuestRoute';
import toast from 'react-hot-toast';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShieldAlt, faRedo, faCheckCircle } from '@fortawesome/free-solid-svg-icons';

export default function VerifyOTPPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const tempToken = useSelector((state) => state.auth.tempToken);
  const tempEmail = useSelector((state) => state.auth.tempEmail);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (!tempToken) {
      router.push('/login');
    }
  }, [tempToken, router]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCanResend(true);
    }
  }, [countdown]);

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(0, 1);
    setOtp(newOtp);
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length !== 6) {
      toast.error('Please enter the complete 6-digit code');
      return;
    }
    setLoading(true);
    try {
      const { data } = await authService.verify2FA({ tempToken, otp: code });
      if (data.success) {
        if (data.data?.accessToken) {
          setAccessToken(data.data.accessToken);
          localStorage.setItem('token', data.data.accessToken);
        }
        dispatch(setUser(data.data?.user));
        dispatch(setTempToken(null));
        toast.success('Verified successfully!');
        if (data.data?.user?.role === 'admin') {
          router.replace('/admin/dashboard');
        } else {
          router.replace('/');
        }
      } else {
        toast.error(data.message || 'Invalid OTP');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setCanResend(false);
    setCountdown(60);
    try {
      await authService.resendOTP({ email: tempEmail, type: '2fa' });
      toast.success('OTP resent successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resend OTP');
      setCanResend(true);
    }
  };

  if (!tempToken) return null;

  return (
    <GuestRoute>
      <section style={{ background: 'var(--bs)', minHeight: '100vh' }} className="d-flex align-items-center">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-5 col-md-7">
              <div className="text-center mb-4">
                <FontAwesomeIcon icon={faShieldAlt} size="2x" style={{ color: 'var(--ap)' }} />
                <h2 className="fw-bold mt-2" style={{ background: 'var(--gm)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                  Two-Factor Auth
                </h2>
                <p style={{ color: 'var(--ts)' }}>Enter the 6-digit code sent to your email</p>
              </div>
              <div className="card border-0 rounded-3 p-4" style={{ background: 'var(--bc)' }}>
                <form onSubmit={handleSubmit}>
                  <div className="d-flex justify-content-center gap-2 mb-4">
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        ref={el => inputRefs.current[index] = el}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={e => handleChange(index, e.target.value)}
                        onKeyDown={e => handleKeyDown(index, e)}
                        className="form-control text-center fw-bold"
                        style={{
                          width: '50px', height: '55px', fontSize: '1.3rem',
                          background: 'var(--bs)', border: '2px solid var(--bdr)', color: 'var(--tp)',
                          borderRadius: '10px',
                        }}
                      />
                    ))}
                  </div>
                  <button type="submit" disabled={loading} className="btn w-100 fw-semibold py-2 border-0" style={{ background: 'var(--ap)', color: '#fff' }}>
                    {loading ? (
                      <><span className="spinner-border spinner-border-sm me-2" />Verifying...</>
                    ) : (
                      <><FontAwesomeIcon icon={faCheckCircle} className="me-2" />Verify Code</>
                    )}
                  </button>
                </form>
                <div className="text-center mt-3">
                  {canResend ? (
                    <button onClick={handleResend} className="btn btn-sm fw-semibold" style={{ color: 'var(--ap)', border: '1px solid var(--ap)', background: 'transparent' }}>
                      <FontAwesomeIcon icon={faRedo} className="me-1" />Resend Code
                    </button>
                  ) : (
                    <p className="mb-0" style={{ color: 'var(--ts)', fontSize: '0.85rem' }}>
                      Resend code in <span style={{ color: 'var(--ap)', fontWeight: 600 }}>{countdown}s</span>
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </GuestRoute>
  );
}

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import authService from '@/services/authService';
import GuestRoute from '@/components/common/GuestRoute';
import toast from 'react-hot-toast';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faPaperPlane, faArrowLeft, faCheckCircle, faRedo } from '@fortawesome/free-solid-svg-icons';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('email');
  const [otp, setOtp] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [countdown, setCountdown] = useState(30);
  const [canResend, setCanResend] = useState(false);

  const startResendTimer = () => {
    setCountdown(30);
    setCanResend(false);
    const timer = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(timer);
          setCanResend(true);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email');
      return;
    }
    setLoading(true);
    try {
      const { data } = await authService.forgotPassword({ email });
      if (data.success) {
        setStep('otp');
        startResendTimer();
        toast.success('OTP sent to your email');
      } else {
        toast.error(data.message || 'Failed to send OTP');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      toast.error('Please enter the 6-digit OTP');
      return;
    }
    setLoading(true);
    try {
      const { data } = await authService.verifyOTP({ email, otp });
      if (data.success) {
        setResetToken(data.data.resetToken);
        setStep('success');
        toast.success('OTP verified!');
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
    try {
      await authService.resendOTP({ email, type: 'passwordReset' });
      startResendTimer();
      toast.success('OTP resent');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resend OTP');
      setCanResend(true);
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
                  {step === 'email' ? 'Forgot Password' : step === 'otp' ? 'Verify OTP' : 'OTP Verified'}
                </h2>
                <p style={{ color: 'var(--ts)' }}>
                  {step === 'email' ? 'Enter your email to receive a reset OTP' : step === 'otp' ? 'Enter the 6-digit code sent to your email' : 'Choose your new password'}
                </p>
              </div>
              <div className="card border-0 rounded-3 p-4" style={{ background: 'var(--bc)' }}>
                {step === 'email' && (
                  <form onSubmit={handleSendOTP}>
                    <div className="mb-4">
                      <label className="form-label fw-medium" style={{ color: 'var(--tp)' }}>
                        <FontAwesomeIcon icon={faEnvelope} className="me-2" style={{ color: 'var(--ap)' }} />Email
                      </label>
                      <input
                        type="email" value={email} onChange={e => setEmail(e.target.value)}
                        className="form-control" placeholder="your@email.com"
                        style={{ background: 'var(--bs)', border: '1px solid var(--bdr)', color: 'var(--tp)' }}
                      />
                    </div>
                    <button type="submit" disabled={loading} className="btn w-100 fw-semibold py-2 border-0" style={{ background: 'var(--ap)', color: '#fff' }}>
                      {loading ? (
                        <><span className="spinner-border spinner-border-sm me-2" />Sending OTP...</>
                      ) : (
                        <><FontAwesomeIcon icon={faPaperPlane} className="me-2" />Send OTP</>
                      )}
                    </button>
                  </form>
                )}
                {step === 'otp' && (
                  <form onSubmit={handleVerifyOTP}>
                    <div className="mb-3">
                      <label className="form-label fw-medium" style={{ color: 'var(--tp)' }}>6-Digit OTP</label>
                      <input
                        type="text" inputMode="numeric" maxLength={6} value={otp}
                        onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        className="form-control text-center fw-bold" placeholder="000000"
                        style={{ background: 'var(--bs)', border: '2px solid var(--bdr)', color: 'var(--tp)', fontSize: '1.3rem', letterSpacing: '8px' }}
                      />
                    </div>
                    <button type="submit" disabled={loading} className="btn w-100 fw-semibold py-2 border-0" style={{ background: 'var(--ap)', color: '#fff' }}>
                      {loading ? (
                        <><span className="spinner-border spinner-border-sm me-2" />Verifying...</>
                      ) : (
                        <><FontAwesomeIcon icon={faCheckCircle} className="me-2" />Verify OTP</>
                      )}
                    </button>
                    <div className="text-center mt-3">
                      {canResend ? (
                        <button type="button" onClick={handleResend} className="btn btn-sm fw-semibold" style={{ color: 'var(--ap)', border: '1px solid var(--ap)', background: 'transparent' }}>
                          <FontAwesomeIcon icon={faRedo} className="me-1" />Resend OTP
                        </button>
                      ) : (
                        <p className="mb-0" style={{ color: 'var(--ts)', fontSize: '0.85rem' }}>
                          Resend in <span style={{ color: 'var(--ap)', fontWeight: 600 }}>{countdown}s</span>
                        </p>
                      )}
                    </div>
                  </form>
                )}
                {step === 'success' && (
                  <div className="text-center py-3">
                    <FontAwesomeIcon icon={faCheckCircle} size="3x" style={{ color: '#10b981' }} />
                    <h5 className="fw-bold mt-3" style={{ color: 'var(--tp)' }}>OTP Verified!</h5>
                    <p style={{ color: 'var(--ts)', fontSize: '0.9rem' }}>You can now reset your password.</p>
                    <button onClick={() => router.push(`/reset-password?token=${resetToken}`)} className="btn fw-semibold px-4 py-2 border-0 mt-2" style={{ background: 'var(--ap)', color: '#fff' }}>
                      Reset Password
                    </button>
                  </div>
                )}
                <p className="text-center mt-3 mb-0" style={{ color: 'var(--ts)', fontSize: '0.9rem' }}>
                  <Link href="/login" style={{ color: 'var(--ap)' }}>
                    <FontAwesomeIcon icon={faArrowLeft} className="me-1" />Back to Login
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </GuestRoute>
  );
}

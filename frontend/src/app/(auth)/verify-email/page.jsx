'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import authService from '@/services/authService';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faTimesCircle, faSpinner, faArrowLeft } from '@fortawesome/free-solid-svg-icons';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    if (!token) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStatus('error');
      return;
    }
    const verify = async () => {
      try {
        const { data } = await authService.verifyEmail(token);
        if (data.success) {
          setStatus('success');
        } else {
          setStatus('error');
        }
      } catch (err) {
        setStatus('error');
      }
    };
    verify();
  }, [token]);

  return (
    <section style={{ background: 'var(--bs)', minHeight: '100vh' }} className="d-flex align-items-center">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-5 col-md-7 text-center">
            <div className="card border-0 rounded-3 p-5" style={{ background: 'var(--bc)' }}>
              {status === 'loading' && (
                <>
                  <FontAwesomeIcon icon={faSpinner} spin size="3x" style={{ color: 'var(--ap)' }} />
                  <h4 className="fw-bold mt-4" style={{ color: 'var(--tp)' }}>Verifying your email...</h4>
                  <p style={{ color: 'var(--ts)' }}>Please wait while we verify your email address.</p>
                </>
              )}
              {status === 'success' && (
                <>
                  <FontAwesomeIcon icon={faCheckCircle} size="3x" style={{ color: '#10b981' }} />
                  <h4 className="fw-bold mt-4" style={{ color: 'var(--tp)' }}>Email Verified!</h4>
                  <p style={{ color: 'var(--ts)' }}>Your email has been successfully verified. You can now sign in.</p>
                  <button onClick={() => router.push('/login')} className="btn fw-semibold px-4 py-2 border-0 mt-2" style={{ background: 'var(--bt)', color: '#fff' }}>
                    Go to Login
                  </button>
                </>
              )}
              {status === 'error' && (
                <>
                  <FontAwesomeIcon icon={faTimesCircle} size="3x" style={{ color: '#ef4444' }} />
                  <h4 className="fw-bold mt-4" style={{ color: 'var(--tp)' }}>Verification Failed</h4>
                  <p style={{ color: 'var(--ts)' }}>The verification link is invalid or expired.</p>
                  <Link href="/" className="btn mt-2" style={{ border: '1px solid var(--ap)', color: 'var(--ap)', background: 'transparent' }}>
                    <FontAwesomeIcon icon={faArrowLeft} className="me-2" />Go Home
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <section style={{ background: 'var(--bs)', minHeight: '100vh' }} className="d-flex align-items-center justify-content-center">
        <div className="spinner-border" style={{ color: 'var(--ap)' }} role="status" />
      </section>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}

'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

const specialties = [
  'Full-Stack Web Development',
  'React & Next.js Expert',
  'Node.js Backend Development',
  'Cloud & DevOps Solutions',
  'API Design & Development',
  'Database Architecture'
];

export default function HeroSection() {
  const [text, setText] = useState('');
  const [index, setIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);

  const type = useCallback(() => {
    const current = specialties[index];
    if (!deleting) {
      if (charIndex < current.length) {
        setText(current.slice(0, charIndex + 1));
        setCharIndex(c => c + 1);
      } else {
        setTimeout(() => setDeleting(true), 2000);
        return;
      }
    } else {
      if (charIndex > 0) {
        setText(current.slice(0, charIndex - 1));
        setCharIndex(c => c - 1);
      } else {
        setDeleting(false);
        setIndex((i) => (i + 1) % specialties.length);
        return;
      }
    }
  }, [index, charIndex, deleting]);

  useEffect(() => {
    const speed = deleting ? 40 : 80;
    const timer = setTimeout(type, speed);
    return () => clearTimeout(timer);
  }, [type, deleting]);

  return (
    <section className="position-relative overflow-hidden d-flex align-items-center" style={{ background: 'var(--bp)', minHeight: '70vh' }}>
      <div className="position-absolute top-0 start-0 w-100 h-100" style={{ overflow: 'hidden', zIndex: 0 }}>
        <div className="position-absolute rounded-circle opacity-25" style={{ width: '400px', height: '400px', background: 'radial-gradient(circle, var(--ap), transparent)', top: '-10%', left: '-5%', filter: 'blur(60px)' }} />
        <div className="position-absolute rounded-circle opacity-25" style={{ width: '350px', height: '350px', background: 'radial-gradient(circle, #2563eb, transparent)', top: '20%', right: '-5%', filter: 'blur(50px)' }} />
        <div className="position-absolute rounded-circle opacity-20" style={{ width: '300px', height: '300px', background: 'radial-gradient(circle, #06b6d4, transparent)', bottom: '-5%', left: '30%', filter: 'blur(40px)' }} />
      </div>

      <div className="container position-relative" style={{ zIndex: 1 }}>
        <div className="row justify-content-center text-center">
          <div className="col-lg-8 col-xl-7">
            <p className="text-uppercase fw-semibold mb-3" style={{ color: 'var(--ap)', letterSpacing: '3px', fontSize: '0.875rem' }}>
              Welcome to My Portfolio
            </p>
            <h1 className="display-4 fw-bold mb-2" style={{
              background: 'var(--gm)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              Arsalan Akhtar
            </h1>
            <p className="fs-5 fw-medium mb-2" style={{ color: 'var(--ts)' }}>
              Full-Stack Software Engineer
            </p>
            <div className="mb-3" style={{ minHeight: '1.8rem' }}>
              <span className="fs-5" style={{ color: 'var(--tp)' }}>
                <span style={{ borderRight: '2px solid var(--ap)', paddingRight: '4px' }}>{text}</span>
                <span className="animate-blink" style={{ color: 'var(--ap)' }}>|</span>
              </span>
            </div>
            <div className="d-flex gap-3 justify-content-center flex-wrap">
              <Link href="/projects" className="btn btn-lg px-4 py-2 fw-semibold border-0" style={{ background: 'var(--gm)', color: '#fff' }}>
                View Projects
              </Link>
              <Link href="/contact" className="btn btn-lg px-4 py-2 fw-semibold" style={{ border: '2px solid var(--ap)', color: 'var(--ap)', background: 'transparent' }}>
                Contact Me
              </Link>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        .animate-blink {
          animation: blink 1s step-end infinite;
        }
      `}</style>
    </section>
  );
}

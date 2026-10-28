'use client';
import Link from 'next/link';

export default function CTASection() {
  return (
    <section className="py-5 position-relative overflow-hidden" style={{
      background: 'linear-gradient(135deg, #7c3aed, #2563eb, #06b6d4)'
    }}>
      <div className="position-absolute top-0 start-0 w-100 h-100 opacity-10" style={{
        backgroundImage: 'radial-gradient(circle at 20% 50%, #fff 1px, transparent 1px)',
        backgroundSize: '30px 30px'
      }} />
      <div className="container position-relative" style={{ zIndex: 1 }}>
        <div className="row justify-content-center text-center">
          <div className="col-lg-8">
            <h2 className="display-5 fw-bold text-white mb-3">Lets Work Together</h2>
            <p className="fs-5 mb-4 text-white opacity-90">
              Have a project in mind? Lets discuss how I can help you bring your ideas to life.
            </p>
            <div className="d-flex gap-3 justify-content-center flex-wrap">
              <Link href="/contact" className="btn btn-lg px-5 py-3 fw-semibold text-dark" style={{ background: '#fff', border: 'none' }}>
                Get In Touch
              </Link>
              <Link href="/projects" className="btn btn-lg px-5 py-3 fw-semibold text-white" style={{ border: '2px solid #fff', background: 'transparent' }}>
                View My Work
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

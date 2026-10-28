'use client';
export default function LoadingSpinner({ size = 'md', text = 'Loading...' }) {
  const sizes = { sm: '1rem', md: '2rem', lg: '3rem' };
  return (
    <div className="d-flex flex-column align-items-center justify-content-center py-5">
      <div className="spinner-border" role="status" style={{ width: sizes[size], height: sizes[size], color: 'var(--ap)' }}>
        <span className="visually-hidden">{text}</span>
      </div>
      <p className="mt-2" style={{ color: 'var(--ts)', fontSize: '0.85rem' }}>{text}</p>
    </div>
  );
}

'use client';
import Link from 'next/link';
import { getImageUrl, truncateText, formatCurrency } from '../../utils/helpers';

export default function ServiceCard({ service }) {
  const rating = service.rating || 0;

  return (
    <div className="card h-100 border-0 rounded-3 overflow-hidden" style={{ background: 'var(--bs)' }}>
      <div className="position-relative overflow-hidden" style={{ height: '220px' }}>
        <img
          src={getImageUrl(service.pictures?.find(p => p && (p.startsWith('http://') || p.startsWith('https://'))) || service.pictures?.[0] || service.images?.[0] || service.image)}
          alt={service.title}
          className="w-100 h-100"
          style={{ objectFit: 'cover', transition: 'transform 0.3s' }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        />
        {service.category && (
          <span className="position-absolute top-0 start-0 m-2 badge rounded-pill px-3 py-2 fw-normal" style={{ background: 'var(--ap)', color: '#fff' }}>
            {service.category.category_title || service.category.name || ''}
          </span>
        )}
        {rating > 0 && (
          <span className="position-absolute top-0 end-0 m-2 badge rounded-pill px-3 py-2 fw-normal" style={{ background: '#f59e0b', color: '#000' }}>
            {'★'.repeat(Math.round(rating))}{'☆'.repeat(5 - Math.round(rating))}
          </span>
        )}
      </div>
      <div className="card-body d-flex flex-column">
        <h5 className="fw-bold mb-2" style={{ color: '#fff' }}>{truncateText(service.title, 50)}</h5>
        <p className="card-text flex-grow-1" style={{ color: 'var(--ts)', fontSize: '0.9rem' }}>
          {truncateText(service.description, 100)}
        </p>
        <div className="d-flex justify-content-between align-items-center mt-auto pt-3 border-top border-secondary border-opacity-25">
          <span className="fw-bold fs-5" style={{ color: 'var(--ap)' }}>
            {service.price ? formatCurrency(service.price) : 'Contact for price'}
          </span>
          <Link
            href={`/services/${service.slug || service._id}`}
            className="btn fw-semibold px-3 py-2"
            style={{ border: '1px solid var(--ap)', color: 'var(--ap)', background: 'transparent' }}
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}

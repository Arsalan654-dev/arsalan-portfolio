'use client';
import Link from 'next/link';
import { getImageUrl, truncateText, formatCurrency } from '../../utils/helpers';
import { RATING_LABELS } from '../../utils/constants';

export default function ProjectCard({ project }) {
  const rating = project.rating || 0;

  return (
    <div className="card h-100 border-0 rounded-3 overflow-hidden" style={{ background: 'var(--bs)' }}>
      <div className="position-relative overflow-hidden" style={{ height: '220px' }}>
        <img
          src={getImageUrl(project.pictures?.find(p => p && (p.startsWith('http://') || p.startsWith('https://'))) || project.pictures?.[0] || project.images?.[0] || project.image)}
          alt={project.title}
          className="w-100 h-100"
          style={{ objectFit: 'cover', transition: 'transform 0.3s' }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        />
        {project.category && (
          <span className="position-absolute top-0 start-0 m-2 badge rounded-pill px-3 py-2 fw-normal" style={{ background: 'var(--ap)', color: '#fff' }}>
            {project.category.category_title || project.category.name || ''}
          </span>
        )}
        {rating > 0 && (
          <span className="position-absolute top-0 end-0 m-2 badge rounded-pill px-3 py-2 fw-normal" style={{ background: '#f59e0b', color: '#000' }}>
            {'★'.repeat(Math.round(rating))}{'☆'.repeat(5 - Math.round(rating))}
          </span>
        )}
      </div>
      <div className="card-body d-flex flex-column">
        <h5 className="fw-bold mb-2" style={{ color: '#fff' }}>{truncateText(project.title, 50)}</h5>
        <p className="card-text flex-grow-1" style={{ color: 'var(--ts)', fontSize: '0.9rem' }}>
          {truncateText(project.description, 100)}
        </p>
        <div className="d-flex justify-content-between align-items-center mt-auto pt-3 border-top border-secondary border-opacity-25">
          <span className="fw-bold fs-5" style={{ color: 'var(--ap)' }}>
            {project.price ? formatCurrency(project.price) : 'Contact for price'}
          </span>
          <Link
            href={`/projects/${project.slug || project._id}`}
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

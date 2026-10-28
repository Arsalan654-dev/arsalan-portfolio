'use client';
export default function Pagination({ page, totalPages, totalItems, perPage, onPageChange }) {
  const pages = [];
  const start = Math.max(1, page - 2);
  const end = Math.min(totalPages, page + 2);
  for (let i = start; i <= end; i++) pages.push(i);

  const limit = perPage || 10;
  const from = totalItems ? (page - 1) * limit + 1 : 0;
  const to = totalItems ? Math.min(page * limit, totalItems) : 0;

  return (
    <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mt-3">
      <span style={{ color: 'var(--ts)', fontSize: '0.85rem' }}>
        {totalItems ? (
          <>Showing {from} to {to} of {totalItems} entries</>
        ) : (
          <>Page {page} of {totalPages}</>
        )}
      </span>
      <nav>
        <ul className="pagination mb-0">
          <li className={`page-item ${page <= 1 ? 'disabled' : ''}`}>
            <button className="page-link" onClick={() => onPageChange(page - 1)} style={{ background: 'var(--bs)', color: 'var(--tp)', borderColor: 'var(--bdr)' }}>Previous</button>
          </li>
          {pages.map(p => (
            <li key={p} className={`page-item ${p === page ? 'active' : ''}`}>
              <button className="page-link" onClick={() => onPageChange(p)} style={{ background: p === page ? 'var(--ap)' : 'var(--bs)', color: p === page ? '#fff' : 'var(--tp)', borderColor: 'var(--bdr)' }}>{p}</button>
            </li>
          ))}
          <li className={`page-item ${page >= totalPages ? 'disabled' : ''}`}>
            <button className="page-link" onClick={() => onPageChange(page + 1)} style={{ background: 'var(--bs)', color: 'var(--tp)', borderColor: 'var(--bdr)' }}>Next</button>
          </li>
        </ul>
      </nav>
    </div>
  );
}

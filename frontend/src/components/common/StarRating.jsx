'use client';
import { useState } from 'react';

export default function StarRating({ value = 0, onChange, readOnly = false, max = 5, size = '1.2rem' }) {
  const [hover, setHover] = useState(0);

  const displayValue = hover || value;

  const stars = Array.from({ length: max }, (_, i) => i + 1);

  return (
    <div className="d-inline-flex align-items-center gap-1">
      {stars.map((star) => {
        const filled = star <= Math.floor(displayValue);
        const half = !filled && star === Math.ceil(displayValue) && displayValue % 1 >= 0.25;

        return (
          <span
            key={star}
            onMouseEnter={() => !readOnly && setHover(star)}
            onMouseLeave={() => !readOnly && setHover(0)}
            onClick={() => {
              if (!readOnly && onChange) onChange(star);
            }}
            style={{
              cursor: readOnly ? 'default' : 'pointer',
              fontSize: size,
              color: filled || half ? '#ffc107' : 'var(--bdr)',
              position: 'relative',
              display: 'inline-block',
              userSelect: 'none'
          }}
          >
            {half ? (
              <>
                <i className="fas fa-star" style={{ color: 'var(--bdr)', position: 'absolute', left: 0, top: 0 }}></i>
                <i className="fas fa-star-half-alt" style={{ color: '#ffc107', position: 'relative' }}></i>
              </>
            ) : (
              <i className={`fas fa-star${filled ? '' : ' far'}`} style={{ color: filled ? '#ffc107' : 'var(--bdr)' }}></i>
            )}
          </span>
        );
      })}
      {value > 0 && (
        <span className="ms-1" style={{ color: 'var(--ts)', fontSize: '0.85rem' }}>
          {value.toFixed(1)}
        </span>
      )}
    </div>
  );
}

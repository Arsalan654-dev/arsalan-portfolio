'use client';
import { useState, useEffect, useRef } from 'react';
export default function SearchBar({ placeholder, onSearch, value: externalValue, live = true, debounceMs = 400 }) {
  const [value, setValue] = useState(externalValue || '');
  const timerRef = useRef(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (externalValue !== undefined) setValue(externalValue);
  }, [externalValue]);

  useEffect(() => {
    if (!live) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      if (value !== externalValue) onSearch(value);
    }, debounceMs);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [value, live, debounceMs]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (timerRef.current) clearTimeout(timerRef.current);
    onSearch(value);
  };

  return (
    <form onSubmit={handleSubmit} className="d-flex gap-2">
      <input
        type="text"
        className="form-control"
        placeholder={placeholder || 'Search...'}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        style={{ background: 'var(--bs)', color: 'var(--tp)', borderColor: 'var(--bdr)', maxWidth: '300px' }}
      />
      <button type="submit" className="btn" style={{ background: 'var(--gm)', color: '#fff', border: 'none' }}>
        <i className="fas fa-search"></i>
      </button>
    </form>
  );
}

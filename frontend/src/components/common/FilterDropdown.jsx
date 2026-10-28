'use client';
export default function FilterDropdown({ label, options, value, onChange }) {
  return (
    <select
      className="form-select"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{ background: 'var(--bs)', color: 'var(--tp)', borderColor: 'var(--bdr)', maxWidth: '200px' }}
    >
      <option value="">{label || 'All'}</option>
      {options?.map((opt) => (
        <option key={opt.value || opt} value={opt.value || opt}>{opt.label || opt}</option>
      ))}
    </select>
  );
}

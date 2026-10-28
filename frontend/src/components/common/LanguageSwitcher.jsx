'use client';
import { useDispatch, useSelector } from 'react-redux';
import { setLanguage } from '../../redux/slices/langSlice';
export default function LanguageSwitcher() {
  const lang = useSelector((state) => state.lang.lang);
  const dispatch = useDispatch();
  const languages = [
    { code: 'en', label: 'EN' },
    { code: 'ur', label: 'اردو' },
    { code: 'ar', label: 'العربية' }
  ];
  return (
    <select value={lang} onChange={(e) => dispatch(setLanguage(e.target.value))}
      className="form-select form-select-sm"
      style={{ background: 'var(--bs)', color: 'var(--tp)', borderColor: 'var(--bdr)', width: 'auto', cursor: 'pointer' }}>
      {languages.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
    </select>
  );
}

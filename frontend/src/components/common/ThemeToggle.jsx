'use client';
import { useSelector, useDispatch } from 'react-redux';
import { toggleTheme } from '../../redux/slices/themeSlice';
export default function ThemeToggle() {
  const theme = useSelector((state) => state.theme.theme);
  const dispatch = useDispatch();
  return (
    <button className="tbtn" onClick={() => dispatch(toggleTheme())} title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      style={{ background: 'var(--bt)', border: '1px solid var(--bdr)', color: 'var(--tp)', width: '36px', height: '36px', borderRadius: '9px', cursor: 'pointer' }}>
      <i className={`fas fa-${theme === 'dark' ? 'moon' : 'sun'}`}></i>
    </button>
  );
}

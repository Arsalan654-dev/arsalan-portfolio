'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import { useTheme } from '@/hooks/useTheme';
import { useLanguage } from '@/hooks/useLanguage';
import { logout } from '@/redux/slices/authSlice';
import { setAccessToken } from '@/services/axiosInstance';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBars, faSun, faMoon, faGlobe, faBell, faSignOutAlt,
  faUser, faCog,
} from '@fortawesome/free-solid-svg-icons';

export default function AdminHeader({ onToggleSidebar, title }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { theme, toggleTheme } = useTheme();
  const { lang, changeLanguage } = useLanguage();
  const { user } = useSelector((state) => state.auth);
  const [langOpen, setLangOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const headerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (headerRef.current && !headerRef.current.contains(e.target)) {
        setLangOpen(false);
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    setAccessToken(null);
    toast.success(t('common.loggedOut'));
    window.location.href = '/login';
  };

  return (
    <header ref={headerRef} className="admin-header">
      <div className="header-left">
        <button className="mobile-menu-toggle" onClick={onToggleSidebar}>
          <FontAwesomeIcon icon={faBars} />
        </button>
        {title && <span className="page-title d-none d-md-block">{title}</span>}
      </div>

      <div className="header-right">
        <button className="header-notification-btn" onClick={() => toast.success(t('common.notifications'))}>
          <FontAwesomeIcon icon={faBell} />
          <span className="notif-dot" />
        </button>

        <div className="position-relative d-inline-block">
          <button
            className="btn btn-sm d-flex align-items-center gap-1 rounded-pill"
            style={{
              background: 'rgba(139, 92, 246, 0.1)',
              color: 'var(--ap)',
              border: '1px solid var(--bdr)',
              padding: '0.35rem 0.75rem',
              fontSize: '0.8rem',
            }}
            onClick={() => { setLangOpen(!langOpen); setProfileOpen(false); }}>
            <FontAwesomeIcon icon={faGlobe} size="sm" />
            <span className="text-uppercase d-none d-sm-inline">{lang}</span>
          </button>
          {langOpen && (
            <ul className="dropdown-menu dropdown-menu-end show"
              style={{
                border: '1px solid var(--bdr)',
                boxShadow: 'var(--sgm)',
                position: 'absolute',
                top: '100%',
                right: 0,
                zIndex: 1060,
                minWidth: '120px',
              }}>
              {['en', 'ur', 'ar'].map((l) => (
                <li key={l}>
                  <button
                    className={`dropdown-item ${lang === l ? 'active' : ''}`}
                    onClick={() => { changeLanguage(l); setLangOpen(false); }}>
                    {l === 'en' ? 'English' : l === 'ur' ? 'اردو' : 'العربية'}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <button className="header-notification-btn" onClick={toggleTheme}>
          <FontAwesomeIcon icon={theme === 'dark' ? faSun : faMoon} />
        </button>

        <div className="position-relative d-inline-block">
          <button
            className="header-user-menu"
            onClick={() => { setProfileOpen(!profileOpen); setLangOpen(false); }}>
            <span className="user-avatar rounded-circle d-flex align-items-center justify-content-center"
              style={{
                width: '32px', height: '32px',
                background: 'var(--gm)',
                color: '#fff',
                fontSize: '0.8rem',
                fontWeight: 600,
              }}>
              {user?.name?.charAt(0)?.toUpperCase() || 'A'}
            </span>
            <span className="user-name d-none d-md-inline">{user?.name || t('nav.profile')}</span>
          </button>
          {profileOpen && (
            <ul className="dropdown-menu dropdown-menu-end show"
              style={{
                border: '1px solid var(--bdr)',
                boxShadow: 'var(--sgm)',
                position: 'absolute',
                top: '100%',
                right: 0,
                zIndex: 1060,
                minWidth: '180px',
              }}>
              <li>
                <Link className="dropdown-item d-flex align-items-center gap-2" href="/admin/profile"
                  onClick={() => setProfileOpen(false)}>
                  <FontAwesomeIcon icon={faUser} size="sm" />
                  {t('nav.profile')}
                </Link>
              </li>
              <li>
                <Link className="dropdown-item d-flex align-items-center gap-2" href="/admin/settings"
                  onClick={() => setProfileOpen(false)}>
                  <FontAwesomeIcon icon={faCog} size="sm" />
                  {t('nav.settings')}
                </Link>
              </li>
              <li><hr className="dropdown-divider" /></li>
              <li>
                <button className="dropdown-item d-flex align-items-center gap-2" style={{ color: 'var(--er)' }}
                  onClick={handleLogout}>
                  <FontAwesomeIcon icon={faSignOutAlt} size="sm" />
                  {t('nav.logout')}
                </button>
              </li>
            </ul>
          )}
        </div>
      </div>

      <style>{`
        .admin-header .dropdown-menu.show {
          background-color: var(--bs) !important;
          border-color: var(--bdr) !important;
        }
        .admin-header .dropdown-item {
          color: var(--tp) !important;
        }
        .admin-header .dropdown-item:hover {
          background-color: var(--bt) !important;
          color: var(--apl) !important;
        }
        .admin-header .dropdown-item.active {
          background-color: var(--ap) !important;
          color: #fff !important;
        }
        .admin-header .dropdown-divider {
          border-color: var(--bdr) !important;
        }
      `}</style>
    </header>
  );
}

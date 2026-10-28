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
import { faSun, faMoon, faSearch, faShoppingCart, faUser, faSignOutAlt, faSignInAlt, faUserPlus, faBars, faTimes, faGlobe } from '@fortawesome/free-solid-svg-icons';

export default function Navbar() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { theme, toggleTheme } = useTheme();
  const { lang, changeLanguage } = useLanguage();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const cartItems = useSelector((state) => state.cart.items);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [profileOpen, setProfileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const navRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setProfileOpen(false);
        setLangOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    setAccessToken(null);
    toast.success(t('common.loggedOut'));
    setProfileOpen(false);
    window.location.href = '/login';
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/projects?search=${encodeURIComponent(searchQuery.trim())}`;
      setSearchQuery('');
      setSearchOpen(false);
    }
  };

  const navLinks = [
    { label: t('nav.home'), href: '/' },
    { label: t('nav.projects'), href: '/projects' },
    { label: t('nav.services'), href: '/services' },
    { label: t('nav.about'), href: '/about' },
    { label: t('nav.contact'), href: '/contact' },
    { label: t('nav.blogs'), href: '/blogs' },
    { label: t('nav.gallery'), href: '/gallery' },
  ];

  const isDark = theme === 'dark';

  return (
    <nav ref={navRef}
      className={`navbar navbar-expand-lg fixed-top ${isDark ? 'navbar-dark' : 'navbar-light'}`}
      style={{
        background: isDark ? 'rgba(15,15,15,0.92)' : 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(12px)',
        borderBottom: `1px solid ${isDark ? 'rgba(139,92,246,0.2)' : 'rgba(56,189,248,0.2)'}`,
        boxShadow: isDark ? '0 1px 10px rgba(139,92,246,0.1)' : '0 1px 10px rgba(56,189,248,0.08)',
        padding: '0.5rem 0',
        zIndex: 1050,
      }}>
      <div className="container-fluid px-3 px-lg-4">
        <div className="d-flex align-items-center justify-content-between w-100" style={{ gap: '0.75rem' }}>

          {/* Left: Brand + Hamburger */}
          <div className="d-flex align-items-center flex-shrink-0">
            <Link className="navbar-brand fw-bold fs-5 mb-0" href="/" style={{
              background: 'linear-gradient(135deg, #8b5cf6, #38bdf8)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              whiteSpace: 'nowrap',
            }}>
              Arsalan Jaffri
            </Link>
            <button className="navbar-toggler border-0 ms-1 d-lg-none p-1" type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              style={{ color: isDark ? '#38bdf8' : '#8b5cf6', fontSize: '1rem' }}>
              <FontAwesomeIcon icon={menuOpen ? faTimes : faBars} />
            </button>
          </div>

          {/* Center: Nav links (desktop) */}
          <div className="d-none d-lg-flex align-items-center mx-auto" style={{ gap: '0.15rem' }}>
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}
                className="nav-link px-2 py-1"
                style={{ color: isDark ? '#aaa' : '#666', fontSize: '0.875rem', whiteSpace: 'nowrap', transition: 'all 0.2s', borderRadius: '6px' }}
                onMouseEnter={e => { e.target.style.color = '#fff'; e.target.style.background = 'linear-gradient(135deg, #8b5cf6, #38bdf8)'; }}
                onMouseLeave={e => { e.target.style.color = isDark ? '#aaa' : '#666'; e.target.style.background = 'transparent'; }}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right: All actions in one line */}
          <div className="d-flex align-items-center flex-shrink-0" style={{ gap: '0.35rem' }}>
            {/* Search */}
            <button className="btn p-1 rounded-circle d-flex align-items-center justify-content-center"
              style={{ color: isDark ? '#38bdf8' : '#8b5cf6', width: '32px', height: '32px', background: 'transparent', border: 'none' }}
              onClick={() => setSearchOpen(!searchOpen)}>
              <FontAwesomeIcon icon={faSearch} size="sm" />
            </button>

            {/* Theme */}
            <button className="btn p-1 rounded-circle d-flex align-items-center justify-content-center"
              style={{ color: isDark ? '#38bdf8' : '#8b5cf6', width: '32px', height: '32px', background: 'transparent', border: 'none' }}
              onClick={toggleTheme}>
              <FontAwesomeIcon icon={isDark ? faSun : faMoon} size="sm" />
            </button>

            {/* Language */}
            <div className="position-relative">
              <button className="btn p-1 rounded-circle d-flex align-items-center justify-content-center"
                style={{ color: isDark ? '#38bdf8' : '#8b5cf6', width: '32px', height: '32px', background: 'transparent', border: 'none' }}
                onClick={() => setLangOpen(!langOpen)}>
                <FontAwesomeIcon icon={faGlobe} size="sm" />
              </button>
              {langOpen && (
                <ul className="dropdown-menu dropdown-menu-end show" style={{
                  background: isDark ? '#1a1a1a' : '#fff', border: `1px solid ${isDark ? 'rgba(139,92,246,0.3)' : 'rgba(56,189,248,0.3)'}`, minWidth: '100px', padding: '0.25rem',
                }}>
                  {['en', 'ur', 'ar'].map((l) => (
                    <li key={l}>
                      <button className={`dropdown-item py-1 px-2 ${lang === l ? 'active' : ''}`} style={{
                        fontSize: '0.8rem', borderRadius: '4px',
                        background: lang === l ? 'linear-gradient(135deg, #8b5cf6, #38bdf8)' : 'transparent',
                        color: lang === l ? '#fff' : (isDark ? '#ccc' : '#555'),
                      }} onClick={() => { changeLanguage(l); setLangOpen(false); }}>
                        {l === 'en' ? 'EN' : l === 'ur' ? 'UR' : 'AR'}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Cart */}
            <Link href="/cart" className="btn p-1 rounded-circle d-flex align-items-center justify-content-center position-relative"
              style={{ color: isDark ? '#38bdf8' : '#8b5cf6', width: '32px', height: '32px', background: 'transparent', border: 'none' }}>
              <FontAwesomeIcon icon={faShoppingCart} size="sm" />
              {cartItems.length > 0 && (
                <span className="position-absolute badge rounded-pill" style={{
                  background: 'linear-gradient(135deg, #8b5cf6, #38bdf8)', color: '#fff',
                  fontSize: '0.55rem', top: '-2px', right: '-2px', minWidth: '14px', height: '14px', lineHeight: '14px', padding: '0 3px',
                }}>
                  {cartItems.length}
                </span>
              )}
            </Link>

            {/* Divider */}
            <div style={{ width: '1px', height: '20px', background: isDark ? 'rgba(139,92,246,0.3)' : 'rgba(56,189,248,0.3)' }} className="d-none d-sm-block mx-1"></div>

            {/* Auth buttons */}
            {isAuthenticated ? (
              <div className="position-relative">
                <button className="btn btn-sm rounded-pill d-flex align-items-center gap-1" style={{
                  background: 'linear-gradient(135deg, #8b5cf6, #38bdf8)', color: '#fff', border: 'none', padding: '0.3rem 0.75rem', fontSize: '0.8rem',
                }} onClick={() => setProfileOpen(!profileOpen)}>
                  <FontAwesomeIcon icon={faUser} size="xs" />
                  <span className="d-none d-md-inline">{user?.name?.split(' ')[0] || 'Profile'}</span>
                </button>
                {profileOpen && (
                  <ul className="dropdown-menu dropdown-menu-end show" style={{
                    background: isDark ? '#1a1a1a' : '#fff', border: `1px solid ${isDark ? 'rgba(139,92,246,0.3)' : 'rgba(56,189,248,0.3)'}`,
                  }}>
                    {user?.role === 'admin' && (
                      <li><Link className="dropdown-item" href="/admin/dashboard" style={{ color: isDark ? '#ccc' : '#555' }} onClick={() => setProfileOpen(false)}>
                        <FontAwesomeIcon icon={faUser} className="me-2" size="sm" />{t('nav.admin')}
                      </Link></li>
                    )}
                    <li><Link className="dropdown-item" href="/profile" style={{ color: isDark ? '#ccc' : '#555' }} onClick={() => setProfileOpen(false)}>
                      <FontAwesomeIcon icon={faUser} className="me-2" size="sm" />{t('nav.profile')}
                    </Link></li>
                    <li><button className="dropdown-item" style={{ color: isDark ? '#ccc' : '#555' }} onClick={handleLogout}>
                      <FontAwesomeIcon icon={faSignOutAlt} className="me-2" size="sm" />{t('nav.logout')}
                    </button></li>
                  </ul>
                )}
              </div>
            ) : (
              <div className="d-flex align-items-center" style={{ gap: '0.3rem' }}>
                <Link href="/login" className="btn btn-sm rounded-pill d-inline-flex align-items-center gap-1 text-decoration-none" style={{
                  color: isDark ? '#38bdf8' : '#8b5cf6', border: `1px solid ${isDark ? 'rgba(139,92,246,0.4)' : 'rgba(56,189,248,0.4)'}`,
                  background: 'transparent', padding: '0.3rem 0.7rem', fontSize: '0.8rem', whiteSpace: 'nowrap',
                }}>
                  <FontAwesomeIcon icon={faSignInAlt} size="xs" />
                  <span className="d-none d-sm-inline">{t('nav.login')}</span>
                </Link>
                <Link href="/signup" className="btn btn-sm rounded-pill d-inline-flex align-items-center gap-1 text-decoration-none" style={{
                  background: 'linear-gradient(135deg, #8b5cf6, #38bdf8)', color: '#fff', border: 'none',
                  padding: '0.3rem 0.7rem', fontSize: '0.8rem', whiteSpace: 'nowrap',
                }}>
                  <FontAwesomeIcon icon={faUserPlus} size="xs" />
                  <span className="d-none d-sm-inline">{t('nav.signup')}</span>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Search bar - expandable */}
        {searchOpen && (
          <div className="mt-2">
            <form onSubmit={handleSearch}>
              <div className="input-group input-group-sm" style={{ borderRadius: '20px', overflow: 'hidden', border: `1px solid ${isDark ? 'rgba(139,92,246,0.4)' : 'rgba(56,189,248,0.4)'}`, maxWidth: '400px', margin: '0 auto' }}>
                <input type="text" className="form-control border-0" style={{
                  background: isDark ? '#1a1a1a' : '#f8f9fa', color: isDark ? '#fff' : '#333', outline: 'none', boxShadow: 'none', fontSize: '0.85rem',
                }} placeholder={t('common.search')} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} autoFocus />
                <button className="btn border-0" type="submit" style={{ background: 'linear-gradient(135deg, #8b5cf6, #38bdf8)', color: '#fff', padding: '0 0.75rem' }}>
                  <FontAwesomeIcon icon={faSearch} size="sm" />
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Mobile menu */}
        {menuOpen && (
          <div className="d-lg-none mt-2 p-3" style={{
            background: isDark ? 'rgba(0,0,0,0.95)' : 'rgba(255,255,255,0.95)',
            borderRadius: '12px', border: `1px solid ${isDark ? 'rgba(139,92,246,0.3)' : 'rgba(56,189,248,0.3)'}`,
          }}>
            <ul className="list-unstyled mb-0">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="d-block py-2 px-3 rounded mb-1" style={{ color: isDark ? '#ccc' : '#555', textDecoration: 'none' }}
                    onClick={() => setMenuOpen(false)}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <style>{`
        .navbar-toggler:focus { box-shadow: none; }
        .nav-link:hover { color: #fff !important; }
        .dropdown-item:hover { background: linear-gradient(135deg, #8b5cf6, #38bdf8) !important; color: #fff !important; }
        .dropdown-item.active { background: linear-gradient(135deg, #8b5cf6, #38bdf8) !important; color: #fff !important; }
        ::placeholder { color: #888; opacity: 1; }
        @media (max-width: 575.98px) {
          .navbar-brand { font-size: 1rem !important; }
        }
      `}</style>
    </nav>
  );
}

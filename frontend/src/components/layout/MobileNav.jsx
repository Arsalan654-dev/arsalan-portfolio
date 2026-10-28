'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSelector } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHome, faProjectDiagram, faServicestack,
  faShoppingCart, faUser, faSignInAlt,
} from '@fortawesome/free-solid-svg-icons';

export default function MobileNav() {
  const pathname = usePathname();
  const theme = useSelector((state) => state.theme?.theme) || 'dark';
  const { isAuthenticated } = useSelector((state) => state.auth);
  const cartItems = useSelector((state) => state.cart.items);

  const navItems = [
    { label: 'Home', icon: faHome, href: '/' },
    { label: 'Projects', icon: faProjectDiagram, href: '/projects' },
    { label: 'Services', icon: faServicestack, href: '/services' },
    {
      label: 'Cart',
      icon: faShoppingCart,
      href: '/cart',
      badge: cartItems.length,
    },
    {
      label: isAuthenticated ? 'Profile' : 'Login',
      icon: isAuthenticated ? faUser : faSignInAlt,
      href: isAuthenticated ? '/profile' : '/login',
    },
  ];

  return (
    <nav
      className="d-lg-none position-fixed bottom-0 start-0 end-0"
      style={{
        background: theme === 'dark' ? 'rgba(0,0,0,0.95)' : 'rgba(255,255,255,0.95)',
        borderTop: `1px solid ${theme === 'dark' ? 'rgba(139, 92, 246, 0.3)' : 'rgba(56, 189, 248, 0.3)'}`,
        backdropFilter: 'blur(10px)',
        zIndex: 1030,
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}>
      <div className="d-flex align-items-center justify-content-around py-2">
        {navItems.map((item) => {
          const active = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="d-flex flex-column align-items-center text-decoration-none position-relative"
              style={{
                color: active ? '#fff' : (theme === 'dark' ? '#888' : '#999'),
                fontSize: '0.65rem',
                transition: 'all 0.2s ease',
                minWidth: '60px',
              }}>
              <span
                className="d-flex align-items-center justify-content-center rounded-circle"
                style={{
                  width: active ? '44px' : '36px',
                  height: active ? '44px' : '36px',
                  background: active
                    ? 'linear-gradient(135deg, #8b5cf6, #38bdf8)'
                    : 'transparent',
                  transition: 'all 0.2s ease',
                  marginBottom: '2px',
                }}>
                <FontAwesomeIcon icon={item.icon} size="sm"
                  style={{ fontSize: active ? '1rem' : '0.9rem' }} />
              </span>
              <span style={{ fontWeight: active ? 600 : 400 }}>{item.label}</span>

              {item.badge > 0 && (
                <span
                  className="position-absolute badge rounded-pill"
                  style={{
                    background: '#ef4444',
                    fontSize: '0.55rem',
                    top: '0px',
                    right: '6px',
                    minWidth: '16px',
                    height: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0 4px',
                  }}>
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

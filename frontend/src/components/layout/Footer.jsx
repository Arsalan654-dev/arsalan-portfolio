'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import axiosInstance from '../../services/axiosInstance';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowUp, faEnvelope, faMapMarkerAlt, faPhone } from '@fortawesome/free-solid-svg-icons';
import { faFacebookF, faTwitter, faLinkedinIn, faGithub, faInstagram, faYoutube } from '@fortawesome/free-brands-svg-icons';

export default function Footer() {
  const { t } = useTranslation();
  const theme = useSelector((state) => state.theme?.theme) || 'dark';
  const isDark = theme === 'dark';
  const [subEmail, setSubEmail] = useState('');
  const [subscribing, setSubscribing] = useState(false);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const quickLinks = [
    { label: t('nav.home'), href: '/' },
    { label: t('nav.projects'), href: '/projects' },
    { label: t('nav.services'), href: '/services' },
    { label: t('nav.about'), href: '/about' },
    { label: t('nav.contact'), href: '/contact' },
    { label: t('nav.blogs'), href: '/blogs' },
    { label: t('nav.gallery'), href: '/gallery' },
  ];

  const socialLinks = [
    { icon: faFacebookF, href: 'https://facebook.com', label: 'Facebook' },
    { icon: faTwitter, href: 'https://twitter.com', label: 'Twitter' },
    { icon: faLinkedinIn, href: 'https://linkedin.com', label: 'LinkedIn' },
    { icon: faGithub, href: 'https://github.com', label: 'GitHub' },
    { icon: faInstagram, href: 'https://instagram.com', label: 'Instagram' },
    { icon: faYoutube, href: 'https://youtube.com', label: 'YouTube' },
  ];

  const contactInfo = [
    { icon: faEnvelope, text: 'arsalan@example.com' },
    { icon: faPhone, text: '+92 300 1234567' },
    { icon: faMapMarkerAlt, text: 'Pakistan' },
  ];

  return (
    <footer
      style={{
        background: isDark ? '#000' : '#f8f9fa',
        borderTop: `1px solid ${isDark ? 'rgba(139, 92, 246, 0.2)' : 'rgba(56, 189, 248, 0.2)'}`,
        position: 'relative',
        transition: 'all 0.3s ease',
      }}>
      <div className="container-fluid px-4 py-5">
        <div className="row g-4">
          <div className="col-lg-4 col-md-6">
            <h5 className="fw-bold mb-3"
              style={{
                background: 'linear-gradient(135deg, #8b5cf6, #38bdf8)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
              Arsalan Portfolio
            </h5>
            <p style={{ color: isDark ? '#aaa' : '#666', fontSize: '0.9rem', lineHeight: 1.7 }}>
              {t('footer.footerDescription')}
            </p>
            <div className="d-flex gap-2 mt-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="d-inline-flex align-items-center justify-content-center rounded-circle text-decoration-none"
                  style={{
                    width: '38px',
                    height: '38px',
                    background: isDark ? 'rgba(139, 92, 246, 0.15)' : 'rgba(56, 189, 248, 0.15)',
                    color: isDark ? '#38bdf8' : '#8b5cf6',
                    border: `1px solid ${isDark ? 'rgba(139, 92, 246, 0.3)' : 'rgba(56, 189, 248, 0.3)'}`,
                    transition: 'all 0.3s ease',
                    fontSize: '0.9rem',
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = 'linear-gradient(135deg, #8b5cf6, #38bdf8)';
                    e.target.style.color = '#fff';
                    e.target.style.transform = 'translateY(-3px)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = isDark ? 'rgba(139, 92, 246, 0.15)' : 'rgba(56, 189, 248, 0.15)';
                    e.target.style.color = isDark ? '#38bdf8' : '#8b5cf6';
                    e.target.style.transform = 'translateY(0)';
                  }}
                  aria-label={social.label}>
                  <FontAwesomeIcon icon={social.icon} />
                </a>
              ))}
            </div>
          </div>

          <div className="col-lg-2 col-md-6">
            <h6 className="fw-bold mb-3"
              style={{ color: isDark ? '#fff' : '#333' }}>
              {t('footer.quickLinks')}
            </h6>
            <ul className="list-unstyled mb-0">
              {quickLinks.map((link) => (
                <li key={link.href} className="mb-2">
                  <Link href={link.href}
                    style={{
                      color: isDark ? '#aaa' : '#666',
                      textDecoration: 'none',
                      fontSize: '0.9rem',
                      transition: 'all 0.3s ease',
                    }}
                    onMouseEnter={(e) => { e.target.style.color = '#8b5cf6'; e.target.style.paddingLeft = '5px'; }}
                    onMouseLeave={(e) => { e.target.style.color = isDark ? '#aaa' : '#666'; e.target.style.paddingLeft = '0'; }}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-lg-3 col-md-6">
            <h6 className="fw-bold mb-3"
              style={{ color: isDark ? '#fff' : '#333' }}>
              {t('footer.contactInfo')}
            </h6>
            <ul className="list-unstyled mb-0">
              {contactInfo.map((item, index) => (
                <li key={index} className="mb-3 d-flex align-items-center gap-2"
                  style={{ color: isDark ? '#aaa' : '#666', fontSize: '0.9rem' }}>
                  <span
                    style={{
                      width: '32px',
                      height: '32px',
                      background: isDark ? 'rgba(139, 92, 246, 0.15)' : 'rgba(56, 189, 248, 0.15)',
                      borderRadius: '50%',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: isDark ? '#38bdf8' : '#8b5cf6',
                      flexShrink: 0,
                    }}>
                    <FontAwesomeIcon icon={item.icon} size="sm" />
                  </span>
                  <span>{item.text}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-lg-3 col-md-6">
            <h6 className="fw-bold mb-3"
              style={{ color: isDark ? '#fff' : '#333' }}>
              {t('footer.newsletter')}
            </h6>
            <p style={{ color: isDark ? '#aaa' : '#666', fontSize: '0.9rem' }}>
              {t('footer.newsletterDesc')}
            </p>
            <form onSubmit={async (e) => {
              e.preventDefault();
              if (!subEmail.trim()) return;
              setSubscribing(true);
              try {
                await axiosInstance.post('/public/subscribe', { email: subEmail });
                toast.success('Subscribed successfully!');
                setSubEmail('');
              } catch (err) {
                toast.error(err.response?.data?.message || 'Subscription failed');
              } finally { setSubscribing(false); }
            }}>
              <div className="input-group"
                style={{
                  borderRadius: '25px',
                  overflow: 'hidden',
                  border: `1px solid ${isDark ? 'rgba(139, 92, 246, 0.4)' : 'rgba(56, 189, 248, 0.4)'}`,
                }}>
                <input
                  type="email"
                  className="form-control border-0"
                  placeholder={t('footer.emailPlaceholder')}
                  value={subEmail}
                  onChange={(e) => setSubEmail(e.target.value)}
                  required
                  style={{
                    background: isDark ? '#1a1a1a' : '#eee',
                    color: isDark ? '#fff' : '#333',
                    outline: 'none',
                    boxShadow: 'none',
                    padding: '0.6rem 1rem',
                  }}
                />
                <button className="btn border-0 px-3 fw-semibold"
                  type="submit"
                  disabled={subscribing}
                  style={{
                    background: 'linear-gradient(135deg, #8b5cf6, #38bdf8)',
                    color: '#fff',
                    fontSize: '0.85rem',
                  }}>
                  {subscribing ? '...' : t('footer.subscribe')}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div
        style={{
          borderTop: `1px solid ${isDark ? 'rgba(139, 92, 246, 0.15)' : 'rgba(56, 189, 248, 0.15)'}`,
          padding: '1rem 0',
        }}>
        <div className="container-fluid px-4">
          <div className="row align-items-center">
            <div className="col-md-6 text-center text-md-start">
              <p className="mb-0" style={{ color: isDark ? '#888' : '#999', fontSize: '0.85rem' }}>
                &copy; {new Date().getFullYear()} {t('footer.copyright', { appName: 'Arsalan Portfolio' })}
              </p>
            </div>
            <div className="col-md-6 text-center text-md-end mt-2 mt-md-0">
              <p className="mb-0" style={{ color: isDark ? '#888' : '#999', fontSize: '0.85rem' }}>
                {t('footer.builtWith')}{' '}
                <span style={{
                  background: 'linear-gradient(135deg, #8b5cf6, #38bdf8)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  fontWeight: 600,
                }}>
                  {t('footer.love')}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={scrollToTop}
        className="btn rounded-circle position-fixed d-flex align-items-center justify-content-center"
        style={{
          width: '45px',
          height: '45px',
          background: 'linear-gradient(135deg, #8b5cf6, #38bdf8)',
          color: '#fff',
          border: 'none',
          bottom: '90px',
          right: '25px',
          zIndex: 999,
          boxShadow: '0 4px 15px rgba(139, 92, 246, 0.4)',
          transition: 'all 0.3s ease',
        }}
        onMouseEnter={(e) => { e.target.style.transform = 'translateY(-5px)'; e.target.style.boxShadow = '0 6px 20px rgba(139, 92, 246, 0.6)'; }}
        onMouseLeave={(e) => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = '0 4px 15px rgba(139, 92, 246, 0.4)'; }}
        aria-label={t('footer.backToTop')}>
        <FontAwesomeIcon icon={faArrowUp} />
      </button>
    </footer>
  );
}

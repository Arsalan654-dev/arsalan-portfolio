'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSelector } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTachometerAlt, faLayerGroup, faMicrochip, faCode, faTools,
  faProjectDiagram, faServer, faUsers, faGlobeAsia, faCity,
  faImages, faImages as faBanners, faShoppingBag, faTicketAlt,
  faInfoCircle, faBlog, faEnvelope, faRobot, faFileAlt, faUser,
  faChevronDown, faChevronRight, faTimes,
} from '@fortawesome/free-solid-svg-icons';

const menuGroups = [
  {
    title: 'main',
    items: [
      { label: 'Dashboard', icon: faTachometerAlt, href: '/admin/dashboard' },
    ],
  },
  {
    title: 'content',
    items: [
      { label: 'Categories', icon: faLayerGroup, href: '/admin/categories' },
      { label: 'Technologies', icon: faMicrochip, href: '/admin/technologies' },
      { label: 'Slugs', icon: faCode, href: '/admin/slugs' },
      { label: 'Skills', icon: faTools, href: '/admin/skills' },
      { label: 'Projects', icon: faProjectDiagram, href: '/admin/projects' },
      { label: 'Services', icon: faServer, href: '/admin/services' },
    ],
  },
  {
    title: 'users',
    items: [
      { label: 'Users', icon: faUsers, href: '/admin/users' },
      { label: 'Countries', icon: faGlobeAsia, href: '/admin/countries' },
      { label: 'Cities', icon: faCity, href: '/admin/cities' },
    ],
  },
  {
    title: 'media',
    items: [
      { label: 'Gallery', icon: faImages, href: '/admin/gallery' },
      { label: 'Banners', icon: faBanners, href: '/admin/banners' },
    ],
  },
  {
    title: 'orders',
    items: [
      { label: 'Orders', icon: faShoppingBag, href: '/admin/orders' },
      { label: 'Promo Codes', icon: faTicketAlt, href: '/admin/promo-codes' },
    ],
  },
  {
    title: 'pages',
    items: [
      { label: 'About', icon: faInfoCircle, href: '/admin/about' },
      { label: 'Blogs', icon: faBlog, href: '/admin/blogs' },
      { label: 'Contact Queries', icon: faEnvelope, href: '/admin/contact-queries' },
    ],
  },
  {
    title: 'extras',
    items: [
      { label: 'Chatbot', icon: faRobot, href: '/admin/chatbot' },
      { label: 'Resume', icon: faFileAlt, href: '/admin/resume' },
    ],
  },
  {
    title: 'account',
    items: [
      { label: 'Profile', icon: faUser, href: '/admin/profile' },
    ],
  },
];

export default function AdminSidebar({ isOpen, onClose }) {
  const pathname = usePathname();
  const theme = useSelector((state) => state.theme?.theme) || 'dark';
  const [expandedGroups, setExpandedGroups] = useState({});

  const toggleGroup = (title) => {
    setExpandedGroups((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  const isActive = (href) => pathname === href;

  return (
    <>
      {isOpen && (
        <div className="sidebar-overlay" onClick={onClose} />
      )}

      <aside className={`admin-sidebar ${isOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <Link href="/admin" className="sidebar-logo">
            <span className="logo-icon">A</span>
            <span>Admin Panel</span>
          </Link>
          <button className="sidebar-toggle d-lg-none" onClick={onClose}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        <div className="sidebar-nav">
          {menuGroups.map((group) => {
            const isGroupExpanded = expandedGroups[group.title] !== false;

            return (
              <div key={group.title} className="mb-1">
                <button
                  className="sidebar-nav-item justify-content-between"
                  onClick={() => toggleGroup(group.title)}>
                  <span className="sidebar-text">{group.title}</span>
                  <FontAwesomeIcon icon={isGroupExpanded ? faChevronDown : faChevronRight} size="xs" />
                </button>

                {isGroupExpanded && (
                  <div>
                    {group.items.map((item) => {
                      const active = isActive(item.href);

                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={`sidebar-nav-item ${active ? 'active' : ''}`}
                          onClick={onClose}>
                          <span className="nav-icon">
                            <FontAwesomeIcon icon={item.icon} size="sm" />
                          </span>
                          <span className="sidebar-text">{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </aside>
    </>
  );
}

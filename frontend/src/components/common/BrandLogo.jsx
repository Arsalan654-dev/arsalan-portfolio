'use client';

import { useSelector } from 'react-redux';

/**
 * Renders the official Jaffri's Tech Solutions logo.
 * The light artwork is used on dark surfaces and the dark artwork on light surfaces.
 *
 * @param {{
 *   variant?: 'full' | 'icon',
 *   height?: number | string,
 *   className?: string,
 *   style?: React.CSSProperties,
 *   alt?: string,
 * }} props
 */
export default function BrandLogo({
  variant = 'full',
  height = 40,
  className = '',
  style = {},
  alt = "Jaffri's Tech Solutions",
}) {
  const theme = useSelector((state) => state.theme?.theme) || 'dark';
  const artwork = theme === 'light' ? 'dark' : 'light';

  return (
    <img
      src={`/brand/logo-${variant}-${artwork}.png`}
      alt={alt}
      className={className}
      draggable={false}
      style={{
        display: 'block',
        height,
        width: 'auto',
        maxWidth: '100%',
        objectFit: 'contain',
        ...style,
      }}
    />
  );
}

'use client';

import { Link, useLocation } from 'react-router-dom';
// import { useState, useRef, useEffect } from 'react'
import { useState, useEffect } from 'react';
import { asset } from '../../lib/asset';
import styles from './Navbar.module.css';

export const NAV_BAR_HEIGHT = 64;

const NAV_ITEMS = [
  { href: '/', label: 'Home', exact: true as const },
  { href: '/checker', label: 'Checker', matchDiagram: true as const },
  { href: '/learn', label: 'Learn' },
  { href: '/project-starter', label: 'Project Starter' },
] as const;

function isNavItemActive(
  href: string,
  exact: boolean | undefined,
  matchDiagram: boolean | undefined,
  pathname: string
): boolean {
  if (exact) return pathname === href;
  if (matchDiagram) return pathname === href || pathname.startsWith(`${href}/`);
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function Navbar() {
  const pathname = useLocation().pathname;
  const [menuOpen, setMenuOpen] = useState(false);

  //   useEffect(() => {
  //     setMenuOpen(false)
  //   }, [pathname])

  useEffect(() => {
    if (!menuOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [menuOpen]);

  const navLinks = NAV_ITEMS.map(({ href, label, ...item }) => {
    const isActive = isNavItemActive(
      href,
      'exact' in item ? item.exact : false,
      'matchDiagram' in item ? item.matchDiagram : false,
      pathname
    );

    return (
      <Link
        key={href}
        to={href}
        className={`${styles.link} ${isActive ? styles.linkActive : ''}`}
        onClick={() => setMenuOpen(false)}
      >
        {label}
      </Link>
    );
  });

  return (
    <nav className={styles.navbar} aria-label="Main navigation">
      <Link
        to="/"
        className={styles.logo}
        aria-label="Home"
        onClick={() => setMenuOpen(false)}
      >
        <img
          src={asset('/logo_dark.svg')}
          alt=""
          width={36}
          height={36}
          className={styles.logoImage}
        />
        <span className={styles.logoText}>CAVE</span>
      </Link>

      <div className={styles.links}>{navLinks}</div>

      <button
        type="button"
        className={styles.menuButton}
        aria-label={menuOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={menuOpen}
        aria-controls="navbar-menu"
        onClick={() => setMenuOpen((open) => !open)}
      >
        <span
          className={`${styles.menuIcon} ${menuOpen ? styles.menuIconOpen : ''}`}
          aria-hidden
        >
          <span />
          <span />
          <span />
        </span>
      </button>

      {menuOpen && (
        <>
          <button
            type="button"
            className={styles.backdrop}
            aria-label="Close menu"
            onClick={() => setMenuOpen(false)}
          />
          <div id="navbar-menu" className={styles.menuPanel}>
            {navLinks}
          </div>
        </>
      )}
    </nav>
  );
}

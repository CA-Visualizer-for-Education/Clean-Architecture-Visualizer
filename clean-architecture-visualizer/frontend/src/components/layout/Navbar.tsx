'use client'

import { Link, useLocation } from 'react-router-dom'
import { useState, useRef, useEffect } from 'react'
import { asset } from '../../lib/asset'
import styles from './Navbar.module.css'

export const NAV_BAR_HEIGHT = 64

const NAV_ITEMS = [
  { href: '/', label: 'Home', exact: true as const },
  { href: '/checker', label: 'Checker', matchDiagram: true as const },
  { href: '/learning', label: 'Learn' },
  { href: '/project-starter', label: 'Project Starter' },
] as const

function isNavItemActive(
  href: string,
  exact: boolean | undefined,
  matchDiagram: boolean | undefined,
  pathname: string,
): boolean {
  if (exact) return pathname === href
  if (matchDiagram) return pathname === href || pathname.startsWith(`${href}/`)
  return pathname === href || pathname.startsWith(`${href}/`)
}

function FeedbackButton() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div ref={ref} className={styles.feedbackWrap}>
      <button className={styles.feedbackBtn} onClick={() => setOpen(o => !o)}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
          <circle cx="8" cy="9" r="4.5" stroke="currentColor" strokeWidth="1.4"/>
          <path d="M6 4.5C6 3.4 6.9 2.5 8 2.5C9.1 2.5 10 3.4 10 4.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
          <path d="M5 6.5L3.5 5M11 6.5L12.5 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
          <path d="M4 9H3M13 9H12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
          <path d="M8 7V9.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
          <circle cx="8" cy="10.5" r="0.5" fill="currentColor"/>
        </svg>
        Bug Report
      </button>

      {open && (
        <div className={styles.feedbackPopup}>
          <p className={styles.feedbackText}>
            If you run into a bug, please create an issue on our GitHub page.
          </p>
          <a
            href="https://github.com/CA-Visualizer-for-Education/cave-learn/issues"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.feedbackLink}
          >
            Open an issue →
          </a>
        </div>
      )}
    </div>
  )
}

export default function Navbar() {
  const pathname = useLocation().pathname;
  const [menuOpen, setMenuOpen] = useState(false)

//   useEffect(() => {
//     setMenuOpen(false)
//   }, [pathname])

  useEffect(() => {
    if (!menuOpen) return

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [menuOpen])

  const navLinks = NAV_ITEMS.map(({ href, label, ...item }) => {
    const isActive = isNavItemActive(
      href,
      'exact' in item ? item.exact : false,
      'matchDiagram' in item ? item.matchDiagram : false,
      pathname,
    )

    return (
      <Link
        key={href}
        to={href}
        className={`${styles.link} ${isActive ? styles.linkActive : ''}`}
        onClick={() => setMenuOpen(false)}
      >
        {label}
      </Link>
    )
  })

  return (
    <nav className={styles.navbar} aria-label="Main navigation">
      <Link to="/" className={styles.logo} aria-label="Home" onClick={() => setMenuOpen(false)}>
        <img src={asset('/logo_dark.svg')} alt="" width={36} height={36} className={styles.logoImage} />
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
  )
}

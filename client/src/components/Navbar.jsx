import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { LogoIcon, IconDoc, IconStar, IconCode, IconBarChart, IconBolt } from './Icons'
import './Navbar.css'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setMenuOpen(false)
    document.body.style.overflow = ''
  }, [location])

  const toggleMenu = () => {
    setMenuOpen(v => !v)
    document.body.style.overflow = menuOpen ? '' : 'hidden'
  }

  const closeMenu = () => {
    setMenuOpen(false)
    document.body.style.overflow = ''
  }

  return (
    <>
      <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="nav-inner">
          <Link to="/" className="nav-logo">
            <div className="logo-mark"><LogoIcon gradientId="navGrad" /></div>
            <span className="logo-text">Unix<span className="logo-x">X</span> Proxy</span>
            <div className="logo-status" />
          </Link>

          <div className="nav-center">
            <a href="/#features" className="nav-link">Features</a>
            <a href="/#endpoints" className="nav-link">API</a>
            <a href="/#stats" className="nav-link">Stats</a>
            <a href="/#quickstart" className="nav-link">Setup</a>
          </div>

          <div className="nav-right">
            <Link to="/docs" className="nav-cta">
              <IconDoc size={14} />
              <span>Docs</span>
            </Link>
          </div>

          <button className={`hamburger ${menuOpen ? 'active' : ''}`} onClick={toggleMenu} aria-label="Menu">
            <span /><span /><span />
          </button>
        </div>
      </nav>

      <div className={`mobile-overlay ${menuOpen ? 'active' : ''}`} onClick={closeMenu} />
      <div className={`mobile-drawer ${menuOpen ? 'active' : ''}`}>
        <div className="drawer-header">
          <Link to="/" className="nav-logo" onClick={closeMenu}>
            <div className="logo-mark"><LogoIcon gradientId="drawerGrad" /></div>
            <span className="logo-text">Unix<span className="logo-x">X</span> Proxy</span>
          </Link>
        </div>
        <div className="drawer-links">
          <a href="/#features" onClick={closeMenu}>
            <IconStar size={18} />
            <span>Features</span>
          </a>
          <a href="/#endpoints" onClick={closeMenu}>
            <IconCode size={18} />
            <span>API</span>
          </a>
          <a href="/#stats" onClick={closeMenu}>
            <IconBarChart size={18} />
            <span>Stats</span>
          </a>
          <a href="/#quickstart" onClick={closeMenu}>
            <IconBolt size={18} />
            <span>Setup</span>
          </a>
          <Link to="/docs" className="drawer-cta" onClick={closeMenu}>
            <IconDoc size={18} />
            <span>Documentation</span>
          </Link>
        </div>
      </div>
    </>
  )
}

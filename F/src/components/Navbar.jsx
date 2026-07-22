import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'

const navItems = [
    { label: 'Home',     path: '/'         },
    { label: 'About',    path: '/about'    },
    { label: 'Skills',   path: '/skills'   },
    { label: 'Projects', path: '/projects' },
]

function SunIcon() {
    return (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="5" />
            <line x1="12" y1="1" x2="12" y2="3" />
            <line x1="12" y1="21" x2="12" y2="23" />
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
            <line x1="1" y1="12" x2="3" y2="12" />
            <line x1="21" y1="12" x2="23" y2="12" />
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
    )
}

function MoonIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z" />
        </svg>
    )
}

export default function Navbar() {
    const [scrolled] = useState(false)
    const [open, setOpen]   = useState(false)
    const { theme, toggle } = useTheme()

    return (
        <nav
            className={`navbar${scrolled ? ' scrolled' : ''}`}
            role="navigation"
            aria-label="Main navigation"
        >
            <div className="navbar-inner">

                {/* Brand */}
                <NavLink to="/" className="nav-brand" aria-label="Go to home">
                    <div className="nav-logo-box">A</div>
                    <span className="nav-brand-name">Aayush<span>.dev</span></span>
                </NavLink>

                {/* Nav links */}
                <ul className={`nav-links${open ? ' open' : ''}`} role="list">
                    {navItems.map(item => (
                        <li key={item.path}>
                            <NavLink
                                to={item.path}
                                end={item.path === '/'}
                                className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
                                onClick={() => setOpen(false)}
                            >
                                {item.label}
                            </NavLink>
                        </li>
                    ))}
                    <li>
                        <NavLink
                            to="/contact"
                            className={({ isActive }) => `nav-link nav-cta${isActive ? ' active' : ''}`}
                            onClick={() => setOpen(false)}
                        >
                            Contact Me
                        </NavLink>
                    </li>
                </ul>

                {/* Right controls */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <button
                        className="theme-toggle"
                        onClick={toggle}
                        aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                        title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
                    >
                        {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
                    </button>

                    <button
                        className={`nav-hamburger${open ? ' open' : ''}`}
                        onClick={() => setOpen(o => !o)}
                        aria-label={open ? 'Close menu' : 'Open menu'}
                        aria-expanded={open}
                    >
                        <span /><span /><span />
                    </button>
                </div>

            </div>
        </nav>
    )
}

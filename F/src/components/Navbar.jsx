import { useState, useEffect } from 'react'
import { useTheme } from '../context/ThemeContext'

const navItems = [
    { label: 'Home',     id: 'home'     },
    { label: 'About',    id: 'about'    },
    { label: 'Skills',   id: 'skills'   },
    { label: 'Projects', id: 'projects' },
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

function scrollTo(id) {
    const el = document.getElementById(id)
    if (!el) return
    const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 68
    const top = el.getBoundingClientRect().top + window.scrollY - navH
    window.scrollTo({ top, behavior: 'smooth' })
}

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false)
    const [active, setActive]     = useState('home')
    const [open, setOpen]         = useState(false)
    const { theme, toggle }       = useTheme()

    useEffect(() => {
        const onScroll = () => {
            setScrolled(window.scrollY > 20)

            // Highlight active section based on scroll position
            const ids = ['home', 'about', 'skills', 'projects', 'contact']
            const navH = 68
            for (let i = ids.length - 1; i >= 0; i--) {
                const el = document.getElementById(ids[i])
                if (el && el.getBoundingClientRect().top <= navH + 40) {
                    setActive(ids[i])
                    break
                }
            }
        }
        window.addEventListener('scroll', onScroll, { passive: true })
        return () => window.removeEventListener('scroll', onScroll)
    }, [])

    const handleNav = (id) => {
        scrollTo(id)
        setOpen(false)
    }

    return (
        <nav
            className={`navbar${scrolled ? ' scrolled' : ''}`}
            role="navigation"
            aria-label="Main navigation"
        >
            <div className="navbar-inner">

                {/* Brand */}
                <button className="nav-brand" onClick={() => handleNav('home')} aria-label="Go to top">
                    <div className="nav-logo-box">A</div>
                    <span className="nav-brand-name">Aayush<span>.dev</span></span>
                </button>

                {/* Nav links */}
                <ul className={`nav-links${open ? ' open' : ''}`} role="list">
                    {navItems.map(item => (
                        <li key={item.id}>
                            <button
                                className={`nav-link${active === item.id ? ' active' : ''}`}
                                onClick={() => handleNav(item.id)}
                            >
                                {item.label}
                            </button>
                        </li>
                    ))}
                    <li>
                        <button
                            className={`nav-link nav-cta${active === 'contact' ? ' active' : ''}`}
                            onClick={() => handleNav('contact')}
                        >
                            Contact Me
                        </button>
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

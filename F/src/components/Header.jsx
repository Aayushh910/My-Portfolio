import { Link } from 'react-router-dom'
import { useState } from 'react'

function Header() {
  const [open, setOpen] = useState(false)

  return (
    <header className="site-header">
      <Link className="brand-button" to="/">AS.</Link>
      <button className="hamburger" onClick={() => setOpen(!open)} aria-label="Menu">
        <span /><span /><span />
      </button>
      <nav className={`nav-links ${open ? 'open' : ''}`} aria-label="Primary navigation">
        <Link to="/" onClick={() => setOpen(false)}>Home</Link>
        <Link to="/about" onClick={() => setOpen(false)}>About</Link>
        <Link to="/skills" onClick={() => setOpen(false)}>Skills</Link>
        <Link to="/contact" onClick={() => setOpen(false)}>Contact</Link>
      </nav>
    </header>
  )
}

export default Header

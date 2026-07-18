import { NavLink } from 'react-router-dom'

const footerLinks = [
    { label: 'Home', to: '/' },
    { label: 'About', to: '/about' },
    { label: 'Skills', to: '/skills' },
    { label: 'Contact', to: '/contact' },
]

export default function Footer() {
    const year = new Date().getFullYear()

    return (
        <footer className="site-footer" role="contentinfo">
            <div className="footer-inner">

                {/* Brand */}
                <div className="footer-brand">
                    Aayush<span>.dev</span>
                </div>

                {/* Nav links */}
                <ul className="footer-links">
                    {footerLinks.map(link => (
                        <li key={link.to}>
                            <NavLink to={link.to} end={link.to === '/'}>{link.label}</NavLink>
                        </li>
                    ))}
                </ul>

                {/* Contact info */}
                <div className="footer-contact">
                    <a href="mailto:aayush@example.com">aayush@example.com</a>
                    {' '}·{' '}
                    <a href="tel:+919999999999">+91 99999 99999</a>
                </div>

                <p className="footer-copy">
                    © {year} Aayush — AI &amp; ML Developer. Built with React &amp; FastAPI.
                </p>
            </div>
        </footer>
    )
}

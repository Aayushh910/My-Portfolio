import { Link } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import SideRays from '../components/SideRays'

/* Ray colors tuned per theme — decent, no neon */
const RAY_CONFIG = {
    dark: {
        rayColor1: '#c8a44a',   // warm muted gold
        rayColor2: '#4a7ec8',   // muted steel-blue
        intensity: 1.8,
        opacity: 0.70,
    },
    light: {
        rayColor1: '#b8942e',   // deeper gold for light bg
        rayColor2: '#3568b0',   // deeper blue for light bg
        intensity: 1.2,
        opacity: 0.45,
    },
}

export default function HomePage() {
    const { theme } = useTheme()
    const rays = RAY_CONFIG[theme]

    return (
        <section className="home-hero" aria-label="Hero section">

            {/* ── SideRays WebGL background ── */}
            <SideRays
                speed={1.6}
                rayColor1={rays.rayColor1}
                rayColor2={rays.rayColor2}
                intensity={rays.intensity}
                spread={2.2}
                origin="top-right"
                tilt={0}
                saturation={1.2}
                blend={0.68}
                falloff={1.8}
                opacity={rays.opacity}
            />

            {/* Subtle radial wash over the rays */}
            <div className="hero-bg-wash" aria-hidden="true" />

            {/* Dot grid */}
            <div className="hero-grid" aria-hidden="true" />

            {/* ── Main content ── */}
            <div className="hero-content">
                <div className="hero-badge">
                    <span className="hero-badge-dot" aria-hidden="true" />
                    Available for Opportunities
                </div>

                <h1 className="hero-name">
                    Hi, I'm
                    <span className="highlight">Aayush</span>
                </h1>

                <p className="hero-role">
                    <strong>AI &amp; ML Developer</strong> · Data Analytics &amp; Full Stack
                </p>

                <p className="hero-desc">
                    I build intelligent systems and data-driven applications —
                    from machine learning models and FastAPI backends to
                    interactive React dashboards and cloud-deployed pipelines.
                </p>

                <div className="hero-actions">
                    <Link to="/contact" className="btn-primary">
                        Let's Talk →
                    </Link>
                    <Link to="/about" className="btn-secondary">
                        Learn More
                    </Link>
                </div>
            </div>

            {/* ── Floating 3D stats card ── */}
            <div className="hero-3d-card" role="complementary" aria-label="Quick stats">
                <div className="hero-3d-card-title">Quick Stats</div>
                {[
                    { label: 'ML Models Built', value: '5+' },
                    { label: 'Tech Stack', value: '10+' },
                    { label: 'Experience', value: 'Fresher' },
                    { label: 'Datasets Analysed', value: '5+' },
                ].map(stat => (
                    <div className="hero-stat" key={stat.label}>
                        <span className="hero-stat-label">{stat.label}</span>
                        <span className="hero-stat-value">{stat.value}</span>
                    </div>
                ))}
            </div>

            {/* ── Scroll cue ── */}
            <div className="hero-scroll" aria-hidden="true">
                <div className="scroll-line" />
                <span>Scroll</span>
            </div>
        </section>
    )
}

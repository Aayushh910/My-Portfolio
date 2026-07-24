import ShapeGrid from '../components/ShapeGrid'

export default function HomePage() {
    return (
        <section className="home-hero" aria-label="Hero section">

            {/* ── ShapeGrid canvas background ── */}
            <div className="shapegrid-bg">
                <ShapeGrid
                    speed={0.15}
                    squareSize={55}
                    direction="right"
                    borderColor="rgba(255,255,255,0.08)"
                    hoverFillColor="#5B5EF4"
                    shape="square"
                    hoverTrailAmount={20}
                />
            </div>

            {/* Subtle radial wash over the grid */}
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
                    <a className="btn-primary" href="/contact">
                        Let's Talk →
                    </a>
                    <a className="btn-secondary" href="/about">
                        Learn More
                    </a>
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

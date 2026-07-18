import { FaRobot, FaChartLine } from 'react-icons/fa'

// Vite glob — picks up aayush.png OR aayush.jpg automatically
const photos = import.meta.glob('../assets/aayush.*', { eager: true })
const photoSrc = Object.values(photos)[0]?.default ?? null

function AvatarContent() {
    if (photoSrc) {
        return (
            <img
                src={photoSrc}
                alt="Aayush"
                className="about-avatar-photo"
            />
        )
    }
    return (
        <>
            <span className="about-avatar-initials">A</span>
            <span className="about-avatar-role">AI · ML</span>
        </>
    )
}

export default function AboutPage() {
    const meta = [
        { label: 'Location', value: 'India 🇮🇳' },
        { label: 'Studies', value: 'B.Tech AIML' },
        { label: 'Focus Area', value: 'AI / ML / Data' },
        { label: 'Available', value: 'Open to Work' },
    ]

    return (
        <div className="about-page" aria-label="About me">
            <div className="about-grid section-container">

                {/* ── Left: Avatar ── */}
                <div className="about-avatar-wrap">
                    <div className="about-avatar-ring">
                        <div className="about-avatar-inner">
                            <AvatarContent />
                        </div>
                    </div>

                    {/* Floating badges — react-icons, no emojis */}
                    <div className="about-badge about-badge-1">
                        <FaRobot /> AI &amp; ML Developer
                    </div>
                    <div className="about-badge about-badge-2">
                        <FaChartLine /> Data Analytics
                    </div>
                </div>

                {/* ── Right: Bio ── */}
                <div className="about-text">
                    <p className="about-page-label">Who Am I</p>

                    <h1 className="about-page-title">
                        AI Developer,{' '}
                        <span className="gradient-text">Data Storyteller</span>
                    </h1>

                    <p className="about-page-bio">
                        Hey there! I'm <strong>Aayush</strong>, an AI &amp; ML Developer
                        passionate about turning raw data into actionable intelligence. I
                        specialize in building end-to-end machine learning pipelines,
                        training predictive models, and deploying them through robust{' '}
                        <strong>FastAPI</strong> backends integrated with React frontends.
                    </p>
                    <p className="about-page-bio">
                        Beyond model building, I work with <strong>SQL</strong>,{' '}
                        <strong>Power BI</strong>, and cloud platforms to create insightful
                        dashboards and data analytics solutions. Whether it's a regression
                        model, an NLP pipeline, a REST API, or a live BI report — I bridge
                        the gap between data science and production-ready software.
                    </p>

                    {/* Meta grid */}
                    <div className="about-meta-grid">
                        {meta.map(item => (
                            <div className="about-meta-item" key={item.label}>
                                <div className="about-meta-label">{item.label}</div>
                                <div className="about-meta-value">{item.value}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

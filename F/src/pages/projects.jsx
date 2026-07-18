import { SiGithub } from 'react-icons/si'
import { FiExternalLink } from 'react-icons/fi'

const projects = [
    {
        title: 'RoomMateX',
        type: 'Full-Stack Web App',
        description:
            'A full-stack platform connecting room seekers with property owners — with verification, smart recommendations, and admin moderation. Solves the problem of slow, unsafe, unverified accommodation discovery.',
        tags: ['React', 'FastAPI', 'PostgreSQL', 'AI Recommendations'],
        github: 'https://github.com/Aayushh910/RoomMateX',
        live: 'https://room-matex.vercel.app/',
        status: 'Live',
    },
    {
        title: 'InterviewIQ',
        type: 'AI / NLP / Computer Vision',
        description:
            'AI-powered interview performance analyzer that evaluates candidates through realistic mock sessions — scoring speech, answer quality, communication skills, and behavioral cues using NLP and Computer Vision.',
        tags: ['Python', 'NLP', 'Computer Vision', 'FastAPI'],
        github: 'https://github.com/Aayushh910/InterviewIQ',
        live: '',
        status: 'In Progress',
    },
    {
        title: 'Smart Plant Detector',
        type: 'Machine Learning App',
        description:
            'An AI-based application that identifies plant diseases by analyzing leaf images using ML. Provides accurate disease detection along with treatment and prevention suggestions to help farmers reduce crop losses.',
        tags: ['Python', 'scikit-learn', 'Image Classification', 'FastAPI'],
        github: 'https://github.com/Aayushh910/Smart-Plant-Detection',
        live: '',
        status: 'Completed',
    },
    {
        title: 'Tree Structure to Folder Creator',
        type: 'VS Code Extension',
        description:
            'A VS Code extension that lets you define a folder/file tree structure as text and generates everything automatically — no more creating directories one by one.',
        tags: ['TypeScript', 'VS Code API', 'Node.js'],
        github: 'https://github.com/Aayushh910/VS-code-extension-T2F',
        live:'',
        status: 'Completed',
    },
]

const statusColors = {
    Live:        { bg: 'rgba(22,163,74,0.1)',  border: 'rgba(22,163,74,0.3)',  text: '#16a34a' },
    Completed:   { bg: 'rgba(59,130,246,0.1)', border: 'rgba(59,130,246,0.3)', text: '#3b82f6' },
    'In Progress':{ bg: 'rgba(234,179,8,0.1)', border: 'rgba(234,179,8,0.3)',  text: '#ca8a04' },
    Published:   { bg: 'rgba(168,85,247,0.1)', border: 'rgba(168,85,247,0.3)', text: '#a855f7' },
}

export default function ProjectsPage() {
    return (
        <div className="projects-page" aria-label="Projects">

            <div className="skills-page-header">
                <p className="page-section-label">What I've Built</p>
                <h1 className="page-section-title">
                    Featured <span className="gradient-text">Projects</span>
                </h1>
                <p className="page-section-sub">
                    A selection of real-world projects spanning AI, full-stack web, and developer tooling.
                </p>
            </div>

            <div className="projects-grid section-container">
                {projects.map((p) => {
                    const s = statusColors[p.status]
                    return (
                        <article key={p.title} className="project-card">

                            {/* Top row */}
                            <div className="project-card-top">
                                <span
                                    className="project-status"
                                    style={{ background: s.bg, border: `1px solid ${s.border}`, color: s.text }}
                                >
                                    <span className="project-status-dot" style={{ background: s.text }} />
                                    {p.status}
                                </span>
                                <div className="project-links">
                                    {p.github !== undefined && (
                                        <a
                                            href={p.github || '#'}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="project-icon-btn"
                                            title="GitHub"
                                            aria-label="GitHub repository"
                                            onClick={e => !p.github && e.preventDefault()}
                                            style={{ opacity: p.github ? 1 : 0.35, cursor: p.github ? 'pointer' : 'default' }}
                                        >
                                            <SiGithub />
                                        </a>
                                    )}
                                    {p.live && (
                                        <a
                                            href={p.live}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="project-icon-btn"
                                            title="Live demo"
                                            aria-label="Live demo"
                                        >
                                            <FiExternalLink />
                                        </a>
                                    )}
                                </div>
                            </div>

                            {/* Body */}
                            <p className="project-type">{p.type}</p>
                            <h2 className="project-title">{p.title}</h2>
                            <p className="project-desc">{p.description}</p>

                            {/* Tags */}
                            <div className="project-tags">
                                {p.tags.map(t => (
                                    <span key={t} className="project-tag">{t}</span>
                                ))}
                            </div>

                        </article>
                    )
                })}
            </div>

        </div>
    )
}

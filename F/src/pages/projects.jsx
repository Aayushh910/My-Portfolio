import { useEffect, useState } from 'react'
import { SiGithub } from 'react-icons/si'
import { FiExternalLink, FiStar, FiGitBranch, FiClock } from 'react-icons/fi'

const GITHUB_USER = 'Aayushh910'
const API_URL = `https://api.github.com/users/${GITHUB_USER}/starred?per_page=100`

const statusMeta = {
    Live:          { bg: 'rgba(22,163,74,0.12)',  border: 'rgba(22,163,74,0.3)',  text: '#16a34a', glow: 'rgba(22,163,74,0.2)' },
    Completed:     { bg: 'rgba(59,130,246,0.12)', border: 'rgba(59,130,246,0.3)', text: '#3b82f6', glow: 'rgba(59,130,246,0.2)' },
    'In Progress': { bg: 'rgba(234,179,8,0.12)',  border: 'rgba(234,179,8,0.3)',  text: '#ca8a04', glow: 'rgba(234,179,8,0.2)' },
}

const langColors = {
    JavaScript: '#f7df1e', TypeScript: '#3178c6', Python:  '#3572A5',
    HTML:       '#e34c26', CSS:        '#563d7c', Go:      '#00ADD8',
    Rust:       '#dea584', Java:       '#b07219', 'C++':   '#f34b7d',
    Ruby:       '#701516', Shell:      '#89e051', Kotlin:  '#7F52FF',
}

function deriveStatus(repo) {
    if (repo.archived) return 'Completed'
    const months = (Date.now() - new Date(repo.pushed_at)) / (1000 * 60 * 60 * 24 * 30)
    return months < 3 ? 'In Progress' : 'Completed'
}

function timeAgo(dateStr) {
    const days = Math.round((Date.now() - new Date(dateStr)) / 86400000)
    if (days === 0) return 'Today'
    if (days === 1) return '1 day ago'
    if (days < 30)  return `${days} days ago`
    const mo = Math.round(days / 30)
    return mo === 1 ? '1 month ago' : `${mo} months ago`
}

export default function ProjectsPage() {
    const [repos, setRepos]     = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError]     = useState(null)

    useEffect(() => {
        const headers = { Accept: 'application/vnd.github+json' }
        const token = import.meta.env.VITE_GITHUB_TOKEN
        if (token) headers.Authorization = `Bearer ${token}`

        fetch(API_URL, { headers })
            .then(r => { if (!r.ok) throw new Error(`GitHub API ${r.status}`); return r.json() })
            .then(data => setRepos(data.map(r => ({
                name:        r.name,
                title:       r.name.replace(/[-_]/g, ' '),
                description: r.description || 'No description provided.',
                language:    r.language || null,
                topics:      r.topics?.slice(0, 4) ?? [],
                github:      r.html_url,
                live:        r.homepage || '',
                stars:       r.stargazers_count,
                forks:       r.forks_count,
                updatedAt:   r.pushed_at,
                status:      r.homepage ? 'Live' : deriveStatus(r),
            }))))
            .catch(e => setError(e.message))
            .finally(() => setLoading(false))
    }, [])

    return (
        <div className="projects-page" aria-label="Projects">

            <div className="skills-page-header">
                <p className="page-section-label">What I've Built</p>
                <h1 className="page-section-title">
                    Featured <span className="gradient-text">Projects</span>
                </h1>
                <p className="page-section-sub">
                    Live from GitHub — every repo I star appears here automatically.
                </p>
            </div>

            {error && <p className="projects-error">⚠ {error}</p>}

            {loading && (
                <div className="projects-grid section-container">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="project-card pc-skeleton">
                            <div className="pcs-banner" />
                            <div className="pcs-body">
                                <div className="pcs-line pcs-w60" />
                                <div className="pcs-line pcs-w90" style={{ height: '1.1rem' }} />
                                <div className="pcs-line pcs-w100" />
                                <div className="pcs-line pcs-w80" />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {!loading && !error && (
                <div className="projects-grid section-container">
                    {repos.map((p, i) => {
                        const s  = statusMeta[p.status] ?? statusMeta.Completed
                        const lc = langColors[p.language] ?? '#8385fa'

                        return (
                            <article
                                key={p.name}
                                className="project-card"
                                style={{ animationDelay: `${i * 0.06}s` }}
                            >
                                {/* ── Banner ── */}
                                <div className="pc-banner" style={{ '--lc': lc }}>
                                    <div className="pc-banner-dots">
                                        <span /><span /><span />
                                    </div>
                                    <div className="pc-banner-center">
                                        {p.language && (
                                            <span className="pc-banner-lang">
                                                <span className="pc-lang-dot" style={{ background: lc }} />
                                                {p.language}
                                            </span>
                                        )}
                                    </div>
                                    <div className="pc-banner-actions">
                                        <a href={p.github} target="_blank" rel="noreferrer"
                                            className="pc-action-btn" aria-label="GitHub">
                                            <SiGithub />
                                        </a>
                                        {p.live && (
                                            <a href={p.live} target="_blank" rel="noreferrer"
                                                className="pc-action-btn pc-action-live" aria-label="Live">
                                                <FiExternalLink />
                                            </a>
                                        )}
                                    </div>
                                </div>

                                {/* ── Body ── */}
                                <div className="pc-body">
                                    <div className="pc-title-row">
                                        <h2 className="project-title">{p.title}</h2>
                                        <span
                                            className="pc-status-badge"
                                            style={{ background: s.bg, border: `1px solid ${s.border}`, color: s.text }}
                                        >
                                            <span className="pc-status-dot" style={{ background: s.text, boxShadow: `0 0 5px ${s.glow}` }} />
                                            {p.status}
                                        </span>
                                    </div>

                                    <p className="project-desc">{p.description}</p>

                                    {p.topics.length > 0 && (
                                        <div className="pc-topics">
                                            {p.topics.map(t => (
                                                <span key={t} className="pc-topic">{t}</span>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* ── Footer ── */}
                                <div className="pc-footer">
                                    <div className="pc-stats">
                                        <span className="pc-stat" title="Stars">
                                            <FiStar /> {p.stars}
                                        </span>
                                        <span className="pc-stat" title="Forks">
                                            <FiGitBranch /> {p.forks}
                                        </span>
                                    </div>
                                    <span className="pc-time">
                                        <FiClock /> {timeAgo(p.updatedAt)}
                                    </span>
                                </div>

                            </article>
                        )
                    })}
                </div>
            )}

        </div>
    )
}

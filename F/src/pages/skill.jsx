import {
    SiPython, SiPandas,
    SiFastapi, SiPostgresql, SiReact,
    SiHtml5, SiGit, SiGithub, SiJupyter,
} from 'react-icons/si'
import {
    FaBrain, FaChartLine, FaChartBar, FaDatabase, FaCloud, FaCog, FaCode,
} from 'react-icons/fa'
import { MdApi } from 'react-icons/md'

// ── Skill data – icon is a React element ──────────────────────
const defaultSkills = [
    {
        category: 'AI & Machine Learning',
        skills: [
            { name: 'Python', icon: <SiPython />, level: 92 },
            { name: 'Machine Learning', icon: <FaBrain />, level: 88 },
            { name: 'Deep Learning', icon: <FaBrain />, level: 80 },
            { name: 'scikit-learn', icon: <FaCog />, level: 85 },
            { name: 'Pandas / NumPy', icon: <SiPandas />, level: 90 },
            { name: 'Data Analytics', icon: <FaChartLine />, level: 88 },
        ],
    },
    {
        category: 'Backend & APIs',
        skills: [
            { name: 'FastAPI', icon: <SiFastapi />, level: 85 },
            { name: 'SQL', icon: <FaDatabase />, level: 88 },
            { name: 'REST APIs', icon: <MdApi />, level: 86 },
            { name: 'PostgreSQL', icon: <SiPostgresql />, level: 78 },
        ],
    },
    {
        category: 'Frontend & Visualisation',
        skills: [
            { name: 'React', icon: <SiReact />, level: 82 },
            { name: 'Power BI', icon: <FaChartBar />, level: 85 },
            { name: 'HTML / CSS', icon: <SiHtml5 />, level: 80 },
        ],
    },
    {
        category: 'Cloud, Tools & DevOps',
        skills: [
            { name: 'AWS / GCP', icon: <FaCloud />, level: 72 },
            { name: 'Git', icon: <SiGit />, level: 90 },
            { name: 'GitHub', icon: <SiGithub />, level: 90 },
            { name: 'VS Code', icon: <FaCode />, level: 95 },
            { name: 'Jupyter', icon: <SiJupyter />, level: 90 },
        ],
    },
]

function SkillCard({ name, icon, level }) {
    const levelLabel =
        level >= 88 ? 'Expert' :
            level >= 75 ? 'Advanced' :
                level >= 55 ? 'Intermediate' : 'Beginner'

    return (
        <div className="skill-card" title={`${name} – ${level}%`}>
            <div className="skill-icon" aria-hidden="true">{icon}</div>
            <div className="skill-name">{name}</div>
            <div className="skill-bar-wrap">
                <div
                    className="skill-bar-fill"
                    style={{ width: `${level}%` }}
                    role="progressbar"
                    aria-valuenow={level}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`${name} proficiency`}
                />
            </div>
            <div className="skill-level">{levelLabel} · {level}%</div>
        </div>
    )
}

/**
 * SkillPage
 * @param {{ skillGroups?: Array }} props
 */
export default function SkillPage({ skillGroups = defaultSkills }) {
    return (
        <main className="skills-page" aria-label="Skills">

            <div className="skills-page-header">
                <p className="page-section-label">What I Know</p>
                <h1 className="page-section-title">
                    My <span className="gradient-text">Skills &amp; Expertise</span>
                </h1>
                <p className="page-section-sub">
                    From training ML models and building intelligent pipelines to
                    deploying APIs and crafting data dashboards — here's my full toolkit.
                </p>
            </div>

            <div className="skills-categories section-container">
                {skillGroups.map(group => (
                    <div key={group.category}>
                        <h2 className="skill-category-title">{group.category}</h2>
                        <div className="skills-grid">
                            {group.skills.map(skill => (
                                <SkillCard key={skill.name} {...skill} />
                            ))}
                        </div>
                    </div>
                ))}
            </div>

        </main>
    )
}

import {
    SiPython, SiPandas,
    SiFastapi, SiPostgresql, SiReact,
    SiHtml5, SiGit, SiGithub, SiJupyter,
} from 'react-icons/si'
import {
    FaBrain, FaChartLine, FaChartBar, FaDatabase, FaCloud, FaCog, FaCode,
} from 'react-icons/fa'
import { MdApi } from 'react-icons/md'

const skillGroups = [
    {
        category: 'AI & Machine Learning',
        icon: <FaBrain />,
        skills: [
            { name: 'Python',          icon: <SiPython /> },
            { name: 'Machine Learning',icon: <FaBrain /> },
            { name: 'Deep Learning',   icon: <FaBrain /> },
            { name: 'scikit-learn',    icon: <FaCog /> },
            { name: 'Pandas / NumPy',  icon: <SiPandas /> },
            { name: 'Data Analytics',  icon: <FaChartLine /> },
        ],
    },
    {
        category: 'Backend & APIs',
        icon: <SiFastapi />,
        skills: [
            { name: 'FastAPI',    icon: <SiFastapi /> },
            { name: 'SQL',        icon: <FaDatabase /> },
            { name: 'REST APIs',  icon: <MdApi /> },
            { name: 'PostgreSQL', icon: <SiPostgresql /> },
        ],
    },
    {
        category: 'Frontend & Visualisation',
        icon: <SiReact />,
        skills: [
            { name: 'React',      icon: <SiReact /> },
            { name: 'Power BI',   icon: <FaChartBar /> },
            { name: 'HTML / CSS', icon: <SiHtml5 /> },
        ],
    },
    {
        category: 'Cloud, Tools & DevOps',
        icon: <FaCloud />,
        skills: [
            { name: 'AWS / GCP', icon: <FaCloud /> },
            { name: 'Git',       icon: <SiGit /> },
            { name: 'GitHub',    icon: <SiGithub /> },
            { name: 'VS Code',   icon: <FaCode /> },
            { name: 'Jupyter',   icon: <SiJupyter /> },
        ],
    },
]

export default function SkillPage() {
    return (
        <div className="skills-page" aria-label="Skills">

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

            <div className="skill-group-grid section-container">
                {skillGroups.map(group => (
                    <div key={group.category} className="skill-group-card">
                        <div className="skill-group-header">
                            <span className="skill-group-cat-icon" aria-hidden="true">{group.icon}</span>
                            <h2 className="skill-group-title">{group.category}</h2>
                        </div>
                        <div className="skill-pill-list">
                            {group.skills.map(s => (
                                <span key={s.name} className="skill-pill">
                                    <span className="skill-pill-icon" aria-hidden="true">{s.icon}</span>
                                    {s.name}
                                </span>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

        </div>
    )
}

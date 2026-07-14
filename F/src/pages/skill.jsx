const skills = [
  { name: 'HTML',              level: 90 },
  { name: 'CSS',               level: 80 },
  { name: 'JavaScript',        level: 70 },
  { name: 'React',             level: 65 },
  { name: 'Vite',              level: 60 },
  { name: 'Git & GitHub',      level: 65 },
  { name: 'Responsive Design', level: 75 },
  { name: 'REST APIs',         level: 55 },
]

function SkillPage() {
  return (
    <>
      <div className="page-hero">
        <p className="page-hero-eyebrow">Skills</p>
        <h1>Technologies I Work With</h1>
        <p>Tools and technologies I have been learning and using to build real projects.</p>
      </div>

      <div className="page-body">
        <div className="skills-grid">
          {skills.map((s) => (
            <div className="skill-item" key={s.name}>
              <div className="skill-name">{s.name}</div>
              <div className="skill-bar-bg">
                <div className="skill-bar-fill" style={{ width: `${s.level}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

export default SkillPage

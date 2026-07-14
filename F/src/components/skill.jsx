const skills = ['HTML', 'CSS', 'JavaScript', 'React', 'Git', 'Vite']

function Skill() {
  return (
    <section id="skills" className="card">
      <h2>Skills</h2>
      <div className="skills-grid">
        {skills.map((skill) => (
          <div className="skill-card" key={skill}>
            {skill}
          </div>
        ))}
      </div>
    </section>
  )
}

export default Skill

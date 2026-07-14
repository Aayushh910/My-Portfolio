import { Link } from 'react-router-dom'

const projects = [
  {
    name: 'Portfolio Website',
    desc: 'Personal portfolio built with React and Vite. Fully responsive with a clean white theme.',
    tags: ['React', 'Vite', 'CSS'],
  },
  {
    name: 'Todo App',
    desc: 'Task management app with add, complete, and delete functionality using React hooks.',
    tags: ['React', 'JavaScript'],
  },
  {
    name: 'Weather App',
    desc: 'Fetches real-time weather data from a public API and displays it in a clean interface.',
    tags: ['JavaScript', 'REST API'],
  },
]

function Home() {
  return (
    <>
      <section className="hero">
        <div className="hero-left">
          <p className="hero-eyebrow">Frontend Developer</p>
          <h1>Aayush<br />Savaliya</h1>
          <p className="hero-role">Building clean web experiences with React</p>
          <p className="hero-desc">
            A self-taught developer focused on writing clean code and building
            fast, accessible, and visually polished web applications.
          </p>
          <div className="hero-btns">
            <Link to="/contact"><button className="btn-primary">Get in Touch</button></Link>
            <Link to="/skills"><button className="btn-outline">View Skills</button></Link>
          </div>
        </div>
        <div className="hero-right">
          <div className="stat-card">
            <div className="stat-num">3+</div>
            <div className="stat-label">Projects Completed</div>
          </div>
          <div className="stat-card">
            <div className="stat-num">6+</div>
            <div className="stat-label">Technologies Learned</div>
          </div>
          <div className="stat-card">
            <div className="stat-num">1+</div>
            <div className="stat-label">Year of Learning</div>
          </div>
        </div>
      </section>

      <section className="page-body">
        <p className="section-label">Work</p>
        <h2 className="section-title">Selected Projects</h2>
        <p className="section-desc">
          A few things I have built while learning. Each project helped me understand
          a new concept or technology.
        </p>
        <div className="projects-grid">
          {projects.map((p) => (
            <div className="project-card" key={p.name}>
              <h3>{p.name}</h3>
              <p>{p.desc}</p>
              <div className="project-tags">
                {p.tags.map((t) => <span className="project-tag" key={t}>{t}</span>)}
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}

export default Home

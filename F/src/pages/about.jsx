function AboutPage() {
  return (
    <>
      <div className="page-hero">
        <p className="page-hero-eyebrow">About</p>
        <h1>Who I Am</h1>
        <p>A self-taught frontend developer from India, passionate about clean UI and modern web technologies.</p>
      </div>

      <div className="page-body">
        <div className="about-grid">
          <div className="about-text">
            <p>
              I started learning web development out of curiosity and quickly became
              passionate about building things that live on the internet. I enjoy the
              process of turning ideas into real, working interfaces.
            </p>
            <p>
              My focus is on writing clean, readable code and creating interfaces that
              are both functional and visually polished. I am currently deepening my
              knowledge of React and modern JavaScript patterns.
            </p>
            <p>
              I am open to internship opportunities, freelance projects, and collaborations
              where I can contribute and continue growing as a developer.
            </p>
          </div>
          <div>
            <div className="detail-row">
              <span className="detail-key">Name</span>
              <span className="detail-val">Aayush Savaliya</span>
            </div>
            <div className="detail-row">
              <span className="detail-key">Location</span>
              <span className="detail-val">India</span>
            </div>
            <div className="detail-row">
              <span className="detail-key">Focus</span>
              <span className="detail-val">Frontend Development</span>
            </div>
            <div className="detail-row">
              <span className="detail-key">Stack</span>
              <span className="detail-val">React · JavaScript · CSS</span>
            </div>
            <div className="detail-row">
              <span className="detail-key">Status</span>
              <span className="detail-val" style={{ color: '#16a34a' }}>Available for Work</span>
            </div>
            <div className="detail-row">
              <span className="detail-key">Email</span>
              <span className="detail-val">aayush@example.com</span>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default AboutPage

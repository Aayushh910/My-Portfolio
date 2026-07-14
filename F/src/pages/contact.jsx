function ContactPage() {
  function handleSubmit(e) {
    e.preventDefault()
    alert('Message sent. I will get back to you shortly.')
    e.target.reset()
  }

  return (
    <>
      <div className="page-hero">
        <p className="page-hero-eyebrow">Contact</p>
        <h1>Get in Touch</h1>
        <p>Have a project in mind or just want to say hello? I would love to hear from you.</p>
      </div>

      <div className="page-body">
        <div className="contact-grid">
          <div className="contact-info-list">
            <div className="contact-info-item">
              <span className="ci-label">Email</span>
              <span className="ci-val">aayush@example.com</span>
            </div>
            <div className="contact-info-item">
              <span className="ci-label">Phone</span>
              <span className="ci-val">+91 98765 43210</span>
            </div>
            <div className="contact-info-item">
              <span className="ci-label">Location</span>
              <span className="ci-val">India</span>
            </div>
            <div className="contact-info-item">
              <span className="ci-label">Availability</span>
              <span className="ci-val" style={{ color: '#16a34a' }}>Open to opportunities</span>
            </div>
          </div>

          <form className="contact-form" onSubmit={handleSubmit}>
            <div className="form-row">
              <input type="text" placeholder="Name" required />
              <input type="email" placeholder="Email" required />
            </div>
            <input type="text" placeholder="Subject" />
            <textarea rows="5" placeholder="Your message..." required />
            <button className="btn-primary" type="submit" style={{ alignSelf: 'flex-start' }}>
              Send Message
            </button>
          </form>
        </div>
      </div>
    </>
  )
}

export default ContactPage

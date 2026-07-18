import { useState } from 'react'
import { MdEmail, MdLocationOn, MdSend, MdCheckCircle } from 'react-icons/md'
import { FaPhone, FaGithub, FaLinkedin, FaXTwitter } from 'react-icons/fa6'

const contactDetails = [
    {
        icon: <MdEmail />,
        label: 'Email',
        value: 'aayushsavaliya910@gmail.com',
        href: 'mailto:aayushsavaliya910@gmail.com',
    },
    {
        icon: <FaPhone />,
        label: 'Phone',
        value: '+91 82002 56660',
        href: 'tel:+918200256660',
    },
    {
        icon: <MdLocationOn />,
        label: 'Location',
        value: 'Ahmedabad, Gujarat, India',
        href: null,
    },
]

const socials = [
    { icon: <FaGithub />,   label: 'GitHub',   href: 'https://github.com/Aayushh910' },
    { icon: <FaLinkedin />, label: 'LinkedIn',  href: 'https://www.linkedin.com/in/aayush-savaliya-50776b32a' },
    { icon: <FaXTwitter />, label: 'LeetCode',  href: 'https://leetcode.com/Aayushh01/' },
]

export default function ContactPage() {
    const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
    const [submitted, setSubmitted] = useState(false)

    const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

    const handleSubmit = e => {
        e.preventDefault()
        console.log('Contact form submitted:', form)
        setSubmitted(true)
        setForm({ name: '', email: '', subject: '', message: '' })
    }

    return (
        <div className="contact-page" aria-label="Contact">

            {/* Section header */}
            <div className="skills-page-header">
                <p className="page-section-label">Get In Touch</p>
                <h1 className="page-section-title">
                    Let's <span className="gradient-text">Work Together</span>
                </h1>
                <p className="page-section-sub">
                    Have a project, collaboration, or just want to say hi?
                    My inbox is always open.
                </p>
            </div>

            <div className="contact-inner section-container">

                {/* ── Contact info ── */}
                <div className="contact-info">
                    <h2 className="contact-info-title animate-fade-up">
                        Contact <span className="gradient-text">Information</span>
                    </h2>
                    <p className="contact-info-text animate-fade-up-d1">
                        I'm currently available for freelance AI/ML projects, full-time
                        roles, or exciting data collaborations. Reach out through any
                        channel below.
                    </p>

                    <div className="contact-detail-list animate-fade-up-d2">
                        {contactDetails.map(d => (
                            <div className="contact-detail-item" key={d.label}>
                                <div className="contact-detail-icon" aria-hidden="true">
                                    {d.icon}
                                </div>
                                <div>
                                    <div className="contact-detail-label">{d.label}</div>
                                    {d.href
                                        ? <a className="contact-detail-value" href={d.href}>{d.value}</a>
                                        : <span className="contact-detail-value">{d.value}</span>
                                    }
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Social links */}
                    <div className="contact-social-row animate-fade-up-d3">
                        {socials.map(s => (
                            <a
                                key={s.label}
                                href={s.href}
                                target="_blank"
                                rel="noreferrer"
                                className="social-icon-btn"
                                aria-label={s.label}
                                title={s.label}
                            >
                                {s.icon}
                            </a>
                        ))}
                    </div>
                </div>

                {/* ── Contact form ── */}
                <div className="contact-form-card animate-fade-up-d1">
                    {submitted ? (
                        <div className="form-success">
                            <MdCheckCircle
                                style={{ fontSize: '3rem', color: 'var(--clr-accent-soft)', marginBottom: '0.75rem' }}
                            />
                            <p>Message sent! I'll get back to you soon.</p>
                            <button
                                className="btn-secondary"
                                style={{ margin: '1.25rem auto 0', display: 'inline-flex' }}
                                onClick={() => setSubmitted(false)}
                            >
                                Send another
                            </button>
                        </div>
                    ) : (
                        <>
                            <h2 className="form-title">Send a Message</h2>
                            <form onSubmit={handleSubmit} noValidate>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                    <div className="form-group">
                                        <label className="form-label" htmlFor="name">Name</label>
                                        <input
                                            id="name" name="name" type="text"
                                            className="form-input" placeholder="Your Name"
                                            value={form.name} onChange={handleChange} required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label" htmlFor="email">Email</label>
                                        <input
                                            id="email" name="email" type="email"
                                            className="form-input" placeholder="you@example.com"
                                            value={form.email} onChange={handleChange} required
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="form-label" htmlFor="subject">Subject</label>
                                    <input
                                        id="subject" name="subject" type="text"
                                        className="form-input" placeholder="What's this about?"
                                        value={form.subject} onChange={handleChange}
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label" htmlFor="message">Message</label>
                                    <textarea
                                        id="message" name="message"
                                        className="form-textarea"
                                        placeholder="Tell me about your project or collaboration idea..."
                                        value={form.message} onChange={handleChange} required
                                    />
                                </div>

                                <button type="submit" className="form-submit" id="submit-contact-form">
                                    Send Message <MdSend style={{ marginLeft: '0.25rem' }} />
                                </button>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}

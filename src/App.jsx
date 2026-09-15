import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import './App.css'
import { services } from './data/services'
import Header from './components/Header'

const t = {
  book: 'Book appointment',
  explore: 'Explore services',
  eyebrow: 'Gachuurt • Ulaanbaatar • Garage 84',
  heroTitle: 'Vehicle support that solves the real problem.',
  heroText:
    'Repair it, inspect it before you buy, source the right vehicle, sort the paperwork, and keep it moving with clear advice from people who know the Mongolian vehicle world.',
  ask: 'Tell us what vehicle issue you are dealing with.',
  getInTouch: 'Get in touch',
  stats: [
    { value: '20+', label: 'Years in Mongolia automotive work' },
    { value: '5.0', label: 'Google rating from real customers' },
    { value: '4x4', label: 'Specialist SUV and diesel focus' },
  ],
}

const initialForm = {
  name: '',
  phone: '',
  email: '',
  vehicle: '',
  message: '',
}

function App() {
  const [formData, setFormData] = useState(initialForm)
  const location = useLocation()

  useEffect(() => {
    if (location.hash) {
      document.querySelector(location.hash)?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [location.hash])

  const messengerIcon = (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="contact-icon-svg">
      <path d="M12 2.2C6.5 2.2 2 6.3 2 11.3c0 2.5 1.1 4.9 3 6.6v3.9l3.4-1.8c.9.3 1.9.4 2.9.4 5.5 0 10-4.1 10-9.1S17.5 2.2 12 2.2zm1.1 12.9-2.5-2.7-4.9 2.7 5.4-5.7 2.6 2.7 4.8-2.7-5.4 5.7z" />
    </svg>
  )

  const phoneIcon = (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="contact-icon-svg">
      <path d="M6.62 10.79c1.44 2.83 3.76 5.15 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02z" />
    </svg>
  )

  const emailIcon = (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="contact-icon-svg">
      <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5z" />
    </svg>
  )

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    const subject = encodeURIComponent(`Booking request from ${formData.name || 'website visitor'}`)
    const body = encodeURIComponent(
      `Name: ${formData.name}\nPhone: ${formData.phone}\nEmail: ${formData.email}\nVehicle: ${formData.vehicle}\n\nDetails:\n${formData.message}`,
    )

    window.location.href = `mailto:jkmongolia@gmail.com?subject=${subject}&body=${body}`
  }

  return (
    <div className="luxury-page">
      <Header />

      <main>
        <section className="hero-section reveal">
          <div className="hero-copy">
            <span className="eyebrow">{t.eyebrow}</span>
            <h1>{t.heroTitle}</h1>
            <p>{t.heroText}</p>

            <div className="cta-row">
              <a className="primary-button" href="#contact">{t.book}</a>
              <a className="secondary-button" href="#services">{t.explore}</a>
            </div>

            <div className="stats-row">
              {t.stats.map((item) => (
                <div key={item.label} className="stat-box">
                  <strong>{item.value}</strong>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="hero-visual" aria-label="JK Mongolia vehicle services">
            <img
              src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1200&q=80"
              alt="Luxury SUV in a workshop setting"
            />
            <div className="floating-card card-top">
              <span className="mini-label">Workshop focus</span>
              <h2>Practical, honest, no fluff.</h2>
            </div>
            <div className="floating-card card-bottom">
              <div>
                <span>Available now</span>
                <strong>Repairs • Inspections • Sourcing</strong>
              </div>
            </div>
          </div>
        </section>

        <section id="services" className="services-section reveal">
          <div className="section-header">
            <div>
              <span className="eyebrow dark">What we do</span>
              <h2>Choose the job. See exactly what it includes.</h2>
            </div>
            <p>
              From engine and bodywork to paperwork, sourcing, and rental support, each service is handled with an eye on real-world value.
            </p>
          </div>

          <div className="service-grid">
            {services.map((service) => (
              <article key={service.title} className="service-card">
                <span className="service-number">{service.accent}</span>
                <h3>{service.title}</h3>
                <p>{service.summary}</p>
                <Link to={`/services/${service.slug}`}>Learn more</Link>
              </article>
            ))}
          </div>
        </section>

        <section className="cta-strip reveal">
          <div>
            <span className="eyebrow light">Need help now?</span>
            <h2>{t.ask}</h2>
          </div>
          <a href="#contact" className="primary-button light-button">{t.getInTouch}</a>
        </section>

        <section id="contact" className="contact-section reveal">
          <div className="contact-copy">
            <span className="eyebrow dark">Book a visit</span>
            <h2>Send the details before you arrive.</h2>
            <div className="contact-list">
              <a href="tel:+97688856529" className="contact-icon-link" aria-label="Call now">
                {phoneIcon}
              </a>
              <a href="mailto:jkmongolia@gmail.com" className="contact-icon-link" aria-label="Email us">
                {emailIcon}
              </a>
              <a
                href="https://m.me/jkmongolia"
                target="_blank"
                rel="noreferrer"
                className="contact-icon-link"
                aria-label="Messenger"
              >
                {messengerIcon}
              </a>
            </div>
          </div>

          <form className="contact-form" onSubmit={handleSubmit}>
            <div className="form-grid">
              <label>
                <span>Name</span>
                <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Your name" required />
              </label>
              <label>
                <span>Phone</span>
                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="+976 ..." required />
              </label>
              <label>
                <span>Email</span>
                <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="you@example.com" required />
              </label>
              <label>
                <span>Vehicle</span>
                <input type="text" name="vehicle" value={formData.vehicle} onChange={handleChange} placeholder="Make, model, year" />
              </label>
            </div>

            <label>
              <span>Service details</span>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows="5"
                placeholder="Tell us what kind of help you need..."
                required
              />
            </label>

            <button type="submit" className="primary-button form-button">Send request</button>
          </form>
        </section>
      </main>
    </div>
  )
}

export default App

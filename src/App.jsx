import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  ArrowUpRight, Clock, Mail, MapPin, MessageCircle, Navigation, Package, Phone, Star, Truck, Warehouse, Wrench,
} from 'lucide-react'
import './home.css'
import { services } from './data/services'
import { GOOGLE_RATING, GOOGLE_REVIEW_COUNT, MAPS_URL, featuredReviews } from './data/googleBusiness'
import { submitRequest } from './lib/submitRequest'
import { HOURS_SHORT } from './data/schedule'
import Header from './components/Header'
import BookButton from './components/BookButton'
import Gallery from './components/Gallery'
import CustomerReviews from './components/CustomerReviews'
import AppointmentPicker from './components/AppointmentPicker'
import { galleryPhotos } from './data/gallery'
import BrandMark from './components/BrandMark'

// The first gallery photo becomes the hero background once photos are added.
const heroImage = galleryPhotos[0] ?? 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1800&q=80'

const MAP_EMBED = 'https://maps.google.com/maps?q=47.9290974,107.1572345&z=15&output=embed'

const strengths = [
  { icon: Wrench, title: 'Oil change to engine out', text: 'Routine service through to full engine removal.' },
  { icon: Truck, title: 'Trucks, 4x4s and classics', text: 'Expedition trucks, Land Rovers, SUVs and diesels.' },
  { icon: Package, title: 'Parts imported', text: 'We order parts that are not available in Mongolia.' },
  { icon: Warehouse, title: 'Vehicle storage', text: 'Leave your vehicle with us for as long as you need.' },
]

const travellerPoints = [
  'Wait at the shop, or take a bus or taxi into Ulaanbaatar while we work',
  'Parts ordered in when your model is not common here',
  'Store your vehicle between trips, for any length of time',
  'Big expedition trucks, classic 4x4s and everything in between',
]

const initialForm = { name: '', phone: '', email: '', vehicle: '', service: '', message: '', website: '' }

function Stars({ size = 16 }) {
  return (
    <span className="home-stars" aria-hidden="true">
      {Array.from({ length: 5 }, (_, index) => <Star key={index} size={size} fill="currentColor" strokeWidth={0} />)}
    </span>
  )
}

function App() {
  const [formData, setFormData] = useState(initialForm)
  const [status, setStatus] = useState({ state: 'idle', error: '' })
  const [appointment, setAppointment] = useState(null)
  const [appointmentError, setAppointmentError] = useState('')
  const [availabilityKey, setAvailabilityKey] = useState(0)
  const location = useLocation()

  useEffect(() => {
    if (location.hash) {
      document.querySelector(location.hash)?.scrollIntoView({ behavior: 'smooth' })
    }
    // location.key changes on every navigation, so re-selecting the same section still scrolls.
  }, [location.key, location.hash])

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setStatus({ state: 'sending', error: '' })
    try {
      await submitRequest({
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        service: formData.service || 'General enquiry',
        source: 'Home page',
        website: formData.website,
        fields: [
          { label: 'Vehicle', value: formData.vehicle },
          { label: 'Details', value: formData.message },
        ],
        appointment: appointment ?? undefined,
      })
      setFormData(initialForm)
      setAppointment(null)
      setStatus({ state: 'sent', error: '' })
    } catch (error) {
      if (error.field === 'appointment') {
        // The time filled up meanwhile: show fresh availability and ask for another time.
        setAppointment(null)
        setAppointmentError(error.message)
        setAvailabilityKey((key) => key + 1)
        setStatus({ state: 'idle', error: '' })
      } else {
        setStatus({ state: 'error', error: error.message })
      }
    }
  }

  return (
    <div className="luxury-page home">
      <Header />

      <main>
        <section className="home-hero reveal" aria-labelledby="home-title" style={{ '--hero-image': `url(${heroImage})` }}>
          <div className="home-hero-copy">
            <span className="home-kicker">Garage 84 · Gachuurt, Ulaanbaatar</span>
            <h1 id="home-title">Honest repairs for trucks, 4x4s and overland rigs.</h1>
            <p>
              Jkmechanic Shop is an independent workshop just outside Ulaanbaatar.
              Justin handles everything from a quick oil change to taking out a
              whole engine, and he explains the work as he goes.
            </p>
            <div className="home-actions">
              <BookButton className="primary-button">Book a visit</BookButton>
              <a className="home-ghost-button" href="tel:+97688856529"><Phone size={16} /> +976 8885 6529</a>
            </div>
          </div>

          <dl className="home-facts">
            <a className="home-fact" href="#reviews">
              <dt>Google rating</dt>
              <dd><strong>{GOOGLE_RATING}</strong> <Stars size={14} /> <small>{GOOGLE_REVIEW_COUNT} reviews</small></dd>
            </a>
            <div className="home-fact">
              <dt>Experience</dt>
              <dd><strong>20+ years</strong> <small>in Mongolian automotive work</small></dd>
            </div>
            <div className="home-fact">
              <dt>Hours</dt>
              <dd><strong>{HOURS_SHORT}</strong> <small>Closed on weekends</small></dd>
            </div>
          </dl>
        </section>

        <section className="home-strengths reveal" aria-label="What we offer">
          {strengths.map(({ icon: Icon, title, text }) => (
            <div key={title} className="home-strength">
              <Icon size={22} aria-hidden="true" />
              <h2>{title}</h2>
              <p>{text}</p>
            </div>
          ))}
        </section>

        <section id="services" className="home-section reveal" aria-labelledby="services-title">
          <div className="home-section-head">
            <span className="home-kicker">Services</span>
            <h2 id="services-title">What can we help with?</h2>
          </div>
          <div className="home-service-list">
            {services.map((service) => (
              <Link key={service.slug} to={`/services/${service.slug}`} className="home-service-row">
                <span className="home-service-number">{service.accent}</span>
                <span className="home-service-title">{service.title}</span>
                <span className="home-service-summary">{service.summary}</span>
                <ArrowUpRight className="home-service-arrow" size={22} aria-hidden="true" />
              </Link>
            ))}
          </div>
        </section>

        <section className="home-band reveal" aria-labelledby="travel-title">
          <div>
            <span className="home-kicker">Overlanders welcome</span>
            <h2 id="travel-title">Driving across Mongolia? Stop at Garage 84.</h2>
            <p>
              Travellers heading for China, Russia and Central Asia stop here to
              get their vehicles fixed. Justin has fitted new shock absorbers to a
              Steyr expedition truck and fixed many small faults on a 1980 Land Rover.
            </p>
          </div>
          <ul>
            {travellerPoints.map((point) => <li key={point}>{point}</li>)}
          </ul>
        </section>

        {galleryPhotos.length > 0 && (
          <section id="gallery" className="home-section reveal" aria-labelledby="gallery-title">
            <div className="home-section-head home-section-head-split">
              <div>
                <span className="home-kicker">Inside Garage 84</span>
                <h2 id="gallery-title">Real vehicles. Real jobs.</h2>
              </div>
              <p>Photos from the workshop in Gachuurt.</p>
            </div>
            <Gallery />
          </section>
        )}

        <section id="reviews" className="home-section home-reviews reveal" aria-labelledby="reviews-title">
          <div className="home-reviews-score">
            <span className="home-kicker">Reviews</span>
            <h2 id="reviews-title">{GOOGLE_RATING}</h2>
            <Stars size={22} />
            <p>Average from {GOOGLE_REVIEW_COUNT} reviews on Google Maps.</p>
            <a className="secondary-button" href={MAPS_URL} target="_blank" rel="noreferrer">
              Read all reviews <ArrowUpRight size={16} />
            </a>
          </div>
          <div className="home-review-grid">
            {featuredReviews.map((review) => (
              <figure key={review.name} className="home-review">
                <blockquote>“{review.quote}”</blockquote>
                <figcaption>{review.name}</figcaption>
              </figure>
            ))}
          </div>
          <CustomerReviews />
        </section>

        <section id="contact" className="home-section home-contact reveal" aria-labelledby="contact-title">
          <div className="home-visit">
            <span className="home-kicker">Book a visit</span>
            <h2 id="contact-title">Tell us about the vehicle before you arrive.</h2>
            <ul className="home-visit-list">
              <li><MapPin size={18} /> <span>BZD 20 Khoroo, 10 ail 1-7 toot, Gachuurt, Ulaanbaatar<small>Plus code W5H4+JV</small></span></li>
              <li><Clock size={18} /> <span>{HOURS_SHORT}<small>Closed on weekends</small></span></li>
              <li><Phone size={18} /> <a href="tel:+97688856529">+976 8885 6529</a></li>
              <li><Mail size={18} /> <a href="mailto:jkmongolia@gmail.com">jkmongolia@gmail.com</a></li>
              <li><MessageCircle size={18} /> <a href="https://m.me/jkmongolia" target="_blank" rel="noreferrer">Message us on Messenger</a></li>
            </ul>
            <div className="home-map">
              <iframe title="Map to Garage 84 in Gachuurt" src={MAP_EMBED} loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
              <a href={MAPS_URL} target="_blank" rel="noreferrer"><Navigation size={14} /> Get directions</a>
            </div>
          </div>

          {status.state === 'sent' ? (
            <div className="home-form home-form-done" role="status">
              <h3>Request sent. Thank you!</h3>
              <p>Justin will contact you by phone to confirm a time. For anything urgent, call +976 8885 6529.</p>
              <button type="button" className="secondary-button" onClick={() => setStatus({ state: 'idle', error: '' })}>
                Send another request
              </button>
            </div>
          ) : (
            <form className="home-form" onSubmit={handleSubmit}>
              <div className="home-form-grid">
                <label>
                  <span>Name</span>
                  <input name="name" value={formData.name} onChange={handleChange} placeholder="Your name" autoComplete="name" required />
                </label>
                <label>
                  <span>Phone</span>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="+976 ..." autoComplete="tel" required />
                </label>
                <label>
                  <span>Email <em>optional</em></span>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="you@example.com" autoComplete="email" />
                </label>
                <label>
                  <span>Vehicle</span>
                  <input name="vehicle" value={formData.vehicle} onChange={handleChange} placeholder="Make, model, year" />
                </label>
              </div>
              <label>
                <span>Service</span>
                <select name="service" value={formData.service} onChange={handleChange}>
                  <option value="">Not sure yet</option>
                  {services.map((service) => <option key={service.slug} value={service.title}>{service.title}</option>)}
                </select>
              </label>
              <label>
                <span>What is happening?</span>
                <textarea name="message" value={formData.message} onChange={handleChange} rows="5" placeholder="Symptoms, recent work, when you would like to come in..." required />
              </label>
              <AppointmentPicker
                value={appointment}
                onChange={(next) => {
                  setAppointment(next)
                  if (next) setAppointmentError('')
                }}
                optional
                reloadKey={availabilityKey}
                error={appointmentError}
              />
              <label className="home-honeypot" aria-hidden="true">
                Website <input name="website" value={formData.website} onChange={handleChange} tabIndex={-1} autoComplete="off" />
              </label>
              {status.state === 'error' && <p className="home-form-error" role="alert">{status.error}</p>}
              <button type="submit" className="primary-button form-button" disabled={status.state === 'sending'}>
                {status.state === 'sending' ? 'Sending…' : 'Send request'}
              </button>
            </form>
          )}
        </section>
      </main>

      <footer className="home-footer">
        <div className="home-footer-brand">
          <BrandMark />
          <div>
            <strong>Jkmechanic Shop · Garage 84</strong>
            <p>Independent auto repair in Gachuurt, Ulaanbaatar.</p>
          </div>
        </div>
        <div className="home-footer-col">
          <h2>Visit</h2>
          <p>BZD 20 Khoroo, 10 ail 1-7 toot<br />Gachuurt, Ulaanbaatar</p>
          <a href={MAPS_URL} target="_blank" rel="noreferrer">Get directions</a>
        </div>
        <div className="home-footer-col">
          <h2>Contact</h2>
          <a href="tel:+97688856529">+976 8885 6529</a>
          <a href="mailto:jkmongolia@gmail.com">jkmongolia@gmail.com</a>
          <a href="https://m.me/jkmongolia" target="_blank" rel="noreferrer">Messenger</a>
        </div>
        <div className="home-footer-col">
          <h2>Explore</h2>
          <a href="#services">Services</a>
          <Link to="/about">About us</Link>
          <a href="#contact">Book a visit</a>
        </div>
        <p className="home-footer-legal">© {new Date().getFullYear()} JK Mongolia. All rights reserved.</p>
      </footer>
    </div>
  )
}

export default App

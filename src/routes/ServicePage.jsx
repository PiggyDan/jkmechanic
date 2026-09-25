import { useCallback, useEffect, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { services } from '../data/services'
import Header from '../components/Header'
import { submitRequest } from '../lib/submitRequest'
import AppointmentPicker from '../components/AppointmentPicker'
import BuySellPage from './BuySellPage'
import { servicePhoto } from '../data/brand'

const t = {
  back: 'Back to home',
  enquire: 'Enquire now',
  allServices: 'View all services',
  notFound: 'That page is not available.',
  booking: 'Booking',
  clearProcess: 'A clear process, without the confusion.',
  needThis: 'Need this service?',
  contact: 'Contact JK Mongolia',
  sendRequest: 'Send booking request',
  details: 'What this includes',
  why: 'Why it matters',
  howWorks: 'How it works',
  needServiceText: 'Tell us what you need and we’ll advise on the next step.',
}

function ServicePage({ slug }) {
  const service = services.find((item) => item.slug === slug)

  const initialFormState = service?.formFields
    ? Object.fromEntries(service.formFields.map((field) => [field.name, '']))
    : {}

  const [formData, setFormData] = useState(initialFormState)
  const [status, setStatus] = useState({ state: 'idle', error: '' })
  const [appointment, setAppointment] = useState(null)
  const [appointmentError, setAppointmentError] = useState('')
  const [availabilityKey, setAvailabilityKey] = useState(0)
  const [pickerDown, setPickerDown] = useState(false)
  const location = useLocation()
  const handlePickerDown = useCallback(() => setPickerDown(true), [])

  // Arriving from the booking picker (#booking) jumps straight to the form.
  useEffect(() => {
    if (location.hash) {
      document.querySelector(location.hash)?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [location.key, location.hash])

  if (!service) {
    return (
      <div className="service-detail-page">
        <Header />
        <div className="detail-shell">
          <p className="eyebrow dark">Service not found</p>
          <h1>That page is not available.</h1>
          <Link className="primary-button" to="/">
            Back to home
          </Link>
        </div>
      </div>
    )
  }

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((current) => ({ ...current, [name]: value }))
  }

  const chooseAppointment = (next) => {
    setAppointment(next)
    if (next) setAppointmentError('')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    // The picker can only be skipped if it failed to load; then the notes carry the preferred time.
    if (service.appointment === 'required' && !appointment && !pickerDown) {
      setAppointmentError('Please choose a day and time.')
      return
    }
    setStatus({ state: 'sending', error: '' })
    const fields = service.formFields
      .filter((field) => !['name', 'phone'].includes(field.name))
      .map((field) => ({ label: field.label, value: formData[field.name] || '' }))
    try {
      await submitRequest({
        name: formData.name,
        phone: formData.phone,
        service: service.title,
        source: 'Service page',
        website: formData.website,
        fields,
        appointment: appointment ?? undefined,
      })
      setFormData(Object.fromEntries(service.formFields.map((field) => [field.name, ''])))
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
    <div className="service-detail-page">
      <Header />

      <div className="detail-shell">
        <Link className="back-link" to="/">
          ← {t.back}
        </Link>

        <section className="detail-hero reveal">
          <div className="detail-copy">
            <span className="eyebrow dark">{service.accent}</span>
            <h1>{service.title}</h1>
            <p>{service.intro}</p>
            <div className="detail-actions">
              <a
                className="primary-button"
                href="#booking"
              >
                {t.enquire}
              </a>
              <Link className="secondary-button" to="/">
                {t.allServices}
              </Link>
            </div>
          </div>

          <div className="detail-image-wrap">
            <img src={servicePhoto(service)} alt={service.title} />
          </div>
        </section>

        <section className="detail-summary reveal">
          {service.overview.map((item) => (
            <div key={item} className="summary-chip">
              {item}
            </div>
          ))}
        </section>

        <section className="detail-content reveal">
          <div className="detail-panel">
            <h2>{t.details}</h2>
            <ul>
              {service.points.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </div>

          <div className="detail-panel detail-panel-alt">
            <h2>{t.why}</h2>
            <p>
              This service is built around practical decisions. The goal is not marketing language or vague promises — it is to reduce uncertainty, improve vehicle reliability, and help you choose the right next step with confidence.
            </p>
          </div>
        </section>

        <section className="process-section reveal">
          <div className="section-heading">
            <span className="eyebrow dark">{t.howWorks}</span>
            <h2>{t.clearProcess}</h2>
          </div>

          <div className="process-grid">
            {service.process.map((step) => (
              <div key={step.title} className="process-card">
                <span>{step.title}</span>
                <p>{step.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="booking" className="booking-panel reveal">
          <div className="booking-copy">
            <span className="eyebrow dark">{t.booking}</span>
            <h2>{service.formTitle}</h2>
            <p>{service.formIntro}</p>
          </div>

          {status.state === 'sent' ? (
            <div className="booking-form booking-done" role="status">
              <h3>Request sent. Thank you!</h3>
              <p>We will call you to confirm the details. For anything urgent, call +976 8885 6529.</p>
              <button type="button" className="secondary-button" onClick={() => setStatus({ state: 'idle', error: '' })}>
                Send another request
              </button>
            </div>
          ) : (
          <form className="booking-form" onSubmit={handleSubmit}>
            {service.formFields.map((field) => (
              <label key={field.name}>
                <span>{field.label}</span>
                {field.type === 'textarea' ? (
                  <textarea
                    name={field.name}
                    value={formData[field.name] || ''}
                    onChange={handleChange}
                    placeholder={field.placeholder}
                    required={field.required}
                  />
                ) : field.type === 'select' ? (
                  <select
                    name={field.name}
                    value={formData[field.name] || ''}
                    onChange={handleChange}
                    required={field.required}
                  >
                    <option value="">{field.placeholder}</option>
                    {field.options?.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={field.type}
                    name={field.name}
                    value={formData[field.name] || ''}
                    onChange={handleChange}
                    placeholder={field.placeholder}
                    required={field.required}
                    step={field.type === 'time' ? 60 : undefined}
                    onFocus={(event) => {
                      if (field.type === 'date') {
                        event.target.showPicker?.()
                      }
                    }}
                  />
                )}
              </label>
            ))}

            {service.appointment && (
              <AppointmentPicker
                value={appointment}
                onChange={chooseAppointment}
                optional={service.appointment === 'optional'}
                reloadKey={availabilityKey}
                error={appointmentError}
                onUnavailable={handlePickerDown}
              />
            )}
            <label className="booking-honeypot" aria-hidden="true">
              Website <input name="website" value={formData.website || ''} onChange={handleChange} tabIndex={-1} autoComplete="off" />
            </label>
            {status.state === 'error' && <p className="booking-error" role="alert">{status.error}</p>}
            <button type="submit" className="primary-button form-button" disabled={status.state === 'sending'}>
              {status.state === 'sending' ? 'Sending…' : t.sendRequest}
            </button>
          </form>
          )}
        </section>

        <section className="detail-cta reveal">
          <div>
            <span className="eyebrow dark">{t.needThis}</span>
            <h3>{t.needServiceText}</h3>
          </div>
          <a
            className="primary-button"
            href="#booking"
          >
            {t.contact}
          </a>
        </section>
      </div>
    </div>
  )
}

// Keyed by slug so the form state resets when moving between services.
function ServicePageRoute() {
  const { slug } = useParams()
  // Buying/selling has its own page with pricing and a buy/sell form.
  if (slug === 'buy-sell-car') return <BuySellPage key={slug} />
  return <ServicePage key={slug} slug={slug} />
}

export default ServicePageRoute

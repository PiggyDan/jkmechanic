import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { services } from '../data/services'
import Header from '../components/Header'

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

function ServicePage() {
  const { slug } = useParams()
  const service = services.find((item) => item.slug === slug)

  const initialFormState = service?.formFields
    ? Object.fromEntries(service.formFields.map((field) => [field.name, '']))
    : {}

  const [formData, setFormData] = useState(initialFormState)

  useEffect(() => {
    if (service?.formFields) {
      setFormData(Object.fromEntries(service.formFields.map((field) => [field.name, ''])))
    }
  }, [service])

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

  const handleSubmit = (event) => {
    event.preventDefault()

    const subject = encodeURIComponent(`Booking request - ${service.title}`)
    const body = encodeURIComponent(
      service.formFields
        .map((field) => `${field.label}: ${formData[field.name] || 'N/A'}`)
        .join('\n'),
    )

    const extraFields = service.slug === 'buy-sell-car'
      ? service.formFields.length
        ? ''
        : ''
      : ''

    const buySellExtra = service.slug === 'buy-sell-car'
      ? [
          formData.goal === 'Buy a car'
            ? [
                `Type of car looking for: ${formData.lookingFor || 'N/A'}`,
                `Budget: ${formData.budget || 'N/A'}`,
              ]
            : [
                `Type of vehicle: ${formData.vehicleType || 'N/A'}`,
                `Manufactured year: ${formData.manufacturedYear || 'N/A'}`,
                `Imported year: ${formData.importedYear || 'N/A'}`,
                `Price: ${formData.price || 'N/A'}`,
                `Negotiating: ${formData.negotiating || 'N/A'}`,
              ],
        ].flat().join('\n')
      : ''

    const finalBody = encodeURIComponent(
      [
        service.formFields.map((field) => `${field.label}: ${formData[field.name] || 'N/A'}`).join('\n'),
        buySellExtra,
      ]
        .filter(Boolean)
        .join('\n\n'),
    )

    window.location.href = `mailto:jkmongolia@gmail.com?subject=${subject}&body=${finalBody}`
  }

  const buySellFields =
    service.slug === 'buy-sell-car'
      ? formData.goal === 'Buy a car'
        ? [
            { name: 'lookingFor', label: 'What kind of car are you looking for?', type: 'text', placeholder: 'SUV, sedan, pickup, etc.', required: true },
            { name: 'budget', label: 'Your budget', type: 'text', placeholder: 'e.g. 25,000,000 MNT', required: true },
          ]
        : [
            { name: 'vehicleType', label: 'Type of vehicle', type: 'select', placeholder: 'Choose vehicle type', required: true, options: ['SUV', 'Sedan', 'Pickup truck', 'Van', 'Truck', 'Other'] },
            { name: 'manufacturedYear', label: 'Manufactured year', type: 'text', placeholder: 'e.g. 2018', required: true },
            { name: 'importedYear', label: 'Imported year', type: 'text', placeholder: 'e.g. 2020', required: true },
            { name: 'price', label: 'Price', type: 'text', placeholder: 'e.g. 18,000,000 MNT', required: true },
            { name: 'negotiating', label: 'Negotiating?', type: 'select', placeholder: 'Choose an option', required: true, options: ['Yes', 'No'] },
          ]
      : []

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
                href={`mailto:jkmongolia@gmail.com?subject=${encodeURIComponent(`Service Inquiry - ${service.title}`)}`}
              >
                {t.enquire}
              </a>
              <Link className="secondary-button" to="/">
                {t.allServices}
              </Link>
            </div>
          </div>

          <div className="detail-image-wrap">
            <img src={service.image} alt={service.title} />
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

        <section className="booking-panel reveal">
          <div className="booking-copy">
            <span className="eyebrow dark">{t.booking}</span>
            <h2>{service.formTitle}</h2>
            <p>{service.formIntro}</p>
          </div>

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

            {buySellFields.map((field) => (
              <label key={field.name}>
                <span>{field.label}</span>
                {field.type === 'select' ? (
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
                  />
                )}
              </label>
            ))}

            <button type="submit" className="primary-button form-button">{t.sendRequest}</button>
          </form>
        </section>

        <section className="detail-cta reveal">
          <div>
            <span className="eyebrow dark">{t.needThis}</span>
            <h3>{t.needServiceText}</h3>
          </div>
          <a
            className="primary-button"
            href={`mailto:jkmongolia@gmail.com?subject=${encodeURIComponent(`Service Inquiry - ${service.title}`)}`}
          >
            {t.contact}
          </a>
        </section>
      </div>
    </div>
  )
}

export default ServicePage

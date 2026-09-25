import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, CarFront, HelpCircle, KeyRound, PlaneLanding, Repeat, Wrench, X } from 'lucide-react'
import { services } from '../data/services'
import './book-button.css'

const icons = {
  'vehicle-repair-shop': Wrench,
  'vehicle-rental': KeyRound,
  'buy-sell-car': Repeat,
  'driver-transfers': PlaneLanding,
  other: HelpCircle,
}

// Repairs are the main business, so they go first in the picker.
const ordered = [...services].sort((a, b) => (b.slug === 'vehicle-repair-shop') - (a.slug === 'vehicle-repair-shop'))

// A "Book" button that asks which service first, then opens that service's booking form.
export default function BookButton({ className, children = 'Book appointment' }) {
  const [open, setOpen] = useState(false)
  const dialogRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    const dialog = dialogRef.current
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  const go = (to) => {
    setOpen(false)
    navigate(to)
  }

  return (
    <>
      <button type="button" className={`book-trigger ${className}`} onClick={() => setOpen(true)} aria-haspopup="dialog">
        {children}
      </button>

      <dialog
        ref={dialogRef}
        className="book-picker"
        aria-labelledby="book-picker-title"
        onClose={() => setOpen(false)}
        onClick={(event) => { if (event.target === event.currentTarget) setOpen(false) }}
      >
        <div className="book-picker-inner">
          <header>
            <div>
              <span className="book-picker-kicker">Book an appointment</span>
              <h2 id="book-picker-title">What do you need help with?</h2>
            </div>
            <button type="button" className="book-picker-close" onClick={() => setOpen(false)} aria-label="Close">
              <X size={20} />
            </button>
          </header>

          <div className="book-picker-list">
            {ordered.map((service) => {
              const Icon = icons[service.slug] ?? CarFront
              return (
                <button key={service.slug} type="button" className="book-option" onClick={() => go(`/services/${service.slug}#booking`)}>
                  <span className="book-option-icon"><Icon size={22} /></span>
                  <span className="book-option-text">
                    <strong>{service.title}</strong>
                    <small>{service.summary}</small>
                  </span>
                  <ArrowRight className="book-option-arrow" size={18} aria-hidden="true" />
                </button>
              )
            })}
          </div>

          <p className="book-picker-foot">
            Not sure which one? <button type="button" onClick={() => go('/#contact')}>Send a general request</button> or call <a href="tel:+97688856529">+976 8885 6529</a>.
          </p>
        </div>
      </dialog>
    </>
  )
}

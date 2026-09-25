import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  BadgeCheck, CalendarRange, ClipboardCheck, FileText, Gauge, HandCoins, Handshake, Megaphone, Phone, Search, ShieldCheck,
  Sparkles, TrendingUp, Wrench,
} from 'lucide-react'
import Header from '../components/Header'
import { submitRequest } from '../lib/submitRequest'
import { galleryPhotos } from '../data/gallery'
import MoneyField from '../components/MoneyField'
import { describeAmount } from '../lib/money'
import {
  SELL_COMMISSION, buyChecks, buyFields, buySteps, priceFactors as sharedPriceFactors, reasons as sharedReasons, sellFields,
  sellSteps as sharedSellSteps,
} from '../data/buySell'
import './buy-sell.css'

// Uses a workshop photo from src/assets/gallery/ once added (the second, so it differs from the home page).
const HERO_IMAGE = galleryPhotos[1] ?? galleryPhotos[0] ?? 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1800&q=80'

// Lucide icon names used in the shared buy/sell content.
const icons = { BadgeCheck, CalendarRange, ClipboardCheck, FileText, Gauge, HandCoins, Handshake, Megaphone, Search, ShieldCheck, Sparkles, TrendingUp, Wrench }
const withIcons = (items) => items.map((item) => ({ ...item, icon: icons[item.icon] }))
const reasons = withIcons(sharedReasons)
const sellSteps = withIcons(sharedSellSteps)
const priceFactors = withIcons(sharedPriceFactors)

const emptyForm = { name: '', phone: '', notes: '', website: '' }

function BuySellPage() {
  const [goal, setGoal] = useState('sell')
  const [form, setForm] = useState(emptyForm)
  const [status, setStatus] = useState({ state: 'idle', error: '' })
  const location = useLocation()

  useEffect(() => {
    if (location.hash) document.querySelector(location.hash)?.scrollIntoView({ behavior: 'smooth' })
  }, [location.key, location.hash])

  const startForm = (nextGoal) => {
    setGoal(nextGoal)
    document.querySelector('#booking')?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const goalFields = goal === 'buy' ? buyFields : sellFields
  const currencyOf = (name) => form[`${name}Currency`] || 'MNT'
  const setValue = (name, value) => setForm((current) => ({ ...current, [name]: value }))

  const handleSubmit = async (event) => {
    event.preventDefault()
    setStatus({ state: 'sending', error: '' })
    try {
      await submitRequest({
        name: form.name,
        phone: form.phone,
        service: goal === 'buy' ? 'Buy a car' : 'Sell a car',
        source: 'Buy / sell page',
        website: form.website,
        fields: [...goalFields, { name: 'notes', label: 'Notes' }].map((field) => ({
          label: field.label,
          value: field.type === 'money' ? describeAmount(form[field.name], currencyOf(field.name)) : form[field.name] || '',
        })),
      })
      setForm(emptyForm)
      setStatus({ state: 'sent', error: '' })
    } catch (error) {
      setStatus({ state: 'error', error: error.message })
    }
  }

  return (
    <div className="luxury-page home buysell">
      <Header />

      <main>
        <section className="home-hero buysell-hero reveal" style={{ '--hero-image': `url(${HERO_IMAGE})` }} aria-labelledby="buysell-title">
          <div className="home-hero-copy">
            <Link className="buysell-back" to="/#services">← All services</Link>
            <span className="home-kicker">Buy a car · Sell a car</span>
            <h1 id="buysell-title">Buy or sell a car without the guesswork.</h1>
            <p>
              A used car is only as good as its real condition. Justin checks cars as a mechanic,
              so buyers know what they are paying for and sellers get a fair price, faster.
            </p>
            <div className="home-actions">
              <button type="button" className="primary-button book-trigger" onClick={() => startForm('sell')}>Get a price for my car</button>
              <button type="button" className="home-ghost-button" onClick={() => startForm('buy')}>Help me buy a car</button>
            </div>
          </div>
          <nav className="buysell-jump" aria-label="On this page">
            <a href="#why">Why JK</a>
            <a href="#buying">Buying</a>
            <a href="#selling">Selling</a>
            <a href="#pricing">How we price</a>
          </nav>
        </section>

        <section id="why" className="home-section reveal" aria-labelledby="why-title">
          <div className="home-section-head">
            <span className="home-kicker">Why use Jkmechanic Shop</span>
            <h2 id="why-title">Most car deals go wrong on things nobody checked.</h2>
          </div>
          <div className="buysell-cards">
            {reasons.map(({ icon: Icon, title, text }) => (
              <article key={title} className="buysell-card">
                <Icon size={22} aria-hidden="true" />
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="buying" className="home-section buysell-split reveal" aria-labelledby="buying-title">
          <div>
            <span className="home-kicker">Buying a car</span>
            <h2 id="buying-title">Know what you are buying before you pay.</h2>
            <p className="buysell-lead">
              Photos and a short test drive hide a lot: worn gearboxes, repaired accidents, rust underneath,
              or a car that only runs well once it is warm. We check the car properly and tell you straight.
            </p>
            <h3 className="buysell-subhead">What we check</h3>
            <ul className="buysell-checks">
              {buyChecks.map((item) => <li key={item}>{item}</li>)}
            </ul>
            <p className="buysell-fee">
              <strong>Cost:</strong> depends on how many cars we check and how much help you need.{' '}
              <button type="button" className="buysell-link" onClick={() => startForm('buy')}>Ask for a quote</button>
            </p>
          </div>
          <ol className="buysell-steps">
            {buySteps.map((step, index) => (
              <li key={step.title}>
                <span className="buysell-step-number">{index + 1}</span>
                <div>
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section id="selling" className="home-section reveal" aria-labelledby="selling-title">
          <div className="home-section-head home-section-head-split">
            <div>
              <span className="home-kicker">Selling a car</span>
              <h2 id="selling-title">Sell for a fair price, without a week of phone calls.</h2>
            </div>
            <p>We prepare, price and show your car, and you stay in control of the final decision.</p>
          </div>
          <div className="buysell-cards buysell-cards-steps">
            {sellSteps.map(({ icon: Icon, title, text }, index) => (
              <article key={title} className="buysell-card">
                <span className="buysell-card-step">Step {index + 1}</span>
                <Icon size={22} aria-hidden="true" />
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="pricing" className="home-band buysell-pricing reveal" aria-labelledby="pricing-title">
          <div className="buysell-pricing-head">
            <span className="home-kicker">How we price your car</span>
            <h2 id="pricing-title">Where the price comes from</h2>
            <p>
              A good asking price is not a guess. We look at the car itself and at the market, then
              explain what pushes the price up or down, so you can decide with the full picture.
            </p>
          </div>
          <div className="buysell-factors">
            {priceFactors.map(({ icon: Icon, title, text }) => (
              <div key={title} className="buysell-factor">
                <Icon size={20} aria-hidden="true" />
                <div>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="buysell-fee-card">
            <HandCoins size={26} aria-hidden="true" />
            <div>
              <h3>Our selling fee</h3>
              <p>
                {SELL_COMMISSION
                  ? <>We charge <strong>{SELL_COMMISSION} of the final sale price</strong>. </>
                  : <>Our fee is a <strong>percentage of the final sale price</strong>. We agree the exact percentage with you before we start. </>}
                You know the cost up front, with no surprises at the end.
              </p>
            </div>
            <button type="button" className="primary-button book-trigger" onClick={() => startForm('sell')}>Get a price for my car</button>
          </div>
        </section>

        <section id="booking" className="home-section home-contact buysell-form-section reveal" aria-labelledby="form-title">
          <div className="home-visit">
            <span className="home-kicker">Get started</span>
            <h2 id="form-title">{goal === 'buy' ? 'Tell us what you are looking for.' : 'Tell us about your car.'}</h2>
            <p className="buysell-lead">
              {goal === 'buy'
                ? 'Send the details and Justin will call you to talk through options and next steps.'
                : 'Send the details and Justin will call you to arrange a check and talk through the price.'}
            </p>
            <a className="buysell-call" href="tel:+97688856529"><Phone size={18} /> Prefer to talk? +976 8885 6529</a>
          </div>

          {status.state === 'sent' ? (
            <div className="home-form home-form-done" role="status">
              <h3>Thank you, we got it!</h3>
              <p>Justin will call you soon. For anything urgent, call +976 8885 6529.</p>
              <button type="button" className="secondary-button" onClick={() => setStatus({ state: 'idle', error: '' })}>Send another</button>
            </div>
          ) : (
            <form className="home-form" onSubmit={handleSubmit}>
              <div className="buysell-toggle" role="radiogroup" aria-label="I want to">
                {[['sell', 'I want to sell'], ['buy', 'I want to buy']].map(([value, label]) => (
                  <label key={value} className={goal === value ? 'active' : ''}>
                    <input type="radio" name="goal" value={value} checked={goal === value} onChange={() => setGoal(value)} />
                    {label}
                  </label>
                ))}
              </div>

              <div className="home-form-grid">
                <label>
                  <span>Name</span>
                  <input name="name" value={form.name} onChange={handleChange} placeholder="Your name" autoComplete="name" required />
                </label>
                <label>
                  <span>Phone</span>
                  <input type="tel" name="phone" value={form.phone} onChange={handleChange} placeholder="+976 ..." autoComplete="tel" required />
                </label>
                {goalFields.map((field) => field.type === 'money' ? (
                  <MoneyField
                    key={field.name}
                    id={`money-${field.name}`}
                    label={field.label}
                    amount={form[field.name] || ''}
                    currency={currencyOf(field.name)}
                    onAmountChange={(value) => setValue(field.name, value)}
                    onCurrencyChange={(code) => setValue(`${field.name}Currency`, code)}
                    required={field.required}
                    optional={!field.required}
                  />
                ) : (
                  <label key={field.name}>
                    <span>{field.label}{!field.required && field.type !== 'select' && !field.placeholder.startsWith('Optional') && <em> optional</em>}</span>
                    {field.type === 'select' ? (
                      <select name={field.name} value={form[field.name] || ''} onChange={handleChange}>
                        <option value="">Choose…</option>
                        {field.options.map((option) => <option key={option}>{option}</option>)}
                      </select>
                    ) : (
                      <input name={field.name} value={form[field.name] || ''} onChange={handleChange} placeholder={field.placeholder} required={field.required} inputMode={field.inputMode} />
                    )}
                  </label>
                ))}
              </div>
              <label>
                <span>Anything else? <em>optional</em></span>
                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  rows="4"
                  placeholder={goal === 'buy' ? 'Must-haves, cars you are already looking at…' : 'Known problems, recent repairs, service records…'}
                />
              </label>
              <label className="home-honeypot" aria-hidden="true">
                Website <input name="website" value={form.website} onChange={handleChange} tabIndex={-1} autoComplete="off" />
              </label>
              {status.state === 'error' && <p className="home-form-error" role="alert">{status.error}</p>}
              <button type="submit" className="primary-button form-button" disabled={status.state === 'sending'}>
                {status.state === 'sending' ? 'Sending…' : goal === 'buy' ? 'Send my request' : 'Get my price check'}
              </button>
            </form>
          )}
        </section>
      </main>
    </div>
  )
}

export default BuySellPage

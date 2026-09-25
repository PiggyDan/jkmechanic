import { useEffect, useRef, useState } from 'react'
import { ImagePlus, PenLine, Star, X } from 'lucide-react'
import { compressImage } from '../lib/compressImage'
import './customer-reviews.css'

const emptyForm = { name: '', rating: 0, text: '', vehicle: '', website: '', photos: [] }
const MAX_PHOTOS = 3
const photoUrl = (review, n) => `/api/review-photo?id=${review.id}&n=${n}`
const LABELS = ['', 'Poor', 'Fair', 'Good', 'Very good', 'Excellent']
const dateFormat = new Intl.DateTimeFormat('en-GB', { month: 'short', year: 'numeric' })

function StarPicker({ value, onChange }) {
  const [hover, setHover] = useState(0)
  const shown = hover || value
  return (
    <div className="review-stars-input" role="radiogroup" aria-label="Your rating" onMouseLeave={() => setHover(0)}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          role="radio"
          aria-checked={value === star}
          aria-label={`${star} star${star > 1 ? 's' : ''}`}
          onMouseEnter={() => setHover(star)}
          onClick={() => onChange(star)}
          className={star <= shown ? 'on' : ''}
        >
          <Star size={30} fill="currentColor" strokeWidth={0} />
        </button>
      ))}
      <span className="review-stars-label">{LABELS[shown] || 'Tap to rate'}</span>
    </div>
  )
}

// Reviews written on this website: approved ones are listed, and anyone can write a new one.
// New reviews wait for Justin's approval in /admin before they appear.
export default function CustomerReviews() {
  const [data, setData] = useState({ reviews: [], count: 0, average: null })
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [status, setStatus] = useState({ state: 'idle', error: '' })
  const [photoBusy, setPhotoBusy] = useState(false)
  const fileRef = useRef(null)

  useEffect(() => {
    let active = true
    fetch('/api/reviews')
      .then((response) => (response.ok ? response.json() : null))
      .then((result) => active && result && setData(result))
      .catch(() => {})
    return () => { active = false }
  }, [])

  const change = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }))

  const addPhotos = async (event) => {
    const files = [...event.target.files].slice(0, MAX_PHOTOS - form.photos.length)
    event.target.value = ''
    if (!files.length) return
    setPhotoBusy(true)
    setStatus({ state: 'idle', error: '' })
    try {
      const shrunk = []
      for (const file of files) shrunk.push(await compressImage(file))
      setForm((current) => ({ ...current, photos: [...current.photos, ...shrunk].slice(0, MAX_PHOTOS) }))
    } catch (error) {
      setStatus({ state: 'error', error: error.message })
    } finally {
      setPhotoBusy(false)
    }
  }

  const removePhoto = (index) => setForm((current) => ({ ...current, photos: current.photos.filter((_, i) => i !== index) }))

  const submit = async (event) => {
    event.preventDefault()
    if (!form.rating) return setStatus({ state: 'error', error: 'Please choose a star rating.' })
    setStatus({ state: 'sending', error: '' })
    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const result = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(result.error || 'Your review could not be sent. Please try again.')
      setForm(emptyForm)
      setStatus({ state: 'sent', error: '' })
    } catch (error) {
      setStatus({ state: 'error', error: error.message })
    }
  }

  return (
    <div className="customer-reviews">
      <div className="customer-reviews-head">
        <div>
          <h3>From our customers</h3>
          {data.count > 0 && (
            <p>
              <strong>{Number(data.average).toFixed(1)}</strong> <Star size={14} fill="currentColor" strokeWidth={0} className="review-star-inline" /> average from {data.count} review{data.count === 1 ? '' : 's'} on this site
            </p>
          )}
        </div>
        {!open && status.state !== 'sent' && (
          <button type="button" className="secondary-button review-write" onClick={() => setOpen(true)}>
            <PenLine size={16} /> Write a review
          </button>
        )}
      </div>

      {status.state === 'sent' ? (
        <p className="review-thanks" role="status">
          <strong>Thank you for your review!</strong> It will appear here once Justin has checked it.
        </p>
      ) : open && (
        <form className="review-form" onSubmit={submit}>
          <StarPicker value={form.rating} onChange={(rating) => setForm((current) => ({ ...current, rating }))} />
          <div className="review-form-grid">
            <label>
              <span>Your name</span>
              <input name="name" value={form.name} onChange={change} placeholder="e.g. Bold" maxLength={60} autoComplete="given-name" required />
            </label>
            <label>
              <span>Vehicle <em>optional</em></span>
              <input name="vehicle" value={form.vehicle} onChange={change} placeholder="e.g. Toyota Land Cruiser" maxLength={80} />
            </label>
          </div>
          <label>
            <span>Your review</span>
            <textarea name="text" value={form.text} onChange={change} rows="4" minLength={10} maxLength={1500} placeholder="What did Justin fix, and how was the experience?" required />
          </label>
          <div className="review-photos">
            <span className="review-photos-label">Photos <em>optional, up to {MAX_PHOTOS}</em></span>
            <div className="review-photos-row">
              {form.photos.map((src, index) => (
                <div key={src.slice(-32)} className="review-photo-thumb">
                  <img src={src} alt={`Your photo ${index + 1}`} />
                  <button type="button" onClick={() => removePhoto(index)} aria-label={`Remove photo ${index + 1}`}><X size={14} /></button>
                </div>
              ))}
              {form.photos.length < MAX_PHOTOS && (
                <button type="button" className="review-photo-add" onClick={() => fileRef.current?.click()} disabled={photoBusy}>
                  <ImagePlus size={22} />
                  <span>{photoBusy ? 'Preparing…' : 'Add photo'}</span>
                </button>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={addPhotos} />
            <small className="review-note">Show the work, your vehicle, or the workshop. Photos are shrunk before upload.</small>
          </div>
          <label className="home-honeypot" aria-hidden="true">
            Website <input name="website" value={form.website} onChange={change} tabIndex={-1} autoComplete="off" />
          </label>
          {status.state === 'error' && <p className="home-form-error" role="alert">{status.error}</p>}
          <div className="review-form-actions">
            <button type="submit" className="primary-button form-button" disabled={status.state === 'sending' || photoBusy}>
              {status.state === 'sending' ? 'Sending…' : 'Send review'}
            </button>
            <button type="button" className="review-cancel" onClick={() => { setOpen(false); setStatus({ state: 'idle', error: '' }) }}>Cancel</button>
          </div>
          <small className="review-note">Reviews are checked before they are published.</small>
        </form>
      )}

      {data.reviews.length > 0 ? (
        <div className="review-cards">
          {data.reviews.map((review) => (
            <figure key={review.id} className="review-card">
              <span className="review-card-stars" aria-label={`${review.rating} out of 5 stars`}>
                {Array.from({ length: 5 }, (_, index) => (
                  <Star key={index} size={15} fill="currentColor" strokeWidth={0} className={index < review.rating ? 'on' : ''} />
                ))}
              </span>
              <blockquote>“{review.text}”</blockquote>
              {review.photos > 0 && (
                <div className="review-card-photos">
                  {Array.from({ length: review.photos }, (_, n) => (
                    <a key={n} href={photoUrl(review, n)} target="_blank" rel="noreferrer" aria-label={`Open photo ${n + 1} from ${review.name}`}>
                      <img src={photoUrl(review, n)} alt={`Photo ${n + 1} from ${review.name}`} loading="lazy" />
                    </a>
                  ))}
                </div>
              )}
              <figcaption>
                {review.name}
                {review.vehicle && <span> · {review.vehicle}</span>}
                <time dateTime={new Date(review.createdAt).toISOString()}> · {dateFormat.format(review.createdAt)}</time>
              </figcaption>
            </figure>
          ))}
        </div>
      ) : (
        !open && status.state !== 'sent' && <p className="review-empty">Be the first to review Garage 84 here.</p>
      )}
    </div>
  )
}

import { useEffect, useState } from 'react'
import { Check, EyeOff, RotateCcw, Star, Trash2 } from 'lucide-react'
import { adminApi, timeAgo, timeFormat } from './adminApi'

const FILTERS = [['pending', 'Waiting'], ['approved', 'Published'], ['hidden', 'Hidden']]

// Photos of unpublished reviews need the admin password, so load them with it
// instead of a plain <img src> (which can't send the Authorization header).
function AdminPhoto({ token, reviewId, n, name }) {
  const [src, setSrc] = useState(null)
  useEffect(() => {
    let url
    let active = true
    fetch(`/api/review-photo?id=${reviewId}&n=${n}`, { headers: { Authorization: `Bearer ${token}` } })
      .then((response) => (response.ok ? response.blob() : null))
      .then((blob) => {
        if (!blob || !active) return
        url = URL.createObjectURL(blob)
        setSrc(url)
      })
      .catch(() => {})
    return () => {
      active = false
      if (url) URL.revokeObjectURL(url)
    }
  }, [token, reviewId, n])

  if (!src) return <span className="admin-review-photo is-loading" aria-hidden="true" />
  return (
    <a className="admin-review-photo" href={src} target="_blank" rel="noreferrer" aria-label={`Open photo ${n + 1} from ${name}`}>
      <img src={src} alt={`Photo ${n + 1} from ${name}`} />
    </a>
  )
}

// Approve customer reviews before they appear on the website, or hide/delete them.
export default function AdminReviews({ token, reviews, onChange, onError }) {
  const [filter, setFilter] = useState('pending')
  const counts = Object.fromEntries(FILTERS.map(([value]) => [value, reviews.filter((review) => review.status === value).length]))
  const visible = reviews.filter((review) => review.status === filter)

  const setStatus = async (review, status) => {
    onChange(reviews.map((item) => (item.id === review.id ? { ...item, status } : item)))
    try {
      await adminApi(token, 'reviews', 'PATCH', { body: { id: review.id, status } })
    } catch (err) {
      onError(err)
    }
  }

  const remove = async (review) => {
    if (!window.confirm(`Delete the review from ${review.name}? This cannot be undone.`)) return
    onChange(reviews.filter((item) => item.id !== review.id))
    try {
      await adminApi(token, 'reviews', 'DELETE', { query: `?id=${encodeURIComponent(review.id)}` })
    } catch (err) {
      onError(err)
    }
  }

  return (
    <>
      <div className="admin-toolbar">
        <div className="admin-tabs" role="tablist" aria-label="Filter reviews">
          {FILTERS.map(([value, label]) => (
            <button key={value} type="button" role="tab" aria-selected={filter === value} className={filter === value ? 'active' : ''} onClick={() => setFilter(value)}>
              {label} <span>{counts[value]}</span>
            </button>
          ))}
        </div>
        <p className="admin-hint">Only published reviews appear on the website.</p>
      </div>

      {visible.length === 0 && (
        <div className="admin-empty">
          {filter === 'pending' ? 'No reviews waiting. New ones from the website appear here first.' : 'Nothing here yet.'}
        </div>
      )}

      <div className="admin-list">
        {visible.map((review) => (
          <article key={review.id} className={`admin-card${review.status === 'pending' ? ' is-new' : ''}`}>
            <header>
              <div>
                <h2>{review.name}</h2>
                <p className="admin-review-stars" aria-label={`${review.rating} out of 5 stars`}>
                  {Array.from({ length: 5 }, (_, index) => (
                    <Star key={index} size={16} fill="currentColor" strokeWidth={0} className={index < review.rating ? 'on' : ''} />
                  ))}
                  {review.vehicle && <span> · {review.vehicle}</span>}
                </p>
              </div>
              <div className="admin-card-side">
                {review.status === 'pending' && <span className="admin-badge">New</span>}
                <time dateTime={new Date(review.createdAt).toISOString()} title={timeFormat.format(review.createdAt)}>{timeAgo(review.createdAt)}</time>
              </div>
            </header>
            <p className="admin-review-text">{review.text}</p>
            {review.photos > 0 && (
              <div className="admin-review-photos">
                {Array.from({ length: review.photos }, (_, n) => (
                  <AdminPhoto key={n} token={token} reviewId={review.id} n={n} name={review.name} />
                ))}
              </div>
            )}
            <footer>
              <span className="admin-exact-time">{timeFormat.format(review.createdAt)}</span>
              <div className="admin-card-actions">
                {review.status !== 'approved' && (
                  <button type="button" className="admin-btn admin-btn-primary" onClick={() => setStatus(review, 'approved')}>
                    <Check size={15} /> Publish
                  </button>
                )}
                {review.status === 'approved' && (
                  <button type="button" className="admin-btn" onClick={() => setStatus(review, 'hidden')}>
                    <EyeOff size={15} /> Hide
                  </button>
                )}
                {review.status === 'pending' && (
                  <button type="button" className="admin-btn" onClick={() => setStatus(review, 'hidden')}>
                    <EyeOff size={15} /> Don&apos;t publish
                  </button>
                )}
                {review.status === 'hidden' && (
                  <button type="button" className="admin-btn" onClick={() => setStatus(review, 'pending')}>
                    <RotateCcw size={15} /> Back to waiting
                  </button>
                )}
                <button type="button" className="admin-btn admin-btn-danger" onClick={() => remove(review)} aria-label={`Delete review from ${review.name}`}>
                  <Trash2 size={15} />
                </button>
              </div>
            </footer>
          </article>
        ))}
      </div>
    </>
  )
}

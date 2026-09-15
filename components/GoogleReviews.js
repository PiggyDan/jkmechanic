'use client';

import { useEffect, useState } from 'react';
import { ExternalLink } from 'lucide-react';

export default function GoogleReviews() {
  const [state, setState] = useState({ status: 'loading', data: null });

  useEffect(() => {
    let active = true;

    fetch('/api/google-place')
      .then((res) => res.json())
      .then((data) => {
        if (!active) return;

        if (data.error) {
          setState({ status: 'error', data: null });
          return;
        }

        setState({ status: 'ready', data });
      })
      .catch(() => {
        if (active) setState({ status: 'error', data: null });
      });

    return () => {
      active = false;
    };
  }, []);

  if (state.status === 'error') {
    return (
      <div className="proof-head">
        <div>
          <div className="section-kicker">Customer feedback</div>
          <h2>Google Reviews</h2>
          <p>Reviews are temporarily unavailable. Please check back shortly.</p>
        </div>
      </div>
    );
  }

  const data = state.data;
  const rating = data?.rating ?? null;
  const reviewCount = data?.reviewCount ?? 0;
  const reviews = data?.reviews ?? [];
  const googleMapsUri = data?.googleMapsUri ?? null;

  return (
    <>
      <div className="proof-head">
        <div>
          <div className="section-kicker">Customer feedback</div>
          <h2>
            What people say
            <br />
            after the work is done.
          </h2>
          <p>Real reviews from our Google Business profile.</p>
        </div>

        {rating != null && (
          <div className="rating-block">
            <strong>{rating.toFixed(1)}</strong>
            <span>
              {'★'.repeat(Math.round(rating))}
              {'☆'.repeat(5 - Math.round(rating))}
            </span>
            <small>{reviewCount} Google reviews</small>
            {googleMapsUri && (
              <a
                className="text-link"
                href={googleMapsUri}
                target="_blank"
                rel="noreferrer"
              >
                View on Google Maps <ExternalLink size={14} />
              </a>
            )}
          </div>
        )}
      </div>

      {reviews.length > 0 && (
        <div className="review-cards">
          {reviews.slice(0, 6).map((review, index) => (
            <article key={index}>
              <div className="review-stars">
                {'★'.repeat(review.rating)}
                {'☆'.repeat(5 - review.rating)}
              </div>

              <p>{review.text}</p>

              <footer>
                <div className="review-author">
                  {review.authorPhoto && (
                    <img
                      className="review-avatar"
                      src={review.authorPhoto}
                      alt={review.author}
                      referrerPolicy="no-referrer"
                    />
                  )}
                  <b>{review.author}</b>
                </div>
                <small>{review.date || review.relativeTime}</small>
              </footer>
            </article>
          ))}
        </div>
      )}
    </>
  );
}

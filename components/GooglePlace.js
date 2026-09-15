'use client';

import { useEffect, useState } from 'react';
import { Star } from 'lucide-react';

export default function GooglePlace({ mode = 'single', photoIndex = 0 }) {
  const [state, setState] = useState({ status: 'loading', photo: null, rating: null });

  useEffect(() => {
    let active = true;

    fetch('/api/google-place')
      .then((res) => res.json())
      .then((data) => {
        if (!active) return;

        if (data.error) {
          setState({ status: 'error', photo: null, rating: null });
          return;
        }

        const index = mode === 'hero' ? 0 : photoIndex;
        const photo = data.photos?.[index] ?? null;

        setState({
          status: photo ? 'ready' : 'empty',
          photo,
          rating: data.rating ?? null,
        });
      })
      .catch(() => {
        if (active) setState({ status: 'error', photo: null, rating: null });
      });

    return () => {
      active = false;
    };
  }, [mode, photoIndex]);

  const sizeClass = mode === 'hero' ? 'hero-real-photo' : 'service-real-photo';
  const loaded = state.status === 'ready';

  return (
    <div className={`real-photo ${sizeClass} ${loaded ? 'loaded' : ''}`}>
      {loaded && (
        <img
          src={state.photo.url}
          alt="JK Mongolia workshop"
          referrerPolicy="no-referrer"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      )}

      <div className="photo-await">
        <span>JK</span>
        <small>
          {state.status === 'error' || state.status === 'empty'
            ? 'Photo unavailable'
            : 'Loading real photo…'}
        </small>
      </div>

      {mode === 'hero' && loaded && state.rating != null && (
        <div className="photo-badge">
          <Star size={14} fill="currentColor" />
          {state.rating.toFixed(1)} on Google
        </div>
      )}
    </div>
  );
}

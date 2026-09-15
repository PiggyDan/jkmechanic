'use client';

import { useEffect, useState } from 'react';

export default function GoogleGallery() {
  const [state, setState] = useState({ status: 'loading', photos: [] });

  useEffect(() => {
    let active = true;

    fetch('/api/google-place')
      .then((res) => res.json())
      .then((data) => {
        if (!active) return;

        if (data.error || !data.photos?.length) {
          setState({ status: 'empty', photos: [] });
          return;
        }

        setState({ status: 'ready', photos: data.photos.slice(0, 4) });
      })
      .catch(() => {
        if (active) setState({ status: 'error', photos: [] });
      });

    return () => {
      active = false;
    };
  }, []);

  if (state.status === 'error' || state.status === 'empty') {
    return null;
  }

  return (
    <>
      <div className="section-top">
        <div>
          <div className="section-kicker">Our work</div>
          <h2>
            Real vehicles.
            <br />
            Real jobs.
          </h2>
        </div>
        <p>A look at recent work, straight from our Google Business photos.</p>
      </div>

      <div className="proof-gallery">
        {state.status === 'loading'
          ? Array.from({ length: 4 }).map((_, index) => (
              <div className="proof-photo" key={index} />
            ))
          : state.photos.map((photo, index) => (
              <div className="proof-photo" key={photo.id}>
                <img
                  src={photo.url}
                  alt={`JK Mongolia workshop photo ${index + 1}`}
                  loading={index === 0 ? 'eager' : 'lazy'}
                  referrerPolicy="no-referrer"
                />
                {photo.attribution?.displayName && (
                  <span className="proof-photo-credit">
                    Photo:{' '}
                    {photo.attribution.uri ? (
                      <a href={photo.attribution.uri} target="_blank" rel="noreferrer">
                        {photo.attribution.displayName}
                      </a>
                    ) : (
                      photo.attribution.displayName
                    )}
                  </span>
                )}
              </div>
            ))}
      </div>
    </>
  );
}

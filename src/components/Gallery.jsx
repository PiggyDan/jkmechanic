import { useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { galleryPhotos } from '../data/gallery'
import './gallery.css'

// Photo grid with a full-screen viewer. Renders nothing until photos are added.
export default function Gallery({ limit = 8 }) {
  const [showAll, setShowAll] = useState(false)
  const [openIndex, setOpenIndex] = useState(null)
  const dialogRef = useRef(null)

  const count = galleryPhotos.length
  const shown = showAll ? galleryPhotos : galleryPhotos.slice(0, limit)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (openIndex !== null && !dialog.open) dialog.showModal()
    if (openIndex === null && dialog.open) dialog.close()
  }, [openIndex])

  if (!count) return null

  const step = (delta) => setOpenIndex((index) => (index + delta + count) % count)

  const handleKeyDown = (event) => {
    if (event.key === 'ArrowRight') step(1)
    if (event.key === 'ArrowLeft') step(-1)
  }

  return (
    <>
      <div className="gallery-grid">
        {shown.map((src, index) => (
          <button key={src} type="button" className="gallery-tile" onClick={() => setOpenIndex(index)} aria-label={`Open photo ${index + 1} of ${count}`}>
            <img src={src} alt={`Garage 84 workshop photo ${index + 1}`} loading="lazy" decoding="async" />
          </button>
        ))}
      </div>

      {count > limit && (
        <button type="button" className="secondary-button gallery-more" onClick={() => setShowAll((value) => !value)}>
          {showAll ? 'Show fewer photos' : `Show all ${count} photos`}
        </button>
      )}

      <dialog
        ref={dialogRef}
        className="gallery-viewer"
        aria-label="Photo viewer"
        onClose={() => setOpenIndex(null)}
        onKeyDown={handleKeyDown}
        onClick={(event) => { if (event.target === event.currentTarget) setOpenIndex(null) }}
      >
        {openIndex !== null && (
          <>
            <img src={galleryPhotos[openIndex]} alt={`Garage 84 workshop photo ${openIndex + 1}`} />
            <span className="gallery-counter">{openIndex + 1} / {count}</span>
            <button type="button" className="gallery-nav gallery-close" onClick={() => setOpenIndex(null)} aria-label="Close"><X size={20} /></button>
            {count > 1 && (
              <>
                <button type="button" className="gallery-nav gallery-prev" onClick={() => step(-1)} aria-label="Previous photo"><ChevronLeft size={24} /></button>
                <button type="button" className="gallery-nav gallery-next" onClick={() => step(1)} aria-label="Next photo"><ChevronRight size={24} /></button>
              </>
            )}
          </>
        )}
      </dialog>
    </>
  )
}

import { Link } from 'react-router-dom'
import Header from '../components/Header'
import {
  MAPS_URL,
  MAPS_EMBED_SRC,
  GOOGLE_RATING,
  GOOGLE_REVIEW_COUNT,
  featuredReviews,
  galleryPhotos,
} from '../data/googleBusiness'

const benefits = [
  'Practical diagnostics before expensive repairs',
  'Independent advice without dealership pressure',
  'Parts, paperwork, and export support in one place',
  'Straightforward Musso rental options for real use',
]

const proof = {
  kicker: 'Google Business Profile',
  title: 'See the shop before you visit.',
  text: 'Real location, real customer reviews, and workshop photos from the JK Mongolia Google Business listing.',
  reviewsLabel: 'Read all reviews on Google',
  photosLabel: 'More photos on Google',
}

function AboutPage() {
  return (
    <div className="luxury-page">
      <Header />

      <main>
        <section className="about-section reveal">
          <div className="about-visual">
            <div className="visual-card">
              <span className="mini-label">Experience</span>
              <strong>20</strong>
              <small>Years around Mongolia’s auto industry</small>
            </div>
          </div>

          <div className="about-copy">
            <span className="eyebrow dark">WHY US</span>
            <h2>Vehicles are rarely as simple as the fault code.</h2>
            <p>
              Twenty years in Mongolia’s automotive industry means seeing the same issues in new forms: hard cold starts, poor diesel work, worn suspension, mismatched parts, and vehicles that look right online but drive badly in person.
            </p>
            <p>
              JK Mongolia is built around practical judgment: diagnose clearly, explain simply, and recommend only what the vehicle truly needs.
            </p>

            <ul className="benefit-list">
              {benefits.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </section>

        <section className="proof-section reveal">
          <div className="section-header">
            <div>
              <span className="eyebrow dark">{proof.kicker}</span>
              <h2>{proof.title}</h2>
            </div>
            <p>{proof.text}</p>
          </div>

          <div className="proof-grid">
            <div className="proof-map">
              <iframe
                title="JK Mongolia location on Google Maps"
                src={MAPS_EMBED_SRC}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>

            <div className="proof-reviews">
              <div className="rating-badge">
                <strong>{GOOGLE_RATING}</strong>
                <span>★★★★★</span>
                <small>{GOOGLE_REVIEW_COUNT} Google reviews</small>
              </div>
              <div className="review-list">
                {featuredReviews.map((review) => (
                  <blockquote key={review.quote}>
                    <p>“{review.quote}”</p>
                    <footer>{review.name}</footer>
                  </blockquote>
                ))}
              </div>
              <a className="secondary-button" href={MAPS_URL} target="_blank" rel="noreferrer">
                {proof.reviewsLabel}
              </a>
            </div>
          </div>

          <div className="proof-gallery">
            {galleryPhotos.map((src, index) => (
              <div className="gallery-frame" key={src}>
                <img
                  src={src}
                  alt={`JK Mongolia workshop photo ${index + 1}`}
                  loading="lazy"
                  onError={(event) => {
                    event.currentTarget.style.display = 'none'
                  }}
                />
              </div>
            ))}
            <a className="text-link" href={MAPS_URL} target="_blank" rel="noreferrer">
              {proof.photosLabel}
            </a>
          </div>
        </section>

        <section className="cta-strip reveal">
          <div>
            <span className="eyebrow light">Ready to get started?</span>
            <h2>Book a visit or ask us anything.</h2>
          </div>
          <Link to="/#contact" className="primary-button light-button">
            Get in touch
          </Link>
        </section>
      </main>
    </div>
  )
}

export default AboutPage

import { Link } from 'react-router-dom'
import Header from '../components/Header'
import { GOOGLE_RATING, GOOGLE_REVIEW_COUNT, MAPS_URL, featuredReviews } from '../data/googleBusiness'
import { HOURS_TEXT } from '../data/schedule'

const benefits = [
  'Everything from oil changes to full engine removal',
  'Trucks, 4x4s, and classic vehicles, including overland rigs',
  'Parts imported for you when they are not available locally',
  'Secure vehicle storage for as long as you need',
]

const approach = [
  {
    title: 'Bring the vehicle in',
    text: 'Tell Justin what is happening, from a small leak to a worn suspension. He will look at the vehicle and explain what needs doing.',
  },
  {
    title: 'Relax or head into town',
    text: 'Wait at the shop while the work is done, or take a bus or taxi into Ulaanbaatar and come back when the vehicle is ready.',
  },
  {
    title: 'Get back on the road',
    text: 'Parts can be imported if needed, and your vehicle can be stored for any length of time, whether you are local or travelling through Mongolia.',
  },
]

function AboutPage() {
  return (
    <div className="luxury-page">
      <Header />
      <main>
        <section className="about-section reveal" aria-labelledby="about-title">
          <div className="about-visual">
            <div className="visual-card">
              <span className="mini-label">Jkmechanic Shop · Garage 84</span>
              <strong>{GOOGLE_RATING}</strong>
              <small>★★★★★ from {GOOGLE_REVIEW_COUNT} Google reviews</small>
            </div>
          </div>

          <div className="about-copy">
            <span className="eyebrow dark">About JK Mongolia</span>
            <h1 id="about-title">An auto repair shop in Gachuurt, run by Justin.</h1>
            <p>
              Jkmechanic Shop, also called Garage 84, is an independent auto repair
              shop in Gachuurt, just outside Ulaanbaatar. Justin handles every job
              himself, from a routine oil change to taking out a whole engine.
            </p>
            <p>
              Local drivers and overland travellers come to us for the same thing:
              repairs done properly by someone who explains the work. We have
              fitted shock absorbers on a Steyr expedition truck and sorted out
              many small faults on a 1980 Land Rover. Both vehicles went back on the road.
            </p>
            <ul className="benefit-list">
              {benefits.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </div>
        </section>

        <section className="services-section reveal" aria-labelledby="approach-title">
          <div className="section-header">
            <div>
              <span className="eyebrow dark">How we work</span>
              <h2 id="approach-title">Skilled work, friendly service.</h2>
            </div>
            <p>A visit to Garage 84 is simple, whether you live nearby or are driving across Asia.</p>
          </div>
          <div className="about-approach-grid">
            {approach.map((item, index) => (
              <article className="service-card" key={item.title}>
                <span className="service-number">0{index + 1}</span>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="services-section reveal" aria-labelledby="reviews-title">
          <div className="section-header">
            <div>
              <span className="eyebrow dark">What customers say</span>
              <h2 id="reviews-title">Rated {GOOGLE_RATING} on Google.</h2>
            </div>
            <p>
              <a href={MAPS_URL} target="_blank" rel="noreferrer">
                Read all {GOOGLE_REVIEW_COUNT} reviews on Google Maps
              </a>
            </p>
          </div>
          <div className="review-list">
            {featuredReviews.map((review) => (
              <blockquote key={review.name}>
                <p>“{review.quote}”</p>
                <footer>{review.name} · Google review</footer>
              </blockquote>
            ))}
          </div>
        </section>

        <section className="contact-section reveal" aria-labelledby="visit-title">
          <div className="contact-copy">
            <span className="eyebrow dark">Visit Garage 84</span>
            <h2 id="visit-title">Find us in Gachuurt.</h2>
            <p className="about-visit-copy">
              BZD 20 Khoroo, 10 ail 1-7 toot, Gachuurt, Ulaanbaatar
              <br />
              Plus code: W5H4+JV Gachuurt
              <br />
              Open {HOURS_TEXT}. Book a time online or call ahead.
            </p>
          </div>
          <div className="detail-panel">
            <h2>Let's talk about your vehicle.</h2>
            <p>Have your make, model, and a short description of the issue ready.</p>
            <div className="detail-actions">
              <a className="primary-button" href="tel:+97688856529">Call +976 8885 6529</a>
              <a className="secondary-button" href={MAPS_URL} target="_blank" rel="noreferrer">
                Get directions
              </a>
            </div>
          </div>
        </section>

        <section className="cta-strip reveal">
          <div>
            <span className="eyebrow light">Ready to get started?</span>
            <h2>Book a visit or ask us anything.</h2>
          </div>
          <Link to="/#contact" className="primary-button light-button">Get in touch</Link>
        </section>
      </main>
    </div>
  )
}

export default AboutPage

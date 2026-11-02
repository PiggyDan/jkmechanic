import { Suspense, lazy, useEffect, useRef, useState } from 'react'
import { motion, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from 'motion/react'
import { ArrowDown, Phone } from 'lucide-react'
import BookButton from '../components/BookButton'
import { STAGES } from './timeline'
import heroTruck from '../assets/photo3d/truck.webp'
import './experience.css'

// Three.js and the 3D scene load as their own chunk; the ZIL-130 body loads later still.
const Workshop = lazy(() => import('./Workshop.jsx'))

function hasWebGL() {
  try {
    const canvas = document.createElement('canvas')
    return Boolean(window.WebGLRenderingContext && (canvas.getContext('webgl2') || canvas.getContext('webgl')))
  } catch {
    return false
  }
}

const isMobile = () => window.matchMedia('(max-width: 760px), (pointer: coarse)').matches

function useWindow(scroll, a, b, edge = 0.025) {
  const opacity = useTransform(scroll, [a, a + edge, b - edge, b], [0, 1, 1, 0])
  const y = useTransform(scroll, [a, a + edge, b - edge, b], [32, 0, 0, -32])
  return { opacity, y }
}

function StageCopy({ stage, scroll }) {
  const style = useWindow(scroll, stage.range[0], stage.range[1])
  return (
    <motion.article className="xp-stage" style={style}>
      <p className="xp-stage-meta">
        <span className="xp-stage-n">{stage.n}</span>
        <span>{stage.vehicle}</span>
      </p>
      <h2>{stage.title}</h2>
      <p className="xp-stage-line">{stage.line}</p>
      <dl className="xp-specs">
        {stage.specs.map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
    </motion.article>
  )
}

function Hero({ scroll }) {
  const opacity = useTransform(scroll, [0, 0.045], [1, 0])
  const y = useTransform(scroll, [0, 0.045], [0, -40])
  // Gate clicks on scroll, not opacity: scroll-linked opacity may run on the compositor.
  const pointerEvents = useTransform(scroll, (p) => (p < 0.03 ? 'auto' : 'none'))
  return (
    <motion.div className="xp-hero" style={{ opacity, y, pointerEvents }}>
      <p className="xp-kicker">Jkmechanic Shop · Garage 84 · Gachuurt</p>
      <h1 id="home-title">Built for the <em>long way</em> home.</h1>
      <p className="xp-hero-sub">Independent repairs for the vehicles that take you further. Cars, trucks, 4x4s and overland rigs.</p>
      <div className="xp-actions">
        <BookButton className="xp-btn xp-btn-primary">Book a visit</BookButton>
        <a className="xp-btn xp-btn-ghost" href="tel:+97688856529" aria-label="Call +976 8885 6529"><Phone size={16} aria-hidden="true" /> Call us</a>
      </div>
      <div className="xp-scroll-cue" aria-hidden="true">
        <span className="xp-scroll-line" />
        <span>Scroll to assemble</span>
        <ArrowDown size={14} />
      </div>
    </motion.div>
  )
}

function Finale({ scroll }) {
  // Fades in and stays to the end. Offsets must stay inside 0..1 for scroll-linked animation.
  const a = STAGES[4].range[0]
  const opacity = useTransform(scroll, [a, a + 0.03], [0, 1])
  const y = useTransform(scroll, [a, a + 0.03], [32, 0])
  const pointerEvents = useTransform(scroll, (p) => (p > a + 0.015 ? 'auto' : 'none'))
  return (
    <motion.div className="xp-finale" style={{ opacity, y, pointerEvents }}>
      <p className="xp-stage-meta"><span className="xp-stage-n">05</span><span>Garage 84 · Gachuurt, Ulaanbaatar</span></p>
      <h2>Soviet body.<br />Korean heart.</h2>
      <p className="xp-stage-line">A ZIL-130 body on a SsangYong Musso chassis and 2.9 L diesel. If it has a frame and an engine, bring it in.</p>
      <div className="xp-actions">
        <BookButton className="xp-btn xp-btn-primary">Book a visit</BookButton>
        <a className="xp-btn xp-btn-ghost" href="tel:+97688856529"><Phone size={16} aria-hidden="true" /> +976 8885 6529</a>
      </div>
    </motion.div>
  )
}

function Rail({ scroll, sectionRef, reduced }) {
  const [active, setActive] = useState(-1)
  const fill = useTransform(scroll, [0.06, 1], [0, 1])
  useMotionValueEvent(scroll, 'change', (p) => {
    const index = STAGES.findIndex((s) => p >= s.range[0] - 0.01 && p < s.range[1])
    setActive((current) => (current === index ? current : index))
  })

  const jump = (stage) => {
    const el = sectionRef.current
    const top = el.getBoundingClientRect().top + window.scrollY
    const travel = el.offsetHeight - window.innerHeight
    window.scrollTo({ top: top + travel * (stage.range[0] + 0.04), behavior: reduced ? 'auto' : 'smooth' })
  }

  return (
    <nav className="xp-rail" aria-label="Assembly stages">
      <span className="xp-rail-track"><motion.span className="xp-rail-fill" style={{ scaleY: fill }} /></span>
      <ol>
        {STAGES.map((stage, i) => (
          <li key={stage.id}>
            <button type="button" className={i === active ? 'is-active' : ''} onClick={() => jump(stage)} aria-current={i === active ? 'step' : undefined}>
              <span className="xp-rail-n">{stage.n}</span>
              <span className="xp-rail-label">{stage.title}</span>
            </button>
          </li>
        ))}
      </ol>
    </nav>
  )
}

function Loading() {
  return (
    <div className="xp-loading" role="status">
      <span className="xp-loading-bar" />
      <span>Opening the workshop…</span>
    </div>
  )
}

export default function AssemblyExperience() {
  const sectionRef = useRef(null)
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end end'] })
  const reduced = useReducedMotion()
  const [webgl] = useState(hasWebGL)
  const [mobile] = useState(isMobile)
  const [active, setActive] = useState(true)

  // Stop rendering when the section is off screen.
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setActive(entry.isIntersecting), { rootMargin: '120px 0px' })
    observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section ref={sectionRef} className="xp" aria-labelledby="home-title">
      <div className="xp-sticky">
        {webgl ? (
          <Suspense fallback={<Loading />}>
            <Workshop scroll={scrollYProgress} reduced={Boolean(reduced)} active={active} mobile={mobile} />
          </Suspense>
        ) : (
          <div className="xp-fallback">
            <img src={heroTruck} alt="Red ZIL-130 pickup" width="638" height="480" />
          </div>
        )}
        <div className="xp-shade" aria-hidden="true" />
        <Hero scroll={scrollYProgress} />
        {STAGES.slice(0, 4).map((stage) => <StageCopy key={stage.id} stage={stage} scroll={scrollYProgress} />)}
        <Finale scroll={scrollYProgress} />
        <Rail scroll={scrollYProgress} sectionRef={sectionRef} reduced={Boolean(reduced)} />
        <p className="xp-note">
          {webgl ? (
            <span className="xp-note-long">Real-time 3D reconstruction · final shot: real photo</span>
          ) : '3D view needs WebGL · showing the stage notes only'}
        </p>
      </div>
    </section>
  )
}

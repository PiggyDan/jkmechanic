import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Callout, Part, Rod, Shadowed } from '../kit.jsx'
import { M, useAssembly } from '../core'
import { smooth } from '../math'
import { BODY, BODY_HOVER } from '../timeline'

// ZIL-130 pickup body in red, modelled on the shop's own truck (see hero-truck-red), fitted
// to the SsangYong Musso chassis:
// rounded cab with wraparound windscreen and roof marker lamps, flat bonnet with side
// louvres, barred grille between round headlamps, body-colour bumper with fog lamps,
// smooth pickup bed with rounded rear wings and a chrome side step. Panels are extruded
// side profiles traced from photos; pressings are simplified. Axes match Zil130.jsx.

const SIDES = [-1, 1]
const HALF_WB = 1.9
const R = 0.51

function arc(cx, cy, r, from, to, steps = 16) {
  return Array.from({ length: steps + 1 }, (_, i) => {
    const a = THREE.MathUtils.degToRad(from + ((to - from) * i) / steps)
    return [cx + Math.cos(a) * r, cy + Math.sin(a) * r]
  })
}

const shapeOf = (points) => new THREE.Shape(points.map(([x, y]) => new THREE.Vector2(x, y)))

/** Side profile extruded across `width` with rounded edges, centred on z. */
function Panel({ shape, width, z = 0, m = M.zilPaint, bevel = 0.06 }) {
  const geometry = useMemo(() => {
    const g = new THREE.ExtrudeGeometry(shape, { depth: Math.max(0.001, width - bevel * 2), bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 4, curveSegments: 14 })
    g.translate(0, 0, -width / 2 + bevel)
    return g
  }, [shape, width, bevel])
  return <mesh geometry={geometry} material={m} position={[0, 0, z]} />
}

// Cab side profile with a rounded roof line.
const CAB = (() => {
  const s = new THREE.Shape()
  s.moveTo(-0.42, 1.05)
  s.lineTo(1.2, 1.05)
  s.lineTo(1.24, 1.78)
  s.lineTo(1.1, 2.18)
  s.quadraticCurveTo(1.04, 2.37, 0.82, 2.38)
  s.lineTo(-0.16, 2.38)
  s.quadraticCurveTo(-0.42, 2.37, -0.42, 2.12)
  s.lineTo(-0.42, 1.05)
  return s
})()
const SIDE_WINDOW = shapeOf([[1.06, 1.82], [0.96, 2.2], [0.14, 2.22], [0.14, 1.82]])
const HOOD = shapeOf([[1.2, 1.0], [1.2, 1.78], [2.9, 1.7], [3.0, 1.62], [3.0, 1.0]])
const WING = shapeOf([[1.25, 0.92], [1.25, 1.38], [2.4, 1.42], [2.9, 1.36], [3.02, 1.2], [3.02, 0.86], ...arc(HALF_WB, R, 0.64, 15, 165)])
const BED_SIDE = shapeOf([[-0.55, 0.92], [-0.55, 1.62], [-3.3, 1.62], [-3.3, 0.92], [-2.52, 0.92], ...arc(-HALF_WB, R, 0.62, 138.6, 41.4), [-1.28, 0.92]])
const REAR_WING = shapeOf([[-1.12, 0.95], [-1.2, 1.38], [-1.38, 1.47], [-2.42, 1.47], [-2.6, 1.38], [-2.68, 0.95], ...arc(-HALF_WB, R, 0.66, 168, 12)])

function Lamp({ position, r = 0.085, m = M.lamp }) {
  return (
    <group position={position} rotation={[0, 0, Math.PI / 2]}>
      <mesh material={M.chrome}>
        <cylinderGeometry args={[r + 0.02, r + 0.02, 0.05, 32]} />
      </mesh>
      <mesh position={[0, -0.028, 0]} material={m}>
        <cylinderGeometry args={[r, r, 0.01, 32]} />
      </mesh>
    </group>
  )
}

function Cab() {
  const glass = useMemo(() => new THREE.ExtrudeGeometry(SIDE_WINDOW, { depth: 0.01, bevelEnabled: false }), [])
  // Windscreen lies on the sloped front face between (1.24, 1.78) and (1.1, 2.18).
  const lean = Math.atan2(0.14, 0.4)
  return (
    <group>
      <Panel shape={CAB} width={2.24} bevel={0.16} />
      {SIDES.map((s) => (
        <group key={s}>
          <mesh geometry={glass} material={M.bodyGlass} position={[0, 0, s * 1.121 - (s < 0 ? 0.01 : 0)]} />
          {/* quarter-vent post, door shut lines, handle, mirror */}
          <mesh position={[0.86, 1.96, s * 1.133]} rotation={[0, 0, 0.2]} material={M.zilPaint}>
            <boxGeometry args={[0.035, 0.5, 0.012]} />
          </mesh>
          <mesh position={[0.1, 1.6, s * 1.123]} material={M.dark}>
            <boxGeometry args={[0.012, 1.08, 0.004]} />
          </mesh>
          <mesh position={[0.32, 1.64, s * 1.13]} material={M.chrome}>
            <boxGeometry args={[0.14, 0.025, 0.02]} />
          </mesh>
          <Rod a={[1.14, 1.82, s * 1.1]} b={[1.28, 1.95, s * 1.3]} r={0.012} m={M.dark} />
          <mesh position={[1.28, 1.98, s * 1.34]} material={M.dark}>
            <boxGeometry args={[0.04, 0.3, 0.17]} />
          </mesh>
          {/* windscreen pane and the wraparound corner glass */}
          <mesh position={[1.185, 1.98, s * 0.46]} rotation={[0, 0, lean]} material={M.bodyGlass}>
            <boxGeometry args={[0.02, 0.42, 0.9]} />
          </mesh>
          <mesh position={[1.125, 1.98, s * 1.0]} rotation={[0, s * -0.7, lean]} material={M.bodyGlass}>
            <boxGeometry args={[0.02, 0.42, 0.26]} />
          </mesh>
          <Rod a={[1.27, 1.8, s * 0.12]} b={[1.2, 2.05, s * 0.62]} r={0.008} m={M.dark} />
        </group>
      ))}
      <mesh position={[1.195, 1.98, 0]} rotation={[0, 0, lean]} material={M.zilPaint}>
        <boxGeometry args={[0.03, 0.44, 0.03]} />
      </mesh>
      <mesh position={[-0.425, 2.0, 0]} material={M.bodyGlass}>
        <boxGeometry args={[0.02, 0.26, 0.95]} />
      </mesh>
      {/* three amber roof marker lamps */}
      {[-0.32, 0, 0.32].map((z) => (
        <mesh key={z} position={[0.9, 2.41, z]} material={M.amberLamp}>
          <boxGeometry args={[0.07, 0.05, 0.11]} />
        </mesh>
      ))}
    </group>
  )
}

function Front() {
  return (
    <group>
      <Panel shape={HOOD} width={1.36} bevel={0.06} />
      {SIDES.map((s) => (
        <group key={s}>
          <Panel shape={WING} width={0.52} z={s * 0.87} bevel={0.09} />
          {/* bonnet side louvres */}
          {Array.from({ length: 5 }, (_, i) => (
            <mesh key={i} position={[1.55 + i * 0.07, 1.6, s * 0.685]} material={M.dark}>
              <boxGeometry args={[0.025, 0.1, 0.006]} />
            </mesh>
          ))}
          <Lamp position={[3.16, 1.2, s * 0.62]} />
          <mesh position={[3.15, 1.2, s * 0.92]} material={M.amberLamp}>
            <boxGeometry args={[0.04, 0.08, 0.1]} />
          </mesh>
        </group>
      ))}
      {/* front panel, barred grille, badge */}
      <mesh position={[3.1, 1.22, 0]} material={M.zilPaint}>
        <boxGeometry args={[0.06, 0.62, 2.16]} />
      </mesh>
      <mesh position={[3.135, 1.22, 0]} material={M.dark}>
        <boxGeometry args={[0.02, 0.42, 0.76]} />
      </mesh>
      {Array.from({ length: 6 }, (_, i) => (
        <mesh key={i} position={[3.15, 1.06 + i * 0.065, 0]} material={M.chrome}>
          <boxGeometry args={[0.02, 0.02, 0.74]} />
        </mesh>
      ))}
      <mesh position={[3.15, 1.48, 0]} material={M.chrome}>
        <boxGeometry args={[0.02, 0.04, 0.2]} />
      </mesh>
      {/* body-colour bumper with fog lamps and number plate */}
      <mesh position={[3.18, 0.7, 0]} material={M.zilPaint}>
        <boxGeometry args={[0.26, 0.26, 2.3]} />
      </mesh>
      {SIDES.map((s) => <Lamp key={s} position={[3.315, 0.7, s * 0.82]} r={0.06} m={M.amberLamp} />)}
      <mesh position={[3.315, 0.7, 0.3]} material={M.paintWhite}>
        <boxGeometry args={[0.01, 0.11, 0.42]} />
      </mesh>
    </group>
  )
}

function Bed() {
  const x0 = -3.3
  const x1 = -0.55
  const cx = (x0 + x1) / 2
  const len = x1 - x0
  return (
    <group>
      <mesh position={[cx, 1.1, 0]} material={M.dark}>
        <boxGeometry args={[len, 0.06, 2.2]} />
      </mesh>
      {SIDES.map((s) => (
        <group key={s}>
          <Panel shape={BED_SIDE} width={0.08} z={s * 1.12} bevel={0.03} />
          <Panel shape={REAR_WING} width={0.34} z={s * 1.2} bevel={0.1} />
          {/* chrome step between cab and rear wing */}
          <mesh position={[0.25, 0.78, s * 1.02]} material={M.chrome}>
            <boxGeometry args={[1.5, 0.035, 0.3]} />
          </mesh>
          {[-0.3, 0.8].map((x) => (
            <mesh key={x} position={[x, 0.86, s * 0.85]} material={M.dark}>
              <boxGeometry args={[0.05, 0.14, 0.25]} />
            </mesh>
          ))}
        </group>
      ))}
      <Panel shape={shapeOf([[x0, 0.92], [x0, 1.62], [x0 + 0.08, 1.62], [x0 + 0.08, 0.92]])} width={2.32} bevel={0.03} />
      <Panel shape={shapeOf([[x1 - 0.08, 1.05], [x1 - 0.08, 1.62], [x1, 1.62], [x1, 1.05]])} width={2.32} bevel={0.03} />
      {SIDES.map((s) => (
        <mesh key={s} position={[x0 - 0.02, 1.05, s * 0.85]} material={M.lampRed}>
          <boxGeometry args={[0.03, 0.08, 0.16]} />
        </mesh>
      ))}
    </group>
  )
}

// The body is drawn at ZIL-130 size; FIT squeezes it onto the Musso chassis so the wheel
// arches sit over the Musso axles (wheelbase 2.63 m vs 3.8 m) and track.
const FIT_SCALE = [1.315 / HALF_WB, 0.78, 0.85]
const FIT_POSITION = [0, 0.366 - R * 0.78, 0]
const SPREAD = { front: 0.8, cab: 0, bed: -0.8 }

/** Moves a section: drops into view, hovers apart, closes up, then lowers onto the frame. */
function useHover(name) {
  const ref = useRef()
  const progress = useAssembly()
  useFrame(() => {
    const p = progress.current.p
    const show = smooth(p, ...BODY.show)
    const together = smooth(p, ...BODY.gather)
    const down = smooth(p, ...BODY.drop[name])
    const g = ref.current
    g.visible = show > 0.001
    g.position.set(SPREAD[name] * (1 - together), BODY_HOVER * (1 - down) + 6 * (1 - show), 0)
  })
  return ref
}

/** One body section, drawn at ZIL size and fitted to the Musso. Its label lives outside
 * the scaled group (in metres) so it lines up with the section on screen. */
function BodyPiece({ name, label, children }) {
  const ref = useHover(name)
  const labelRef = useHover(name)
  return (
    <>
      <group ref={ref} visible={false}>
        <group scale={FIT_SCALE} position={FIT_POSITION}>
          <Part>{children}</Part>
        </group>
      </group>
      <group ref={labelRef} visible={false}>
        <Callout {...label} win={BODY.labels} />
      </group>
    </>
  )
}

export default function ZilBody() {
  return (
    <Shadowed>
      <BodyPiece name="front" label={{ position: [2.2, 0.95, 0.62], title: 'Barred grille', detail: 'round headlamps · amber indicators' }}>
        <Front />
      </BodyPiece>
      <BodyPiece name="cab" label={{ position: [0.3, 1.78, 0.95], title: 'ZIL-130 cab', detail: 'wraparound windscreen · roof lamps' }}>
        <Cab />
      </BodyPiece>
      <BodyPiece name="bed" label={{ position: [-1.38, 1.24, -0.95], title: 'Pickup bed', detail: 'rounded rear wings', side: 'left' }}>
        <Bed />
      </BodyPiece>
    </Shadowed>
  )
}

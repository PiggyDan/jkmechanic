import { Suspense, lazy, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Grid, Lightformer, PerformanceMonitor } from '@react-three/drei'
import * as THREE from 'three'
import { AssemblyContext, M } from './core'
import { CAMERA_KEYS, mussoFrameGlow } from './timeline'
import Musso from './musso/Musso.jsx'
import TruckPhoto from './TruckPhoto.jsx'

// The ZIL-130 body is a separate chunk, fetched while the visitor watches the engine go in.
const ZilBody = lazy(() => import('./zil/ZilBody.jsx'))

const posCurve = new THREE.CatmullRomCurve3(CAMERA_KEYS.map((k) => new THREE.Vector3(...k.pos)), false, 'centripetal')
const lookCurve = new THREE.CatmullRomCurve3(CAMERA_KEYS.map((k) => new THREE.Vector3(...k.look)), false, 'centripetal')
const segments = CAMERA_KEYS.length - 1

function curveParam(p) {
  let i = 0
  while (i < segments - 1 && p > CAMERA_KEYS[i + 1].p) i += 1
  const a = CAMERA_KEYS[i].p
  const b = CAMERA_KEYS[i + 1].p
  const w = Math.min(1, Math.max(0, (p - a) / (b - a)))
  return (i + w) / segments
}

const targetPos = new THREE.Vector3()
const targetLook = new THREE.Vector3()
const look = new THREE.Vector3()

// Owns the smoothed progress, moves the camera, and shares progress with every part below it.
function Rig({ scroll, reduced, onZil, children }) {
  const { size } = useThree()
  const first = useRef(true)
  const progress = useRef({ p: 0 })

  const framed = useRef('')
  const lastP = useRef(-1)

  useFrame((state, delta) => {
    const { camera: cam, gl } = state
    // Keep the subject clear of the copy: on wide screens shift the optical centre right,
    // on portrait screens lift the subject into the top half.
    const key = `${size.width}x${size.height}`
    if (framed.current !== key) {
      framed.current = key
      // A view offset (not filmOffset) so labels pinned with <Html> project to the same spot.
      const { width: w, height: h } = size
      if (w / h > 1.25) cam.setViewOffset(w, h, -w * 0.137, 0, w, h)
      else if (w / h < 0.9) cam.setViewOffset(w, h, 0, h * 0.2, w, h)
      else cam.clearViewOffset()
      cam.updateProjectionMatrix()
    }

    const raw = scroll.get()
    const p = progress.current
    // Damped progress keeps wheel and trackpad steps from looking jerky.
    p.p = reduced || first.current ? raw : THREE.MathUtils.damp(p.p, raw, 5, Math.min(delta, 0.1))
    if (p.p > 0.25) onZil()

    const u = curveParam(p.p)
    posCurve.getPoint(u, targetPos)
    lookCurve.getPoint(u, targetLook)
    // Portrait screens: pull back so the whole assembly still fits.
    const aspect = size.width / size.height
    if (aspect < 1.25) targetPos.sub(targetLook).multiplyScalar(Math.min(1.9, (1.25 / aspect) ** 0.75)).add(targetLook)
    if (!reduced && p.p < 0.08) {
      const t = state.clock.elapsedTime
      targetPos.x += Math.sin(t * 0.25) * 0.12
      targetPos.y += Math.sin(t * 0.33) * 0.05
    }
    if (first.current) {
      cam.position.copy(targetPos)
      look.copy(targetLook)
      first.current = false
    } else {
      const k = reduced ? 1 : 1 - Math.exp(-6 * Math.min(delta, 0.1))
      cam.position.lerp(targetPos, k)
      look.lerp(targetLook, k)
    }
    cam.lookAt(look)

    // Shadows only change when parts move, so skip the shadow pass while progress is still.
    gl.shadowMap.autoUpdate = false
    if (Math.abs(p.p - lastP.current) > 1e-5) {
      gl.shadowMap.needsUpdate = true
      lastP.current = p.p
    }

    M.frame.emissiveIntensity = mussoFrameGlow(p.p) * 0.5
  }, -1)
  return <AssemblyContext.Provider value={progress}>{children}</AssemblyContext.Provider>
}

function Lights({ shadows }) {
  const key = useRef()
  return (
    <>
      <ambientLight intensity={0.22} />
      <hemisphereLight args={['#d4dde8', '#2a1c12', 0.65]} />
      <directionalLight
        ref={key}
        position={[-2, 9, 6]}
        intensity={2.1}
        color="#fff4e8"
        castShadow={shadows}
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
        shadow-camera-left={-7}
        shadow-camera-right={7}
        shadow-camera-top={7}
        shadow-camera-bottom={-6}
        shadow-camera-near={1}
        shadow-camera-far={30}
      />
      <spotLight position={[1.5, 6, 0.5]} angle={0.6} penumbra={0.8} intensity={110} color="#ffffff" distance={14} decay={2} />
      <spotLight position={[-1.5, 7.5, 2.5]} angle={0.7} penumbra={0.8} intensity={90} color="#fff1e0" distance={16} decay={2} />
      <directionalLight position={[-6, 3, -7]} intensity={1.4} color="#9fb4c8" />
      <spotLight position={[-2.5, 3.5, -3.5]} angle={0.7} penumbra={1} intensity={55} color="#b8d0ea" distance={12} decay={2} />
      <directionalLight position={[-6, 2.5, 5]} intensity={0.6} color="#c9d6e2" />
      <pointLight position={[3.5, 0.25, 2.5]} intensity={4} color="#ff5a1f" distance={6} decay={2} />
    </>
  )
}

function Studio() {
  // Image-based light for metal reflections, built from light panels rather than an HDR
  // download, rendered once.
  return (
    <Environment resolution={256} frames={1} environmentIntensity={2.1}>
      <color attach="background" args={['#050506']} />
      {[-12, -8, -4, 0, 4].map((x) => (
        <Lightformer key={x} form="rect" intensity={2.2} position={[x, 6, 0]} rotation-x={Math.PI / 2} scale={[2.6, 0.5, 1]} />
      ))}
      <Lightformer form="rect" intensity={1.2} position={[0, 2, 9]} scale={[14, 1.4, 1]} />
      <Lightformer form="rect" intensity={0.6} color="#9fb4c8" position={[-10, 2, -8]} rotation-y={Math.PI} scale={[10, 2, 1]} />
      <Lightformer form="ring" intensity={1.5} color="#ff5a1f" position={[6, 1, 4]} scale={1.5} />
    </Environment>
  )
}

function Floor() {
  const bay = useMemo(() => {
    const g = new THREE.BufferGeometry()
    const rect = (cx, w, d) => [
      [cx - w, -d], [cx + w, -d], [cx + w, -d], [cx + w, d], [cx + w, d], [cx - w, d], [cx - w, d], [cx - w, -d],
    ]
    const pts = rect(0, 3.0, 1.6).map(([x, z]) => new THREE.Vector3(x, 0.004, z))
    g.setFromPoints(pts)
    return g
  }, [])
  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} position={[-4, 0, 0]} receiveShadow>
        <planeGeometry args={[80, 60]} />
        <meshStandardMaterial color="#141518" roughness={0.72} metalness={0.15} />
      </mesh>
      <Grid
        position={[-4, 0.002, 0]}
        args={[60, 60]}
        cellSize={0.5}
        cellThickness={0.6}
        cellColor="#1a1b1e"
        sectionSize={2.5}
        sectionThickness={1}
        sectionColor="#2a2b30"
        fadeDistance={34}
        fadeStrength={1.4}
        infiniteGrid
      />
      <lineSegments geometry={bay}>
        <lineBasicMaterial color="#ff5a1f" transparent opacity={0.55} />
      </lineSegments>
    </group>
  )
}

export default function Workshop({ scroll, reduced, active, mobile }) {
  const [dpr, setDpr] = useState(mobile ? 1.25 : 1.5)
  const [zil, setZil] = useState(false)
  const model = useRef()
  const shadows = !mobile

  return (
    <Canvas
      className="xp-canvas"
      shadows={shadows && 'percentage'}
      dpr={dpr}
      frameloop={active ? 'always' : 'never'}
      camera={{ fov: mobile ? 42 : 34, near: 0.1, far: 80, position: [3.9, 2.25, 3.0] }}
      gl={{ antialias: !mobile, powerPreference: 'high-performance' }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping
        gl.toneMappingExposure = 1.2
      }}
    >
      <PerformanceMonitor onDecline={() => setDpr(1)} />
      <color attach="background" args={['#09090b']} />
      <fog attach="fog" args={['#09090b', 11, 34]} />
      <Rig scroll={scroll} reduced={reduced} onZil={() => !zil && setZil(true)}>
        <Lights shadows={shadows} />
        <Studio />
        <Floor />
        <group ref={model}>
          <Musso />
          {zil && (
            <Suspense fallback={null}>
              <ZilBody />
            </Suspense>
          )}
        </group>
        <Suspense fallback={null}>
          <TruckPhoto onShown={(shown) => { model.current.visible = !shown }} />
        </Suspense>
      </Rig>
    </Canvas>
  )
}

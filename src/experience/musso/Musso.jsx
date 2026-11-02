import { useMemo } from 'react'
import { RoundedBox } from '@react-three/drei'
import * as THREE from 'three'
import { Beam, Callout, Coil, Coilover, Part, Pipe, Ring, Rod, Scatter, Shadowed, Tyre } from '../kit.jsx'
import { M } from '../core'
import MussoEngine from './MussoEngine.jsx'
import { DRIVELINE as D } from '../timeline'

// SsangYong Musso (2003): ladder frame, double-wishbone front with coil-overs, 5-link rear
// with coil springs, part-time 4WD. Wheelbase 2,630 mm, track ~1,510 mm, 235/75 R15 tyres.
// Origin is on the floor, midway between the axles.

const WB = 1.315 // half wheelbase
const TRACK = 0.755 // half track
const R = 0.366 // tyre radius
const SIDES = [-1, 1]

const FRAME_LABEL = [0.085, 0.215]
const ASSEMBLY_LABEL = D.labels

function Frame() {
  const mountPositions = useMemo(
    () =>
      [1.85, 0.98, 0.25, -0.45, -1.4, -2.0].flatMap((x) =>
        SIDES.map((s) => [x, x < -1.1 ? 0.83 : 0.6, s * (x > 0.88 ? 0.5 : 0.62)]),
      ),
    [],
  )
  const puck = useMemo(() => new THREE.CylinderGeometry(0.035, 0.035, 0.035, 16), [])
  return (
    <group>
      {SIDES.map((s) => {
        // Rail centre line: narrow at the front for wheel lock, wide in the middle, kicked up over the rear axle.
        const pts = [[2.25, 0.52, 0.4], [0.88, 0.52, 0.4], [0.55, 0.5, 0.52], [-0.82, 0.5, 0.52], [-1.14, 0.74, 0.52], [-2.22, 0.74, 0.52]]
          .map(([x, y, z]) => [x, y, s * z])
        return (
          <group key={s}>
            {pts.slice(1).map((b, i) => <Beam key={i} a={pts[i]} b={b} h={0.15} w={0.065} round={0.008} />)}
            {pts.slice(1, -1).map((p, i) => (
              <mesh key={i} position={p} material={M.frame}>
                <boxGeometry args={[0.08, 0.15, 0.07]} />
              </mesh>
            ))}
            {/* body-mount outriggers */}
            {[1.85, 0.98].map((x) => <Beam key={x} a={[x, 0.54, s * 0.4]} b={[x, 0.57, s * 0.52]} h={0.05} w={0.06} />)}
            {[0.25, -0.45].map((x) => <Beam key={x} a={[x, 0.52, s * 0.52]} b={[x, 0.57, s * 0.64]} h={0.05} w={0.06} />)}
            {[-1.4, -2.0].map((x) => <Beam key={x} a={[x, 0.76, s * 0.52]} b={[x, 0.8, s * 0.64]} h={0.05} w={0.06} />)}
            {/* shock towers */}
            <Beam a={[1.32, 0.56, s * 0.41]} b={[1.32, 0.86, s * 0.47]} h={0.1} w={0.09} />
            <mesh position={[1.32, 0.88, s * 0.47]} material={M.frame}>
              <boxGeometry args={[0.14, 0.02, 0.12]} />
            </mesh>
            {/* K-member drop brackets */}
            <Beam a={[1.3, 0.48, s * 0.4]} b={[1.3, 0.34, s * 0.4]} h={0.16} w={0.06} />
            {/* tow hooks */}
            <mesh position={[2.3, 0.44, s * 0.3]} rotation={[0, Math.PI / 2, 0]} material={M.accent}>
              <torusGeometry args={[0.04, 0.012, 8, 20, Math.PI * 1.3]} />
            </mesh>
          </group>
        )
      })}
      {/* crossmembers, front to rear */}
      <Beam a={[2.25, 0.52, -0.46]} b={[2.25, 0.52, 0.46]} h={0.12} w={0.08} round={0.01} />
      <Rod a={[1.92, 0.52, -0.4]} b={[1.92, 0.52, 0.4]} r={0.03} m={M.frame} />
      <Beam a={[1.3, 0.33, -0.43]} b={[1.3, 0.33, 0.43]} h={0.1} w={0.18} round={0.012} />
      <Beam a={[0.15, 0.4, -0.55]} b={[0.15, 0.4, 0.55]} h={0.06} w={0.1} />
      {SIDES.map((s) => <Beam key={s} a={[0.15, 0.5, s * 0.52]} b={[0.15, 0.4, s * 0.5]} h={0.06} w={0.06} />)}
      <Rod a={[-0.55, 0.5, -0.52]} b={[-0.55, 0.5, 0.52]} r={0.035} m={M.frame} />
      <Beam a={[-1.14, 0.76, -0.52]} b={[-1.14, 0.76, 0.52]} h={0.12} w={0.1} round={0.01} />
      <Beam a={[-2.22, 0.74, -0.6]} b={[-2.22, 0.74, 0.6]} h={0.12} w={0.08} round={0.01} />
      <mesh position={[-2.33, 0.66, 0]} material={M.steel}>
        <boxGeometry args={[0.2, 0.06, 0.06]} />
      </mesh>
      <Scatter positions={mountPositions} geometry={puck} m={M.rubber} />

      <Callout position={[-0.1, 0.58, 0.55]} title="Box-section rails" detail="closed, welded" win={FRAME_LABEL} />
      <Callout position={[1.3, 0.3, 0.2]} title="Front crossmember" detail="IFS lower-arm mounts" win={FRAME_LABEL} />
      <Callout position={[-1.0, 0.8, -0.52]} title="Kick-up over the rear axle" win={FRAME_LABEL} side="left" />
    </group>
  )
}

function FrontCorner({ s }) {
  const ball = [WB, 0.24, s * 0.66]
  const upper = [WB, 0.5, s * 0.63]
  return (
    <group>
      <Rod a={[1.12, 0.36, s * 0.38]} b={ball} r={0.018} m={M.steel} />
      <Rod a={[1.5, 0.36, s * 0.38]} b={ball} r={0.018} m={M.steel} />
      <Rod a={[1.2, 0.7, s * 0.44]} b={upper} r={0.015} m={M.steel} />
      <Rod a={[1.44, 0.7, s * 0.44]} b={upper} r={0.015} m={M.steel} />
      <Beam a={[WB, 0.22, s * 0.665]} b={[WB, 0.52, s * 0.645]} h={0.05} w={0.05} m={M.iron} />
      <Coilover a={[WB, 0.29, s * 0.55]} b={[1.32, 0.86, s * 0.47]} />
      {/* brake rotor and caliper */}
      <mesh position={[WB, R, s * 0.69]} rotation={[Math.PI / 2, 0, 0]} material={M.steel}>
        <cylinderGeometry args={[0.14, 0.14, 0.024, 40]} />
      </mesh>
      <group position={[WB - 0.08, R + 0.09, s * 0.69]} rotation={[0, 0, -0.8]}>
        <RoundedBox args={[0.1, 0.06, 0.05]} radius={0.012} material={M.accent} />
      </group>
      {/* CV half-shaft with boots */}
      <Rod a={[WB, 0.36, s * 0.14]} b={[WB, R, s * 0.64]} r={0.015} />
      <Rod a={[WB, 0.36, s * 0.15]} b={[WB, 0.36, s * 0.24]} r={0.04} r2={0.018} m={M.hose} />
      <Rod a={[WB, R, s * 0.62]} b={[WB, R, s * 0.54]} r={0.042} r2={0.018} m={M.hose} />
      {/* tie rod */}
      <Rod a={[1.12, 0.34, s * 0.2]} b={[1.18, 0.3, s * 0.63]} r={0.011} m={M.chrome} />
    </group>
  )
}

function FrontDiff() {
  return (
    <group position={[WB, 0.36, -0.04]}>
      <mesh scale={[1, 1, 0.8]} material={M.iron}>
        <sphereGeometry args={[0.105, 24, 16]} />
      </mesh>
      <Rod a={[0, 0.0, 0]} b={[-0.2, 0.015, -0.01]} r={0.055} r2={0.035} m={M.iron} />
    </group>
  )
}

function Steering() {
  return (
    <group>
      <Rod a={[1.12, 0.34, -0.3]} b={[1.12, 0.34, 0.3]} r={0.013} m={M.steel} />
      <group position={[1.6, 0.54, -0.47]}>
        <RoundedBox args={[0.14, 0.1, 0.1]} radius={0.015} material={M.iron} />
      </group>
      <Rod a={[1.6, 0.5, -0.47]} b={[1.14, 0.35, -0.3]} r={0.012} m={M.steel} />
      <Rod a={[1.62, 0.6, -0.44]} b={[0.95, 1.05, -0.38]} r={0.012} m={M.steel} />
    </group>
  )
}

function RearAxle() {
  const x = -WB
  return (
    <group>
      <Rod a={[x, R, -0.7]} b={[x, R, 0.7]} r={0.045} m={M.iron} />
      <mesh position={[x, R, 0]} scale={[0.85, 1, 0.75]} material={M.iron}>
        <sphereGeometry args={[0.16, 28, 20]} />
      </mesh>
      <mesh position={[x - 0.12, R, 0]} rotation={[0, 0, Math.PI / 2]} material={M.steel}>
        <cylinderGeometry args={[0.13, 0.13, 0.02, 32]} />
      </mesh>
      <group position={[x - 0.125, R, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <Ring count={10} radius={0.115} size={[0.008, 0.008, 0.02]} m={M.steel} />
      </group>
      <Rod a={[x, R + 0.01, 0]} b={[x + 0.22, R + 0.03, 0]} r={0.065} r2={0.04} m={M.iron} />
      {SIDES.map((s) => (
        <group key={s}>
          <mesh position={[x, R, s * 0.68]} rotation={[Math.PI / 2, 0, 0]} material={M.iron}>
            <cylinderGeometry args={[0.14, 0.14, 0.07, 32]} />
          </mesh>
          {/* coil spring between axle perch and the kicked-up rail */}
          <mesh position={[x, 0.41, s * 0.52]} material={M.steel}>
            <cylinderGeometry args={[0.06, 0.06, 0.012, 20]} />
          </mesh>
          <group position={[x, 0.415, s * 0.52]}>
            <Coil radius={0.058} height={0.25} turns={5} wire={0.01} m={M.accent} />
          </group>
          {/* trailing links and damper */}
          <Rod a={[x, 0.28, s * 0.47]} b={[-0.66, 0.42, s * 0.5]} r={0.02} m={M.steel} />
          <Rod a={[x + 0.09, 0.5, s * 0.16]} b={[-0.7, 0.54, s * 0.32]} r={0.017} m={M.steel} />
          <Rod a={[x - 0.14, 0.3, s * 0.6]} b={[x - 0.24, 0.8, s * 0.53]} r={0.022} m={M.dark} />
        </group>
      ))}
      {/* panhard rod */}
      <Rod a={[x - 0.08, 0.33, -0.56]} b={[x - 0.08, 0.7, 0.5]} r={0.016} m={M.steel} />
    </group>
  )
}

function Driveline() {
  return (
    <group>
      {/* bell housing, gearbox, transfer case */}
      <Rod a={[1.08, 0.7, 0]} b={[0.86, 0.69, 0]} r={0.225} r2={0.15} m={M.alu} seg={32} />
      <Rod a={[0.86, 0.69, 0]} b={[0.4, 0.66, 0]} r={0.13} r2={0.1} m={M.alu} seg={28} />
      {[0.8, 0.68, 0.56].map((x) => (
        <mesh key={x} position={[x, 0.68, 0]} rotation={[0, 0, Math.PI / 2]} material={M.alu}>
          <torusGeometry args={[0.122 - (0.8 - x) * 0.05, 0.008, 6, 32]} />
        </mesh>
      ))}
      <Rod a={[0.62, 0.78, 0]} b={[0.68, 1.04, 0]} r={0.011} m={M.chrome} />
      <mesh position={[0.685, 1.06, 0]} material={M.dark}>
        <sphereGeometry args={[0.025, 16, 12]} />
      </mesh>
      <group position={[0.25, 0.6, -0.04]}>
        <RoundedBox args={[0.26, 0.28, 0.27]} radius={0.04} material={M.iron} />
      </group>
    </group>
  )
}

function UJoint({ at }) {
  return (
    <mesh position={at} material={M.steel}>
      <sphereGeometry args={[0.03, 12, 10]} />
    </mesh>
  )
}

function Propshafts() {
  return (
    <group>
      <Rod a={[0.1, 0.6, 0]} b={[-1.09, 0.4, 0]} r={0.034} m={M.steel} />
      <UJoint at={[0.1, 0.6, 0]} />
      <UJoint at={[-1.09, 0.4, 0]} />
      <Rod a={[0.3, 0.5, -0.14]} b={[1.12, 0.375, -0.05]} r={0.026} m={M.steel} />
      <UJoint at={[0.3, 0.5, -0.14]} />
      <UJoint at={[1.12, 0.375, -0.05]} />
    </group>
  )
}

function Plumbing() {
  return (
    <group>
      <Pipe
        points={[[1.02, 0.6, 0.36], [0.82, 0.42, 0.3], [0.2, 0.38, 0.3], [-0.28, 0.38, 0.3]]}
        r={0.026}
        m={M.steel}
      />
      <mesh position={[-0.6, 0.38, 0.3]} rotation={[0, 0, Math.PI / 2]} material={M.steel}>
        <cylinderGeometry args={[0.085, 0.085, 0.62, 28]} />
      </mesh>
      <Pipe points={[[-0.9, 0.38, 0.3], [-1.18, 0.56, 0.3], [-1.55, 0.58, 0.34], [-2.1, 0.5, 0.38], [-2.32, 0.48, 0.4]]} r={0.024} m={M.steel} />
      {/* fuel tank */}
      <group position={[-1.78, 0.56, -0.05]}>
        <RoundedBox args={[0.58, 0.2, 0.74]} radius={0.05} material={M.dark} />
      </group>
    </group>
  )
}

function Radiator() {
  return (
    <group>
      <group position={[2.05, 0.8, 0]}>
        <RoundedBox args={[0.06, 0.48, 0.7]} radius={0.01} material={M.alu} />
        {Array.from({ length: 12 }, (_, i) => (
          <mesh key={i} position={[0.032, -0.2 + i * 0.037, 0]} material={M.dark}>
            <boxGeometry args={[0.004, 0.012, 0.66]} />
          </mesh>
        ))}
      </group>
      <Pipe points={[[2.02, 0.98, 0.12], [1.95, 1.04, 0.06], [1.86, 1.03, 0.0]]} r={0.022} m={M.hose} seg={20} />
      <Pipe points={[[2.02, 0.62, -0.22], [1.94, 0.68, -0.14], [1.9, 0.9, -0.04]]} r={0.022} m={M.hose} seg={20} />
    </group>
  )
}

function Wheel({ s }) {
  return (
    <group rotation={[0, s < 0 ? Math.PI : 0, 0]}>
      <Tyre R={R} width={0.235} rim={0.195} lugs={30} />
      {/* alloy rim: barrel, five-spoke face, six lug nuts (6 x 139.7 mm) */}
      <mesh rotation={[Math.PI / 2, 0, 0]} material={M.alu}>
        <cylinderGeometry args={[0.19, 0.19, 0.19, 40, 1, true]} />
      </mesh>
      <group position={[0, 0, 0.07]}>
        {Array.from({ length: 5 }, (_, i) => (
          <group key={i} rotation={[0, 0, (i / 5) * Math.PI * 2]}>
            <mesh position={[0.135, 0, 0]} material={M.alu}>
              <boxGeometry args={[0.13, 0.05, 0.025]} />
            </mesh>
          </group>
        ))}
        <mesh rotation={[Math.PI / 2, 0, 0]} material={M.alu}>
          <cylinderGeometry args={[0.09, 0.1, 0.035, 32]} />
        </mesh>
        <Ring count={6} radius={0.07} z={0.025} size={[0.011, 0.011, 0.025]} m={M.chrome} />
        <mesh position={[0, 0, 0.022]} rotation={[Math.PI / 2, 0, 0]} material={M.dark}>
          <cylinderGeometry args={[0.035, 0.035, 0.012, 24]} />
        </mesh>
      </group>
    </group>
  )
}

export default function Musso() {
  return (
    <group>
      <Shadowed>
        <Part>
          <Frame />
        </Part>
        <MussoEngine />
        <Part at={D.gearbox} from={[0, 1.6, 0]}>
          <Driveline />
          <Callout position={[0.62, 0.82, 0.12]} title="5-speed manual" win={ASSEMBLY_LABEL} />
          <Callout position={[0.25, 0.46, -0.2]} title="Part-time transfer case" detail="2H · 4H · 4L" win={ASSEMBLY_LABEL} side="left" />
        </Part>
        <Part at={D.frontDiff} from={[0, -0.9, 0]}>
          <FrontDiff />
        </Part>
        {SIDES.map((s) => (
          <Part key={s} at={D.front} from={[0, 0, s * 1.4]}>
            <FrontCorner s={s} />
          </Part>
        ))}
        <Part at={D.steering} from={[0, 0.8, 0]}>
          <Steering />
        </Part>
        <Part at={D.rear} from={[-1.7, 0, 0]}>
          <RearAxle />
          <Callout position={[-WB, 0.62, 0.52]} title="5-link rear axle" detail="coil springs · panhard rod" win={ASSEMBLY_LABEL} />
        </Part>
        <Part at={D.shafts} from={[0, 0.9, 0]}>
          <Propshafts />
        </Part>
        <Part at={D.plumbing} from={[0, -0.95, 0]}>
          <Plumbing />
        </Part>
        <Part at={D.radiator} from={[1.1, 0, 0]}>
          <Radiator />
        </Part>
        {[WB, -WB].flatMap((x) =>
          SIDES.map((s) => (
            <Part key={`${x}${s}`} at={D.wheels} from={[0, 0, s * 1.3]} spin={[0, 0, -s * 5]} position={[x, R, s * TRACK]}>
              <Wheel s={s} />
            </Part>
          )),
        )}
      </Shadowed>
      <Callout position={[WB, 0.78, 0.62]} title="Double-wishbone front" detail="coil-over dampers" win={ASSEMBLY_LABEL} />
    </group>
  )
}

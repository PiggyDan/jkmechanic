import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import { Belt, Callout, Part, Pipe, Pulley, Rod } from '../kit.jsx'
import { M, useAssembly } from '../core'
import { ENGINE_LABELS, mussoEngineLift, mussoExplode } from '../timeline'

// SsangYong Musso 2.9 TD: longitudinal inline-five diesel (Mercedes OM602 lineage, sold by
// SsangYong as OM662). Local origin is the rear crankshaft flange; +x is the timing end.
// Cylinder pitch, head/block split and accessory layout follow reference photos; castings
// are simplified.

const CYL = [0.13, 0.227, 0.324, 0.421, 0.518] // cylinder centres along the block
const ek = mussoExplode
const LABEL = ENGINE_LABELS

function Block() {
  return (
    <group>
      <RoundedBox args={[0.66, 0.36, 0.3]} radius={0.025} position={[0.34, 0.08, 0]} material={M.iron} />
      {/* water-jacket ribs and freeze plugs on both sides */}
      {[-1, 1].map((s) => (
        <group key={s}>
          {CYL.map((x) => (
            <mesh key={x} position={[x, 0.1, s * 0.155]} material={M.iron}>
              <boxGeometry args={[0.07, 0.26, 0.018]} />
            </mesh>
          ))}
          {[0.18, 0.37].map((x) => (
            <mesh key={x} position={[x, 0.04, s * 0.166]} rotation={[Math.PI / 2, 0, 0]} material={M.steel}>
              <cylinderGeometry args={[0.018, 0.018, 0.008, 16]} />
            </mesh>
          ))}
          {/* engine mount bosses */}
          <mesh position={[0.5, -0.02, s * 0.18]} material={M.rubber}>
            <boxGeometry args={[0.09, 0.07, 0.05]} />
          </mesh>
        </group>
      ))}
      {/* bell housing flange and starter */}
      <mesh position={[0.005, 0.02, 0]} rotation={[0, 0, Math.PI / 2]} material={M.iron}>
        <cylinderGeometry args={[0.235, 0.235, 0.02, 40]} />
      </mesh>
      <mesh position={[0.1, -0.1, -0.19]} rotation={[0, 0, Math.PI / 2]} material={M.dark}>
        <cylinderGeometry args={[0.045, 0.045, 0.2, 20]} />
      </mesh>
      {/* oil filter housing */}
      <mesh position={[0.58, 0.12, 0.2]} material={M.dark}>
        <cylinderGeometry args={[0.045, 0.045, 0.14, 24]} />
      </mesh>
      {/* dipstick */}
      <Rod a={[0.44, 0.0, -0.17]} b={[0.46, 0.42, -0.2]} r={0.006} m={M.steel} />
      <mesh position={[0.46, 0.43, -0.2]} rotation={[Math.PI / 2, 0, 0]} material={M.accent}>
        <torusGeometry args={[0.018, 0.006, 8, 16]} />
      </mesh>
    </group>
  )
}

function Head() {
  return (
    <group>
      <RoundedBox args={[0.64, 0.13, 0.27]} radius={0.015} position={[0.33, 0.32, 0]} material={M.alu} />
      {/* injectors and glow plug bosses on the intake side */}
      {CYL.map((x) => (
        <group key={x}>
          <mesh position={[x, 0.42, -0.1]} rotation={[0.35, 0, 0]} material={M.steel}>
            <cylinderGeometry args={[0.012, 0.016, 0.09, 12]} />
          </mesh>
          <mesh position={[x, 0.465, -0.115]} material={M.chrome}>
            <cylinderGeometry args={[0.008, 0.008, 0.02, 8]} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

function ValveCover() {
  return (
    <group position={[0.33, 0.43, 0.02]}>
      <RoundedBox args={[0.6, 0.08, 0.2]} radius={0.03} material={M.dark} />
      {[-0.2, -0.1, 0, 0.1, 0.2].map((x) => (
        <mesh key={x} position={[x, 0.045, 0]} material={M.alu}>
          <boxGeometry args={[0.012, 0.012, 0.16]} />
        </mesh>
      ))}
      <mesh position={[0.22, 0.055, 0.05]} material={M.accent}>
        <cylinderGeometry args={[0.028, 0.028, 0.03, 24]} />
      </mesh>
      <Rod a={[-0.26, 0.02, 0.06]} b={[-0.36, -0.06, 0.16]} r={0.012} m={M.hose} />
    </group>
  )
}

function OilPan() {
  return (
    <group>
      <mesh position={[0.34, -0.11, 0]} material={M.alu}>
        <boxGeometry args={[0.64, 0.02, 0.29]} />
      </mesh>
      <RoundedBox args={[0.58, 0.13, 0.25]} radius={0.03} position={[0.34, -0.19, 0]} material={M.alu} />
      <RoundedBox args={[0.24, 0.08, 0.2]} radius={0.03} position={[0.5, -0.28, 0]} material={M.alu} />
      <mesh position={[0.5, -0.325, 0]} material={M.steel}>
        <cylinderGeometry args={[0.014, 0.014, 0.012, 6]} />
      </mesh>
    </group>
  )
}

function Intake() {
  return (
    <group>
      <mesh position={[0.32, 0.32, -0.25]} rotation={[0, 0, Math.PI / 2]} material={M.alu}>
        <cylinderGeometry args={[0.045, 0.045, 0.56, 24]} />
      </mesh>
      {CYL.map((x) => <Rod key={x} a={[x, 0.32, -0.25]} b={[x, 0.33, -0.135]} r={0.022} m={M.alu} />)}
      <Pipe points={[[0.04, 0.32, -0.25], [-0.02, 0.36, -0.28], [-0.02, 0.48, -0.3]]} r={0.04} m={M.alu} />
    </group>
  )
}

function InjectionPump() {
  const lines = CYL.map((x, i) => [
    [0.42 + i * 0.03, 0.05, -0.2],
    [0.45, 0.22, -0.24 - i * 0.008],
    [x, 0.4, -0.2],
    [x, 0.43, -0.13],
  ])
  return (
    <group>
      <RoundedBox args={[0.3, 0.1, 0.09]} radius={0.015} position={[0.5, 0.0, -0.21]} material={M.alu} />
      <mesh position={[0.66, 0.0, -0.21]} rotation={[0, 0, Math.PI / 2]} material={M.iron}>
        <cylinderGeometry args={[0.05, 0.05, 0.04, 24]} />
      </mesh>
      {lines.map((points, i) => <Pipe key={i} points={points} r={0.0045} m={M.steel} seg={30} />)}
    </group>
  )
}

function ExhaustManifold() {
  return (
    <group>
      {CYL.map((x) => <Pipe key={x} points={[[x, 0.3, 0.135], [x, 0.29, 0.2], [x * 0.8 + 0.02, 0.24, 0.24]]} r={0.022} m={M.iron} seg={16} />)}
      <mesh position={[0.3, 0.24, 0.245]} rotation={[0, 0, Math.PI / 2]} material={M.iron}>
        <cylinderGeometry args={[0.035, 0.03, 0.48, 18]} />
      </mesh>
    </group>
  )
}

function Turbo() {
  return (
    <group position={[0.02, 0.22, 0.3]}>
      {/* turbine side (cast iron) and compressor side (aluminium) */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0]} material={M.iron}>
        <torusGeometry args={[0.055, 0.032, 14, 32]} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0.07, 0]} material={M.alu}>
        <torusGeometry args={[0.062, 0.035, 14, 32]} />
      </mesh>
      <mesh position={[0, 0.035, 0]} material={M.steel}>
        <cylinderGeometry args={[0.04, 0.04, 0.05, 20]} />
      </mesh>
      <mesh position={[0, 0.115, 0]} material={M.alu}>
        <cylinderGeometry args={[0.03, 0.038, 0.05, 20]} />
      </mesh>
      <Pipe points={[[0.05, -0.02, 0.02], [0.02, -0.18, 0.06], [-0.08, -0.32, 0.06]]} r={0.033} m={M.steel} seg={20} />
    </group>
  )
}

function Accessories({ spin }) {
  // Pulley centres in the y/z plane (crank, water pump, alternator, power steering, tensioner).
  const pulleys = useMemo(() => [[0, 0, 0.09], [0.24, 0, 0.065], [0.22, 0.24, 0.045], [0.12, -0.23, 0.055], [0.33, 0.12, 0.03]], [])
  return (
    <group position={[0.79, 0, 0]}>
      <group ref={spin} userData={{ noBake: true }}>
        <Pulley r={0.09} w={0.05} m={M.steel} />
      </group>
      <group position={[0, 0.24, 0]}><Pulley r={0.065} w={0.03} /></group>
      <group position={[0, 0.33, 0.12]}><Pulley r={0.03} w={0.025} m={M.alu} /></group>
      <group position={[0, 0.12, -0.23]}><Pulley r={0.055} w={0.025} /></group>
      <Belt pulleys={pulleys} x={0} />
      {/* timing cover */}
      <RoundedBox args={[0.035, 0.46, 0.24]} radius={0.015} position={[-0.05, 0.16, 0]} material={M.alu} />
      {/* alternator */}
      <group position={[-0.06, 0.22, 0.24]}>
        <mesh rotation={[0, 0, Math.PI / 2]} material={M.alu}>
          <cylinderGeometry args={[0.07, 0.07, 0.12, 28]} />
        </mesh>
        <group position={[0.06, 0, 0]}><Pulley r={0.045} w={0.025} /></group>
      </group>
      {/* power steering pump */}
      <group position={[-0.06, 0.12, -0.23]}>
        <mesh rotation={[0, 0, Math.PI / 2]} material={M.steel}>
          <cylinderGeometry args={[0.05, 0.05, 0.1, 24]} />
        </mesh>
      </group>
    </group>
  )
}

function Fan({ spin }) {
  return (
    <group position={[0.86, 0.24, 0]}>
      <group ref={spin} userData={{ noBake: true }}>
        <mesh rotation={[0, 0, Math.PI / 2]} material={M.alu}>
          <cylinderGeometry args={[0.06, 0.06, 0.06, 24]} />
        </mesh>
        {Array.from({ length: 9 }, (_, i) => (
          <group key={i} rotation={[(i / 9) * Math.PI * 2, 0, 0]}>
            <mesh position={[0.02, 0.15, 0]} rotation={[0, 0.5, 0]} material={M.dark}>
              <boxGeometry args={[0.012, 0.17, 0.07]} />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  )
}

function Flywheel() {
  return (
    <group position={[-0.03, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
      <mesh material={M.steel}>
        <cylinderGeometry args={[0.17, 0.17, 0.035, 48]} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} material={M.iron}>
        <torusGeometry args={[0.175, 0.012, 6, 64]} />
      </mesh>
      <mesh position={[0, -0.03, 0]} material={M.iron}>
        <cylinderGeometry args={[0.15, 0.15, 0.03, 40]} />
      </mesh>
    </group>
  )
}

export default function MussoEngine() {
  const lift = useRef()
  const crank = useRef()
  const fan = useRef()
  const progress = useAssembly()

  useFrame(() => {
    const p = progress.current.p
    lift.current.position.y = 0.7 + mussoEngineLift(p)
    // Crank and fan turn with scroll, so the engine "runs" only when you move it.
    const a = p * Math.PI * 24
    crank.current.rotation.x = a
    fan.current.rotation.x = a * 1.2
  })

  return (
    <group ref={lift} position={[1.08, 0.7, 0]}>
      <Part ek={ek} ex={[0, 0, 0]}>
        <Block />
        <Callout position={[0.34, -0.05, 0.17]} title="Inline-five block" detail="2,874 cc · cast iron" win={LABEL} />
      </Part>
      <Part ek={ek} ex={[0, -0.42, 0]}>
        <OilPan />
        <Callout position={[0.34, -0.24, 0.13]} title="Oil sump" detail="aluminium" win={LABEL} />
      </Part>
      <Part ek={ek} ex={[0, 0.3, 0]}>
        <mesh position={[0.33, 0.258, 0]} material={M.accent}>
          <boxGeometry args={[0.62, 0.004, 0.26]} />
        </mesh>
      </Part>
      <Part ek={ek} ex={[0, 0.46, 0]}>
        <Head />
        <Callout position={[0.62, 0.34, 0.13]} title="Cylinder head" detail="SOHC · 10 valves" win={LABEL} />
      </Part>
      <Part ek={ek} ex={[0, 0.78, 0]}>
        <ValveCover />
      </Part>
      <Part ek={ek} ex={[0, 0.08, -0.48]}>
        <Intake />
      </Part>
      <Part ek={ek} ex={[0, -0.12, -0.36]}>
        <InjectionPump />
        <Callout position={[0.5, 0.0, -0.26]} title="Inline injection pump" detail="mechanical · 5 plungers" win={LABEL} side="left" />
      </Part>
      <Part ek={ek} ex={[0, 0, 0.42]}>
        <ExhaustManifold />
      </Part>
      <Part ek={ek} ex={[-0.15, 0.2, 0.8]}>
        <Turbo />
        <Callout position={[0.02, 0.32, 0.3]} title="Turbocharger" win={LABEL} />
      </Part>
      <Part ek={ek} ex={[0.42, 0, 0]}>
        <Accessories spin={crank} />
      </Part>
      <Part ek={ek} ex={[0.75, 0.05, 0]}>
        <Fan spin={fan} />
      </Part>
      <Part ek={ek} ex={[-0.4, 0, 0]}>
        <Flywheel />
      </Part>
    </group>
  )
}

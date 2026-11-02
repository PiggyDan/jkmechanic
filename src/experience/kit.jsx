import { useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html, RoundedBox } from '@react-three/drei'
import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'

// Shared building blocks for the assembly scene: materials, geometry helpers and the
// scroll-driven <Part> wrapper. Units are metres; +x points to the front of a vehicle.

import { ramp } from './math'
import { M, useAssembly } from './core'

const easeOut = (t) => 1 - (1 - t) ** 3

const UP = new THREE.Vector3(0, 1, 0)
const X = new THREE.Vector3(1, 0, 0)

function between(a, b, axis) {
  const A = new THREE.Vector3(...a)
  const B = new THREE.Vector3(...b)
  const dir = B.clone().sub(A)
  const length = dir.length()
  return {
    position: A.add(B).multiplyScalar(0.5).toArray(),
    quaternion: new THREE.Quaternion().setFromUnitVectors(axis, dir.normalize()),
    length,
  }
}

/** Cylinder from point a to point b (links, shafts, tubes). */
export function Rod({ a, b, r = 0.02, r2, seg = 14, m = M.steel }) {
  const t = useMemo(() => between(a, b, UP), [a, b])
  return (
    <mesh position={t.position} quaternion={t.quaternion} material={m}>
      <cylinderGeometry args={[r2 ?? r, r, t.length, seg]} />
    </mesh>
  )
}

/** Rectangular section from point a to point b (frame rails, brackets). h = height, w = width. */
export function Beam({ a, b, h = 0.1, w = 0.06, m = M.frame, round = 0 }) {
  const t = useMemo(() => between(a, b, X), [a, b])
  if (round) {
    return <RoundedBox args={[t.length, h, w]} radius={round} smoothness={2} position={t.position} quaternion={t.quaternion} material={m} />
  }
  return (
    <mesh position={t.position} quaternion={t.quaternion} material={m}>
      <boxGeometry args={[t.length, h, w]} />
    </mesh>
  )
}

/** Smooth pipe along a list of points (exhaust, hoses, fuel and injector lines). */
export function Pipe({ points, r = 0.02, m = M.steel, seg = 48, closed = false }) {
  const geometry = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p)), closed, 'centripetal')
    return new THREE.TubeGeometry(curve, seg, r, 10, closed)
  }, [points, r, seg, closed])
  return <mesh geometry={geometry} material={m} />
}

/** Coil spring as a swept helix along +y. */
export function Coil({ radius = 0.06, height = 0.3, turns = 6, wire = 0.009, m = M.accent }) {
  const geometry = useMemo(() => {
    const pts = []
    const steps = turns * 24
    for (let i = 0; i <= steps; i += 1) {
      const t = i / steps
      const a = t * turns * Math.PI * 2
      pts.push(new THREE.Vector3(Math.cos(a) * radius, t * height, Math.sin(a) * radius))
    }
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), steps, wire, 8, false)
  }, [radius, height, turns, wire])
  return <mesh geometry={geometry} material={m} />
}

/** Spring and damper between two points. */
export function Coilover({ a, b, radius = 0.055, turns = 6, spring = M.accent }) {
  const t = useMemo(() => between(a, b, UP), [a, b])
  return (
    <group position={t.position} quaternion={t.quaternion}>
      <mesh material={M.dark} position={[0, -t.length * 0.2, 0]}>
        <cylinderGeometry args={[0.026, 0.026, t.length * 0.6, 14]} />
      </mesh>
      <mesh material={M.chrome} position={[0, t.length * 0.25, 0]}>
        <cylinderGeometry args={[0.011, 0.011, t.length * 0.5, 10]} />
      </mesh>
      <group position={[0, -t.length * 0.38, 0]}>
        <Coil radius={radius} height={t.length * 0.76} turns={turns} wire={0.008} m={spring} />
      </group>
    </group>
  )
}

/** Semi-elliptic leaf spring pack along x, arched upward, with eyes and U-bolts. */
export function LeafSpring({ length = 1.4, arch = 0.07, leaves = 7, width = 0.075, thick = 0.011, m = M.dark }) {
  const geometries = useMemo(() => {
    const list = []
    for (let i = 0; i < leaves; i += 1) {
      const half = (length / 2) * (1 - i * (0.72 / leaves))
      const shape = new THREE.Shape()
      const n = 24
      const y = (x) => arch * (1 - (x / (length / 2)) ** 2) - i * thick * 1.05
      for (let s = 0; s <= n; s += 1) {
        const x = -half + (2 * half * s) / n
        if (s === 0) shape.moveTo(x, y(x))
        else shape.lineTo(x, y(x))
      }
      for (let s = n; s >= 0; s -= 1) {
        const x = -half + (2 * half * s) / n
        shape.lineTo(x, y(x) - thick)
      }
      const g = new THREE.ExtrudeGeometry(shape, { depth: width, bevelEnabled: false })
      g.translate(0, 0, -width / 2)
      list.push(g)
    }
    return list
  }, [length, arch, leaves, width, thick])
  const eye = length / 2
  return (
    <group>
      {geometries.map((g, i) => <mesh key={i} geometry={g} material={m} />)}
      {[-eye, eye].map((x) => (
        <mesh key={x} position={[x, thick * 0.5, 0]} rotation={[Math.PI / 2, 0, 0]} material={M.steel}>
          <torusGeometry args={[0.022, 0.01, 8, 16]} />
        </mesh>
      ))}
      {[-0.07, 0.07].map((x) => (
        <group key={x} position={[x, arch - leaves * thick, 0]}>
          {[-1, 1].map((s) => (
            <mesh key={s} position={[0, -0.03, s * (width / 2 + 0.008)]} material={M.steel}>
              <cylinderGeometry args={[0.008, 0.008, 0.16, 8]} />
            </mesh>
          ))}
          <mesh position={[0, -0.11, 0]} material={M.steel}>
            <boxGeometry args={[0.03, 0.02, width + 0.05]} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

/** Tyre built from a lathed cross-section plus instanced tread blocks. Axis is z. */
export function Tyre({ R = 0.366, width = 0.235, rim = 0.19, lugs = 34, lug = 'block' }) {
  const body = useMemo(() => {
    const pts = []
    const h = width / 2
    const c = rim + (R - rim) * 0.5
    const a = (R - rim) * 0.5
    pts.push(new THREE.Vector2(rim, -h * 0.82))
    for (let i = 0; i <= 24; i += 1) {
      const th = -Math.PI / 2 + (Math.PI * i) / 24
      const co = Math.cos(th)
      const si = Math.sin(th)
      pts.push(new THREE.Vector2(c + a * Math.sign(co) * Math.abs(co) ** 0.45, h * Math.sign(si) * Math.abs(si) ** 0.45))
    }
    pts.push(new THREE.Vector2(rim, h * 0.82))
    const g = new THREE.LatheGeometry(pts, 48)
    g.rotateX(Math.PI / 2)
    return g
  }, [R, width, rim])

  const tread = useRef()
  const rows = lug === 'chevron' ? 2 : 2
  useLayoutEffect(() => {
    const mesh = tread.current
    const o = new THREE.Object3D()
    let k = 0
    for (let i = 0; i < lugs; i += 1) {
      for (let r = 0; r < rows; r += 1) {
        const ang = ((i + (r ? 0.5 : 0)) / lugs) * Math.PI * 2
        o.position.set(Math.cos(ang) * R, Math.sin(ang) * R, (r ? 1 : -1) * width * 0.22)
        o.rotation.set(0, 0, ang)
        if (lug === 'chevron') o.rotateX((r ? 1 : -1) * 0.5)
        o.updateMatrix()
        mesh.setMatrixAt(k, o.matrix)
        k += 1
      }
    }
    mesh.instanceMatrix.needsUpdate = true
  }, [lugs, R, width, rows, lug])

  const lugSize = lug === 'chevron' ? [0.05, 0.035, width * 0.5] : [0.03, 0.018, width * 0.4]
  return (
    <group>
      <mesh geometry={body} material={M.rubber} />
      <instancedMesh ref={tread} args={[null, M.rubber, lugs * rows]}>
        <boxGeometry args={lugSize} />
      </instancedMesh>
    </group>
  )
}

/** Ring of identical items (lug nuts, bolts, rivets) using one instanced mesh. */
export function Ring({ count, radius, z = 0, size = [0.012, 0.012, 0.02], m = M.chrome, cyl = true }) {
  const ref = useRef()
  useLayoutEffect(() => {
    const o = new THREE.Object3D()
    for (let i = 0; i < count; i += 1) {
      const a = (i / count) * Math.PI * 2
      o.position.set(Math.cos(a) * radius, Math.sin(a) * radius, z)
      o.rotation.set(Math.PI / 2, 0, 0)
      o.updateMatrix()
      ref.current.setMatrixAt(i, o.matrix)
    }
    ref.current.instanceMatrix.needsUpdate = true
  }, [count, radius, z])
  return (
    <instancedMesh ref={ref} args={[null, m, count]}>
      {cyl ? <cylinderGeometry args={[size[0], size[1], size[2], 6]} /> : <boxGeometry args={size} />}
    </instancedMesh>
  )
}

/** Many identical items at arbitrary positions (frame rivets, bolts). */
export function Scatter({ positions, geometry, m = M.steel, rotation = [0, 0, 0] }) {
  const ref = useRef()
  useLayoutEffect(() => {
    const o = new THREE.Object3D()
    positions.forEach((p, i) => {
      o.position.set(...p)
      o.rotation.set(...rotation)
      o.updateMatrix()
      ref.current.setMatrixAt(i, o.matrix)
    })
    ref.current.instanceMatrix.needsUpdate = true
  }, [positions, rotation])
  return <instancedMesh ref={ref} args={[geometry, m, positions.length]} />
}

/** Pulley with a groove, axis along x. */
export function Pulley({ r = 0.06, w = 0.03, m = M.steel }) {
  const geometry = useMemo(() => {
    const pts = [
      new THREE.Vector2(0.001, -w / 2), new THREE.Vector2(r, -w / 2), new THREE.Vector2(r, -w / 4),
      new THREE.Vector2(r * 0.86, 0), new THREE.Vector2(r, w / 4), new THREE.Vector2(r, w / 2), new THREE.Vector2(0.001, w / 2),
    ]
    const g = new THREE.LatheGeometry(pts, 32)
    g.rotateZ(Math.PI / 2)
    return g
  }, [r, w])
  return <mesh geometry={geometry} material={m} />
}

/** Closed belt hugging a set of pulleys in the y/z plane: [[y, z, r], ...]. */
export function Belt({ pulleys, x = 0, r = 0.006 }) {
  const geometry = useMemo(() => {
    const pts = []
    pulleys.forEach(([y, z, pr]) => {
      for (let i = 0; i < 24; i += 1) {
        const a = (i / 24) * Math.PI * 2
        pts.push([y + Math.cos(a) * (pr + r), z + Math.sin(a) * (pr + r)])
      }
    })
    pts.sort((p, q) => p[0] - q[0] || p[1] - q[1])
    const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0])
    const lower = []
    for (const p of pts) {
      while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) lower.pop()
      lower.push(p)
    }
    const upper = []
    for (const p of [...pts].reverse()) {
      while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) upper.pop()
      upper.push(p)
    }
    const hull = lower.slice(0, -1).concat(upper.slice(0, -1))
    const curve = new THREE.CatmullRomCurve3(hull.map(([y, z]) => new THREE.Vector3(x, y, z)), true, 'centripetal', 0.1)
    return new THREE.TubeGeometry(curve, 200, r, 6, true)
  }, [pulleys, x, r])
  return <mesh geometry={geometry} material={M.hose} />
}

/**
 * Merges the static meshes under `root` into one mesh per material, so a part made of
 * dozens of bolts, ribs and pipes costs a handful of draw calls. Nested parts and groups
 * marked userData.noBake (spinning pulleys, fans) keep their own meshes.
 */
function bake(root) {
  root.updateWorldMatrix(true, true)
  const toRoot = new THREE.Matrix4().copy(root.matrixWorld).invert()
  const buckets = new Map()
  const baked = []
  const walk = (object) => {
    for (const child of object.children) {
      if (child.userData.part || child.userData.noBake) continue
      if (child.isMesh && !child.isInstancedMesh && !child.material.transparent) {
        let g = child.geometry.index ? child.geometry.toNonIndexed() : child.geometry.clone()
        for (const name of Object.keys(g.attributes)) if (name !== 'position' && name !== 'normal') g.deleteAttribute(name)
        g = g.applyMatrix4(new THREE.Matrix4().multiplyMatrices(toRoot, child.matrixWorld))
        if (!buckets.has(child.material)) buckets.set(child.material, [])
        buckets.get(child.material).push(g)
        baked.push(child)
      }
      walk(child)
    }
  }
  walk(root)
  if (baked.length < 2) return () => {}
  const merged = []
  buckets.forEach((list, material) => {
    const mesh = new THREE.Mesh(mergeGeometries(list, false), material)
    list.forEach((g) => g.dispose())
    root.add(mesh)
    merged.push(mesh)
  })
  baked.forEach((mesh) => { mesh.visible = false })
  return () => {
    merged.forEach((mesh) => {
      root.remove(mesh)
      mesh.geometry.dispose()
    })
    baked.forEach((mesh) => { mesh.visible = true })
  }
}

/**
 * Moves its children from an offset into the assembled position over a scroll window.
 * at: [start, end] progress window. from: offset when unassembled. spin: extra rotation.
 * ex / ek: exploded-view offset and a function of progress returning 0..1.
 */
export function Part({ at, from = [0, 0, 0], spin = [0, 0, 0], ex, ek, position = [0, 0, 0], rotation = [0, 0, 0], keep = false, children }) {
  const ref = useRef()
  const progress = useAssembly()
  useLayoutEffect(() => bake(ref.current), [])
  useFrame(() => {
    const g = ref.current
    if (!g) return
    const p = progress.current.p
    const k = at ? easeOut(ramp(p, at[0], at[1])) : 1
    const o = 1 - k
    const e = ek ? ek(p) : 0
    g.position.set(
      position[0] + from[0] * o + (ex ? ex[0] * e : 0),
      position[1] + from[1] * o + (ex ? ex[1] * e : 0),
      position[2] + from[2] * o + (ex ? ex[2] * e : 0),
    )
    g.rotation.set(rotation[0] + spin[0] * o, rotation[1] + spin[1] * o, rotation[2] + spin[2] * o)
    g.visible = keep || !at || k > 0.0001
  })
  return <group ref={ref} position={position} rotation={rotation} userData={{ part: true }}>{children}</group>
}

/** Label pinned to a point in 3D, visible during [start, end] of scroll progress. */
export function Callout({ position, title, detail, win, side = 'right' }) {
  const ref = useRef()
  const progress = useAssembly()
  useFrame(() => {
    const el = ref.current
    if (!el) return
    const p = progress.current.p
    const v = ramp(p, win[0], win[0] + 0.012) * (1 - ramp(p, win[1] - 0.012, win[1]))
    el.style.display = v < 0.01 ? 'none' : 'flex'
    el.style.opacity = v
    el.style.transform = `translateY(${(1 - v) * 8}px)`
  })
  return (
    <Html position={position} zIndexRange={[6, 0]} style={{ pointerEvents: 'none' }}>
      <div ref={ref} className={`xp-callout xp-callout-${side}`} style={{ opacity: 0, display: 'none' }}>
        <span className="xp-callout-dot" />
        <span className="xp-callout-line" />
        <span className="xp-callout-text">
          <strong>{title}</strong>
          {detail && <small>{detail}</small>}
        </span>
      </div>
    </Html>
  )
}

/** Turns on shadow casting for every mesh inside the group once it mounts. */
export function Shadowed({ children }) {
  const ref = useRef()
  useLayoutEffect(() => {
    ref.current.traverse((o) => {
      if (o.isMesh) {
        o.castShadow = true
        o.receiveShadow = true
      }
    })
  })
  return <group ref={ref}>{children}</group>
}

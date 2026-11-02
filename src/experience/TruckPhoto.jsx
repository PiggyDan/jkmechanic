import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'
import * as THREE from 'three'
import { useAssembly } from './core'
import { truckPhoto } from './timeline'
import truckUrl from '../assets/photo3d/truck.webp'
import truckDepthUrl from '../assets/photo3d/truck-depth.png'

// Final shot: the real photo of the finished truck (background removed), standing on the
// studio floor. A depth map (Depth Anything V2) pushes the photo in and out, so it still
// shifts in 3D as the camera moves. It faces the camera; the 3D model hides behind it.

const HEIGHT = 3.1
const FOOT = 0.07 // share of the photo below the tyres

const vertexShader = /* glsl */ `
  uniform sampler2D uDepth;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    vec3 p = position;
    p.z += (texture2D(uDepth, uv).r - 0.5) * 0.35;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`

const fragmentShader = /* glsl */ `
  uniform sampler2D uMap;
  uniform float uOpacity;
  varying vec2 vUv;
  void main() {
    vec4 texel = texture2D(uMap, vUv);
    gl_FragColor = vec4(texel.rgb, texel.a * uOpacity);
    #include <colorspace_fragment>
  }
`

export default function TruckPhoto({ onShown }) {
  const progress = useAssembly()
  const [map, depth] = useTexture([truckUrl, truckDepthUrl], ([colour]) => {
    colour.colorSpace = THREE.SRGBColorSpace
    colour.anisotropy = 8
  })
  const aspect = map.image.width / map.image.height
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        transparent: true,
        depthWrite: false,
        toneMapped: false,
        uniforms: { uMap: { value: map }, uDepth: { value: depth }, uOpacity: { value: 0 } },
      }),
    [map, depth],
  )
  const group = useRef()
  const shadow = useRef()

  useFrame(({ camera }) => {
    const v = truckPhoto(progress.current.p)
    const g = group.current
    g.visible = v > 0.002
    onShown(v > 0.999)
    if (!g.visible) return
    // Turn to face the camera around the vertical axis only, so it stays upright.
    g.rotation.y = Math.atan2(camera.position.x, camera.position.z)
    g.children[0].material.uniforms.uOpacity.value = v
    shadow.current.material.opacity = v * 0.8
  })

  return (
    <group ref={group} visible={false}>
      <mesh material={material} position={[0, HEIGHT * (0.5 - FOOT), 0]} scale={[HEIGHT * aspect, HEIGHT, 1]} renderOrder={5}>
        <planeGeometry args={[1, 1, 200, 150]} />
      </mesh>
      <mesh ref={shadow} rotation-x={-Math.PI / 2} position={[0.1, 0.005, 0.2]} scale={[HEIGHT * aspect * 0.9, HEIGHT * 0.5, 1]} renderOrder={4}>
        <circleGeometry args={[0.5, 48]} />
        <meshBasicMaterial color="#000000" transparent opacity={0} depthWrite={false} alphaMap={SHADOW} />
      </mesh>
    </group>
  )
}

// Radial falloff for the contact shadow.
const SHADOW = (() => {
  const size = 128
  const data = new Uint8Array(size * size * 4)
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const d = Math.hypot(x / size - 0.5, y / size - 0.5) * 2
      const a = Math.max(0, 1 - d) ** 1.6 * 255
      data.set([a, a, a, 255], (y * size + x) * 4)
    }
  }
  const t = new THREE.DataTexture(data, size, size)
  t.needsUpdate = true
  return t
})()

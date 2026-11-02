import { createContext, useContext } from 'react'
import * as THREE from 'three'

// Smoothed scroll progress (0..1), written by the camera rig and read by every part.
export const AssemblyContext = createContext(null)
export const useAssembly = () => useContext(AssemblyContext)

const std = (color, metalness, roughness, extra = {}) =>
  new THREE.MeshStandardMaterial({ color, metalness, roughness, ...extra })
const paint = (color, extra = {}) =>
  new THREE.MeshPhysicalMaterial({ color, metalness: 0.25, roughness: 0.38, clearcoat: 0.9, clearcoatRoughness: 0.12, ...extra })

export const M = {
  frame: std('#454b53', 0.75, 0.3, { emissive: '#ff4d12', emissiveIntensity: 0 }),
  iron: std('#8a9097', 0.65, 0.4),
  alu: std('#cfd4d9', 0.95, 0.24),
  steel: std('#8b9198', 0.9, 0.34),
  chrome: std('#e4e7ea', 1, 0.12),
  dark: std('#3a3e44', 0.55, 0.4),
  rubber: std('#111213', 0, 0.86, { side: THREE.DoubleSide }),
  accent: std('#ff5a1f', 0.3, 0.38),
  hose: std('#0f1011', 0.05, 0.7),
  zilPaint: paint('#cf3524'),
  paintWhite: paint('#e2e0d6'),
  bodyGlass: paint('#0d171c', { metalness: 0.4, roughness: 0.05, clearcoat: 1 }),
  lamp: std('#fff3d6', 0, 0.2, { emissive: '#ffe6b0', emissiveIntensity: 2.2 }),
  amberLamp: std('#ffb347', 0, 0.25, { emissive: '#ff9a1f', emissiveIntensity: 1.8 }),
  lampRed: std('#ff3b2b', 0, 0.25, { emissive: '#ff2a12', emissiveIntensity: 1.2 }),
}

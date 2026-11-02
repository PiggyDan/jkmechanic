// Dependency-free easing helpers, shared by the page shell and the 3D chunk.
export const clamp01 = (x) => (x < 0 ? 0 : x > 1 ? 1 : x)
export const ramp = (p, a, b) => clamp01((p - a) / (b - a))
export const smooth = (p, a, b) => {
  const t = ramp(p, a, b)
  return t * t * (3 - 2 * t)
}

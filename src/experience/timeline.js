import { ramp, smooth } from './math'

// One scroll timeline (0..1) drives the whole scene: a SsangYong Musso chassis that ends up
// wearing a ZIL-130 body. Stage windows, camera keys and part schedules all live here.

export const STAGES = [
  {
    n: '01',
    id: 'frame',
    range: [0.06, 0.235],
    vehicle: 'SsangYong Musso · 2003',
    title: 'Chassis & frame',
    line: 'Box-section ladder frame. Straight rails and sound mounts come before anything else.',
    specs: [['Wheelbase', '2,630 mm'], ['Frame', 'Box-section ladder'], ['Crossmembers', '7']],
  },
  {
    n: '02',
    id: 'engine',
    range: [0.255, 0.475],
    vehicle: 'SsangYong Musso · 2.9 TD',
    title: 'The 2.9 L engine',
    line: 'Inline-five turbodiesel, built up piece by piece and dropped onto its mounts with the driveline.',
    specs: [['Layout', 'Inline 5 · SOHC 10V'], ['Displacement', '2,874 cc'], ['Driveline', '5-speed · part-time 4WD']],
  },
  {
    n: '03',
    id: 'cab',
    range: [0.495, 0.665],
    vehicle: 'ZIL-130 · USSR',
    title: 'The ZIL-130 cab',
    line: 'Classic Soviet sheet metal: rounded cab, wraparound screen, barred grille and a pickup bed.',
    specs: [['Maker', 'ZIL, Moscow'], ['Built', '1964 – 1994'], ['Finish', 'Red']],
  },
  {
    n: '04',
    id: 'marriage',
    range: [0.685, 0.845],
    vehicle: 'ZIL-130 body · Musso chassis',
    title: 'Body meets frame',
    line: 'The ZIL-130 body comes down onto the Musso chassis, one section at a time.',
    specs: [['Front', 'Bonnet · wings · grille'], ['Cab', 'Two-seat steel cab'], ['Rear', 'Pickup bed']],
  },
  {
    n: '05',
    id: 'complete',
    range: [0.865, 1],
    vehicle: 'Garage 84 · Gachuurt',
    title: 'Complete',
    line: '',
    specs: [],
  },
]

// Camera path: positions and look targets, passed through a Catmull-Rom spline.
export const CAMERA_KEYS = [
  { p: 0.0, pos: [4.3, 1.7, 3.3], look: [0.4, 0.55, 0] },
  { p: 0.06, pos: [4.2, 2.5, 4.1], look: [0.1, 0.5, 0] },
  { p: 0.11, pos: [0.4, 3.7, 5.2], look: [0, 0.45, 0] },
  { p: 0.16, pos: [-4.4, 2.4, 3.6], look: [-0.2, 0.45, 0] },
  { p: 0.215, pos: [-2.0, 4.2, -2.6], look: [0.6, 0.9, 0] },
  { p: 0.27, pos: [5.5, 3.1, 4.0], look: [1.35, 1.9, 0] },
  { p: 0.32, pos: [6.0, 3.6, -1.6], look: [1.35, 1.9, 0] },
  { p: 0.37, pos: [5.6, 3.0, 3.3], look: [1.3, 1.75, 0] },
  { p: 0.42, pos: [4.8, 2.8, 4.2], look: [0.6, 0.9, 0] },
  { p: 0.47, pos: [1.8, 1.3, 4.8], look: [0.3, 0.55, 0] },
  { p: 0.525, pos: [7.4, 4.3, 8.2], look: [0.2, 3.1, 0] },
  { p: 0.585, pos: [0.8, 4.5, 10.2], look: [0.3, 3.2, 0] },
  { p: 0.645, pos: [-7.2, 4.2, 6.8], look: [0.2, 3.1, 0] },
  { p: 0.7, pos: [6.6, 3.6, 6.4], look: [0.2, 1.8, 0] },
  { p: 0.77, pos: [3.0, 2.5, 7.2], look: [0, 1.4, 0] },
  { p: 0.835, pos: [-5.0, 2.3, 5.4], look: [0, 1.0, 0] },
  { p: 0.9, pos: [7.0, 2.5, 4.6], look: [0.4, 1.0, 0] },
  { p: 0.95, pos: [6.6, 1.7, 5.3], look: [0.1, 1.0, 0] },
  { p: 1.0, pos: [6.2, 1.5, 4.8], look: [0.0, 1.05, 0] },
]

// Musso engine: arrives exploded above the frame, closes up, then drops onto its mounts.
export const mussoEngineLift = (p) => 1.35 + 4 * (1 - smooth(p, 0.235, 0.3)) - 1.35 * smooth(p, 0.38, 0.425)
export const mussoExplode = (p) => 1 - smooth(p, 0.3, 0.37)
export const ENGINE_LABELS = [0.27, 0.315]

// Driveline and running gear follow the engine in.
export const DRIVELINE = {
  gearbox: [0.405, 0.445],
  frontDiff: [0.415, 0.445],
  front: [0.415, 0.455],
  steering: [0.43, 0.46],
  rear: [0.42, 0.46],
  shafts: [0.44, 0.47],
  plumbing: [0.44, 0.47],
  radiator: [0.44, 0.47],
  wheels: [0.45, 0.49],
  labels: [0.43, 0.48],
}

// ZIL-130 body: comes down into view in sections (stage 03), closes up in the air,
// then each section is lowered onto the chassis (stage 04).
export const BODY_HOVER = 2.3
export const BODY = {
  show: [0.475, 0.535],
  gather: [0.6, 0.66],
  labels: [0.53, 0.645],
  drop: { front: [0.69, 0.75], cab: [0.72, 0.78], bed: [0.75, 0.81] },
}

// Emissive glow on the frame while it is the subject.
export const mussoFrameGlow = (p) => ramp(p, 0.07, 0.1) * (1 - ramp(p, 0.2, 0.235))

// Stage 05: the real photo of the finished truck takes over from the 3D model.
export const truckPhoto = (p) => smooth(p, 0.855, 0.885)

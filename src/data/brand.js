// Your own logo and service photos, picked up automatically from these folders:
//   src/assets/brand/logo.(svg|png|webp|jpg)        → full logo (header, footer)
//   src/assets/brand/icon.(svg|png|webp|jpg)        → square mark (chat, admin, small spots)
//   src/assets/services/<service-slug>.(jpg|png|webp) → that service's page photo
//   src/assets/services/<service-slug>-booking.(jpg|png|webp) → background behind its booking form
// Until a file is added, the site keeps the "JK" mark and the placeholder photos.
const logos = import.meta.glob('../assets/brand/logo.{svg,png,webp,jpg,jpeg}', { eager: true, query: '?url', import: 'default' })
const icons = import.meta.glob('../assets/brand/icon.{svg,png,webp,jpg,jpeg}', { eager: true, query: '?url', import: 'default' })
const servicePhotos = import.meta.glob('../assets/services/*.{jpg,jpeg,png,webp,avif,JPG,JPEG,PNG}', { eager: true, query: '?url', import: 'default' })

export const logoUrl = Object.values(logos)[0] ?? null
export const iconUrl = Object.values(icons)[0] ?? null

const photoBySlug = Object.fromEntries(
  Object.entries(servicePhotos).map(([path, url]) => [path.split('/').pop().replace(/\.[^.]+$/, ''), url]),
)

export const servicePhoto = (service) => photoBySlug[service.slug] ?? service.image

// Optional background behind a service's booking form: src/assets/services/<slug>-booking.jpg,
// otherwise the service's `bookingImage` (if it has one).
export const bookingPhoto = (service) => photoBySlug[`${service.slug}-booking`] ?? service.bookingImage ?? null

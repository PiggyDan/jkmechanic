// Your own logo and service photos, picked up automatically from these folders:
//   src/assets/brand/logo.(svg|png|webp|jpg)        → header, footer, admin, chat
//   src/assets/services/<service-slug>.(jpg|png|webp) → that service's page photo
// Until a file is added, the site keeps the "JK" mark and the placeholder photos.
const logos = import.meta.glob('../assets/brand/logo.{svg,png,webp,jpg,jpeg}', { eager: true, query: '?url', import: 'default' })
const servicePhotos = import.meta.glob('../assets/services/*.{jpg,jpeg,png,webp,avif,JPG,JPEG,PNG}', { eager: true, query: '?url', import: 'default' })

export const logoUrl = Object.values(logos)[0] ?? null

const photoBySlug = Object.fromEntries(
  Object.entries(servicePhotos).map(([path, url]) => [path.split('/').pop().replace(/\.[^.]+$/, ''), url]),
)

export const servicePhoto = (service) => photoBySlug[service.slug] ?? service.image

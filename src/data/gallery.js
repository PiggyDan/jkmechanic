// Every image in src/assets/gallery/ is picked up automatically at build time,
// sorted by file name. To add or remove photos, just add or delete files there.
const files = import.meta.glob('../assets/gallery/*.{jpg,jpeg,png,webp,avif,JPG,JPEG,PNG,WEBP}', {
  eager: true,
  query: '?url',
  import: 'default',
})

export const galleryPhotos = Object.keys(files)
  .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
  .map((path) => files[path])

// Shrinks a photo in the browser before upload: phone photos are often 3–8 MB, this makes
// them ~150–350 KB so uploads are quick on mobile data. Output is a JPEG data URL.
const MAX_SIDE = 1280
const TARGET_BYTES = 350 * 1024

const dataUrlBytes = (dataUrl) => Math.floor((dataUrl.length - dataUrl.indexOf(',') - 1) * 0.75)

async function loadImage(file) {
  // createImageBitmap applies the photo's EXIF rotation, so portrait phone photos stay upright.
  if ('createImageBitmap' in window) {
    try {
      return await createImageBitmap(file, { imageOrientation: 'from-image' })
    } catch {
      // Fall back to <img> below (e.g. older Safari).
    }
  }
  const url = URL.createObjectURL(file)
  try {
    const image = new Image()
    image.src = url
    await image.decode()
    return image
  } finally {
    URL.revokeObjectURL(url)
  }
}

export async function compressImage(file) {
  if (!file.type.startsWith('image/')) throw new Error('Please choose a photo.')
  let image
  try {
    image = await loadImage(file)
  } catch {
    throw new Error('This photo format could not be read. Please choose a JPEG or PNG photo.')
  }

  let side = MAX_SIDE
  for (let attempt = 0; attempt < 6; attempt += 1) {
    const scale = Math.min(1, side / Math.max(image.width, image.height))
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(image.width * scale)
    canvas.height = Math.round(image.height * scale)
    const context = canvas.getContext('2d')
    context.fillStyle = '#ffffff' // transparent PNGs get a white background in JPEG
    context.fillRect(0, 0, canvas.width, canvas.height)
    context.drawImage(image, 0, 0, canvas.width, canvas.height)

    for (const quality of [0.82, 0.72, 0.62]) {
      const dataUrl = canvas.toDataURL('image/jpeg', quality)
      if (dataUrlBytes(dataUrl) <= TARGET_BYTES) return dataUrl
    }
    side = Math.round(side * 0.8)
  }
  throw new Error('This photo is too large. Please choose another one.')
}

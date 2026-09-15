// Real JK Mechanic Google Maps listing — from the place link.
export const MAPS_URL =
  'https://www.google.com/maps/place/Jkmechanic+Shop+-+Garage+84/@47.9290974,107.1572345,17z/data=!4m6!3m5!1s0x5d9685b11cb21959:0x347fdae78c319379!8m2!3d47.9290974!4d107.1572345'
export const MAPS_EMBED_SRC =
  'https://www.google.com/maps/embed?pb=!1m3!2m1!1sJkmechanic+Shop+-+Garage+84,47.9290974,107.1572345!6i16'

// TODO: update to match the current rating/count on the Google Business Profile.
export const GOOGLE_RATING = '5.0'
export const GOOGLE_REVIEW_COUNT = 10

// TODO: replace with real quotes copied from actual Google reviews.
export const featuredReviews = [
  { quote: 'Add a short quote from one of your real Google reviews here.', name: 'Google customer' },
  { quote: 'Add a second real review quote here — keep the original wording.', name: 'Google customer' },
  { quote: 'Add a third real review quote here.', name: 'Google customer' },
]

// Drop real photos (downloaded from your Google Business Profile) into
// public/gallery/ using these exact filenames. Until then, each tile
// falls back to a placeholder automatically.
export const galleryPhotos = ['/gallery/photo-1.jpg', '/gallery/photo-2.jpg', '/gallery/photo-3.jpg', '/gallery/photo-4.jpg']

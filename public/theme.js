// Apply the preference before the page paints, including when storage is unavailable.
;(function () {
  const media = window.matchMedia('(prefers-color-scheme: dark)')
  let saved
  try { saved = localStorage.getItem('jk-theme') } catch { /* Use system preference. */ }
  const valid = value => value === 'light' || value === 'dark'
  const apply = () => {
    document.documentElement.dataset.theme = valid(saved) ? saved : media.matches ? 'dark' : 'light'
  }
  apply()
  media.addEventListener('change', () => {
    try { saved = localStorage.getItem('jk-theme') } catch { /* Keep current preference. */ }
    apply()
  })
  window.addEventListener('storage', event => {
    if (event.key === 'jk-theme' || event.key === null) {
      saved = event.newValue
      apply()
    }
  })
})()

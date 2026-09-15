'use client'

import { Moon, Sun } from 'lucide-react'

export default function ThemeToggle() {
  function toggleTheme() {
    const theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'
    document.documentElement.dataset.theme = theme
    try { localStorage.setItem('jk-theme', theme) } catch { /* Storage may be disabled. */ }
  }

  return (
    <button className="theme-toggle" type="button" onClick={toggleTheme}>
      <Sun className="theme-sun" size={18} aria-hidden="true" />
      <Moon className="theme-moon" size={18} aria-hidden="true" />
      <span className="theme-to-light">Switch to light mode</span>
      <span className="theme-to-dark">Switch to dark mode</span>
    </button>
  )
}

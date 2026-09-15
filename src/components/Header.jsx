import { Link } from 'react-router-dom'
import ThemeToggle from '../../components/ThemeToggle.jsx'

const messengerIcon = (
  <svg viewBox="0 0 24 24" aria-hidden="true" className="messenger-icon">
    <path d="M12 2.2C6.5 2.2 2 6.3 2 11.3c0 2.5 1.1 4.9 3 6.6v3.9l3.4-1.8c.9.3 1.9.4 2.9.4 5.5 0 10-4.1 10-9.1S17.5 2.2 12 2.2zm1.1 12.9-2.5-2.7-4.9 2.7 5.4-5.7 2.6 2.7 4.8-2.7-5.4 5.7z" />
  </svg>
)

export default function Header() {
  return (
    <header className="topbar">
      <Link className="brand-block" to="/">
        <div className="brand-mark">JK</div>
        <div>
          <div className="brand-name">Garage 84</div>
          <small>Automotive Services</small>
        </div>
      </Link>

      <nav className="nav" aria-label="Main navigation">
        <Link to="/#services">Services</Link>
        <Link to="/about">About</Link>
        <Link to="/#contact">Contact</Link>
      </nav>

      <div className="header-actions">
        <ThemeToggle />
        <a
          className="messenger-button"
          href="https://m.me/jkmongolia"
          target="_blank"
          rel="noreferrer"
          aria-label="Message JK Mongolia on Messenger"
        >
          {messengerIcon}
          Messenger
        </a>
        <Link className="pill-button" to="/#contact">
          Book appointment
        </Link>
      </div>
    </header>
  )
}

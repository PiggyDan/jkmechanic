import { Link } from 'react-router-dom'
import ThemeToggle from '../../components/ThemeToggle.jsx'
import { MessageCircle } from 'lucide-react'
import BookButton from './BookButton'
import { openChat } from '../lib/chat'
import BrandMark from './BrandMark'

export default function Header() {
  return (
    <header className="topbar">
      <Link className="brand-block" to="/">
        <BrandMark />
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
        <button type="button" className="messenger-button" onClick={openChat} aria-label="Chat with the Garage 84 assistant">
          <MessageCircle size={18} className="messenger-icon" aria-hidden="true" />
          Chat
        </button>
        <BookButton className="pill-button" />
      </div>
    </header>
  )
}

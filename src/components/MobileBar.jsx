import { useLocation } from 'react-router-dom'
import { CalendarCheck, MessageCircle, Navigation, Phone } from 'lucide-react'
import BookButton from './BookButton'
import { MAPS_URL } from '../data/googleBusiness'
import { openChat } from '../lib/chat'

// App-style bottom bar on phones: the four things customers do most, always in thumb reach.
export default function MobileBar() {
  const location = useLocation()
  if (location.pathname.startsWith('/admin')) return null

  return (
    <nav className="mobile-bar" aria-label="Quick actions">
      <a href="tel:+97688856529" className="mobile-bar-item">
        <Phone size={20} aria-hidden="true" />
        <span>Call</span>
      </a>
      <a href={MAPS_URL} target="_blank" rel="noreferrer" className="mobile-bar-item">
        <Navigation size={20} aria-hidden="true" />
        <span>Directions</span>
      </a>
      <BookButton className="mobile-bar-item mobile-bar-book">
        <CalendarCheck size={20} aria-hidden="true" />
        <span>Book</span>
      </BookButton>
      <button type="button" className="mobile-bar-item" onClick={openChat}>
        <MessageCircle size={20} aria-hidden="true" />
        <span>Chat</span>
      </button>
    </nav>
  )
}

import ThemeToggle from './ThemeToggle.jsx';
import { Phone } from 'lucide-react';
export default function Header(){return <header className="header"><div className="wrap nav"><a href="/" className="brand"><span>JK</span><b>Garage 84<small>Automotive Services</small></b></a><nav><a href="/#services">Services</a><a href="/#reviews">Reviews</a><a href="/#about">About</a><a href="/#appointment">Appointment</a></nav><ThemeToggle /><a className="call" href="tel:+97688856529"><Phone size={16}/> +976 8885 6529</a></div></header>}


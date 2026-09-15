import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Check, Phone } from 'lucide-react';
import Header from '../../../components/Header';
import GooglePlace from '../../../components/GooglePlace';
import AppointmentForm from '../../../components/AppointmentForm';
import { services, getService } from '../../../lib/services';

export function generateStaticParams(){return services.map(s=>({slug:s.slug}))}
export default async function ServicePage({params}){const {slug}=await params;const s=getService(slug);if(!s)notFound();return <main><Header/><section className="service-page-hero wrap"><div className="service-page-copy"><Link href="/#services" className="back"><ArrowLeft size={16}/> All services</Link><span className="service-no">{s.number}</span><h1>{s.title}</h1><p>{s.intro}</p><a className="primary-btn" href="#book">Book this service <ArrowRight size={17}/></a></div><GooglePlace mode="hero" photoIndex={s.photoIndex}/></section><section className="service-detail"><div className="wrap detail-grid"><div><div className="section-kicker">What we can help with</div><h2>Practical support, explained before the work starts.</h2></div><div className="detail-list">{s.bullets.map(x=><div key={x}><Check size={18}/><span>{x}</span></div>)}</div></div></section><section id="book" className="appointment"><div className="wrap appointment-grid"><div className="appointment-copy"><div className="section-kicker light">Book {s.title}</div><h2>Send the vehicle details.</h2><p>Your request goes directly to <b>jkmongolia@gmail.com</b>. We will use your preferred date and time as a request and confirm availability with you.</p><a className="phone-large" href="tel:+97688856529"><Phone/> +976 8885 6529</a></div><AppointmentForm defaultService={s.title}/></div></section></main>}

'use client';
import { useState } from 'react';
import { ArrowRight } from 'lucide-react';

export default function AppointmentForm({ defaultService='' }) {
  const [status,setStatus]=useState(''); const [busy,setBusy]=useState(false);
  async function submit(e){e.preventDefault();setBusy(true);setStatus('');const form=e.currentTarget;const body=Object.fromEntries(new FormData(form));try{const r=await fetch('/api/contact',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});const d=await r.json();if(!r.ok)throw new Error(d.error);form.reset();setStatus('Request sent. JK Mongolia will contact you to confirm the time.');}catch{setStatus('Could not send right now. Please call +976 8885 6529 or email jkmongolia@gmail.com.');}finally{setBusy(false)}}
  return <form className="booking-form" onSubmit={submit}>
    <div className="form-row"><label>Name<input name="name" required/></label><label>Phone<input name="phone" required/></label></div>
    <div className="form-row"><label>Email<input name="email" type="email"/></label><label>Vehicle<input name="vehicle" placeholder="e.g. Land Cruiser 200"/></label></div>
    <div className="form-row"><label>Year<input name="year"/></label><label>Service<input name="service" defaultValue={defaultService}/></label></div>
    <div className="form-row"><label>Preferred date<input name="preferredDate" type="date"/></label><label>Preferred time<select name="preferredTime"><option>Any time</option><option>Morning</option><option>Afternoon</option></select></label></div>
    <label>What do you need help with?<textarea name="message" rows="5" required placeholder="Tell us the symptoms, the vehicle you want inspected, parts you need, or anything useful before we call you."/></label>
    <button className="primary-btn" disabled={busy}>{busy?'Sending…':'Request appointment'} <ArrowRight size={17}/></button>
    {status && <p className="form-status">{status}</p>}
  </form>
}

import { NextResponse } from 'next/server';

const clean = (value = '') => String(value).replace(/[<>]/g, '').trim();

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      name, phone, email, vehicle, year, service,
      preferredDate, preferredTime, message
    } = body;

    if (!clean(name) || !clean(phone) || !clean(message)) {
      return NextResponse.json({ error: 'Name, phone and message are required.' }, { status: 400 });
    }

    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.CONTACT_FROM;
    if (!apiKey || !from) {
      return NextResponse.json({ error: 'Email service is not configured.' }, { status: 500 });
    }

    const subjectParts = [clean(service) || 'Appointment', clean(vehicle)].filter(Boolean);
    const html = `
      <div style="font-family:Arial,sans-serif;max-width:680px;margin:0 auto;color:#17201c">
        <div style="border-bottom:3px solid #203c34;padding-bottom:16px;margin-bottom:24px">
          <h2 style="margin:0">New JK Mongolia appointment request</h2>
          <p style="margin:6px 0 0;color:#666">Submitted from the JK Mongolia website</p>
        </div>
        <table style="width:100%;border-collapse:collapse;font-size:14px">
          <tr><td style="padding:8px 0;color:#777;width:160px">Customer</td><td><b>${clean(name)}</b></td></tr>
          <tr><td style="padding:8px 0;color:#777">Phone</td><td>${clean(phone)}</td></tr>
          <tr><td style="padding:8px 0;color:#777">Email</td><td>${clean(email) || '—'}</td></tr>
          <tr><td style="padding:8px 0;color:#777">Vehicle</td><td>${clean(vehicle) || '—'}</td></tr>
          <tr><td style="padding:8px 0;color:#777">Year</td><td>${clean(year) || '—'}</td></tr>
          <tr><td style="padding:8px 0;color:#777">Service</td><td>${clean(service) || '—'}</td></tr>
          <tr><td style="padding:8px 0;color:#777">Preferred date</td><td>${clean(preferredDate) || '—'}</td></tr>
          <tr><td style="padding:8px 0;color:#777">Preferred time</td><td>${clean(preferredTime) || 'Any time'}</td></tr>
        </table>
        <div style="margin-top:24px;padding:18px;background:#f2f1ec;border-left:4px solid #203c34">
          <b>Customer notes</b>
          <p style="white-space:pre-wrap;line-height:1.6;margin-bottom:0">${clean(message)}</p>
        </div>
      </div>`;

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from,
        to: ['jkmongolia@gmail.com'],
        reply_to: clean(email) || undefined,
        subject: `JK appointment — ${subjectParts.join(' — ')}`,
        html
      })
    });

    if (!response.ok) {
      const text = await response.text();
      console.error('Resend error:', text);
      return NextResponse.json({ error: 'Email provider rejected the message.' }, { status: 502 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Unexpected server error.' }, { status: 500 });
  }
}

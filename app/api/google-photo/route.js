import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    const photoName = request.nextUrl.searchParams.get('name');

    if (!apiKey || !photoName) {
      return NextResponse.json(
        { error: 'Missing photo configuration.' },
        { status: 400 }
      );
    }

    const url =
      `https://places.googleapis.com/v1/${photoName}/media` +
      `?maxWidthPx=1600&skipHttpRedirect=true&key=${apiKey}`;

    const response = await fetch(url);

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Unable to load Google photo.' },
        { status: response.status }
      );
    }

    const data = await response.json();

    if (!data.photoUri) {
      return NextResponse.json(
        { error: 'Photo URL unavailable.' },
        { status: 404 }
      );
    }

    return NextResponse.redirect(data.photoUri, {
      headers: { 'Cache-Control': 'public, max-age=3600' },
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: 'Photo request failed.' },
      { status: 500 }
    );
  }
}

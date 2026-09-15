import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

function formatDate(publishTime) {
  if (!publishTime) return '';
  try {
    return new Date(publishTime).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return '';
  }
}

export async function GET() {
  try {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    const placeId = process.env.GOOGLE_PLACE_ID;

    if (!apiKey || !placeId) {
      return NextResponse.json(
        { error: 'Google Maps API configuration missing.' },
        { status: 500 }
      );
    }

    const fieldMask = [
      'id',
      'displayName',
      'formattedAddress',
      'rating',
      'userRatingCount',
      'reviews',
      'photos',
      'googleMapsUri',
    ].join(',');

    const response = await fetch(
      `https://places.googleapis.com/v1/places/${placeId}`,
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': apiKey,
          'X-Goog-FieldMask': fieldMask,
        },
        cache: 'no-store',
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Google Places error:', errorText);

      return NextResponse.json(
        { error: 'Unable to load Google place information.' },
        { status: response.status }
      );
    }

    const place = await response.json();

    const photos = (place.photos ?? []).map((photo, index) => ({
      id: index,
      width: photo.widthPx,
      height: photo.heightPx,
      attribution: photo.authorAttributions?.[0]
        ? {
            displayName: photo.authorAttributions[0].displayName,
            uri: photo.authorAttributions[0].uri,
          }
        : null,
      url: `/api/google-photo?name=${encodeURIComponent(photo.name)}`,
    }));

    const reviews = (place.reviews ?? []).map((review) => ({
      author: review.authorAttribution?.displayName ?? 'Google User',
      authorPhoto: review.authorAttribution?.photoUri ?? null,
      rating: review.rating ?? 0,
      relativeTime: review.relativePublishTimeDescription ?? '',
      date: formatDate(review.publishTime),
      text: review.text?.text ?? '',
      googleMapsUri: review.googleMapsUri ?? null,
    }));

    return NextResponse.json({
      name: place.displayName?.text ?? '',
      address: place.formattedAddress ?? '',
      rating: place.rating ?? null,
      reviewCount: place.userRatingCount ?? 0,
      googleMapsUri: place.googleMapsUri ?? null,
      photos,
      reviews,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: 'Internal server error.' },
      { status: 500 }
    );
  }
}

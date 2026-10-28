import { NextRequest, NextResponse } from 'next/server';
import { verifyIdToken } from '@/lib/firebase/admin';
import { getSupabaseAdmin } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    // 1. Get token from Authorization header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized: Missing bearer token' }, { status: 401 });
    }
    const token = authHeader.substring(7);

    // 2. Check if Firebase Admin environment variables exist
    if (
      !process.env.FIREBASE_ADMIN_PROJECT_ID ||
      !process.env.FIREBASE_ADMIN_CLIENT_EMAIL ||
      !process.env.FIREBASE_ADMIN_PRIVATE_KEY
    ) {
      return NextResponse.json(
        {
          error:
            'Firebase Admin credentials not configured on server. Please add FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL, and FIREBASE_ADMIN_PRIVATE_KEY to .env.local.',
        },
        { status: 503 }
      );
    }

    // 3. Verify token with Firebase Admin and extract UID
    let decoded;
    try {
      decoded = await verifyIdToken(token);
    } catch (tokenErr) {
      console.error('Firebase token verification failed:', tokenErr);
      return NextResponse.json({ error: 'Invalid or expired Firebase ID token' }, { status: 401 });
    }

    const firebaseUid = decoded.uid;
    if (!firebaseUid) {
      return NextResponse.json({ error: 'Unable to derive user identity from token' }, { status: 401 });
    }

    // 4. Parse body
    const body = await request.json();
    const { place_id, price_rating, ambience_rating, food_quality_rating } = body;

    // 5. Validate inputs
    if (!place_id || typeof place_id !== 'string') {
      return NextResponse.json({ error: 'Invalid or missing place_id' }, { status: 400 });
    }

    const ratings = [price_rating, ambience_rating, food_quality_rating];
    for (const rating of ratings) {
      if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
        return NextResponse.json(
          { error: 'All ratings (food quality, ambience, price) must be integers between 1 and 5' },
          { status: 400 }
        );
      }
    }

    // 6. Check if Supabase Service Role is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json(
        {
          error:
            'Supabase server credentials not configured. Please add SUPABASE_SERVICE_ROLE_KEY to .env.local.',
        },
        { status: 503 }
      );
    }

    const supabaseAdmin = getSupabaseAdmin();

    // 7. Verify place exists and is published
    const { data: place, error: placeError } = await supabaseAdmin
      .from('places')
      .select('id, is_published')
      .eq('id', place_id)
      .single();

    if (placeError || !place) {
      return NextResponse.json({ error: 'Place not found in database' }, { status: 404 });
    }

    if (!place.is_published) {
      return NextResponse.json({ error: 'Place is currently not available for rating' }, { status: 404 });
    }

    // 8. Upsert rating (composite primary key: place_id, firebase_uid)
    const { error: upsertError } = await supabaseAdmin
      .from('place_ratings')
      .upsert(
        {
          place_id,
          firebase_uid: firebaseUid,
          price_rating,
          ambience_rating,
          food_quality_rating,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'place_id,firebase_uid',
        }
      );

    if (upsertError) {
      console.error('Supabase upsert rating error:', upsertError);
      return NextResponse.json({ error: 'Failed to record rating in database' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Rating saved successfully' });
  } catch (err) {
    console.error('Rating API handler error:', err);
    return NextResponse.json({ error: 'Internal server error while processing rating' }, { status: 500 });
  }
}

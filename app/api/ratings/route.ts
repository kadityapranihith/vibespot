import { NextRequest, NextResponse } from 'next/server';
import { verifyIdToken } from '@/lib/firebase/admin';
import { getSupabaseAdmin } from '@/lib/supabase/server';

/**
 * GET /api/ratings
 * - Query with ?place_id=123: Returns current user's rating for this specific place (if any)
 * - Query without place_id: Returns all ratings submitted by current user (with place details)
 */
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized: Missing bearer token' }, { status: 401 });
    }
    const token = authHeader.substring(7);

    // Verify token
    let decoded;
    try {
      decoded = await verifyIdToken(token);
    } catch {
      return NextResponse.json({ error: 'Invalid or expired Firebase ID token' }, { status: 401 });
    }

    const firebaseUid = decoded.uid;
    if (!firebaseUid) {
      return NextResponse.json({ error: 'Unable to derive user identity from token' }, { status: 401 });
    }

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: 'Supabase server credentials not configured' }, { status: 503 });
    }

    const supabaseAdmin = getSupabaseAdmin();
    const placeIdParam = request.nextUrl.searchParams.get('place_id');

    if (placeIdParam) {
      // Fetch user's rating for a specific place
      const { data, error } = await supabaseAdmin
        .from('place_ratings')
        .select('place_id, price_rating, ambience_rating, food_quality_rating, created_at, updated_at')
        .eq('place_id', placeIdParam)
        .eq('firebase_uid', firebaseUid)
        .maybeSingle();

      if (error) {
        console.error('Error fetching user rating:', error);
        return NextResponse.json({ error: 'Failed to retrieve rating' }, { status: 500 });
      }

      return NextResponse.json({ rating: data });
    }

    // Fetch all ratings submitted by this user (e.g. for Account / Profile page)
    const { data, error } = await supabaseAdmin
      .from('place_ratings')
      .select('place_id, price_rating, ambience_rating, food_quality_rating, created_at, updated_at, places(id, name, category, address, price_per_two)')
      .eq('firebase_uid', firebaseUid)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching all user ratings:', error);
      return NextResponse.json({ error: 'Failed to retrieve user ratings' }, { status: 500 });
    }

    return NextResponse.json({ ratings: data || [] });
  } catch (err) {
    console.error('GET /api/ratings handler error:', err);
    return NextResponse.json({ error: 'Internal server error while fetching ratings' }, { status: 500 });
  }
}

/**
 * POST /api/ratings
 * - Upserts a rating for (place_id, firebase_uid).
 * - Enforces that each user has at most ONE rating per place.
 * - Submitting again edits/overwrites their existing rating.
 */
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
    if (!place_id || (typeof place_id !== 'string' && typeof place_id !== 'number')) {
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
    // Ensures exactly 1 rating per user per place, cleanly updating if already exists
    const { data: savedRating, error: upsertError } = await supabaseAdmin
      .from('place_ratings')
      .upsert(
        {
          place_id: Number.isInteger(Number(place_id)) ? Number(place_id) : place_id,
          firebase_uid: firebaseUid,
          price_rating,
          ambience_rating,
          food_quality_rating,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'place_id,firebase_uid',
        }
      )
      .select('place_id, price_rating, ambience_rating, food_quality_rating, created_at, updated_at')
      .single();

    if (upsertError) {
      console.error('Supabase upsert rating error:', upsertError);
      return NextResponse.json({ error: 'Failed to record rating in database' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Rating saved successfully',
      rating: savedRating,
    });
  } catch (err) {
    console.error('Rating API handler error:', err);
    return NextResponse.json({ error: 'Internal server error while processing rating' }, { status: 500 });
  }
}

/**
 * DELETE /api/ratings?place_id=123
 * - Allows a user to delete their rating for a place
 */
export async function DELETE(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized: Missing bearer token' }, { status: 401 });
    }
    const token = authHeader.substring(7);

    let decoded;
    try {
      decoded = await verifyIdToken(token);
    } catch {
      return NextResponse.json({ error: 'Invalid or expired Firebase ID token' }, { status: 401 });
    }

    const firebaseUid = decoded.uid;
    if (!firebaseUid) {
      return NextResponse.json({ error: 'Unable to derive user identity from token' }, { status: 401 });
    }

    const placeIdParam = request.nextUrl.searchParams.get('place_id');
    if (!placeIdParam) {
      return NextResponse.json({ error: 'Missing place_id parameter' }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdmin();
    const { error: deleteError } = await supabaseAdmin
      .from('place_ratings')
      .delete()
      .eq('place_id', placeIdParam)
      .eq('firebase_uid', firebaseUid);

    if (deleteError) {
      console.error('Supabase delete rating error:', deleteError);
      return NextResponse.json({ error: 'Failed to remove rating' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Rating removed successfully' });
  } catch (err) {
    console.error('DELETE /api/ratings handler error:', err);
    return NextResponse.json({ error: 'Internal server error while deleting rating' }, { status: 500 });
  }
}

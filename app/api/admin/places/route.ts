import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminRequest } from '@/lib/admin-server';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { normalizeTags } from '@/lib/utils';

/**
 * GET /api/admin/places
 * Fetch all places (including unpublished/drafts) for admin management
 */
export async function GET(request: NextRequest) {
  const auth = await verifyAdminRequest(request);
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const supabaseAdmin = getSupabaseAdmin();

    const [placesRes, summaryRes] = await Promise.all([
      supabaseAdmin
        .from('places')
        .select('*')
        .order('id', { ascending: false }),
      supabaseAdmin
        .from('place_rating_summary')
        .select('*'),
    ]);

    if (placesRes.error) {
      console.error('Error fetching admin places:', placesRes.error);
      return NextResponse.json({ error: placesRes.error.message }, { status: 500 });
    }

    const summaryMap = new Map();
    if (summaryRes.data) {
      for (const s of summaryRes.data) {
        summaryMap.set(String(s.place_id), s);
      }
    }

    const enrichedPlaces = (placesRes.data || []).map((p) => {
      const summary = summaryMap.get(String(p.id));
      return {
        ...p,
        id: Number(p.id),
        tags: normalizeTags(p.tags),
        avg_price_rating: summary?.avg_price_rating ?? null,
        avg_ambience: summary?.avg_ambience ?? null,
        avg_food_quality: summary?.avg_food_quality ?? null,
        rating_count: summary?.rating_count ?? 0,
      };
    });

    return NextResponse.json({ places: enrichedPlaces });
  } catch (err) {
    console.error('Admin GET error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/admin/places
 * Add a new restaurant/eatery directly to the database
 */
export async function POST(request: NextRequest) {
  const auth = await verifyAdminRequest(request);
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const body = await request.json();
    const {
      name,
      category,
      address,
      price_per_two,
      latitude,
      longitude,
      maps_url,
      tags,
      is_published = true,
    } = body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ error: 'Restaurant name is required' }, { status: 400 });
    }

    if (!category || typeof category !== 'string' || !category.trim()) {
      return NextResponse.json({ error: 'Category is required' }, { status: 400 });
    }

    if (!address || typeof address !== 'string' || !address.trim()) {
      return NextResponse.json({ error: 'Address is required' }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdmin();

    const insertPayload = {
      name: name.trim(),
      category: category.trim(),
      address: address.trim(),
      price_per_two: price_per_two !== undefined && price_per_two !== null && price_per_two !== ''
        ? Number(price_per_two)
        : null,
      latitude: latitude !== undefined && latitude !== null && latitude !== ''
        ? Number(latitude)
        : null,
      longitude: longitude !== undefined && longitude !== null && longitude !== ''
        ? Number(longitude)
        : null,
      maps_url: maps_url ? String(maps_url).trim() : null,
      tags: normalizeTags(tags).join(', '),
      is_published: Boolean(is_published),
      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabaseAdmin
      .from('places')
      .insert(insertPayload)
      .select()
      .single();

    if (error) {
      console.error('Error creating place:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      place: { ...data, tags: normalizeTags(data.tags) },
    });
  } catch (err) {
    console.error('Admin POST error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * PATCH /api/admin/places
 * 1-Click Update: Toggle published status, update prices, tags, or any field
 */
export async function PATCH(request: NextRequest) {
  const auth = await verifyAdminRequest(request);
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Missing place id' }, { status: 400 });
    }

    const cleanUpdates: Record<string, any> = {};

    if (updates.name !== undefined) cleanUpdates.name = String(updates.name).trim();
    if (updates.category !== undefined) cleanUpdates.category = String(updates.category).trim();
    if (updates.address !== undefined) cleanUpdates.address = String(updates.address).trim();
    if (updates.maps_url !== undefined) cleanUpdates.maps_url = updates.maps_url ? String(updates.maps_url).trim() : null;
    if (updates.is_published !== undefined) cleanUpdates.is_published = Boolean(updates.is_published);
    if (updates.price_per_two !== undefined) {
      cleanUpdates.price_per_two = updates.price_per_two === null || updates.price_per_two === ''
        ? null
        : Number(updates.price_per_two);
    }
    if (updates.latitude !== undefined) {
      cleanUpdates.latitude = updates.latitude === null || updates.latitude === ''
        ? null
        : Number(updates.latitude);
    }
    if (updates.longitude !== undefined) {
      cleanUpdates.longitude = updates.longitude === null || updates.longitude === ''
        ? null
        : Number(updates.longitude);
    }
    if (updates.tags !== undefined) {
      cleanUpdates.tags = normalizeTags(updates.tags).join(', ');
    }

    const supabaseAdmin = getSupabaseAdmin();
    const { data, error } = await supabaseAdmin
      .from('places')
      .update(cleanUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating place:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      place: { ...data, tags: normalizeTags(data.tags) },
    });
  } catch (err) {
    console.error('Admin PATCH error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/places?id=123
 * Permanently delete a place
 */
export async function DELETE(request: NextRequest) {
  const auth = await verifyAdminRequest(request);
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const id = request.nextUrl.searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Missing place id parameter' }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdmin();

    // First delete associated ratings to satisfy FK constraint if needed
    await supabaseAdmin.from('place_ratings').delete().eq('place_id', id);

    const { error } = await supabaseAdmin.from('places').delete().eq('id', id);

    if (error) {
      console.error('Error deleting place:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Place deleted successfully' });
  } catch (err) {
    console.error('Admin DELETE error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

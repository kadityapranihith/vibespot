import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/server';

/**
 * In-memory short-term deduplication cache (sessionId:path -> timestamp)
 * Prevents rapid refresh spam from polluting visitor counts.
 */
const recentVisitsCache = new Map<string, number>();

// Clean up stale entries every 10 minutes
setInterval(() => {
  const cutoff = Date.now() - 60000;
  for (const [key, timestamp] of recentVisitsCache.entries()) {
    if (timestamp < cutoff) recentVisitsCache.delete(key);
  }
}, 600000);

/**
 * POST /api/analytics/visit
 * Lightweight, privacy-friendly endpoint to record a page visit.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { path = '/', sessionId, deviceType = 'desktop', referrer } = body;

    // Filter out internal admin and api paths
    if (typeof path === 'string' && (path.startsWith('/admin') || path.startsWith('/api'))) {
      return NextResponse.json({ success: true, ignored: true });
    }

    // Deduplication check: same session visiting same path within 30 seconds
    if (sessionId) {
      const cacheKey = `${sessionId}:${path}`;
      const lastVisit = recentVisitsCache.get(cacheKey);
      const now = Date.now();
      if (lastVisit && now - lastVisit < 30000) {
        return NextResponse.json({ success: true, deduplicated: true });
      }
      recentVisitsCache.set(cacheKey, now);
    }

    const cleanDevice = ['mobile', 'tablet', 'desktop'].includes(deviceType)
      ? deviceType
      : 'desktop';

    const supabaseAdmin = getSupabaseAdmin();
    const { error } = await supabaseAdmin.from('page_visits').insert({
      path: String(path).slice(0, 255),
      session_id: sessionId ? String(sessionId).slice(0, 100) : null,
      device_type: cleanDevice,
      referrer: referrer ? String(referrer).slice(0, 500) : null,
      created_at: new Date().toISOString(),
    });

    if (error) {
      // If table doesn't exist yet (PGRST205), log a friendly warning and return 200 so clients never fail
      if (error.code === 'PGRST205') {
        return NextResponse.json({
          success: false,
          message: "Table 'page_visits' not created in Supabase yet",
        });
      }
      console.warn('Analytics insert error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    // Analytics should never throw visible errors to visitors
    console.error('Analytics POST error:', err);
    return NextResponse.json({ success: false }, { status: 200 });
  }
}


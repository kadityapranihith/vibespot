import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminRequest } from '@/lib/admin-server';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { getFirebaseUsers } from '@/lib/firebase/users';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const auth = await verifyAdminRequest(request);
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    // 1. Fetch Registered Users from Firebase
    const firebaseData = await getFirebaseUsers(1000);

    // 2. Query Page Visits & Analytics from Supabase
    const supabaseAdmin = getSupabaseAdmin();

    // Check if table exists
    const testRes = await supabaseAdmin.from('page_visits').select('id').limit(1);
    const tableMissing = testRes.error && testRes.error.code === 'PGRST205';

    if (tableMissing) {
      return NextResponse.json({
        success: true,
        pendingTable: true,
        totalUsers: firebaseData.totalCount,
        users: firebaseData.users.slice(0, 10),
        totalVisits: 0,
        visitsToday: 0,
        uniqueSessions: 0,
        hourlyGraph: [],
        deviceBreakdown: { mobile: 0, desktop: 0, tablet: 0 },
        popularPaths: [],
      });
    }

    // Calculate start of today in Indian Standard Time (IST = UTC + 5:30)
    const now = new Date();
    const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
    const nowIst = new Date(now.getTime() + IST_OFFSET_MS);
    const todayIstStartUtc = new Date(
      Date.UTC(nowIst.getUTCFullYear(), nowIst.getUTCMonth(), nowIst.getUTCDate()) - IST_OFFSET_MS
    );

    // Past 24 hours timestamp
    const past24hUtc = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Run parallel queries
    const [totalVisitsRes, todayVisitsRes, past24hVisitsRes] = await Promise.all([
      supabaseAdmin.from('page_visits').select('*', { count: 'exact', head: true }),
      supabaseAdmin
        .from('page_visits')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', todayIstStartUtc.toISOString()),
      supabaseAdmin
        .from('page_visits')
        .select('created_at, device_type, path, session_id')
        .gte('created_at', past24hUtc.toISOString())
        .order('created_at', { ascending: true }),
    ]);

    const totalVisits = totalVisitsRes.count || 0;
    const visitsToday = todayVisitsRes.count || 0;
    const past24hRows = past24hVisitsRes.data || [];

    // Unique sessions in last 24h
    const sessionSet = new Set(past24hRows.map((r) => r.session_id).filter(Boolean));
    const uniqueSessions = sessionSet.size;

    // Device breakdown in last 24h
    const deviceBreakdown = { mobile: 0, desktop: 0, tablet: 0 };
    for (const r of past24hRows) {
      const dev = r.device_type as 'mobile' | 'desktop' | 'tablet';
      if (dev && dev in deviceBreakdown) {
        deviceBreakdown[dev]++;
      } else {
        deviceBreakdown.desktop++;
      }
    }

    // Popular paths in last 24h
    const pathCounts: Record<string, number> = {};
    for (const r of past24hRows) {
      const p = r.path || '/';
      pathCounts[p] = (pathCounts[p] || 0) + 1;
    }
    const popularPaths = Object.entries(pathCounts)
      .map(([path, count]) => ({ path, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Build 24-Hour Timing Graph (1-hour bins in IST)
    // We construct 24 bins representing the last 24 hours up to the current hour
    const hourlyBins: { hourLabel: string; visits: number; rawHour: number }[] = [];
    const currentIstHour = nowIst.getUTCHours();

    for (let i = 23; i >= 0; i--) {
      const targetHourIst = (currentIstHour - i + 24) % 24;
      const formattedLabel =
        targetHourIst === 0
          ? '12 AM'
          : targetHourIst < 12
          ? `${targetHourIst} AM`
          : targetHourIst === 12
          ? '12 PM'
          : `${targetHourIst - 12} PM`;

      hourlyBins.push({
        hourLabel: formattedLabel,
        visits: 0,
        rawHour: targetHourIst,
      });
    }

    // Distribute 24h rows into bins based on IST hour
    for (const r of past24hRows) {
      if (!r.created_at) continue;
      const date = new Date(r.created_at);
      const istDate = new Date(date.getTime() + IST_OFFSET_MS);
      const rowHour = istDate.getUTCHours();

      // Find matching bin (most recent occurrence)
      const bin = hourlyBins.find((b) => b.rawHour === rowHour);
      if (bin) {
        bin.visits++;
      }
    }

    // Find peak hour
    let peakHour = 'N/A';
    let maxVisits = 0;
    for (const b of hourlyBins) {
      if (b.visits > maxVisits) {
        maxVisits = b.visits;
        peakHour = b.hourLabel;
      }
    }

    return NextResponse.json({
      success: true,
      pendingTable: false,
      totalUsers: firebaseData.totalCount,
      users: firebaseData.users.slice(0, 10),
      totalVisits,
      visitsToday,
      uniqueSessions,
      peakHour: maxVisits > 0 ? `${peakHour} (${maxVisits} visits)` : 'No visits yet',
      hourlyGraph: hourlyBins.map(({ hourLabel, visits }) => ({ hour: hourLabel, visits })),
      deviceBreakdown,
      popularPaths,
    });
  } catch (err) {
    console.error('Metrics GET error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

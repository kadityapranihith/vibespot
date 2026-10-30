'use client';

import { useState, useEffect } from 'react';
import {
  Users,
  Activity,
  Globe,
  Smartphone,
  Monitor,
  Tablet,
  Clock,
  RotateCcw,
  Copy,
  Check,
  Flame,
  ArrowUpRight,
  TrendingUp,
  ShieldCheck,
  Calendar,
} from 'lucide-react';

interface MetricsData {
  pendingTable: boolean;
  totalUsers: number;
  users: {
    uid: string;
    email?: string;
    displayName?: string;
    createdAt?: string;
    lastLoginAt?: string;
  }[];
  totalVisits: number;
  visitsToday: number;
  uniqueSessions: number;
  peakHour: string;
  hourlyGraph: { hour: string; visits: number }[];
  deviceBreakdown: { mobile: number; desktop: number; tablet: number };
  popularPaths: { path: string; count: number }[];
}

interface AnalyticsDashboardProps {
  getIdToken: () => Promise<string | null>;
}

const CREATE_TABLE_SQL = `-- Run this in your Supabase SQL Editor:
CREATE TABLE IF NOT EXISTS public.page_visits (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  path text NOT NULL DEFAULT '/',
  session_id text,
  device_type text DEFAULT 'desktop',
  referrer text,
  created_at timestamptz DEFAULT now()
);

-- Index for fast time & hourly queries
CREATE INDEX IF NOT EXISTS idx_page_visits_created_at ON public.page_visits (created_at DESC);`;

export function AnalyticsDashboard({ getIdToken }: AnalyticsDashboardProps) {
  const [data, setData] = useState<MetricsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copiedSql, setCopiedSql] = useState(false);
  const [hoveredBar, setHoveredBar] = useState<{ hour: string; visits: number } | null>(null);

  const fetchMetrics = async () => {
    setLoading(true);
    setError('');
    try {
      const token = await getIdToken();
      if (!token) throw new Error('Not authenticated');

      const res = await fetch('/api/admin/metrics', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: 'no-store',
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to load metrics');

      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  const handleCopySql = () => {
    navigator.clipboard.writeText(CREATE_TABLE_SQL);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 3000);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-3xl p-16 border border-stone-200 text-center flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-3 border-orange-600 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
          Gathering live analytics &amp; Firebase users...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-rose-50 border border-rose-200 rounded-3xl p-6 text-rose-800 text-xs font-medium flex items-center justify-between">
        <span>{error}</span>
        <button
          onClick={fetchMetrics}
          className="px-3 py-1.5 bg-rose-600 text-white rounded-xl font-bold"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!data) return null;

  // Max visits for bar chart scaling
  const maxBarVisits = Math.max(...(data.hourlyGraph?.map((g) => g.visits) || [1]), 1);

  // Device breakdown totals
  const totalDeviceVisits =
    data.deviceBreakdown.mobile + data.deviceBreakdown.desktop + data.deviceBreakdown.tablet || 1;
  const mobilePct = Math.round((data.deviceBreakdown.mobile / totalDeviceVisits) * 100);
  const desktopPct = Math.round((data.deviceBreakdown.desktop / totalDeviceVisits) * 100);
  const tabletPct = Math.round((data.deviceBreakdown.tablet / totalDeviceVisits) * 100);

  return (
    <div className="space-y-6">
      {/* Pending Table Notice (if page_visits is not yet created in Supabase) */}
      {data.pendingTable && (
        <div className="bg-amber-50 border border-amber-200 rounded-3xl p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-200/80 text-amber-900 mb-1">
                1-Step Supabase Setup Required
              </div>
              <h3 className="text-base font-bold text-amber-950">
                Enable Page Visit &amp; Timing Analytics
              </h3>
              <p className="text-xs text-amber-800 mt-0.5">
                Run this quick SQL command in your Supabase SQL Editor to start recording real-time visitors:
              </p>
            </div>

            <button
              onClick={handleCopySql}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-900 text-white hover:bg-amber-850 flex items-center gap-1.5 shrink-0 transition-colors shadow-2xs"
            >
              {copiedSql ? <Check size={14} /> : <Copy size={14} />}
              <span>{copiedSql ? 'SQL Copied!' : 'Copy SQL'}</span>
            </button>
          </div>

          <pre className="bg-stone-900 text-orange-200 font-mono text-[11px] p-4 rounded-2xl overflow-x-auto border border-stone-800 leading-relaxed">
            {CREATE_TABLE_SQL}
          </pre>
        </div>
      )}

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Registered Users (Firebase Auth) */}
        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-stone-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
              Registered Users
            </span>
            <div className="w-7 h-7 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
              <Users size={15} />
            </div>
          </div>
          <span className="text-2xl sm:text-3xl font-black text-stone-900 block">
            {data.totalUsers}
          </span>
          <span className="text-[11px] text-stone-400 mt-1 block">Firebase accounts</span>
        </div>

        {/* Visits Today (IST) */}
        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-stone-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">
              Visits Today
            </span>
            <div className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <Activity size={15} />
            </div>
          </div>
          <span className="text-2xl sm:text-3xl font-black text-emerald-600 block">
            {data.visitsToday}
          </span>
          <span className="text-[11px] text-emerald-600/80 mt-1 block">Since 12:00 AM IST</span>
        </div>

        {/* Total All-Time Visits */}
        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-stone-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
              All-Time Visits
            </span>
            <div className="w-7 h-7 rounded-xl bg-stone-100 text-stone-600 flex items-center justify-center">
              <Globe size={15} />
            </div>
          </div>
          <span className="text-2xl sm:text-3xl font-black text-stone-900 block">
            {data.totalVisits}
          </span>
          <span className="text-[11px] text-stone-400 mt-1 block">Total page views</span>
        </div>

        {/* Peak Timing Hour */}
        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-stone-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-orange-600">
              Peak Traffic
            </span>
            <div className="w-7 h-7 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
              <Flame size={15} />
            </div>
          </div>
          <span className="text-lg sm:text-xl font-black text-stone-900 truncate block mt-1">
            {data.peakHour}
          </span>
          <span className="text-[11px] text-orange-600/80 mt-1 block">Busiest hour</span>
        </div>
      </div>

      {/* 24-HOUR TIMING GRAPH PLOT */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-orange-600" />
              <h3 className="text-base font-black text-stone-900">
                24-Hour Activity Curve (IST)
              </h3>
            </div>
            <p className="text-xs text-stone-400 mt-0.5">
              Hourly visit counts across Kakinada time (hover any bar to view exact traffic)
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            {hoveredBar && (
              <span className="font-bold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-xl border border-orange-200 animate-in fade-in">
                {hoveredBar.hour}: {hoveredBar.visits} {hoveredBar.visits === 1 ? 'visit' : 'visits'}
              </span>
            )}
            <button
              onClick={fetchMetrics}
              className="p-2 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50 transition-colors"
              title="Refresh Analytics"
            >
              <RotateCcw size={14} />
            </button>
          </div>
        </div>

        {/* Visual Bar Chart */}
        {data.hourlyGraph && data.hourlyGraph.length > 0 ? (
          <div className="pt-6 pb-2">
            <div className="h-44 sm:h-52 flex items-end gap-1 sm:gap-2 px-1 border-b border-stone-200">
              {data.hourlyGraph.map((item, idx) => {
                const heightPct = Math.max((item.visits / maxBarVisits) * 100, item.visits > 0 ? 8 : 2);
                const isHovered = hoveredBar?.hour === item.hour;

                return (
                  <div
                    key={idx}
                    className="flex-1 h-full flex flex-col justify-end items-center group relative cursor-pointer"
                    onMouseEnter={() => setHoveredBar(item)}
                    onMouseLeave={() => setHoveredBar(null)}
                  >
                    {/* Tooltip on bar hover */}
                    <div
                      className={`absolute -top-9 px-2 py-1 bg-stone-900 text-white text-[10px] font-bold rounded-lg pointer-events-none whitespace-nowrap transition-opacity shadow-md z-10 ${
                        isHovered ? 'opacity-100' : 'opacity-0'
                      }`}
                    >
                      {item.hour}: {item.visits}
                    </div>

                    {/* Bar Pill */}
                    <div
                      style={{ height: `${heightPct}%` }}
                      className={`w-full max-w-[22px] rounded-t-lg transition-all duration-300 ${
                        item.visits > 0
                          ? isHovered
                            ? 'bg-orange-700 shadow-md scale-y-[1.03]'
                            : 'bg-gradient-to-t from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400'
                          : 'bg-stone-100 hover:bg-stone-200'
                      }`}
                    />
                  </div>
                );
              })}
            </div>

            {/* X-Axis Labels (Display every 3rd or 4th hour label for clean spacing) */}
            <div className="flex justify-between items-center text-[10px] font-bold text-stone-400 px-1 pt-2">
              {data.hourlyGraph.map((item, idx) => {
                const showLabel = idx % 4 === 0 || idx === data.hourlyGraph.length - 1;
                return (
                  <span
                    key={idx}
                    className={`flex-1 text-center truncate ${showLabel ? 'visible' : 'invisible'}`}
                  >
                    {item.hour}
                  </span>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="py-12 text-center text-xs text-stone-400 italic">
            No visits recorded in the last 24 hours. Once visitors start browsing, the traffic curve will appear here.
          </div>
        )}
      </div>

      {/* TWO COLUMN INSIGHTS: DEVICES & REGISTERED USERS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Device Breakdown */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Smartphone size={16} className="text-orange-600" />
            <h3 className="text-base font-black text-stone-900">
              Visitor Devices (Last 24h)
            </h3>
          </div>

          <div className="space-y-3 pt-2">
            {/* Mobile */}
            <div>
              <div className="flex justify-between text-xs font-bold text-stone-700 mb-1">
                <span className="flex items-center gap-1.5">
                  <Smartphone size={13} className="text-stone-400" /> Mobile
                </span>
                <span>
                  {data.deviceBreakdown.mobile} visits ({mobilePct}%)
                </span>
              </div>
              <div className="w-full h-2.5 bg-stone-100 rounded-full overflow-hidden">
                <div
                  style={{ width: `${mobilePct}%` }}
                  className="h-full bg-orange-600 rounded-full transition-all duration-500"
                />
              </div>
            </div>

            {/* Desktop */}
            <div>
              <div className="flex justify-between text-xs font-bold text-stone-700 mb-1">
                <span className="flex items-center gap-1.5">
                  <Monitor size={13} className="text-stone-400" /> Desktop / Laptop
                </span>
                <span>
                  {data.deviceBreakdown.desktop} visits ({desktopPct}%)
                </span>
              </div>
              <div className="w-full h-2.5 bg-stone-100 rounded-full overflow-hidden">
                <div
                  style={{ width: `${desktopPct}%` }}
                  className="h-full bg-amber-500 rounded-full transition-all duration-500"
                />
              </div>
            </div>

            {/* Tablet */}
            <div>
              <div className="flex justify-between text-xs font-bold text-stone-700 mb-1">
                <span className="flex items-center gap-1.5">
                  <Tablet size={13} className="text-stone-400" /> Tablet
                </span>
                <span>
                  {data.deviceBreakdown.tablet} visits ({tabletPct}%)
                </span>
              </div>
              <div className="w-full h-2.5 bg-stone-100 rounded-full overflow-hidden">
                <div
                  style={{ width: `${tabletPct}%` }}
                  className="h-full bg-stone-400 rounded-full transition-all duration-500"
                />
              </div>
            </div>
          </div>

          {/* Popular paths snippet */}
          {data.popularPaths && data.popularPaths.length > 0 && (
            <div className="pt-4 border-t border-stone-100">
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 block mb-2">
                Top Visited Pages
              </span>
              <div className="space-y-1.5">
                {data.popularPaths.map((p, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between text-xs bg-stone-50 px-3 py-1.5 rounded-xl border border-stone-200/60"
                  >
                    <span className="font-mono text-stone-700 truncate max-w-[220px]">
                      {p.path === '/' ? 'Home (Discovery)' : p.path}
                    </span>
                    <span className="font-bold text-stone-900">{p.count} views</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Registered Users List (Firebase Auth) */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users size={16} className="text-orange-600" />
              <h3 className="text-base font-black text-stone-900">
                Registered Community ({data.totalUsers})
              </h3>
            </div>
            <span className="text-[11px] font-semibold text-stone-400">
              via Firebase Auth
            </span>
          </div>

          <div className="space-y-2 pt-1 max-h-72 overflow-y-auto">
            {data.users && data.users.length > 0 ? (
              data.users.map((u, i) => (
                <div
                  key={u.uid || i}
                  className="p-3 rounded-2xl bg-stone-50 border border-stone-200/70 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="truncate">
                    <span className="font-bold text-stone-800 block truncate">
                      {u.email || 'Anonymous Foodie'}
                    </span>
                    <span className="text-[10px] text-stone-400 font-mono">
                      UID: {u.uid.slice(0, 12)}...
                    </span>
                  </div>

                  {u.createdAt && (
                    <div className="text-right shrink-0">
                      <span className="text-[10px] text-stone-500 font-medium block">
                        Joined
                      </span>
                      <span className="text-[11px] font-bold text-stone-700">
                        {new Date(u.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-xs text-stone-400 italic text-center py-6">
                No users found.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

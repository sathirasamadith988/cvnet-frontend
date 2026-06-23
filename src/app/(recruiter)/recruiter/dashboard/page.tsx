'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Search, Plus, TrendingUp, Users, Briefcase,
  Loader2, AlertCircle, ArrowRight, ArrowUpRight,
  Sparkles, ChevronRight, BarChart2
} from 'lucide-react';
import {
  AreaChart, Area, ResponsiveContainer,
  Tooltip, XAxis, YAxis, CartesianGrid
} from 'recharts';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Candidate {
  name: string;
  email: string;
  role: string;
  matchScore: number;
  stage: string;
}

interface DashboardData {
  totalApplications: number;
  averageMatchScore: number;
  openPositions: number;
  applicationTrends: { month: string; count: number }[];
  topCandidates: Candidate[];
}

// ─── Stage Config ─────────────────────────────────────────────────────────────

const STAGE_CONFIG: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  Interview: { label: 'Interview', color: '#1d4ed8', bg: '#eff6ff', dot: '#3b82f6' },
  'Technical Test': { label: 'Technical Test', color: '#7c3aed', bg: '#f5f3ff', dot: '#8b5cf6' },
  Screening: { label: 'Screening', color: '#b45309', bg: '#fffbeb', dot: '#f59e0b' },
  Pending: { label: 'Pending', color: '#475569', bg: '#f8fafc', dot: '#94a3b8' },
};

function getStage(stage: string) {
  return STAGE_CONFIG[stage] ?? STAGE_CONFIG['Pending'];
}

// ─── Initials Avatar ──────────────────────────────────────────────────────────

function Avatar({ name }: { name: string }) {
  const initials = name
    .split(' ')
    .map(n => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const colors = [
    ['#e0e7ff', '#4338ca'],
    ['#fce7f3', '#be185d'],
    ['#d1fae5', '#065f46'],
    ['#fef3c7', '#92400e'],
    ['#e0f2fe', '#0369a1'],
  ];
  const [bg, text] = colors[name.charCodeAt(0) % colors.length];

  return (
    <div
      style={{ backgroundColor: bg, color: text }}
      className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 select-none"
    >
      {initials}
    </div>
  );
}

// ─── Score Bar ────────────────────────────────────────────────────────────────

function ScoreBar({ score }: { score: number }) {
  const color =
    score >= 80 ? '#16a34a' :
      score >= 60 ? '#2563eb' :
        score >= 40 ? '#d97706' : '#dc2626';

  return (
    <div className="flex items-center gap-2.5">
      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${score}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-xs font-semibold tabular-nums" style={{ color, minWidth: '32px', textAlign: 'right' }}>
        {score}%
      </span>
    </div>
  );
}

// ─── Stage Badge ──────────────────────────────────────────────────────────────

function StageBadge({ stage }: { stage: string }) {
  const cfg = getStage(stage);
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold"
      style={{ backgroundColor: cfg.bg, color: cfg.color }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cfg.dot }} />
      {cfg.label}
    </span>
  );
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900 text-white text-xs font-semibold rounded-xl px-3 py-2 shadow-xl pointer-events-none">
      <p className="text-slate-400 mb-0.5">{label}</p>
      <p>{payload[0].value} applicants</p>
    </div>
  );
}

// ─── Trend Chart ──────────────────────────────────────────────────────────────

function TrendChart({ data }: { data: { month: string; count: number }[] }) {
  if (!data?.length) return null;
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 8, right: 4, left: -28, bottom: 0 }}>
        <defs>
          <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2563eb" stopOpacity={0.12} />
            <stop offset="100%" stopColor="#2563eb" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke="#f1f5f9" strokeDasharray="0" />
        <XAxis
          dataKey="month"
          axisLine={false}
          tickLine={false}
          tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }}
          dy={10}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          tick={{ fill: '#cbd5e1', fontSize: 10 }}
          tickCount={4}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#e2e8f0', strokeWidth: 1 }} />
        <Area
          type="monotone"
          dataKey="count"
          stroke="#2563eb"
          strokeWidth={2.5}
          fill="url(#grad)"
          activeDot={{ r: 5, strokeWidth: 2.5, stroke: '#fff', fill: '#2563eb' }}
          dot={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({
  label, value, suffix, icon: Icon, accent, className
}: {
  label: string; value: string | number; suffix?: string;
  icon: React.ElementType; accent: string; className?: string;
}) {
  return (
    <div className={`bg-white rounded-2xl border border-slate-100 p-4 sm:p-5 flex items-center gap-3 sm:gap-4 ${className || ''}`}>
      <div
        className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center shrink-0"
        style={{ backgroundColor: accent + '15', color: accent }}
      >
        <Icon size={18} />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5 truncate">{label}</p>
        <div className="flex items-baseline gap-1">
          <span className="text-xl sm:text-2xl font-black text-slate-900 tabular-nums leading-none">{value}</span>
          {suffix && <span className="text-xs sm:text-sm font-semibold text-slate-400">{suffix}</span>}
        </div>
      </div>
    </div>
  );
}

// ─── Loading ──────────────────────────────────────────────────────────────────

function LoadingState() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="animate-spin text-blue-600" size={28} />
        <p className="text-sm font-medium text-slate-400">Loading dashboard…</p>
      </div>
    </div>
  );
}

// ─── Error ────────────────────────────────────────────────────────────────────

function ErrorState({ message }: { message: string }) {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl border border-red-100 p-8 max-w-sm w-full flex flex-col items-center gap-4 text-center">
        <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center text-red-500">
          <AlertCircle size={24} />
        </div>
        <div>
          <h2 className="text-base font-bold text-slate-900 mb-1">Dashboard unavailable</h2>
          <p className="text-sm text-slate-500 leading-relaxed">{message}</p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function RecruiterDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = document.cookie
          .split('; ')
          .find(row => row.startsWith('cvnet_token='))
          ?.split('=')[1];

        if (!token) throw new Error('No authentication token found.');

        const response = await axios.get('http://localhost:5167/api/CompanyDashboard', {
          headers: { Authorization: `Bearer ${token}` },
        });

        setData(response.data);
      } catch (err: any) {
        console.error('Dashboard error:', err);
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (isLoading) return <LoadingState />;
  if (error || !data) return <ErrorState message={error ?? 'Unknown error.'} />;

  const filteredCandidates = data.topCandidates.filter(c =>
    !searchQuery ||
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── Top Bar ── */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">

          {/* Brand + breadcrumb */}
          <div className="flex items-center gap-2 shrink-0">

            <span className="text-sm font-semibold text-slate-900 hidden sm:block">Recruiter</span>
            <ChevronRight size={14} className="text-slate-300 hidden sm:block" />
            <span className="text-sm font-semibold text-slate-400 hidden sm:block">Overview</span>
          </div>

          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search candidates or roles…"
              className="w-full pl-9 pr-4 py-2 text-sm text-slate-700 bg-slate-50 border border-slate-200 rounded-xl placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
            />
          </div>

          {/* Post job CTA */}
          <Link
            href="/recruiter/post-job"
            className="shrink-0 inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors shadow-sm shadow-blue-200"
          >
            <Plus size={15} />
            <span className="hidden sm:inline">Post job</span>
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">

        {/* ── Page heading ── */}
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Overview</h1>
          <p className="text-sm text-slate-500 mt-0.5">Your recruitment pipeline at a glance.</p>
        </div>

        {/* ── Stat Strip ── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
          <StatCard
            label="Total Applications"
            value={data.totalApplications}
            icon={Users}
            accent="#6366f1"
          />
          <StatCard
            label="Open Roles"
            value={data.openPositions}
            icon={Briefcase}
            accent="#f43f5e"
          />
          <StatCard
            label="Avg Match Score"
            value={data.averageMatchScore}
            suffix="%"
            icon={TrendingUp}
            accent="#2563eb"
            className="col-span-2 sm:col-span-1"
          />
        </div>

        {/* ── Chart + Candidates (side by side on lg) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 lg:gap-6 items-start">

          {/* Chart — 3/5 width on lg */}
          <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-100 p-5 sm:p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Application trends</h2>
                <p className="text-xs text-slate-400 mt-0.5">Applicant volume · last 6 months</p>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 bg-slate-50 border border-slate-100 rounded-lg px-2.5 py-1.5">
                <BarChart2 size={13} />
                6 months
              </div>
            </div>
            <div className="h-48 sm:h-56">
              <TrendChart data={data.applicationTrends} />
            </div>
          </div>

          {/* Quick stats sidebar — 2/5 width on lg */}
          <div className="lg:col-span-2 flex flex-col gap-3">

            {/* Pipeline stages breakdown */}
            <div className="bg-white rounded-2xl border border-slate-100 p-5">
              <h2 className="text-sm font-bold text-slate-900 mb-4">Pipeline stages</h2>
              <div className="space-y-3">
                {Object.entries(STAGE_CONFIG).map(([stage, cfg]) => {
                  const count = data.topCandidates.filter(c => c.stage === stage).length;
                  const pct = data.topCandidates.length
                    ? Math.round((count / data.topCandidates.length) * 100)
                    : 0;
                  return (
                    <div key={stage}>
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cfg.dot }} />
                          <span className="font-semibold text-slate-700">{stage}</span>
                        </div>
                        <span className="font-bold tabular-nums" style={{ color: cfg.color }}>
                          {count} <span className="text-slate-400 font-normal">({pct}%)</span>
                        </span>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${pct}%`, backgroundColor: cfg.dot }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Top match score teaser */}
            {data.topCandidates.length > 0 && (() => {
              const top = [...data.topCandidates].sort((a, b) => b.matchScore - a.matchScore)[0];
              return (
                <div className="bg-blue-600 rounded-2xl p-5 text-white">
                  <p className="text-xs font-bold text-blue-200 uppercase tracking-wider mb-3">Top match</p>
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-xs font-bold shrink-0">
                        {top.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-sm truncate">{top.name}</p>
                        <p className="text-xs text-blue-200 truncate">{top.role}</p>
                      </div>
                    </div>
                    <div className="flex items-baseline gap-1 shrink-0 text-right">
                      <span className="text-3xl font-black tabular-nums leading-none">{top.matchScore}</span>
                      <span className="text-blue-200 font-bold text-sm">% match</span>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>

        {/* ── Candidates Table ── */}
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">

          {/* Header */}
          <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Top candidates</h2>
              <p className="text-xs text-slate-400 mt-0.5">Highest-scoring active applications</p>
            </div>
            <Link
              href="/recruiter/candidates"
              className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
            >
              View all <ArrowRight size={13} />
            </Link>
          </div>

          {/* Empty state */}
          {filteredCandidates.length === 0 ? (
            <div className="py-16 flex flex-col items-center gap-3 text-center px-6">
              <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center">
                <Users size={20} className="text-slate-300" />
              </div>
              <p className="text-sm font-semibold text-slate-700">
                {searchQuery ? 'No candidates match your search.' : 'No candidates yet.'}
              </p>
              {!searchQuery && (
                <p className="text-xs text-slate-400 max-w-xs">
                  Post a job to start receiving applications and see them ranked here.
                </p>
              )}
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden md:block">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-50">
                      {['Candidate', 'Role', 'Match', 'Stage', ''].map((h, i) => (
                        <th
                          key={i}
                          className="text-left text-[10px] font-black text-slate-400 uppercase tracking-widest px-5 sm:px-6 py-3"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCandidates.map((c, idx) => (
                      <tr
                        key={idx}
                        className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60 transition-colors group"
                      >
                        {/* Candidate */}
                        <td className="px-5 sm:px-6 py-3.5">
                          <div className="flex items-center gap-3">
                            <Avatar name={c.name} />
                            <div className="min-w-0">
                              <p className="font-semibold text-slate-900 text-sm truncate">{c.name}</p>
                              <p className="text-xs text-slate-400 truncate">{c.email}</p>
                            </div>
                          </div>
                        </td>

                        {/* Role */}
                        <td className="px-5 sm:px-6 py-3.5">
                          <span className="text-sm font-medium text-slate-600 truncate max-w-[180px] block">{c.role}</span>
                        </td>

                        {/* Match score */}
                        <td className="px-5 sm:px-6 py-3.5 w-44">
                          <ScoreBar score={c.matchScore} />
                        </td>

                        {/* Stage */}
                        <td className="px-5 sm:px-6 py-3.5">
                          <StageBadge stage={c.stage} />
                        </td>

                        {/* Action */}
                        <td className="px-5 sm:px-6 py-3.5 text-right">
                          <Link
                            href={`/recruiter/candidates?email=${encodeURIComponent(c.email)}`}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-400 group-hover:text-blue-600 transition-colors"
                          >
                            Review <ArrowUpRight size={13} />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="md:hidden divide-y divide-slate-50">
                {filteredCandidates.map((c, idx) => (
                  <div key={idx} className="p-4 flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={c.name} />
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-slate-900 text-sm truncate">{c.name}</p>
                        <p className="text-xs text-slate-400 truncate">{c.role}</p>
                      </div>
                      <StageBadge stage={c.stage} />
                    </div>

                    <ScoreBar score={c.matchScore} />

                    <Link
                      href={`/recruiter/candidates?email=${encodeURIComponent(c.email)}`}
                      className="self-end text-xs font-semibold text-blue-600 flex items-center gap-1"
                    >
                      Review profile <ArrowUpRight size={12} />
                    </Link>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
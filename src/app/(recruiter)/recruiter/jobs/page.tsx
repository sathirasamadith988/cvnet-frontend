'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Search, Plus, Eye, ChevronDown, Loader2,
  Briefcase, Users, TrendingUp, ChevronRight, Sparkles, SlidersHorizontal, X
} from 'lucide-react';
import axios from 'axios';
import { auth } from '@/lib/firebaseConfig';

// ─── Types ────────────────────────────────────────────────────────────────────

type JobStatus = 'Active' | 'Closed';

type JobListing = {
  id: string;
  title: string;
  dept: string;
  posted: string;
  applicants: number;
  newApplicants: number;
  matchAvg: number;
  status: JobStatus;
};

// ─── Config ───────────────────────────────────────────────────────────────────

const DEPT_COLORS: Record<string, { bg: string; color: string }> = {
  Design: { bg: '#f5f3ff', color: '#6d28d9' },
  Engineering: { bg: '#eff6ff', color: '#1d4ed8' },
  Marketing: { bg: '#fdf2f8', color: '#be185d' },
  Data: { bg: '#ecfeff', color: '#0e7490' },
  'Human Resources': { bg: '#fffbeb', color: '#b45309' },
  Product: { bg: '#f0fdf4', color: '#15803d' },
};

function getDeptStyle(dept: string) {
  return DEPT_COLORS[dept] ?? { bg: '#f8fafc', color: '#475569' };
}

const STATUS_CONFIG: Record<JobStatus, { bg: string; color: string; dot: string }> = {
  Active: { bg: '#f0fdf4', color: '#15803d', dot: '#22c55e' },
  Closed: { bg: '#f8fafc', color: '#64748b', dot: '#94a3b8' },
};

const FILTER_STATUSES = ['All', 'Active', 'Closed'] as const;
const SORT_OPTIONS = ['Newest first', 'Most applicants', 'Best match avg'] as const;

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: JobStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold"
      style={{ backgroundColor: cfg.bg, color: cfg.color }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cfg.dot }} />
      {status}
    </span>
  );
}

function DeptBadge({ dept }: { dept: string }) {
  const { bg, color } = getDeptStyle(dept);
  return (
    <span
      className="inline-flex px-2.5 py-1 rounded-lg text-xs font-semibold"
      style={{ backgroundColor: bg, color }}
    >
      {dept}
    </span>
  );
}

function MatchRing({ value }: { value: number }) {
  if (!value) return <span className="text-sm text-slate-300 font-semibold">—</span>;
  const color =
    value >= 75 ? '#16a34a' :
      value >= 55 ? '#2563eb' :
        value >= 35 ? '#d97706' : '#dc2626';
  return (
    <span className="text-sm font-bold tabular-nums" style={{ color }}>
      {value}%
    </span>
  );
}

// Compact summary cards for mobile top strip
function SummaryPill({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="bg-white rounded-xl border border-slate-100 px-4 py-3 flex items-center gap-3 min-w-[130px]">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: color + '18', color }}>
        {label === 'Total' ? <Briefcase size={15} /> : label === 'Active' ? <TrendingUp size={15} /> : <Users size={15} />}
      </div>
      <div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none mb-0.5">{label}</p>
        <p className="text-lg font-black text-slate-900 leading-none tabular-nums">{value}</p>
      </div>
    </div>
  );
}

// ─── Loading Skeleton ─────────────────────────────────────────────────────────

function JobsSkeleton() {
  return (
    <div className="animate-pulse space-y-5">
      {/* Summary pills skeleton */}
      <div className="flex gap-3 overflow-x-auto pb-0.5 -mx-4 px-4 sm:mx-0 sm:px-0 sm:overflow-visible scrollbar-none">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white rounded-xl border border-slate-100 px-4 py-3 flex items-center gap-3 min-w-[130px]">
            <div className="w-8 h-8 rounded-lg bg-slate-100 shrink-0"></div>
            <div>
              <div className="h-2.5 bg-slate-100 rounded w-12 mb-1.5"></div>
              <div className="h-5 bg-slate-100 rounded w-8"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters skeleton */}
      <div className="hidden sm:flex items-center gap-2.5">
        <div className="h-9 w-48 bg-white border border-slate-100 rounded-xl"></div>
        <div className="h-9 w-32 bg-white border border-slate-100 rounded-xl"></div>
        <div className="h-9 w-36 bg-white border border-slate-100 rounded-xl ml-auto"></div>
      </div>
      <div className="sm:hidden h-9 w-24 bg-white border border-slate-100 rounded-xl"></div>

      {/* Table skeleton */}
      <div className="hidden sm:block bg-white rounded-2xl border border-slate-100 overflow-hidden mt-4">
        <div className="px-5 lg:px-6 py-4 border-b border-slate-50 flex gap-4">
          <div className="h-3 bg-slate-100 rounded w-24"></div>
          <div className="h-3 bg-slate-100 rounded w-20"></div>
          <div className="h-3 bg-slate-100 rounded w-16"></div>
          <div className="h-3 bg-slate-100 rounded w-16"></div>
        </div>
        <div>
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="px-5 lg:px-6 py-4 border-b border-slate-50 last:border-0 flex items-center justify-between gap-4">
              <div className="w-1/3">
                <div className="h-4 bg-slate-100 rounded w-48 mb-2"></div>
                <div className="h-3 bg-slate-100 rounded w-32"></div>
              </div>
              <div className="w-24 h-6 bg-slate-100 rounded-lg"></div>
              <div className="w-16 h-6 bg-slate-100 rounded"></div>
              <div className="w-16 h-6 bg-slate-100 rounded"></div>
              <div className="w-20 h-6 bg-slate-100 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Mobile cards skeleton */}
      <div className="sm:hidden space-y-3 mt-4">
         {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-2xl border border-slate-100 p-4 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                   <div className="h-4 bg-slate-100 rounded w-32 mb-2"></div>
                   <div className="h-3 bg-slate-100 rounded w-20"></div>
                </div>
                <div className="h-6 w-16 bg-slate-100 rounded-lg"></div>
              </div>
              <div className="h-6 w-24 bg-slate-100 rounded-lg"></div>
              <div className="h-8 bg-slate-100 rounded w-full mt-2"></div>
            </div>
         ))}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function JobsPage() {
  const [jobsList, setJobsList] = useState<JobListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<typeof FILTER_STATUSES[number]>('All');
  const [deptFilter, setDeptFilter] = useState('All');
  const [sortBy, setSortBy] = useState<typeof SORT_OPTIONS[number]>('Newest first');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => {
    const fetchCompanyJobs = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;
        const token = await user.getIdToken();
        const response = await axios.get('http://localhost:5167/api/CompanyJob/list', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setJobsList(response.data);
      } catch (error) {
        console.error('Failed to fetch jobs:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) fetchCompanyJobs();
    });

    return () => unsubscribe();
  }, []);

  const deptOptions = ['All', ...Array.from(new Set(jobsList.map(j => j.dept)))];

  const filteredJobs = jobsList
    .filter(job => {
      const q = search.toLowerCase();
      const matchesSearch = !search ||
        job.title.toLowerCase().includes(q) ||
        job.id.toLowerCase().includes(q);
      const matchesStatus = statusFilter === 'All' || job.status === statusFilter;
      const matchesDept = deptFilter === 'All' || job.dept === deptFilter;
      return matchesSearch && matchesStatus && matchesDept;
    })
    .sort((a, b) => {
      if (sortBy === 'Most applicants') return b.applicants - a.applicants;
      if (sortBy === 'Best match avg') return b.matchAvg - a.matchAvg;
      return 0;
    });

  const totalActive = jobsList.filter(j => j.status === 'Active').length;
  const totalApplicants = jobsList.reduce((s, j) => s + j.applicants, 0);
  const hasActiveFilters = search || statusFilter !== 'All' || deptFilter !== 'All';

  const topBar = (
    <header className="bg-white border-b border-slate-100 sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-sm font-semibold text-slate-900 hidden sm:block">Recruiter</span>
          <ChevronRight size={14} className="text-slate-300 hidden sm:block" />
          <span className="text-sm font-semibold text-slate-400 hidden sm:block">Jobs</span>
        </div>

        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search title or job ID…"
            className="w-full pl-9 pr-4 py-2 text-sm text-slate-700 bg-slate-50 border border-slate-200 rounded-xl placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
          />
        </div>

        <Link
          href="/recruiter/post-job"
          className="shrink-0 inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors shadow-sm shadow-blue-200"
        >
          <Plus size={15} />
          <span className="hidden sm:inline">Post job</span>
        </Link>
      </div>
    </header>
  );

  const pageHeading = (
    <div className="flex items-start justify-between">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Job postings</h1>
        <p className="text-sm text-slate-500 mt-0.5">Manage active and past listings.</p>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        {topBar}
        <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-5">
          {pageHeading}
          <JobsSkeleton />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ── Top Bar ── */}
      {topBar}

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-5">

        {/* ── Page heading ── */}
        {pageHeading}

        {/* ── Summary pills (scrollable on mobile) ── */}
        <div className="flex gap-3 overflow-x-auto pb-0.5 -mx-4 px-4 sm:mx-0 sm:px-0 sm:overflow-visible scrollbar-none">
          <SummaryPill label="Total" value={jobsList.length} color="#6366f1" />
          <SummaryPill label="Active" value={totalActive} color="#16a34a" />
          <SummaryPill label="Applicants" value={totalApplicants} color="#2563eb" />
        </div>

        {/* ── Filters ── */}
        {/* Desktop filters */}
        <div className="hidden sm:flex items-center gap-2.5 flex-wrap">
          {/* Status tabs */}
          <div className="flex items-center bg-white border border-slate-100 rounded-xl p-1 gap-0.5">
            {FILTER_STATUSES.map(f => (
              <button
                key={f}
                onClick={() => setStatusFilter(f)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${f === statusFilter
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                  }`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Dept select */}
          <div className="relative">
            <select
              value={deptFilter}
              onChange={e => setDeptFilter(e.target.value)}
              className="appearance-none pl-3.5 pr-8 py-2 text-xs font-semibold border border-slate-200 rounded-xl bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
            >
              {deptOptions.map(d => (
                <option key={d} value={d}>{d === 'All' ? 'All departments' : d}</option>
              ))}
            </select>
            <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          {/* Sort select */}
          <div className="relative ml-auto">
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as typeof SORT_OPTIONS[number])}
              className="appearance-none pl-3.5 pr-8 py-2 text-xs font-semibold border border-slate-200 rounded-xl bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
            >
              {SORT_OPTIONS.map(o => <option key={o}>{o}</option>)}
            </select>
            <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          {/* Clear filters */}
          {hasActiveFilters && (
            <button
              onClick={() => { setSearch(''); setStatusFilter('All'); setDeptFilter('All'); }}
              className="flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-slate-700 transition-colors"
            >
              <X size={12} /> Clear
            </button>
          )}
        </div>

        {/* Mobile filter toggle */}
        <div className="sm:hidden flex items-center gap-2">
          <button
            onClick={() => setShowMobileFilters(v => !v)}
            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl border transition-colors ${showMobileFilters || hasActiveFilters
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-white text-slate-600 border-slate-200'
              }`}
          >
            <SlidersHorizontal size={13} />
            Filters
            {hasActiveFilters && (
              <span className="w-4 h-4 rounded-full bg-blue-500 text-white text-[9px] font-black flex items-center justify-center">
                {[search, statusFilter !== 'All', deptFilter !== 'All'].filter(Boolean).length}
              </span>
            )}
          </button>

          <div className="relative ml-auto">
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as typeof SORT_OPTIONS[number])}
              className="appearance-none pl-3 pr-7 py-2 text-xs font-semibold border border-slate-200 rounded-xl bg-white text-slate-700 focus:outline-none"
            >
              {SORT_OPTIONS.map(o => <option key={o}>{o}</option>)}
            </select>
            <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* Mobile filter panel */}
        {showMobileFilters && (
          <div className="sm:hidden bg-white rounded-2xl border border-slate-100 p-4 space-y-4">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Status</p>
              <div className="flex gap-2">
                {FILTER_STATUSES.map(f => (
                  <button
                    key={f}
                    onClick={() => setStatusFilter(f)}
                    className={`flex-1 py-2 text-xs font-semibold rounded-xl border transition-all ${f === statusFilter
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white text-slate-500 border-slate-200'
                      }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Department</p>
              <div className="relative">
                <select
                  value={deptFilter}
                  onChange={e => setDeptFilter(e.target.value)}
                  className="w-full appearance-none pl-3.5 pr-8 py-2.5 text-sm font-semibold border border-slate-200 rounded-xl bg-white text-slate-700 focus:outline-none"
                >
                  {deptOptions.map(d => (
                    <option key={d} value={d}>{d === 'All' ? 'All departments' : d}</option>
                  ))}
                </select>
                <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {hasActiveFilters && (
              <button
                onClick={() => { setSearch(''); setStatusFilter('All'); setDeptFilter('All'); setShowMobileFilters(false); }}
                className="w-full py-2 text-xs font-semibold text-slate-500 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}

        {/* ── Results count ── */}
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-slate-400 tabular-nums">
            {filteredJobs.length === jobsList.length
              ? `${jobsList.length} postings`
              : `${filteredJobs.length} of ${jobsList.length} postings`}
          </p>
        </div>

        {/* ── Table (desktop) ── */}
        <div className="hidden sm:block bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-50">
                {['Job title', 'Department', 'Applicants', 'Match avg', 'Status', ''].map((h, i) => (
                  <th
                    key={i}
                    className="text-left px-5 lg:px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredJobs.length > 0 ? filteredJobs.map(job => (
                <tr key={job.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60 transition-colors group">

                  {/* Title + date */}
                  <td className="px-5 lg:px-6 py-4">
                    <p className="font-semibold text-slate-900 text-sm">{job.title}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{job.posted}</p>
                  </td>

                  {/* Dept */}
                  <td className="px-5 lg:px-6 py-4">
                    <DeptBadge dept={job.dept} />
                  </td>

                  {/* Applicants */}
                  <td className="px-5 lg:px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="text-base font-black text-slate-900 tabular-nums">{job.applicants}</span>
                      {job.newApplicants > 0 && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-green-50 text-green-600">
                          +{job.newApplicants}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Match avg */}
                  <td className="px-5 lg:px-6 py-4">
                    <MatchRing value={job.matchAvg} />
                  </td>

                  {/* Status */}
                  <td className="px-5 lg:px-6 py-4">
                    <StatusBadge status={job.status} />
                  </td>

                  {/* Action */}
                  <td className="px-5 lg:px-6 py-4 text-right">
                    <Link
                      href={`/recruiter/jobs/${job.id}`}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 group-hover:text-blue-600 transition-colors"
                    >
                      <Eye size={13} /> View
                    </Link>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-11 h-11 bg-slate-50 rounded-2xl flex items-center justify-center mb-1">
                        <Search size={18} className="text-slate-300" />
                      </div>
                      <p className="text-sm font-semibold text-slate-700">No jobs found</p>
                      <p className="text-xs text-slate-400">Try adjusting your filters or search terms.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {filteredJobs.length > 0 && (
            <div className="px-6 py-3.5 border-t border-slate-50 bg-slate-50/40">
              <p className="text-xs font-semibold text-slate-400 tabular-nums">
                {filteredJobs.length} of {jobsList.length} postings shown
              </p>
            </div>
          )}
        </div>

        {/* ── Cards (mobile) ── */}
        <div className="sm:hidden space-y-3">
          {filteredJobs.length > 0 ? filteredJobs.map(job => (
            <div key={job.id} className="bg-white rounded-2xl border border-slate-100 p-4 space-y-3">

              {/* Row 1: Title + status */}
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold text-slate-900 text-sm leading-snug">{job.title}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{job.posted}</p>
                </div>
                <StatusBadge status={job.status} />
              </div>

              {/* Row 2: Dept badge */}
              <DeptBadge dept={job.dept} />

              {/* Row 3: Stats */}
              <div className="flex items-center gap-4 pt-1 border-t border-slate-50">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Applicants</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-base font-black text-slate-900 tabular-nums">{job.applicants}</span>
                    {job.newApplicants > 0 && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-green-50 text-green-600">
                        +{job.newApplicants}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Match avg</span>
                  <div className="mt-0.5">
                    <MatchRing value={job.matchAvg} />
                  </div>
                </div>

                <Link
                  href={`/recruiter/jobs/${job.id}`}
                  className="ml-auto inline-flex items-center gap-1.5 text-xs font-semibold bg-blue-50 text-blue-600 px-3 py-2 rounded-xl"
                >
                  <Eye size={13} /> View
                </Link>
              </div>
            </div>
          )) : (
            <div className="bg-white rounded-2xl border border-slate-100 py-14 flex flex-col items-center gap-2 text-center">
              <div className="w-11 h-11 bg-slate-50 rounded-2xl flex items-center justify-center mb-1">
                <Search size={18} className="text-slate-300" />
              </div>
              <p className="text-sm font-semibold text-slate-700">No jobs found</p>
              <p className="text-xs text-slate-400 max-w-[200px]">Try adjusting your filters or search terms.</p>
            </div>
          )}
        </div>

      </main>
    </div>
  );
}
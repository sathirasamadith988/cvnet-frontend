'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Search, ChevronDown, Loader2, Users, ChevronRight,
  Sparkles, SlidersHorizontal, X, ArrowUpRight, Briefcase
} from 'lucide-react';
import axios from 'axios';
import { auth } from '@/lib/firebaseConfig';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Candidate {
  appId: string;
  userId: string;
  fullName: string;
  email: string;
  profileImageUrl: string | null;
  jobTitle: string;
  industryScore: number;
  status: string;
  skills: string[];
}

interface JobFilter {
  id: string;
  title: string;
}

// ─── Config ───────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { bg: string; color: string; dot: string }> = {
  Interview: { bg: '#eff6ff', color: '#1d4ed8', dot: '#3b82f6' },
  'Technical Test': { bg: '#f5f3ff', color: '#7c3aed', dot: '#8b5cf6' },
  Screening: { bg: '#fffbeb', color: '#b45309', dot: '#f59e0b' },
  Applied: { bg: '#f8fafc', color: '#475569', dot: '#94a3b8' },
  Rejected: { bg: '#fff1f2', color: '#be123c', dot: '#f43f5e' },
  Pending: { bg: '#fffbeb', color: '#b45309', dot: '#f59e0b' },
};

function getStatus(status: string) {
  return STATUS_CONFIG[status] ?? STATUS_CONFIG['Pending'];
}

const SORT_OPTIONS = [
  { value: 'desc', label: 'Highest match' },
  { value: 'asc', label: 'Lowest match' },
  { value: 'gpa_desc', label: 'Highest GPA' },
  { value: 'gpa_asc', label: 'Lowest GPA' },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function Avatar({ name, imageUrl }: { name: string; imageUrl: string | null }) {
  const initials = name?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() ?? '??';
  const colors = [
    ['#e0e7ff', '#4338ca'], ['#fce7f3', '#be185d'],
    ['#d1fae5', '#065f46'], ['#fef3c7', '#92400e'], ['#e0f2fe', '#0369a1'],
  ];
  const [bg, color] = colors[(name?.charCodeAt(0) ?? 0) % colors.length];

  if (imageUrl) {
    return (
      <img
        src={imageUrl} alt={name}
        className="w-10 h-10 rounded-xl object-cover border border-slate-100 shrink-0"
      />
    );
  }
  return (
    <div
      className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 select-none"
      style={{ backgroundColor: bg, color }}
    >
      {initials}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const cfg = getStatus(status);
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap"
      style={{ backgroundColor: cfg.bg, color: cfg.color }}
    >
      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: cfg.dot }} />
      {status}
    </span>
  );
}

function ScoreChip({ score }: { score: number }) {
  const color =
    score >= 70 ? '#16a34a' :
      score >= 50 ? '#2563eb' :
        score >= 30 ? '#d97706' : '#dc2626';
  return (
    <span className="text-sm font-black tabular-nums" style={{ color }}>
      {score}%
    </span>
  );
}

function ScoreBar({ score }: { score: number }) {
  const color =
    score >= 70 ? '#16a34a' :
      score >= 50 ? '#2563eb' :
        score >= 30 ? '#d97706' : '#dc2626';
  return (
    <div className="flex items-center gap-2">
      <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${score}%`, backgroundColor: color }} />
      </div>
      <ScoreChip score={score} />
    </div>
  );
}

function LoadingState() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="animate-spin text-blue-600" size={26} />
        <p className="text-sm font-medium text-slate-400">Loading candidates…</p>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CandidatesPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [jobs, setJobs] = useState<JobFilter[]>([]);
  const [search, setSearch] = useState('');
  const [selectedJobId, setSelectedJobId] = useState('');
  const [sortOrder, setSortOrder] = useState('desc');
  const [loading, setLoading] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [expandedAppId, setExpandedAppId] = useState<string | null>(null);

  const fetchJobs = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;
      const token = await user.getIdToken();
      const res = await axios.get('http://localhost:5167/api/candidates/jobs', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setJobs(res.data);
    } catch (err) {
      console.error('Failed to fetch jobs', err);
    }
  };

  const fetchCandidates = async () => {
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) return;
      const token = await user.getIdToken();
      const params = new URLSearchParams();
      if (selectedJobId) params.append('jobId', selectedJobId);
      if (search) params.append('search', search);
      params.append('sortOrder', sortOrder);
      const res = await axios.get(`http://localhost:5167/api/candidates?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCandidates(res.data);
    } catch (err) {
      console.error('Failed to fetch candidates', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(user => { if (user) fetchJobs(); });
    return () => unsub();
  }, []);

  useEffect(() => {
    const t = setTimeout(() => { if (auth.currentUser) fetchCandidates(); }, 300);
    return () => clearTimeout(t);
  }, [selectedJobId, search, sortOrder]);

  const hasFilters = !!search || !!selectedJobId;
  const selectedJob = jobs.find(j => j.id === selectedJobId);

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── Top Bar ── */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-sm font-semibold text-slate-900 hidden sm:block">Recruiter</span>
            <ChevronRight size={14} className="text-slate-300 hidden sm:block" />
            <span className="text-sm font-semibold text-slate-400 hidden sm:block">Candidates</span>
          </div>

          <div className="relative flex-1 max-w-sm">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              aria-label="Search candidates"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or email…"
              className="w-full pl-9 pr-4 py-2 text-sm text-slate-700 bg-slate-50 border border-slate-200 rounded-xl placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
            />
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">

        {/* ── Page heading ── */}
        <div className="mb-5">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Candidates</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {selectedJob ? `Showing applicants for "${selectedJob.title}"` : 'All applicants across your job postings.'}
          </p>
        </div>

        <div className="w-full">

          {/* ── Candidates list ── */}
          <div className="flex-1 min-w-0 w-full space-y-4">

            {/* Filters + Count indicator */}
            {!loading && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div className="flex flex-wrap items-center gap-3">
                  {/* Job Filter */}
                  <div className="relative shrink-0">
                    <select
                      aria-label="Filter by job"
                      value={selectedJobId}
                      onChange={e => setSelectedJobId(e.target.value)}
                      className="appearance-none pl-3 pr-8 py-2.5 text-sm font-semibold border border-slate-200 rounded-xl bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer max-w-[250px] sm:max-w-[300px] truncate shadow-sm hover:bg-slate-50 transition-colors"
                    >
                      {[{ id: '', title: 'All jobs' }, ...jobs].map(job => (
                        <option key={job.id} value={job.id}>{job.title}</option>
                      ))}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                  
                  {/* Sort Order */}
                  <div className="relative shrink-0">
                    <select
                      aria-label="Sort candidates"
                      value={sortOrder}
                      onChange={e => setSortOrder(e.target.value)}
                      className="appearance-none pl-3 pr-8 py-2.5 text-sm font-semibold border border-slate-200 rounded-xl bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer shadow-sm hover:bg-slate-50 transition-colors"
                    >
                      {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                  {hasFilters && (
                    <button type="button"
                      onClick={() => { setSearch(''); setSelectedJobId(''); }}
                      className="text-xs font-semibold text-slate-400 hover:text-slate-700 flex items-center gap-1 transition-colors"
                    >
                      <X size={12} /> Clear filters
                    </button>
                  )}
                </div>
                <p className="text-xs font-semibold text-slate-400 tabular-nums">
                  {candidates.length} candidate{candidates.length !== 1 ? 's' : ''}
                </p>
              </div>
            )}

            {/* Loading */}
            {loading ? (
              <>
                <div className="hidden sm:block bg-white rounded-2xl border border-slate-100 overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-50">
                        {['Candidate', 'Applying for', 'Match', 'Stage', ''].map((h, i) => (
                          <th key={i} className="text-left px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {[1, 2, 3, 4, 5].map((i) => (
                        <tr key={i} className="border-b border-slate-50 last:border-0">
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-slate-200 animate-pulse shrink-0"></div>
                              <div className="space-y-2 flex-1">
                                <div className="h-3.5 bg-slate-200 rounded animate-pulse w-32"></div>
                                <div className="h-2.5 bg-slate-100 rounded animate-pulse w-24"></div>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-3.5">
                            <div className="h-3 bg-slate-200 rounded animate-pulse w-28"></div>
                          </td>
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-2">
                              <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-slate-200 animate-pulse w-12 rounded-full"></div>
                              </div>
                              <div className="h-3 bg-slate-200 rounded animate-pulse w-6"></div>
                            </div>
                          </td>
                          <td className="px-5 py-3.5">
                            <div className="h-6 bg-slate-200 rounded-lg animate-pulse w-20"></div>
                          </td>
                          <td className="px-5 py-3.5 text-right">
                            <div className="h-4 bg-slate-200 rounded animate-pulse w-14 ml-auto"></div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="sm:hidden space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-white rounded-2xl border border-slate-100 p-4 space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-200 animate-pulse shrink-0"></div>
                        <div className="space-y-2 flex-1 pt-1">
                          <div className="h-3.5 bg-slate-200 rounded animate-pulse w-3/4"></div>
                          <div className="h-2.5 bg-slate-100 rounded animate-pulse w-1/2"></div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                        <div className="space-y-1.5">
                          <div className="h-2 bg-slate-100 rounded animate-pulse w-16"></div>
                          <div className="h-1.5 bg-slate-200 rounded animate-pulse w-24"></div>
                        </div>
                        <div className="h-8 bg-slate-200 rounded-xl animate-pulse w-20"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : candidates.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-100 py-16 flex flex-col items-center gap-2 text-center">
                <div className="w-11 h-11 bg-slate-50 rounded-2xl flex items-center justify-center mb-1">
                  <Users size={18} className="text-slate-300" />
                </div>
                <p className="text-sm font-semibold text-slate-700">No candidates found</p>
                <p className="text-xs text-slate-400 max-w-[220px]">
                  {hasFilters ? 'Try adjusting your search or job filter.' : 'Post a job to start receiving applications.'}
                </p>
              </div>

            ) : (
              <>
                {/* Desktop table */}
                <div className="hidden sm:block bg-white rounded-2xl border border-slate-100 overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-50">
                        {['Candidate', 'Applying for', 'Match', 'Stage', ''].map((h, i) => (
                          <th key={i} className="text-left px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {candidates.map(c => (
                        <React.Fragment key={c.appId}>
                          <tr
                            onClick={() => setExpandedAppId(prev => prev === c.appId ? null : c.appId)}
                            className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60 transition-colors group cursor-pointer"
                          >

                            {/* Candidate */}
                            <td className="px-5 py-3.5">
                              <div className="flex items-center gap-3">
                                <Avatar name={c.fullName} imageUrl={c.profileImageUrl} />
                                <div className="min-w-0">
                                  <p className="font-semibold text-slate-900 text-sm truncate">{c.fullName}</p>
                                  <p className="text-xs text-slate-400 truncate">{c.email}</p>
                                </div>
                              </div>
                            </td>

                            {/* Job */}
                            <td className="px-5 py-3.5">
                              <span className="text-xs font-medium text-slate-600 truncate max-w-[140px] block">{c.jobTitle}</span>
                            </td>

                            {/* Match score */}
                            <td className="px-5 py-3.5">
                              <ScoreBar score={c.industryScore} />
                            </td>

                            {/* Stage */}
                            <td className="px-5 py-3.5">
                              <StatusBadge status={c.status} />
                            </td>

                            {/* Action */}
                            <td className="px-5 py-3.5 text-right">
                              <Link
                                href={`/recruiter/candidates/${c.appId}`}
                                onClick={(e) => e.stopPropagation()}
                                className="inline-flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-blue-600 transition-colors"
                              >
                                Review <ArrowUpRight size={13} />
                              </Link>
                            </td>
                          </tr>
                          
                          {/* Expanded Skills Row */}
                          {expandedAppId === c.appId && (
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                              <td colSpan={5} className="px-5 py-4">
                                <div className="flex flex-col gap-2">
                                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Candidate Skills</span>
                                  {c.skills?.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                      {c.skills.map((s, i) => (
                                        <span key={i} className="text-xs font-medium px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-slate-700 shadow-sm">
                                          {s}
                                        </span>
                                      ))}
                                    </div>
                                  ) : (
                                    <span className="text-xs text-slate-500 italic">No skills listed for this candidate.</span>
                                  )}
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile cards */}
                <div className="sm:hidden space-y-3">
                  {candidates.map(c => (
                    <div key={c.appId} className="bg-white rounded-2xl border border-slate-100 p-4 space-y-3">
                      <div className="flex items-start gap-3">
                        <Avatar name={c.fullName} imageUrl={c.profileImageUrl} />
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-slate-900 text-sm truncate">{c.fullName}</p>
                          <p className="text-xs text-slate-400 truncate">{c.email}</p>
                          <p className="text-xs font-medium text-blue-600 mt-0.5 truncate">{c.jobTitle}</p>
                        </div>
                        <StatusBadge status={c.status} />
                      </div>

                      {c.skills?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {c.skills.slice(0, 4).map((s, i) => (
                            <span key={i} className="text-[10px] font-semibold px-2 py-0.5 bg-slate-50 border border-slate-100 rounded-md text-slate-600">
                              {s}
                            </span>
                          ))}
                          {c.skills.length > 4 && (
                            <span className="text-[10px] text-slate-400 font-semibold self-center">+{c.skills.length - 4}</span>
                          )}
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-1 border-t border-slate-50">
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Match score</p>
                          <ScoreBar score={c.industryScore} />
                        </div>
                        <Link
                          href={`/recruiter/candidates/${c.appId}`}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold bg-blue-50 text-blue-600 px-3 py-2 rounded-xl"
                        >
                          Review <ArrowUpRight size={12} />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
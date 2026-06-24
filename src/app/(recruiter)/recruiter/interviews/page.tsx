'use client';

import { useState, useEffect } from 'react';
import {
  Calendar, Clock, Video, UserX, CalendarCheck2,
  Loader2, X, AlertCircle, Share2, CheckCircle2, Copy, Users,
  Settings2, Trash2, ExternalLink, ChevronRight, Sparkles,
  ChevronLeft, MapPin, ChevronDown, ChevronUp
} from 'lucide-react';
import axios from 'axios';
import { auth } from '@/lib/firebaseConfig';

// ─── Types ────────────────────────────────────────────────────────────────────

interface InterviewCandidate {
  callId: string;
  appId: string;
  userId: string;
  fullName: string;
  email: string;
  profileImageUrl: string | null;
  jobId: string;
  jobTitle: string;
  interviewDate: string | null;
}

interface ActivePortal {
  portalId: string;
  interviewDate: string;
  expiresAt: string;
  password: string;
  link: string;
  jobTitles: string[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getInitials = (name: string) =>
  name ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : '??';

function Avatar({ name, imageUrl, size = 10 }: { name: string; imageUrl: string | null; size?: number }) {
  const colors = [
    ['#e0e7ff', '#4338ca'], ['#fce7f3', '#be185d'],
    ['#d1fae5', '#065f46'], ['#fef3c7', '#92400e'], ['#e0f2fe', '#0369a1'],
  ];
  const [bg, color] = colors[(name?.charCodeAt(0) ?? 0) % colors.length];
  const cls = `w-${size} h-${size} rounded-xl flex items-center justify-center text-xs font-bold shrink-0`;

  if (imageUrl) return <img src={imageUrl} alt={name} className={`${cls} object-cover border border-slate-100`} />;
  return (
    <div className={cls} style={{ backgroundColor: bg, color }}>
      {getInitials(name)}
    </div>
  );
}

// ─── Modal shell ──────────────────────────────────────────────────────────────

function Modal({ onClose, children, maxWidth = 'max-w-lg' }: {
  onClose: () => void; children: React.ReactNode; maxWidth?: string;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:px-4 bg-slate-900/60 backdrop-blur-sm">
      <div className={`bg-white w-full ${maxWidth} rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[92vh] overflow-y-auto`}>
        {children}
      </div>
    </div>
  );
}

function ModalHeader({ title, subtitle, onClose }: {
  title: string; subtitle?: string; onClose: () => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 px-5 sm:px-6 pt-5 pb-4 border-b border-slate-100">
      <div>
        <h3 className="text-base font-bold text-slate-900">{title}</h3>
        {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
      </div>
      <button
        type="button" aria-label="Close" onClick={onClose}
        className="shrink-0 w-8 h-8 flex items-center justify-center rounded-xl bg-slate-100 text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
      >
        <X size={15} />
      </button>
    </div>
  );
}

// ─── Divider ──────────────────────────────────────────────────────────────────

function Divider() { return <div className="h-px bg-slate-100" />; }

// ─── Loading ──────────────────────────────────────────────────────────────────

function InterviewsSkeleton() {
  return (
    <div className="grid lg:grid-cols-5 gap-5 items-start animate-pulse">
      <div className="lg:col-span-3 space-y-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
            <div className="px-5 py-3.5 flex items-center justify-between">
              <div>
                <div className="h-4 w-32 bg-slate-100 rounded mb-1.5"></div>
                <div className="h-3 w-20 bg-slate-100 rounded"></div>
              </div>
              <div className="w-4 h-4 rounded bg-slate-100"></div>
            </div>
          </div>
        ))}
      </div>
      <div className="lg:col-span-2">
        <div className="bg-white rounded-2xl border border-slate-100 p-4 sm:p-5 sticky top-20">
          <div className="flex items-center justify-between mb-4">
            <div className="h-4 w-32 bg-slate-100 rounded"></div>
            <div className="flex gap-1">
              <div className="w-8 h-8 rounded-lg bg-slate-100"></div>
              <div className="w-8 h-8 rounded-lg bg-slate-100"></div>
            </div>
          </div>
          <div className="grid grid-cols-7 mb-2">
            {[1, 2, 3, 4, 5, 6, 7].map(i => (
              <div key={i} className="h-3 w-4 bg-slate-100 rounded mx-auto py-1"></div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-0.5">
            {Array.from({ length: 35 }).map((_, i) => (
              <div key={i} className="aspect-square rounded-xl bg-slate-50 border border-slate-100"></div>
            ))}
          </div>
          <div className="mt-4 h-12 bg-slate-50 rounded-xl border border-slate-100"></div>
        </div>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function InterviewsPage() {
  const [candidates, setCandidates] = useState<InterviewCandidate[]>([]);
  const [loading, setLoading] = useState(true);

  const [scheduleModal, setScheduleModal] = useState<InterviewCandidate | null>(null);
  const [rejectModal, setRejectModal] = useState<InterviewCandidate | null>(null);

  const [selectedDateView, setSelectedDateView] = useState<string | null>(null);
  const [shareStep, setShareStep] = useState<'summary' | 'select_jobs' | 'result'>('summary');
  const [selectedJobsToShare, setSelectedJobsToShare] = useState<string[]>([]);
  const [generatedPortal, setGeneratedPortal] = useState<{ link: string; password: string } | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const [managePortalsOpen, setManagePortalsOpen] = useState(false);
  const [activePortals, setActivePortals] = useState<ActivePortal[]>([]);
  const [loadingPortals, setLoadingPortals] = useState(false);

  const [selectedDate, setSelectedDate] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  const toggleGroup = (jobTitle: string) => {
    setExpandedGroups(prev => ({ ...prev, [jobTitle]: !prev[jobTitle] }));
  };

  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));

  // ── Data fetching ──

  const fetchInterviews = async () => {
    try {
      const user = auth.currentUser;
      const headers = user ? { Authorization: `Bearer ${await user.getIdToken()}` } : {};
      const res = await axios.get('http://localhost:5167/api/interviews', { headers });
      setCandidates(res.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const fetchActivePortals = async () => {
    setLoadingPortals(true);
    try {
      const user = auth.currentUser;
      const headers = user ? { Authorization: `Bearer ${await user.getIdToken()}` } : {};
      const res = await axios.get('http://localhost:5167/api/interviews/portals', { headers });
      setActivePortals(res.data);
    } catch (e) { console.error(e); }
    finally { setLoadingPortals(false); }
  };

  const deletePortal = async (portalId: string) => {
    try {
      const user = auth.currentUser;
      const headers = user ? { Authorization: `Bearer ${await user.getIdToken()}` } : {};
      await axios.delete(`http://localhost:5167/api/interviews/portals/${portalId}`, { headers });
      setActivePortals(prev => prev.filter(p => p.portalId !== portalId));
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(user => { if (user) fetchInterviews(); });
    return () => unsub();
  }, []);

  // ── Actions ──

  const handleSchedule = async () => {
    if (!scheduleModal || !selectedDate) return;
    setActionLoading(true);
    try {
      const user = auth.currentUser;
      const headers = user ? { Authorization: `Bearer ${await user.getIdToken()}` } : {};
      await axios.put(`http://localhost:5167/api/interviews/${scheduleModal.callId}/schedule`, {
        interviewDate: new Date(selectedDate).toISOString()
      }, { headers });
      setScheduleModal(null);
      fetchInterviews();
    } catch (e) { console.error(e); }
    finally { setActionLoading(false); }
  };

  const handleReject = async () => {
    if (!rejectModal || !rejectReason) return;
    setActionLoading(true);
    try {
      const user = auth.currentUser;
      const headers = user ? { Authorization: `Bearer ${await user.getIdToken()}` } : {};
      await axios.post(`http://localhost:5167/api/interviews/${rejectModal.callId}/reject`, {
        reason: rejectReason
      }, { headers });
      setRejectModal(null);
      fetchInterviews();
    } catch (e) { console.error(e); }
    finally { setActionLoading(false); }
  };

  const handleGeneratePortal = async () => {
    if (!selectedDateView || selectedJobsToShare.length === 0) return;
    setIsGenerating(true);
    try {
      const user = auth.currentUser;
      const headers = user ? { Authorization: `Bearer ${await user.getIdToken()}` } : {};
      const res = await axios.post('http://localhost:5167/api/interviews/share-portal', {
        interviewDate: new Date(selectedDateView).toISOString(),
        jobIds: selectedJobsToShare
      }, { headers });
      setGeneratedPortal({
        link: `${window.location.origin}${res.data.link}`,
        password: res.data.password
      });
      setShareStep('result');
    } catch (e) { console.error(e); }
    finally { setIsGenerating(false); }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ── Derived data ──

  const groupedInterviews = candidates.reduce((acc, curr) => {
    if (!acc[curr.jobTitle]) acc[curr.jobTitle] = [];
    acc[curr.jobTitle].push(curr);
    return acc;
  }, {} as Record<string, InterviewCandidate[]>);

  const scheduledDates = candidates
    .filter(c => c.interviewDate)
    .map(c => new Date(c.interviewDate!).toDateString());

  const candidatesForSelectedDate = selectedDateView
    ? candidates.filter(c => c.interviewDate && new Date(c.interviewDate).toDateString() === selectedDateView)
    : [];

  const groupedDaySummary = candidatesForSelectedDate.reduce((acc, curr) => {
    if (!acc[curr.jobId]) acc[curr.jobId] = { title: curr.jobTitle, candidates: [] };
    acc[curr.jobId].candidates.push(curr);
    return acc;
  }, {} as Record<string, { title: string; candidates: InterviewCandidate[] }>);

  // ── Calendar ──

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const startDayOfWeek = currentMonth.getDay();
  const calendarGrid: (number | null)[] = [];
  for (let i = 0; i < startDayOfWeek; i++) calendarGrid.push(null);
  for (let i = 1; i <= daysInMonth; i++) calendarGrid.push(i);

  const handleDateClick = (day: number) => {
    const clicked = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day).toDateString();
    if (!scheduledDates.includes(clicked)) return;
    setSelectedDateView(clicked);
    setShareStep('summary');
    setGeneratedPortal(null);
    const jobsForDay = Array.from(new Set(
      candidates.filter(c => c.interviewDate && new Date(c.interviewDate).toDateString() === clicked).map(c => c.jobId)
    ));
    setSelectedJobsToShare(jobsForDay);
  };

  const scheduledCount = candidates.filter(c => c.interviewDate).length;
  const pendingCount = candidates.filter(c => !c.interviewDate).length;

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── Top Bar ── */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-sm font-semibold text-slate-900 hidden sm:block">Recruiter</span>
            <ChevronRight size={14} className="text-slate-300 hidden sm:block" />
            <span className="text-sm font-semibold text-slate-400 hidden sm:block">Interviews</span>
          </div>

          <button
            type="button"
            onClick={() => { setManagePortalsOpen(true); fetchActivePortals(); }}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 border border-slate-200 bg-white hover:bg-slate-50 px-3.5 py-2 rounded-xl transition-colors"
          >
            <Settings2 size={13} />
            <span className="hidden sm:inline">Manage portals</span>
            <span className="sm:hidden">Portals</span>
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-5">

        {/* ── Heading + stats ── */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Interview schedule</h1>
            <p className="text-sm text-slate-500 mt-0.5">Manage and schedule pending interview calls.</p>
          </div>

          {/* Quick stat pills */}
          {loading ? (
            <div className="flex gap-2 shrink-0 animate-pulse">
              <div className="w-28 h-8 bg-slate-200 rounded-xl" />
              <div className="w-28 h-8 bg-slate-200 rounded-xl" />
            </div>
          ) : (
            <div className="flex gap-2 shrink-0">
              <div className="bg-white rounded-xl border border-slate-100 px-3.5 py-2 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-xs font-bold text-slate-700 tabular-nums">{scheduledCount} scheduled</span>
              </div>
              <div className="bg-white rounded-xl border border-slate-100 px-3.5 py-2 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-amber-400" />
                <span className="text-xs font-bold text-slate-700 tabular-nums">{pendingCount} pending</span>
              </div>
            </div>
          )}
        </div>

        {loading ? (
          <InterviewsSkeleton />
        ) : (
          <div className="grid lg:grid-cols-5 gap-5 items-start">

            {/* ── Left: candidate list ── */}
            <div className="lg:col-span-3 space-y-4">
              {candidates.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-100 py-16 flex flex-col items-center gap-3 text-center">
                  <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center">
                    <CalendarCheck2 size={20} className="text-slate-300" />
                  </div>
                  <p className="text-sm font-semibold text-slate-700">No pending interview calls</p>
                  <p className="text-xs text-slate-400 max-w-[200px]">Candidates moved to the interview stage will appear here.</p>
                </div>
              ) : (
                Object.keys(groupedInterviews).map(jobTitle => {
                  const isExpanded = expandedGroups[jobTitle];
                  return (
                    <div key={jobTitle} className="bg-white rounded-2xl border border-slate-100 overflow-hidden">

                      {/* Job group header */}
                      <button
                        type="button"
                        onClick={() => toggleGroup(jobTitle)}
                        className={`w-full text-left px-5 py-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors focus:outline-none ${isExpanded ? 'border-b border-slate-50' : ''}`}
                      >
                        <div>
                          <p className="text-sm font-bold text-slate-900">{jobTitle}</p>
                          <p className="text-xs text-slate-400 mt-0.5">{groupedInterviews[jobTitle].length} candidate{groupedInterviews[jobTitle].length !== 1 ? 's' : ''}</p>
                        </div>
                        {isExpanded ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
                      </button>

                      {/* Candidate rows */}
                      {isExpanded && (
                        <div className="divide-y divide-slate-50">
                          {groupedInterviews[jobTitle].map(c => (
                            <div key={c.callId} className="p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">

                              {/* Left: identity & date */}
                              <div className="flex items-start sm:items-center gap-3 min-w-0">
                                <Avatar name={c.fullName} imageUrl={c.profileImageUrl} size={10} />
                                <div className="min-w-0 flex flex-col gap-1.5 sm:gap-0 sm:flex-row sm:items-center">
                                  <div>
                                    <p className="text-sm font-semibold text-slate-900 truncate">{c.fullName}</p>
                                    <p className="text-xs text-slate-400 truncate">{c.email}</p>
                                  </div>
                                  <div className="sm:ml-4">
                                    {c.interviewDate ? (
                                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-green-50 text-green-700 text-[10px] sm:text-xs font-semibold border border-green-100">
                                        <Clock size={11} />
                                        {new Date(c.interviewDate).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 text-[10px] sm:text-xs font-semibold border border-amber-100">
                                        <Calendar size={11} /> Pending scheduling
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Right: Actions */}
                              <div className="flex gap-2 w-full sm:w-auto shrink-0">
                                <button
                                  type="button"
                                  onClick={() => { setScheduleModal(c); setSelectedDate(''); }}
                                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 sm:py-2.5 rounded-xl transition-colors"
                                >
                                  <CalendarCheck2 size={13} /> Book date
                                </button>
                                <button
                                  type="button"
                                  onClick={() => { setRejectModal(c); setRejectReason(''); }}
                                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 text-xs font-semibold bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 px-4 py-2 sm:py-2.5 rounded-xl transition-colors"
                                >
                                  <UserX size={13} /> Reject
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })
              )}
            </div>

            {/* ── Right: calendar ── */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl border border-slate-100 p-4 sm:p-5 sticky top-20">

                {/* Month nav */}
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-bold text-slate-900">
                    {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                  </p>
                  <div className="flex gap-1">
                    <button
                      type="button" aria-label="Previous month"
                      onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
                      className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 transition-colors"
                    >
                      <ChevronLeft size={15} />
                    </button>
                    <button
                      type="button" aria-label="Next month"
                      onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
                      className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 transition-colors"
                    >
                      <ChevronRight size={15} />
                    </button>
                  </div>
                </div>

                {/* Day labels */}
                <div className="grid grid-cols-7 mb-2">
                  {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                    <div key={d} className="text-center text-[10px] font-bold text-slate-400 uppercase py-1">{d}</div>
                  ))}
                </div>

                {/* Calendar grid */}
                <div className="grid grid-cols-7 gap-0.5">
                  {calendarGrid.map((day, idx) => {
                    if (!day) return <div key={`e-${idx}`} className="aspect-square" />;
                    const gridDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
                    const isToday = gridDate.toDateString() === today.toDateString();
                    const hasInterview = scheduledDates.includes(gridDate.toDateString());

                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => handleDateClick(day)}
                        disabled={!hasInterview}
                        className={`aspect-square flex flex-col items-center justify-center rounded-xl text-xs font-semibold relative transition-all
                        ${hasInterview ? 'cursor-pointer hover:bg-blue-50' : 'cursor-default text-slate-300'}
                        ${isToday && hasInterview ? 'bg-blue-600 text-white hover:bg-blue-700' : ''}
                        ${isToday && !hasInterview ? 'bg-slate-100 text-slate-500' : ''}
                        ${!isToday && hasInterview ? 'text-slate-800' : ''}
                      `}
                      >
                        {day}
                        {hasInterview && (
                          <div className={`absolute bottom-1 w-1 h-1 rounded-full ${isToday ? 'bg-white' : 'bg-blue-500'}`} />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Legend */}
                <div className="mt-4 bg-slate-50 rounded-xl border border-slate-100 p-3.5 flex items-start gap-2.5">
                  <AlertCircle size={13} className="text-blue-500 mt-0.5 shrink-0" />
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">
                    Blue dot = interview day. Tap to view the day summary and generate a judge board link.
                  </p>
                </div>
              </div>
            </div>

          </div>
        )}
      </main>

      {/* ══════════════════════════════════════════════════════════════
          MODALS
      ══════════════════════════════════════════════════════════════ */}

      {/* ── Manage portals ── */}
      {managePortalsOpen && (
        <Modal onClose={() => setManagePortalsOpen(false)} maxWidth="max-w-2xl">
          <ModalHeader
            title="Active judge boards"
            subtitle="Manage and revoke active secure portals."
            onClose={() => setManagePortalsOpen(false)}
          />
          <div className="p-5 sm:p-6 space-y-4">
            {loadingPortals ? (
              <div className="flex justify-center py-12">
                <Loader2 className="animate-spin text-blue-600" size={24} />
              </div>
            ) : activePortals.length === 0 ? (
              <div className="bg-slate-50 rounded-xl border border-slate-100 py-10 text-center">
                <p className="text-sm font-semibold text-slate-700">No active portals</p>
                <p className="text-xs text-slate-400 mt-1">Generate a portal from a scheduled interview day.</p>
              </div>
            ) : activePortals.map(portal => {
              const linkUrl = `${window.location.origin}${portal.link}`;
              return (
                <div key={portal.portalId} className="bg-white border border-slate-100 rounded-2xl p-4 space-y-3">
                  {/* Header row */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-blue-600 mb-1.5">
                        {new Date(portal.interviewDate).toDateString()}
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {portal.jobTitles.map((jt, i) => (
                          <span key={i} className="text-[10px] font-semibold bg-slate-50 border border-slate-200 text-slate-600 px-2 py-0.5 rounded-lg">
                            {jt}
                          </span>
                        ))}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => deletePortal(portal.portalId)}
                      className="shrink-0 w-8 h-8 flex items-center justify-center rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                      title="Revoke portal"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <Divider />

                  {/* Link + PIN */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Access link</p>
                      <a
                        href={linkUrl} target="_blank" rel="noreferrer"
                        className="text-xs font-medium text-blue-600 hover:text-blue-700 truncate block flex items-center gap-1"
                      >
                        <span className="truncate">{linkUrl}</span>
                        <ExternalLink size={10} className="shrink-0" />
                      </a>
                    </div>
                    <div className="shrink-0">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">PIN</p>
                      <p className="text-sm font-black text-slate-900 tracking-widest">{portal.password}</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => copyToClipboard(`Judge Board Link: ${linkUrl}\nPIN: ${portal.password}`)}
                    className="w-full inline-flex items-center justify-center gap-1.5 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white py-2.5 rounded-xl transition-colors"
                  >
                    <Copy size={13} /> Copy link + PIN
                  </button>
                </div>
              );
            })}
          </div>
        </Modal>
      )}

      {/* ── Day summary / share portal ── */}
      {selectedDateView && (
        <Modal onClose={() => setSelectedDateView(null)} maxWidth="max-w-xl">
          <ModalHeader
            title={
              shareStep === 'summary' ? 'Daily summary' :
                shareStep === 'select_jobs' ? 'Create judge board' :
                  'Portal ready'
            }
            subtitle={selectedDateView}
            onClose={() => setSelectedDateView(null)}
          />

          <div className="p-5 sm:p-6 space-y-4">

            {/* Summary view */}
            {shareStep === 'summary' && (
              <>
                <div className="space-y-4">
                  {Object.keys(groupedDaySummary).map(jobId => (
                    <div key={jobId}>
                      <div className="flex items-center gap-2 mb-2">
                        <Users size={13} className="text-blue-500" />
                        <p className="text-xs font-bold text-slate-700">{groupedDaySummary[jobId].title}</p>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {groupedDaySummary[jobId].candidates.map(c => (
                          <div key={c.appId} className="flex items-center gap-3 bg-slate-50 border border-slate-100 rounded-xl p-3">
                            <Avatar name={c.fullName} imageUrl={c.profileImageUrl} size={8} />
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-slate-900 truncate">{c.fullName}</p>
                              <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                                {new Date(c.interviewDate!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setShareStep('select_jobs')}
                  className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-3 rounded-xl transition-colors"
                >
                  <Share2 size={15} /> Create shareable judge board
                </button>
              </>
            )}

            {/* Select jobs view */}
            {shareStep === 'select_jobs' && (
              <>
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                  <p className="text-xs text-blue-700 font-medium leading-relaxed">
                    Select which roles to include. Judges will only see candidates for the chosen positions.
                  </p>
                </div>

                <div className="space-y-2">
                  {Object.keys(groupedDaySummary).map(jobId => {
                    const sel = selectedJobsToShare.includes(jobId);
                    return (
                      <label
                        key={jobId}
                        className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${sel ? 'border-blue-300 bg-blue-50' : 'border-slate-100 bg-white hover:bg-slate-50'
                          }`}
                      >
                        <input
                          type="checkbox" checked={sel}
                          aria-label={`Select ${groupedDaySummary[jobId].title}`}
                          onChange={e => {
                            if (e.target.checked) setSelectedJobsToShare([...selectedJobsToShare, jobId]);
                            else setSelectedJobsToShare(selectedJobsToShare.filter(id => id !== jobId));
                          }}
                          className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-slate-900 truncate">{groupedDaySummary[jobId].title}</p>
                          <p className="text-xs text-slate-400">{groupedDaySummary[jobId].candidates.length} candidate(s)</p>
                        </div>
                        {sel && <CheckCircle2 size={15} className="text-blue-600 shrink-0" />}
                      </label>
                    );
                  })}
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    type="button" onClick={() => setShareStep('summary')}
                    className="flex-1 text-sm font-semibold text-slate-600 border border-slate-200 bg-white hover:bg-slate-50 py-3 rounded-xl transition-colors"
                  >
                    Back
                  </button>
                  <button
                    type="button" onClick={handleGeneratePortal}
                    disabled={isGenerating || selectedJobsToShare.length === 0}
                    className="flex-1 inline-flex items-center justify-center gap-2 text-sm font-semibold bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-3 rounded-xl transition-colors"
                  >
                    {isGenerating ? <Loader2 className="animate-spin" size={15} /> : 'Generate secure link'}
                  </button>
                </div>
              </>
            )}

            {/* Result view */}
            {shareStep === 'result' && generatedPortal && (
              <div className="text-center space-y-4">
                <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center mx-auto">
                  <CheckCircle2 size={26} className="text-green-600" />
                </div>
                <div>
                  <p className="text-base font-bold text-slate-900">Secure link generated</p>
                  <p className="text-xs text-slate-400 mt-1">Share this link and PIN with interview judges. Expires in 7 days.</p>
                </div>

                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-left space-y-3">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Portal link</p>
                    <p className="text-xs font-medium text-blue-600 break-all">{generatedPortal.link}</p>
                  </div>
                  <Divider />
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Access PIN</p>
                    <p className="text-2xl font-black text-slate-900 tracking-widest">{generatedPortal.password}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => copyToClipboard(`Judge Board Link: ${generatedPortal.link}\nPIN: ${generatedPortal.password}`)}
                  className={`w-full inline-flex items-center justify-center gap-2 text-sm font-semibold py-3 rounded-xl transition-colors ${copied
                    ? 'bg-green-600 text-white'
                    : 'bg-slate-900 hover:bg-slate-800 text-white'
                    }`}
                >
                  {copied
                    ? <><CheckCircle2 size={15} /> Copied!</>
                    : <><Copy size={15} /> Copy link + PIN</>}
                </button>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* ── Schedule modal ── */}
      {scheduleModal && (
        <Modal onClose={() => setScheduleModal(null)}>
          <ModalHeader
            title="Schedule interview"
            subtitle={`${scheduleModal.fullName} · ${scheduleModal.jobTitle}`}
            onClose={() => setScheduleModal(null)}
          />
          <div className="p-5 sm:p-6 space-y-4">
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Candidate</p>
              <p className="text-sm font-semibold text-slate-900">{scheduleModal.fullName}</p>
              <p className="text-xs text-blue-600 font-medium mt-0.5">{scheduleModal.jobTitle}</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Date & time
              </label>
              <input
                type="datetime-local"
                value={selectedDate}
                onChange={e => setSelectedDate(e.target.value)}
                aria-label="Select date and time"
                className="w-full px-3.5 py-3 text-sm border border-slate-200 rounded-xl bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
              />
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button" onClick={() => setScheduleModal(null)}
                className="flex-1 text-sm font-semibold text-slate-600 border border-slate-200 bg-white hover:bg-slate-50 py-3 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="button" onClick={handleSchedule}
                disabled={!selectedDate || actionLoading}
                className="flex-1 inline-flex items-center justify-center gap-2 text-sm font-semibold bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-3 rounded-xl transition-colors"
              >
                {actionLoading ? <Loader2 className="animate-spin" size={15} /> : 'Confirm booking'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── Reject modal ── */}
      {rejectModal && (
        <Modal onClose={() => setRejectModal(null)}>
          <ModalHeader
            title="Reject application"
            subtitle="This action cannot be undone."
            onClose={() => setRejectModal(null)}
          />
          <div className="p-5 sm:p-6 space-y-4">
            <div className="bg-red-50 border border-red-100 rounded-xl p-4">
              <p className="text-xs font-medium text-red-700 leading-relaxed">
                You are about to reject <strong>{rejectModal.fullName}</strong> for <strong>{rejectModal.jobTitle}</strong>.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Reason for rejection (internal)
              </label>
              <input
                type="text"
                placeholder="e.g. Insufficient experience"
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
                aria-label="Reason for rejection"
                className="w-full px-3.5 py-3 text-sm border border-slate-200 rounded-xl bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400 transition-all"
              />
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button" onClick={() => setRejectModal(null)}
                className="flex-1 text-sm font-semibold text-slate-600 border border-slate-200 bg-white hover:bg-slate-50 py-3 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="button" onClick={handleReject}
                disabled={!rejectReason || actionLoading}
                className="flex-1 inline-flex items-center justify-center gap-2 text-sm font-semibold bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white py-3 rounded-xl transition-colors"
              >
                {actionLoading ? <Loader2 className="animate-spin" size={15} /> : 'Confirm rejection'}
              </button>
            </div>
          </div>
        </Modal>
      )}

    </div>
  );
}
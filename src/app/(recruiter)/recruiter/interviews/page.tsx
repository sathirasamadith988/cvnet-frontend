'use client';

import { useState, useEffect } from 'react';
import { 
  Calendar, MapPin, Clock, Video, UserX, CalendarCheck2, 
  Loader2, X, AlertCircle, Share2, CheckCircle2, Copy, Users,
  Settings2, Trash2, ExternalLink
} from 'lucide-react';
import axios from 'axios';
import { auth } from '@/lib/firebaseConfig';

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

const getInitials = (name: string) => name ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : '??';

export default function InterviewsPage() {
  const [candidates, setCandidates] = useState<InterviewCandidate[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [scheduleModal, setScheduleModal] = useState<InterviewCandidate | null>(null);
  const [rejectModal, setRejectModal] = useState<InterviewCandidate | null>(null);
  
  // Day Summary & Share Flow States
  const [selectedDateView, setSelectedDateView] = useState<string | null>(null);
  const [shareStep, setShareStep] = useState<'summary' | 'select_jobs' | 'result'>('summary');
  const [selectedJobsToShare, setSelectedJobsToShare] = useState<string[]>([]);
  const [generatedPortal, setGeneratedPortal] = useState<{ link: string; password: string } | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  // Active Portals Manager State
  const [managePortalsOpen, setManagePortalsOpen] = useState(false);
  const [activePortals, setActivePortals] = useState<ActivePortal[]>([]);
  const [loadingPortals, setLoadingPortals] = useState(false);

  // Forms
  const [selectedDate, setSelectedDate] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Calendar State
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));

  const fetchInterviews = async () => {
    try {
      const user = auth.currentUser;
      const headers = user ? { Authorization: `Bearer ${await user.getIdToken()}` } : {};
      const res = await axios.get('http://localhost:5167/api/interviews', { headers });
      setCandidates(res.data);
    } catch (error) {
      console.error("Failed to load interviews", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchActivePortals = async () => {
    setLoadingPortals(true);
    try {
      const user = auth.currentUser;
      const headers = user ? { Authorization: `Bearer ${await user.getIdToken()}` } : {};
      const res = await axios.get('http://localhost:5167/api/interviews/portals', { headers });
      setActivePortals(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingPortals(false);
    }
  };

  const deletePortal = async (portalId: string) => {
    try {
      const user = auth.currentUser;
      const headers = user ? { Authorization: `Bearer ${await user.getIdToken()}` } : {};
      await axios.delete(`http://localhost:5167/api/interviews/portals/${portalId}`, { headers });
      setActivePortals(prev => prev.filter(p => p.portalId !== portalId));
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(user => {
      if (user) fetchInterviews();
    });
    return () => unsub();
  }, []);

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
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
  }, {} as Record<string, { title: string, candidates: InterviewCandidate[] }>);

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const startDayOfWeek = currentMonth.getDay();
  
  const calendarGrid = [];
  for (let i = 0; i < startDayOfWeek; i++) calendarGrid.push(null);
  for (let i = 1; i <= daysInMonth; i++) calendarGrid.push(i);

  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));

  const handleDateClick = (day: number) => {
    const clickedDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day).toDateString();
    if (scheduledDates.includes(clickedDate)) {
      setSelectedDateView(clickedDate);
      setShareStep('summary');
      setGeneratedPortal(null);
      
      const jobsForDay = Array.from(new Set(
        candidates.filter(c => c.interviewDate && new Date(c.interviewDate).toDateString() === clickedDate).map(c => c.jobId)
      ));
      setSelectedJobsToShare(jobsForDay);
    }
  };

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto min-h-screen bg-slate-50/50">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Interview Management</p>
          <h1 className="text-3xl font-black text-slate-900">Interviews Schedule</h1>
        </div>
        <button type="button" 
          onClick={() => { setManagePortalsOpen(true); fetchActivePortals(); }}
          className="flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-bold px-4 py-2.5 rounded-xl transition-colors shadow-sm"
        >
          <Settings2 size={16} /> Manage Active Boards
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Left Col: Candidates Grouped by Job */}
        <div className="lg:col-span-2 space-y-6">
          {loading ? (
             <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-600" size={40} /></div>
          ) : candidates.length === 0 ? (
             <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center text-slate-500 font-medium">No pending interview calls.</div>
          ) : (
            Object.keys(groupedInterviews).map(jobTitle => (
              <div key={jobTitle} className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
                <div className="bg-slate-50 border-b border-slate-200 px-6 py-4">
                  <h2 className="font-extrabold text-slate-800 text-lg">{jobTitle}</h2>
                  <p className="text-xs text-slate-500 font-medium">{groupedInterviews[jobTitle].length} candidates</p>
                </div>
                <div className="divide-y divide-slate-100">
                  {groupedInterviews[jobTitle].map((c) => (
                    <div key={c.callId} className="p-6 flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between hover:bg-slate-50/50 transition">
                      
                      <div className="flex items-center gap-4">
                        {c.profileImageUrl ? (
                          <img src={c.profileImageUrl} alt={c.fullName} className="w-12 h-12 rounded-full object-cover shadow-sm border border-slate-200" />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold shadow-sm">
                            {getInitials(c.fullName)}
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-slate-900">{c.fullName}</p>
                          <p className="text-xs text-slate-500">{c.email}</p>
                          
                          <div className="mt-2">
                            {c.interviewDate ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                                <Clock size={12} /> {new Date(c.interviewDate).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50 text-amber-700 text-xs font-bold border border-amber-200">
                                <Calendar size={12} /> Pending Scheduling
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 w-full sm:w-auto">
                        <button type="button" 
                          onClick={() => { setScheduleModal(c); setSelectedDate(''); }}
                          className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition"
                        >
                          <CalendarCheck2 size={14} /> Book Date
                        </button>
                        <button type="button" 
                          onClick={() => { setRejectModal(c); setRejectReason(''); }}
                          className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-xs font-bold rounded-xl transition"
                        >
                          <UserX size={14} /> Reject
                        </button>
                      </div>

                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Right Col: Big Calendar */}
        <div>
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm sticky top-6">
            
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-black text-slate-900 text-lg">
                {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
              </h3>
              <div className="flex gap-2">
                <button type="button" aria-label="Previous month" onClick={prevMonth} className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-50 hover:bg-slate-200 text-slate-600 font-bold transition">{'<'}</button>
                <button type="button" aria-label="Next month" onClick={nextMonth} className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-50 hover:bg-slate-200 text-slate-600 font-bold transition">{'>'}</button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2 text-center">
              {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => (
                <div key={d} className="text-[10px] font-black text-slate-400 uppercase">{d}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
              {calendarGrid.map((day, idx) => {
                if (!day) return <div key={`empty-${idx}`} className="h-10" />;
                
                const currentGridDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
                const isToday = currentGridDate.toDateString() === today.toDateString();
                const hasInterview = scheduledDates.includes(currentGridDate.toDateString());

                return (
                  <div 
                    key={day} 
                    onClick={() => handleDateClick(day)}
                    className={`
                      h-10 rounded-xl flex flex-col items-center justify-center text-sm font-bold relative transition
                      ${hasInterview ? 'cursor-pointer hover:scale-110 hover:shadow-md hover:bg-blue-50 hover:border-blue-200 border border-transparent' : 'text-slate-400 cursor-default'}
                      ${isToday && hasInterview ? 'bg-blue-600 text-white shadow-md hover:bg-blue-700' : ''}
                      ${isToday && !hasInterview ? 'bg-slate-100 text-slate-900' : ''}
                      ${!isToday && hasInterview ? 'text-slate-900 bg-slate-50' : ''}
                    `}
                  >
                    {day}
                    {hasInterview && !isToday && (
                      <div className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-blue-500" />
                    )}
                    {hasInterview && isToday && (
                      <div className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-white" />
                    )}
                  </div>
                );
              })}
            </div>
            
            <div className="mt-8 p-4 bg-blue-50 rounded-2xl border border-blue-100">
              <div className="flex items-start gap-3">
                <AlertCircle className="text-blue-500 shrink-0" size={18} />
                <p className="text-xs text-blue-800 font-medium leading-relaxed">
                  Dots indicate scheduled interviews. <strong>Click on a dotted date</strong> to view the daily summary and share the board portal.
                </p>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* ─── MODALS ──────────────────────────────────────────────────────── */}

      {/* 0. Manage Portals Modal */}
      {managePortalsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-3xl rounded-[2rem] p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-2xl font-black text-slate-900">Active Judge Boards</h3>
                <p className="text-sm font-medium text-slate-500 mt-1">Manage and revoke active secure portals.</p>
              </div>
              <button type="button" aria-label="Close" onClick={() => setManagePortalsOpen(false)} className="text-slate-400 hover:text-slate-700 bg-slate-100 p-2 rounded-full transition"><X size={20}/></button>
            </div>

            {loadingPortals ? (
              <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-600" size={40} /></div>
            ) : activePortals.length === 0 ? (
              <div className="text-center py-10 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-slate-500 font-bold">No active portals available.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {activePortals.map(portal => {
                  const linkUrl = `${window.location.origin}${portal.link}`;
                  return (
                    <div key={portal.portalId} className="border border-slate-200 rounded-2xl p-5 relative group hover:border-blue-300 transition-colors">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <p className="text-xs font-black text-blue-600 uppercase tracking-widest mb-1">
                            {new Date(portal.interviewDate).toDateString()}
                          </p>
                          <div className="flex flex-wrap gap-1.5 mb-2">
                            {portal.jobTitles.map((jt, i) => (
                              <span key={i} className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded border border-slate-200">
                                {jt}
                              </span>
                            ))}
                          </div>
                        </div>
                        <button type="button" 
                          onClick={() => deletePortal(portal.portalId)}
                          className="text-rose-400 hover:text-rose-600 bg-rose-50 hover:bg-rose-100 p-2 rounded-lg transition-colors"
                          title="Revoke Portal"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col sm:flex-row gap-4 justify-between items-center">
                        <div className="flex-1 overflow-hidden w-full text-center sm:text-left">
                          <p className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">Access Link</p>
                          <a href={linkUrl} target="_blank" rel="noreferrer" className="text-xs font-medium text-blue-600 hover:underline truncate block">
                            {linkUrl} <ExternalLink size={10} className="inline mb-0.5" />
                          </a>
                        </div>
                        <div className="px-4 border-l border-r border-slate-200 text-center">
                          <p className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">PIN Code</p>
                          <p className="text-sm font-black text-slate-800 tracking-widest">{portal.password}</p>
                        </div>
                        <div>
                          <button type="button" 
                            onClick={() => copyToClipboard(`Judge Board Link: ${linkUrl}\nPIN: ${portal.password}`)}
                            className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2 rounded-lg transition flex items-center gap-2"
                          >
                            <Copy size={14} /> Copy
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* 1. Day Summary & Share Portal Modal */}
      {selectedDateView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl rounded-[2rem] p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto custom-scrollbar">
            
            <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-2xl font-black text-slate-900">
                  {shareStep === 'summary' && 'Daily Interview Summary'}
                  {shareStep === 'select_jobs' && 'Share Judge Board Portal'}
                  {shareStep === 'result' && 'Portal Ready!'}
                </h3>
                <p className="text-sm font-bold text-blue-600 mt-1">{selectedDateView}</p>
              </div>
              <button type="button" aria-label="Close" onClick={() => setSelectedDateView(null)} className="text-slate-400 hover:text-slate-700 bg-slate-100 p-2 rounded-full transition"><X size={20}/></button>
            </div>

            {/* View A: Summary List */}
            {shareStep === 'summary' && (
              <>
                <div className="space-y-6 mb-8">
                  {Object.keys(groupedDaySummary).map(jobId => (
                    <div key={jobId}>
                      <h4 className="font-bold text-slate-800 flex items-center gap-2 mb-3">
                        <Users size={16} className="text-blue-600" /> {groupedDaySummary[jobId].title}
                      </h4>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {groupedDaySummary[jobId].candidates.map(c => (
                          <div key={c.appId} className="bg-slate-50 border border-slate-100 p-3 rounded-xl flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-600 shrink-0">
                              {getInitials(c.fullName)}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 text-sm leading-tight">{c.fullName}</p>
                              <p className="text-[10px] text-slate-500 font-semibold mt-0.5">
                                {new Date(c.interviewDate!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <button type="button" 
                  onClick={() => setShareStep('select_jobs')}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20"
                >
                  <Share2 size={18} /> Create Shareable Judge Board
                </button>
              </>
            )}

            {/* View B: Select Jobs to Share */}
            {shareStep === 'select_jobs' && (
              <>
                <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl mb-6">
                  <p className="text-sm text-blue-800 font-medium">Select which jobs you want to include in this specific portal link. Judges will only see candidates for the selected roles.</p>
                </div>

                <div className="space-y-3 mb-8">
                  {Object.keys(groupedDaySummary).map(jobId => {
                    const isSelected = selectedJobsToShare.includes(jobId);
                    return (
                      <label key={jobId} className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${isSelected ? 'border-blue-500 bg-blue-50/50' : 'border-slate-200 hover:bg-slate-50'}`}>
                        <input 
                          aria-label={`Select ${groupedDaySummary[jobId].title}`}
                          type="checkbox" 
                          checked={isSelected}
                          onChange={(e) => {
                            if (e.target.checked) setSelectedJobsToShare([...selectedJobsToShare, jobId]);
                            else setSelectedJobsToShare(selectedJobsToShare.filter(id => id !== jobId));
                          }}
                          className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500"
                        />
                        <div className="flex-1">
                          <p className="font-bold text-slate-900">{groupedDaySummary[jobId].title}</p>
                          <p className="text-xs text-slate-500 font-medium">{groupedDaySummary[jobId].candidates.length} candidate(s)</p>
                        </div>
                      </label>
                    );
                  })}
                </div>

                <div className="flex gap-3">
                  <button type="button" onClick={() => setShareStep('summary')} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3.5 rounded-xl transition">
                    Back
                  </button>
                  <button type="button" 
                    onClick={handleGeneratePortal}
                    disabled={isGenerating || selectedJobsToShare.length === 0}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl transition flex items-center justify-center gap-2"
                  >
                    {isGenerating ? <Loader2 className="animate-spin" size={18} /> : 'Generate Secure Link'}
                  </button>
                </div>
              </>
            )}

            {/* View C: Result & Copy Screen */}
            {shareStep === 'result' && generatedPortal && (
              <div className="text-center py-4">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 size={32} />
                </div>
                <h4 className="text-xl font-black text-slate-900 mb-2">Secure Link Generated</h4>
                <p className="text-sm text-slate-500 mb-8">Share this link and PIN with the interview judges. It will automatically expire in 7 days.</p>

                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-left mb-8 relative">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Portal Link</p>
                  <p className="text-sm font-medium text-blue-600 break-all mb-4">{generatedPortal.link}</p>
                  
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Access PIN</p>
                  <p className="text-2xl font-black text-slate-900 tracking-widest">{generatedPortal.password}</p>
                </div>

                <button type="button" 
                  onClick={() => copyToClipboard(`Judge Board Link: ${generatedPortal.link}\nPIN: ${generatedPortal.password}`)}
                  className={`w-full font-bold py-4 rounded-xl transition flex items-center justify-center gap-2 ${
                    copied ? 'bg-emerald-600 text-white' : 'bg-slate-900 hover:bg-slate-800 text-white'
                  }`}
                >
                  {copied ? <><CheckCircle2 size={18} /> Copied to Clipboard!</> : <><Copy size={18} /> Copy Details</>}
                </button>
              </div>
            )}

          </div>
        </div>
      )}


      {/* 2. Schedule Modal */}
      {scheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-[2rem] p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black text-slate-900">Schedule Interview</h3>
              <button type="button" aria-label="Close" onClick={() => setScheduleModal(null)} className="text-slate-400 hover:text-slate-700"><X size={20}/></button>
            </div>
            
            <div className="mb-6 p-4 bg-slate-50 rounded-xl border border-slate-100">
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-1">Candidate</p>
              <p className="font-bold text-slate-900">{scheduleModal.fullName}</p>
              <p className="text-sm text-blue-600 font-medium">{scheduleModal.jobTitle}</p>
            </div>

            <label className="block text-sm font-bold text-slate-700 mb-2">Select Date & Time</label>
            <input 
              aria-label="Select Date and Time"
              type="datetime-local" 
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none mb-8 font-medium text-slate-700"
            />

            <button type="button" 
              onClick={handleSchedule}
              disabled={!selectedDate || actionLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition flex items-center justify-center gap-2"
            >
              {actionLoading ? <Loader2 className="animate-spin" size={18} /> : 'Confirm Booking'}
            </button>
          </div>
        </div>
      )}

      {/* 3. Reject Modal */}
      {rejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-[2rem] p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-200 border border-rose-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black text-rose-600">Reject Application</h3>
              <button type="button" aria-label="Close" onClick={() => setRejectModal(null)} className="text-slate-400 hover:text-slate-700"><X size={20}/></button>
            </div>
            
            <p className="text-sm text-slate-600 mb-6 font-medium leading-relaxed">
              You are about to reject <span className="font-bold text-slate-900">{rejectModal.fullName}</span> for the role of <span className="font-bold text-slate-900">{rejectModal.jobTitle}</span>. This action cannot be undone.
            </p>

            <label className="block text-sm font-bold text-slate-700 mb-2">Reason for rejection (Internal)</label>
            <input 
              aria-label="Reason for rejection"
              type="text" 
              placeholder="e.g. Not enough experience"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-rose-500 outline-none mb-8 font-medium text-slate-700"
            />

            <div className="flex gap-3">
              <button type="button" 
                onClick={() => setRejectModal(null)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3.5 rounded-xl transition"
              >
                Cancel
              </button>
              <button type="button" 
                onClick={handleReject}
                disabled={!rejectReason || actionLoading}
                className="flex-1 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition flex items-center justify-center gap-2"
              >
                {actionLoading ? <Loader2 className="animate-spin" size={18} /> : 'Confirm Reject'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
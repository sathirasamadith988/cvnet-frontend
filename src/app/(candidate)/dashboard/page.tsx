"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Bell, TrendingUp, Briefcase, BarChart2, ArrowRight, Search,
  Plus, Trash2, AlertTriangle, Loader2, Target, Sparkles,
  ChevronRight, X, CheckCircle2
} from "lucide-react";
import axios from "axios";
import { auth } from "@/lib/firebaseConfig";

// ─── Types ────────────────────────────────────────────────────────────────────

const API_URL = "http://localhost:5167/api/Dashboard";

type Profile = { id: string; jobRole: string; isMaster?: boolean };
type GlobalStats = { applied: number; requests: number; rejects: number };
type RecentApp = { role: string; company: string; date: string; status: string };
type SkillGapDetail = { skillName: string; requirementSource: string; expectedLevel: string; userDeclaredLevel: string };
type CategoryTrack = { categoryName: string; roles: string[] };

type DashboardData = {
  profiles: Profile[];
  activeProfileId: string;
  globalStats: GlobalStats;
  activeProfileData: {
    completenessPercentage: number;
    roleAppliedCount: number;
    recentApps: RecentApp[];
  };
};

// ─── Config ───────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { bg: string; color: string; dot: string }> = {
  "In Review": { bg: "#fffbeb", color: "#b45309", dot: "#f59e0b" },
  "Interviewing": { bg: "#f5f3ff", color: "#7c3aed", dot: "#8b5cf6" },
  "Pending": { bg: "#f8fafc", color: "#475569", dot: "#94a3b8" },
  "Rejected": { bg: "#fff1f2", color: "#be123c", dot: "#f43f5e" },
  "Offer Received": { bg: "#f0fdf4", color: "#15803d", dot: "#22c55e" },
};
function getStatus(s: string) { return STATUS_CONFIG[s] ?? STATUS_CONFIG["Pending"]; }

const PIE_COLORS = ["#2563eb", "#f43f5e", "#f59e0b"];
const LEVEL_PCT: Record<number, number> = { 0: 0, 1: 7.5, 2: 34, 3: 85 };
const LEVEL_LABEL: Record<number, string> = { 0: "Missing", 1: "Beginner", 2: "Intermediate", 3: "Expert" };

function parseLevel(lvl?: string) {
  if (!lvl) return 0;
  const l = lvl.toLowerCase();
  if (l.includes("expert") || l.includes("advanced")) return 3;
  if (l.includes("intermediate")) return 2;
  if (l.includes("beginner")) return 1;
  return 0;
}
function skillBarColor(u: number, e: number) {
  if (u === 0) return "#e2e8f0";
  if (u >= e) return "#22c55e";
  if (u === 1 && e >= 3) return "#f43f5e";
  return "#f97316";
}

// ─── Shared primitives ────────────────────────────────────────────────────────

function Divider() { return <div className="h-px bg-slate-100" />; }

function SectionCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`bg-white rounded-2xl border border-slate-100 ${className}`}>{children}</div>;
}

function StatCard({ label, value, suffix, icon: Icon, accent, sub, className = "" }: {
  label: string; value: string | number; suffix?: string;
  icon: React.ElementType; accent: string; sub?: string; className?: string;
}) {
  return (
    <div className={`bg-white rounded-2xl border border-slate-100 p-4 sm:p-5 flex items-center gap-3 sm:gap-4 ${className}`}>
      <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center shrink-0"
        style={{ backgroundColor: accent + "18", color: accent }}>
        <Icon size={18} />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5 truncate">{label}</p>
        <div className="flex items-baseline gap-1">
          <span className="text-xl sm:text-2xl font-black text-slate-900 tabular-nums leading-none">{value}</span>
          {suffix && <span className="text-xs font-semibold text-slate-400">{suffix}</span>}
        </div>
        {sub && <p className="text-[10px] text-slate-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const cfg = getStatus(status);
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap"
      style={{ backgroundColor: cfg.bg, color: cfg.color }}>
      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: cfg.dot }} />
      {status}
    </span>
  );
}

// ─── Confirm modal ────────────────────────────────────────────────────────────

function ConfirmModal({ message, onConfirm, onCancel }: {
  message: string; onConfirm: () => void; onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:px-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-sm rounded-t-2xl sm:rounded-2xl p-5 sm:p-6 shadow-2xl">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
            <AlertTriangle size={16} className="text-red-600" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900 mb-0.5">Remove role target?</p>
            <p className="text-xs text-slate-500 leading-relaxed">{message}</p>
          </div>
        </div>
        <div className="flex gap-2 pt-1">
          <button type="button" onClick={onCancel}
            className="flex-1 text-sm font-semibold text-slate-600 border border-slate-200 bg-white hover:bg-slate-50 py-2.5 rounded-xl transition-colors">
            Cancel
          </button>
          <button type="button" onClick={onConfirm}
            className="flex-1 text-sm font-semibold bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-xl transition-colors">
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Skeleton() {
  return (
    <div className="animate-pulse space-y-5">
      <div className="bg-white rounded-2xl border border-slate-100 p-5 h-24" />
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[1, 2, 3].map(i => (
          <div key={i} className={`bg-white rounded-2xl border border-slate-100 p-4 flex gap-3 items-center ${i === 3 ? "col-span-2 sm:col-span-1" : ""}`}>
            <div className="w-10 h-10 rounded-xl bg-slate-100 shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-2.5 bg-slate-100 rounded w-16" />
              <div className="h-5 bg-slate-100 rounded w-10" />
            </div>
          </div>
        ))}
      </div>
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-slate-100 h-64" />
        <div className="bg-white rounded-2xl border border-slate-100 h-64" />
      </div>
      <div className="bg-white rounded-2xl border border-slate-100 h-48" />
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [activeProfileId, setActiveProfileId] = useState("");
  const [availableTracks, setAvailableTracks] = useState<CategoryTrack[]>([]);
  const [skillBreakdown, setSkillBreakdown] = useState<SkillGapDetail[]>([]);
  const [matrixMatchScore, setMatrixMatchScore] = useState(0);
  const [targetCategory, setTargetCategory] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showAddTrack, setShowAddTrack] = useState(false);
  const [deleteWarning, setDeleteWarning] = useState<string | null>(null);

  const fetchDashboardData = async (profileId?: string) => {
    try {
      if (!auth.currentUser) return;
      const token = await auth.currentUser.getIdToken();
      const cfg = { headers: { Authorization: `Bearer ${token}` }, ...(profileId ? { params: { profileId } } : {}) };
      const res = await axios.get(`${API_URL}/summary`, cfg);
      setData(res.data);
      const pid = profileId || res.data?.activeProfileId;
      if (pid) {
        setActiveProfileId(pid);
        const mx = await axios.get(`${API_URL}/readiness-matrix`, {
          headers: { Authorization: `Bearer ${token}` }, params: { profileId: pid }
        });
        setSkillBreakdown(mx.data?.breakdown || []);
        setMatrixMatchScore(mx.data?.matchScore || 0);
      }
    } catch (e) { console.error(e); }
    finally { setIsLoading(false); }
  };

  const loadTrackMeta = async () => {
    try {
      if (!auth.currentUser) return;
      const token = await auth.currentUser.getIdToken();
      const res = await axios.get(`${API_URL}/available-tracks`, { headers: { Authorization: `Bearer ${token}` } });
      setAvailableTracks(res.data || []);
      if (res.data?.length) {
        setTargetCategory(res.data[0].categoryName);
        setTargetRole(res.data[0].roles[0] || "");
      }
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(user => {
      if (user) { loadTrackMeta(); fetchDashboardData(); }
      else setIsLoading(false);
    });
    return () => unsub();
  }, []);

  const handleAddTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetRole || !targetCategory) return;
    setIsLoading(true);
    try {
      const token = await auth.currentUser?.getIdToken();
      await axios.post(`${API_URL}/roles`, { jobRole: targetRole, category: targetCategory },
        { headers: { Authorization: `Bearer ${token}` } });
      setShowAddTrack(false);
      fetchDashboardData();
    } catch (e) { console.error(e); setIsLoading(false); }
  };

  const handleRemoveRole = async (force = false) => {
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await axios.delete(`${API_URL}/roles/${activeProfileId}?force=${force}`,
        { headers: { Authorization: `Bearer ${token}` } });
      if (res.data?.isBlocked) { alert(res.data.message); setDeleteWarning(null); return; }
      if (res.data?.needsConfirmation && !force) { setDeleteWarning(res.data.message); return; }
      setDeleteWarning(null);
      fetchDashboardData();
    } catch (e) { console.error(e); }
  };

  // ── Derived ──────────────────────────────────────────────────────────────────

  const jobRoleProfiles = useMemo(() =>
    (data?.profiles || []).filter(p => p.jobRole !== "General CV Profile"),
    [data?.profiles]
  );

  const totalApps = (data?.globalStats?.applied || 0)
    + (data?.globalStats?.requests || 0)
    + (data?.globalStats?.rejects || 0);

  const pieSegments = useMemo(() => {
    const items = [
      { label: "Applied", value: data?.globalStats?.applied || 0 },
      { label: "Rejected", value: data?.globalStats?.rejects || 0 },
      { label: "Interviewing", value: data?.globalStats?.requests || 0 },
    ].filter(i => i.value > 0);
    return items.map((item, idx) => ({ ...item, color: PIE_COLORS[idx % PIE_COLORS.length] }));
  }, [data?.globalStats]);



  const displaySkills = useMemo(() =>
    (skillBreakdown || []).slice(0, 5).map(s => ({
      name: s.skillName,
      uVal: parseLevel(s.userDeclaredLevel),
      eVal: parseLevel(s.expectedLevel),
    })),
    [skillBreakdown]
  );

  const displayName = auth.currentUser?.displayName?.split(" ")[0] || "there";

  // ── Top bar ───────────────────────────────────────────────────────────────────

  const TopBar = (
    <header className="bg-white border-b border-slate-100 sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 shrink-0">

          <span className="text-sm font-semibold text-slate-900 hidden sm:block">CVNet</span>
          <ChevronRight size={14} className="text-slate-300 hidden sm:block" />
          <span className="text-sm font-semibold text-slate-400 hidden sm:block">Dashboard</span>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/applications"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 border border-slate-200 bg-white hover:bg-slate-50 px-3.5 py-2 rounded-xl transition-colors">
            <Search size={13} /> Search jobs
          </Link>
          <Link href="/applications"
            className="sm:hidden w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500">
            <Search size={15} />
          </Link>
          <button type="button" aria-label="Notifications"
            className="relative w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-colors">
            <Bell size={15} />
            <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-red-500 border border-white" />
          </button>
        </div>
      </div>
    </header>
  );

  const DashboardHeader = (
    <div>
      <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
        Welcome back, {displayName}
      </h1>
      <p className="text-sm text-slate-500 mt-0.5">Here's your career progress today.</p>
    </div>
  );

  if (isLoading) return (
    <div className="min-h-screen bg-slate-50">
      {TopBar}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-5 sm:py-8 space-y-5">
        {DashboardHeader}
        <Skeleton />
      </main>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {TopBar}

      {deleteWarning && (
        <ConfirmModal
          message={deleteWarning}
          onCancel={() => setDeleteWarning(null)}
          onConfirm={() => handleRemoveRole(true)}
        />
      )}

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-5 sm:py-8 space-y-5">

        {/* ── Heading ── */}
        {DashboardHeader}

        {/* ── Role manager ── */}
        <SectionCard className="p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-lg bg-blue-50 flex items-center justify-center">
              <Target size={12} className="text-blue-600" />
            </div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active target role</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            {/* Selector */}
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <select
                value={activeProfileId}
                onChange={e => {
                  const id = e.target.value;
                  setActiveProfileId(id);
                  setIsLoading(true);
                  fetchDashboardData(id);
                }}
                className="flex-1 min-w-0 px-3.5 py-2.5 text-sm font-semibold border border-slate-200 rounded-xl bg-white text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all cursor-pointer"
              >
                {jobRoleProfiles.length === 0
                  ? <option value="">No target roles configured</option>
                  : jobRoleProfiles.map(p => <option key={p.id} value={p.id}>{p.jobRole}</option>)
                }
              </select>
              {activeProfileId && jobRoleProfiles.length > 0 && (
                <button type="button" onClick={() => handleRemoveRole(false)}
                  className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-colors shrink-0"
                  title="Remove target role">
                  <Trash2 size={15} />
                </button>
              )}
            </div>

            {/* Add track */}
            {!showAddTrack ? (
              <button type="button" onClick={() => setShowAddTrack(true)}
                className="inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-500 border border-dashed border-slate-300 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 px-4 py-2.5 rounded-xl transition-colors sm:w-auto w-full">
                <Plus size={13} /> Add new target
              </button>
            ) : (
              <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2.5">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">New target role</p>
                  <button type="button" onClick={() => setShowAddTrack(false)} className="text-slate-400 hover:text-slate-600">
                    <X size={13} />
                  </button>
                </div>
                <div className="flex gap-2">
                  <select value={targetCategory}
                    onChange={e => {
                      setTargetCategory(e.target.value);
                      setTargetRole(availableTracks.find(t => t.categoryName === e.target.value)?.roles[0] || "");
                    }}
                    className="flex-1 px-3 py-2 text-xs font-semibold border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer">
                    {availableTracks.map(t => <option key={t.categoryName} value={t.categoryName}>{t.categoryName}</option>)}
                  </select>
                  <select value={targetRole} onChange={e => setTargetRole(e.target.value)}
                    className="flex-1 px-3 py-2 text-xs font-semibold border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer">
                    {(availableTracks.find(t => t.categoryName === targetCategory)?.roles || []).map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
                <button type="button" onClick={handleAddTrack}
                  className="w-full text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition-colors">
                  Save target
                </button>
              </div>
            )}
          </div>
        </SectionCard>

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <StatCard label="Profile complete" value={data?.activeProfileData?.completenessPercentage || 0}
            suffix="%" icon={TrendingUp} accent="#2563eb" sub="for active track" />
          <StatCard label="Skill match" value={matrixMatchScore}
            suffix="%" icon={BarChart2} accent="#16a34a" sub="weighted analysis" />
          <StatCard label="Role applications" value={data?.activeProfileData?.roleAppliedCount || 0}
            icon={Briefcase} accent="#7c3aed" sub="for active track" className="col-span-2 sm:col-span-1" />
        </div>

        {/* ── Charts row ── */}
        <div className="grid lg:grid-cols-2 gap-4">

          {/* Application breakdown */}
          <SectionCard className="p-5 sm:p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Application breakdown</h2>
                <p className="text-xs text-slate-400 mt-0.5">Applied, rejected and interviewing</p>
              </div>
              <Link href="/applications" className="text-xs font-semibold text-slate-400 hover:text-blue-600 flex items-center gap-1 transition-colors">
                View all <ArrowRight size={12} />
              </Link>
            </div>

            <div className="flex flex-col gap-6 mt-2">
              {/* Stacked Progress Bar */}
              {totalApps === 0 ? (
                <div className="h-2.5 bg-slate-100 rounded-full w-full" />
              ) : (
                <div className="h-2.5 flex rounded-full overflow-hidden bg-slate-100">
                  {pieSegments.map(({ color, value, label }) => (
                    <div
                      key={label}
                      style={{ width: `${(value / totalApps) * 100}%`, backgroundColor: color }}
                      className="h-full transition-all duration-500 hover:brightness-110"
                      title={`${label}: ${value}`}
                    />
                  ))}
                </div>
              )}

              {/* Metric Grid */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                {pieSegments.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-4 col-span-2">No applications tracked yet.</p>
                ) : pieSegments.map(({ label, value, color }) => (
                  <div key={label} className="flex flex-col bg-slate-50 border border-slate-100 rounded-2xl p-4 transition-colors hover:bg-slate-100/50">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: color }} />
                      <span className="text-xs font-bold text-slate-600">{label}</span>
                    </div>
                    <div className="flex items-end justify-between mt-auto">
                      <span className="text-2xl font-black text-slate-900 tabular-nums leading-none">{value}</span>
                      <span className="text-xs font-bold text-slate-400 tabular-nums mb-0.5">
                        {totalApps > 0 ? Math.round((value / totalApps) * 100) : 0}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </SectionCard>

          {/* Skills gap */}
          <SectionCard className="p-5 sm:p-6 flex flex-col">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Skills gap</h2>
                <p className="text-xs text-slate-400 mt-0.5">Your level vs. job requirements</p>
              </div>
              <Link href="/skill-gap" className="text-xs font-semibold text-slate-400 hover:text-blue-600 flex items-center gap-1 transition-colors">
                Details <ArrowRight size={12} />
              </Link>
            </div>

            {displaySkills.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-2 text-center py-8">
                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center">
                  <Target size={18} className="text-slate-300" />
                </div>
                <p className="text-sm font-semibold text-slate-700">No analysis yet</p>
                <p className="text-xs text-slate-400">Select a target role to see your skill gaps.</p>
              </div>
            ) : (
              <div className="space-y-4 flex-1">
                {displaySkills.map((skill, i) => {
                  const fillPct = LEVEL_PCT[skill.uVal] || 0;
                  const targetPct = LEVEL_PCT[skill.eVal] || 7.5;
                  const barColor = skillBarColor(skill.uVal, skill.eVal);
                  const met = skill.uVal >= skill.eVal && skill.uVal > 0;
                  return (
                    <div key={i} className="space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-800 truncate">{skill.name}</p>
                          <p className="text-[10px] text-slate-400 font-medium">You: {LEVEL_LABEL[skill.uVal]}</p>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {met && <CheckCircle2 size={12} className="text-green-500" />}
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg border"
                            style={{
                              backgroundColor: met ? "#f0fdf4" : "#eff6ff",
                              color: met ? "#15803d" : "#1d4ed8",
                              borderColor: met ? "#bbf7d0" : "#bfdbfe",
                            }}>
                            {LEVEL_LABEL[skill.eVal]}
                          </span>
                        </div>
                      </div>
                      <div className="relative h-2 bg-slate-100 rounded-full overflow-visible">
                        <div className="absolute top-0 left-0 h-full rounded-full transition-all duration-500"
                          style={{ width: `${fillPct}%`, backgroundColor: barColor }} />
                        <div className="absolute top-[-3px] bottom-[-3px] w-0.5 bg-slate-700 rounded-full z-10"
                          style={{ left: `${targetPct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Course nudge */}
            {displaySkills.some(s => s.uVal > 0 && s.uVal < s.eVal) && (
              <>
                <Divider />
                <div className="pt-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                    <Briefcase size={15} className="text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate">
                      Recommended: {displaySkills.find(s => s.uVal > 0 && s.uVal < s.eVal)?.name} course
                    </p>
                    <p className="text-[10px] text-slate-400">Based on your top skill gap</p>
                  </div>
                  <Link href="/skill-gap"
                    className="shrink-0 text-xs font-semibold text-blue-600 border border-blue-100 bg-blue-50 hover:bg-blue-100 px-3.5 py-2 rounded-xl transition-colors whitespace-nowrap">
                    Explore
                  </Link>
                </div>
              </>
            )}
          </SectionCard>
        </div>

        {/* ── Recent applications ── */}
        <SectionCard>
          <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-50">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Recent applications</h2>
              <p className="text-xs text-slate-400 mt-0.5">Your latest activity for this track</p>
            </div>
            <Link href="/applications"
              className="text-xs font-semibold text-slate-400 hover:text-blue-600 flex items-center gap-1 transition-colors">
              View all <ArrowRight size={12} />
            </Link>
          </div>

          {!data?.activeProfileData?.recentApps?.length ? (
            <div className="py-14 flex flex-col items-center gap-2 text-center px-6">
              <div className="w-11 h-11 bg-slate-50 rounded-2xl flex items-center justify-center">
                <Briefcase size={18} className="text-slate-300" />
              </div>
              <p className="text-sm font-semibold text-slate-700">No applications yet</p>
              <p className="text-xs text-slate-400">Start applying to track your history here.</p>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden sm:block">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-50">
                      {["Role & company", "Date", "Status"].map((h, i) => (
                        <th key={i} className="text-left text-[10px] font-black text-slate-400 uppercase tracking-widest px-5 sm:px-6 py-3">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(data?.activeProfileData?.recentApps || []).slice(0, 5).map((app, i) => (
                      <tr key={i} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60 transition-colors">
                        <td className="px-5 sm:px-6 py-3.5">
                          <p className="text-sm font-semibold text-slate-900">{app.role}</p>
                          <p className="text-xs text-slate-400">{app.company}</p>
                        </td>
                        <td className="px-5 sm:px-6 py-3.5">
                          <span className="text-xs font-medium text-slate-400 whitespace-nowrap">{app.date}</span>
                        </td>
                        <td className="px-5 sm:px-6 py-3.5">
                          <StatusBadge status={app.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="sm:hidden divide-y divide-slate-50">
                {(data?.activeProfileData?.recentApps || []).slice(0, 5).map((app, i) => (
                  <div key={i} className="px-4 py-3.5 flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">{app.role}</p>
                      <p className="text-xs text-slate-400 truncate">{app.company} · {app.date}</p>
                    </div>
                    <StatusBadge status={app.status} />
                  </div>
                ))}
              </div>
            </>
          )}
        </SectionCard>

        <div className="h-4 sm:h-0" />
      </main>
    </div>
  );
}
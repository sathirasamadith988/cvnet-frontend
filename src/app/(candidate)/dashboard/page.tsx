"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Bell, TrendingUp, Briefcase, BarChart2, ArrowRight, ExternalLink, Search,
  Plus, Trash2, AlertTriangle, Loader2, CheckCircle
} from "lucide-react";
import axios from "axios";
import { auth } from "@/lib/firebaseConfig";

const API_URL = "http://localhost:5167/api/Dashboard";

// --- TYPES ---
type Profile = { id: string; jobRole: string };
type GlobalStats = { applied: number; requests: number; rejects: number };
type RecentApp = { role: string; company: string; date: string; status: string };
type SkillGapDetail = { skillName: string; requirementSource: string; expectedLevel: string; expectedPercentage: number; userDeclaredLevel: string; userCalculatedPercentage: number; };
type CategoryTrack = { categoryName: string; roles: string[] };

type DashboardData = {
  profiles: Profile[];
  activeProfileId: string;
  globalStats: GlobalStats;
  activeProfileData: {
    completenessPercentage: number;
    skillMatchPercentage: number;
    roleAppliedCount: number;
    recentApps: RecentApp[];
  };
};

const statusColors: Record<string, string> = {
  "In Review": "bg-amber-100 text-amber-700",
  "Interview": "bg-blue-100 text-blue-700",
  "Applied": "bg-slate-100 text-slate-600",
  "Rejected": "bg-red-100 text-red-700",
  "Offer": "bg-green-100 text-green-700",
};

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [activeProfileId, setActiveProfileId] = useState<string>("");
  const [availableTracks, setAvailableTracks] = useState<CategoryTrack[]>([]);
  const [skillBreakdown, setSkillBreakdown] = useState<SkillGapDetail[]>([]);
  
  const [targetCategory, setTargetCategory] = useState<string>("");
  const [targetRole, setTargetRole] = useState<string>("");
  
  const [isLoading, setIsLoading] = useState(true);
  const [showAddTrack, setShowAddTrack] = useState(false);
  const [deleteWarningMsg, setDeleteWarningMsg] = useState<string | null>(null);

  // --- API LOGIC ---
  const fetchDashboardData = async (profileId?: string) => {
    try {
      if (!auth.currentUser) return;
      const idToken = await auth.currentUser.getIdToken();
      
      const res = await axios.get(profileId ? `${API_URL}/summary?profileId=${profileId}` : `${API_URL}/summary`, { 
        headers: { Authorization: `Bearer ${idToken}` } 
      });
      setData(res.data);
      
      if (res.data.activeProfileId) {
        setActiveProfileId(res.data.activeProfileId);
        const matrixRes = await axios.get("http://localhost:5167/api/JobRole/readiness-matrix", {
          headers: { Authorization: `Bearer ${idToken}` }
        });
        setSkillBreakdown(matrixRes.data.breakdown || []);
      }
    } catch (err: any) {
      // ✅ Expose the exact error payload from C#
      console.error("Dashboard payload loading failure:", err.response?.data?.error || err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const loadTrackMeta = async () => {
    try {
      if (!auth.currentUser) return;
      const idToken = await auth.currentUser.getIdToken();
      const res = await axios.get(`${API_URL}/available-tracks`, {
        headers: { Authorization: `Bearer ${idToken}` }
      });
      setAvailableTracks(res.data || []);
      if (res.data.length > 0) {
        setTargetCategory(res.data[0].categoryName);
        setTargetRole(res.data[0].roles[0] || "");
      }
    } catch (err: any) {
      // ✅ Expose the exact error payload from C#
      console.error("Failed to load metrics:", err.response?.data?.error || err.message);
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) { loadTrackMeta(); fetchDashboardData(); }
    });
    return () => unsubscribe();
  }, []);

  const handleAddTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetRole || !targetCategory) return;
    setIsLoading(true);
    try {
      const idToken = await auth.currentUser?.getIdToken();
      await axios.post(`${API_URL}/roles`, { jobRole: targetRole, category: targetCategory }, {
        headers: { Authorization: `Bearer ${idToken}` }
      });
      setShowAddTrack(false);
      fetchDashboardData();
    } catch (err) {
      console.error(err);
      setIsLoading(false);
    }
  };

  const handleRemoveRole = async (force: boolean = false) => {
    try {
      const idToken = await auth.currentUser?.getIdToken();
      const res = await axios.delete(`${API_URL}/roles/${activeProfileId}?force=${force}`, {
        headers: { Authorization: `Bearer ${idToken}` }
      });
      
      if (res.data.isBlocked) { alert(`Blocked: ${res.data.message}`); setDeleteWarningMsg(null); return; }
      if (res.data.needsConfirmation && !force) { setDeleteWarningMsg(res.data.message); return; }
      
      setDeleteWarningMsg(null);
      fetchDashboardData();
    } catch (err) {
      console.error(err);
    }
  };

  // --- UI COMPUTATIONS (Preserving Original SVG Logic) ---
  const pieSegments = useMemo(() => [
    { label: "Applied Jobs", value: data?.globalStats.applied || 0, color: "#2563eb", bg: "bg-blue-600" },
    { label: "Rejects", value: data?.globalStats.rejects || 0, color: "#ef4444", bg: "bg-red-500" },
    { label: "Interview Called", value: data?.globalStats.requests || 0, color: "#f59e0b", bg: "bg-amber-500" },
  ], [data]);

  const chartRadius = 44;
  const chartCircumference = 2 * Math.PI * chartRadius;
  const chartSegments = useMemo(() => {
    const total = pieSegments.reduce((sum, seg) => sum + seg.value, 0);
    if (!total) return [];
    let consumed = 0;
    return pieSegments.map(({ value, color }) => {
      const length = (value / total) * chartCircumference;
      const offset = consumed;
      consumed += length;
      return { color, length, offset };
    });
  }, [chartCircumference, pieSegments]);

  const totalApps = data ? (data.globalStats.applied + data.globalStats.requests + data.globalStats.rejects) : 0;

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-[70vh]"><Loader2 className="animate-spin text-blue-600" size={48} /></div>;
  }

  return (
    <div className="p-6 sm:p-8 max-w-7xl">
      
      {/* Safety Warning Modal */}
      {deleteWarningMsg && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
            <div className="flex items-center gap-3 text-rose-600 mb-3"><AlertTriangle size={24} /><h3 className="text-lg font-bold">System Warning</h3></div>
            <p className="text-slate-600 mb-6 text-sm">{deleteWarningMsg}</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteWarningMsg(null)} className="px-4 py-2 font-semibold text-slate-500 hover:bg-slate-50 rounded-xl">Cancel</button>
              <button onClick={() => handleRemoveRole(true)} className="px-4 py-2 font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl">Confirm Deletion</button>
            </div>
          </div>
        </div>
      )}

      {/* ORIGINAL TOP BAR */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Welcome back, {auth.currentUser?.displayName || "User"}</h1>
          <p className="text-slate-500 text-sm mt-0.5">Here's what's happening with your career today.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/applications/jobs" className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-white px-4 py-2 text-sm font-semibold text-blue-700 shadow-sm transition-colors hover:bg-blue-50">
            <Search size={16} /> Search Jobs & Skills
          </Link>
          <button aria-label="Notifications" className="relative p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
            <Bell size={18} className="text-slate-600" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </button>
        </div>
      </div>

      {/* ORIGINAL GRADIENT BANNER */}
      <div className="bg-linear-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 mb-6 text-white shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-blue-100 text-sm font-medium mb-1">Ready for your next big role?</p>
            <p className="text-base font-semibold">Your profile readiness has increased by <strong>5%</strong> this week. Keep going!</p>
            <div className="flex gap-6 mt-3 text-sm">
              <span className="flex items-center gap-1.5"><TrendingUp size={14} className="text-green-300" /><strong>{data?.activeProfileData.completenessPercentage}%</strong> Readiness</span>
              <span className="flex items-center gap-1.5"><BarChart2 size={14} className="text-blue-200" /><strong>{data?.activeProfileData.skillMatchPercentage}%</strong> Skill Match</span>
            </div>
          </div>
          <div className="flex gap-3 shrink-0">
            <Link href="/cv" className="bg-white text-blue-600 font-semibold text-sm px-4 py-2 rounded-xl hover:bg-blue-50 transition-colors">View Profile</Link>
          </div>
        </div>
      </div>

      {/* ROLE MANAGER (Replaces old static filter dropdowns) */}
      <div className="bg-white border border-slate-100 rounded-2xl p-4 mb-6 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="w-full sm:w-1/2">
            <label className="text-xs font-medium text-slate-500 mb-1 block">Active Target Profile Track</label>
            <div className="flex items-center gap-2">
              <select 
                value={activeProfileId} 
                onChange={(e) => { setActiveProfileId(e.target.value); fetchDashboardData(e.target.value); }}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold bg-slate-50 outline-none"
              >
                {data?.profiles.length === 0 ? <option value="">No Active Track Roles</option> : data?.profiles.map(p => <option key={p.id} value={p.id}>{p.jobRole}</option>)}
              </select>
              {activeProfileId && (
                <button onClick={() => handleRemoveRole(false)} className="p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 rounded-xl transition-colors border border-transparent hover:border-red-100">
                  <Trash2 size={18} />
                </button>
              )}
            </div>
          </div>

          <div className="w-full sm:w-1/2">
            {!showAddTrack ? (
              <button onClick={() => setShowAddTrack(true)} className="mt-5 w-full bg-slate-50 border border-slate-200 border-dashed hover:bg-slate-100 text-slate-600 font-semibold py-2 rounded-xl transition-colors flex justify-center items-center gap-2 text-sm">
                <Plus size={16}/> Create New Job Track
              </button>
            ) : (
              <form onSubmit={handleAddTrack} className="flex flex-col gap-2 relative">
                <label className="text-xs font-medium text-slate-500 block">Select Category & Role</label>
                <div className="flex gap-2">
                  <select value={targetCategory} onChange={(e) => { setTargetCategory(e.target.value); setTargetRole(availableTracks.find(t => t.categoryName === e.target.value)?.roles[0] || ""); }} className="w-1/2 rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none">
                    {availableTracks.map(t => <option key={t.categoryName} value={t.categoryName}>{t.categoryName}</option>)}
                  </select>
                  <select value={targetRole} onChange={(e) => setTargetRole(e.target.value)} className="w-1/2 rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none">
                    {(availableTracks.find(t => t.categoryName === targetCategory)?.roles || []).map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div className="flex gap-2 mt-1">
                  <button type="submit" className="flex-1 bg-blue-600 text-white font-semibold text-xs py-2 rounded-lg">Save</button>
                  <button type="button" onClick={() => setShowAddTrack(false)} className="flex-1 bg-slate-100 text-slate-600 font-semibold text-xs py-2 rounded-lg">Cancel</button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* ORIGINAL STATS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {/* PROFILE COMPLETENESS (READINESS SCORE) METRIC CARD */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-slate-500">Profile Completeness</p>
              <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
                <TrendingUp size={17} className="text-blue-600" />
              </div>
            </div>
            <p className="text-2xl font-extrabold text-blue-600">
              {data?.activeProfileData?.completenessPercentage ?? 0}%
            </p>
          </div>
          <div className="mt-4 border-t border-slate-50 pt-3 flex items-center justify-between text-xs">
            <span className="text-slate-400 font-medium">Click to update sections</span>
            {/* ✅ FIXED: Changed label string to "View" and successfully linked path to /cv track */}
            <Link 
              href="/cv" 
              className="font-bold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-0.5"
            >
              View &rarr;
            </Link>
          </div>
        </div>
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3"><p className="text-sm font-medium text-slate-500">Skill Match</p><div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center"><BarChart2 size={17} className="text-emerald-600" /></div></div>
          <p className="text-2xl font-extrabold text-emerald-600">{data?.activeProfileData.skillMatchPercentage}%</p>
          <p className="text-xs text-slate-400 mt-1">From industry analysis</p>
        </div>
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3"><p className="text-sm font-medium text-slate-500">Total Applied Count</p><div className="w-9 h-9 rounded-xl bg-violet-50 flex items-center justify-center"><Briefcase size={17} className="text-violet-600" /></div></div>
          <p className="text-2xl font-extrabold text-violet-600">{data?.activeProfileData.roleAppliedCount}</p>
          <p className="text-xs text-slate-400 mt-1">For current active track</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* ORIGINAL SVG APPLICATION BREAKDOWN */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm mb-6 lg:mb-0">
          <div className="flex items-center justify-between mb-5">
            <div><h2 className="font-bold text-slate-900">Application Breakdown</h2><p className="text-xs text-slate-400 mt-0.5">Applied jobs, requests, and rejects</p></div>
            <Link href="/applications/jobs" className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">Apply here <ArrowRight size={12} /></Link>
          </div>

          <div className="grid gap-6 xl:grid-cols-[auto_1fr] xl:items-center">
            <div className="flex items-center justify-center">
              <svg viewBox="0 0 120 120" className="h-48 w-48 drop-shadow-sm">
                <circle cx="60" cy="60" r={chartRadius} fill="none" stroke="#e2e8f0" strokeWidth="18" />
                {chartSegments.map(({ color, length, offset }) => (
                  <circle key={`${color}-${offset}`} cx="60" cy="60" r={chartRadius} fill="none" stroke={color} strokeWidth="18" strokeDasharray={`${length} ${chartCircumference - length}`} strokeDashoffset={-offset} transform="rotate(-90 60 60)" strokeLinecap="round" />
                ))}
                <circle cx="60" cy="60" r="34" fill="white" />
                <text x="60" y="57" textAnchor="middle" className="fill-slate-900 text-[18px] font-extrabold">{totalApps}</text>
                <text x="60" y="72" textAnchor="middle" className="fill-slate-400 text-[8px] font-medium">Total applied</text>
              </svg>
            </div>
            <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
              {pieSegments.map(({ label, value, bg }) => (
                <div key={label} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <div className="flex items-center gap-2 mb-2"><span className={`h-3 w-3 rounded-full ${bg}`} /><p className="text-sm font-semibold text-slate-700">{label}</p></div>
                  <p className="text-2xl font-extrabold text-slate-900">{value}</p>
                  <p className="text-xs text-slate-400 mt-1">{totalApps ? Math.round((value / totalApps) * 100) : 0}% of total</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ORIGINAL SKILLS GAP WIDGET */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div><h2 className="font-bold text-slate-900">Skills Gap Analysis</h2><p className="text-xs text-slate-400 mt-0.5">Candidate vs. Job Requirements</p></div>
            <Link href="/skill-gap" className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">View Details <ArrowRight size={12} /></Link>
          </div>

          <h3 className="text-sm font-semibold text-slate-700 mb-3">Top Missing Skills</h3>
          {skillBreakdown.length === 0 ? (
            <p className="text-sm text-slate-400 py-4 text-center">No track selected or matrix is generating.</p>
          ) : (
            <div className="space-y-3.5">
              {skillBreakdown.slice(0, 5).map((skill, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-slate-700">{skill.skillName}</span>
                      <span className="text-[10px] uppercase font-bold text-slate-400">{skill.userDeclaredLevel} / {skill.expectedLevel} target</span>
                    </div>
                    <div className="relative bg-slate-100 rounded-full h-2 w-full">
                      <div className={`absolute top-0 bottom-0 left-0 rounded-full transition-all ${skill.userCalculatedPercentage >= skill.expectedPercentage ? 'bg-emerald-500' : 'bg-red-500'}`} style={{ width: `${skill.userCalculatedPercentage}%` }} />
                      <div className="absolute top-[-2px] bottom-[-2px] w-0.5 bg-slate-900 z-10" style={{ left: `${skill.expectedPercentage}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          <Link href="/skill-gap" className="mt-6 flex items-center justify-center gap-1 text-xs text-blue-600 font-semibold hover:text-blue-700">
            Find Courses <ExternalLink size={11} />
          </Link>
        </div>
      </div>

      {/* ORIGINAL RECENT APPLICATIONS TABLE */}
      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm mt-6">
        <div className="flex items-center justify-between mb-5">
          <div><h2 className="font-bold text-slate-900">Recent Applications</h2><p className="text-xs text-slate-400 mt-0.5">Your latest job applications</p></div>
          <Link href="/applications" className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">View All <ArrowRight size={12} /></Link>
        </div>

        {data?.activeProfileData.recentApps.length === 0 ? (
           <div className="text-center py-8"><p className="text-sm text-slate-500">No applications tracked yet.</p></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left pb-3 text-xs font-semibold text-slate-400 uppercase">Role</th>
                  <th className="text-left pb-3 text-xs font-semibold text-slate-400 uppercase">Date</th>
                  <th className="text-left pb-3 text-xs font-semibold text-slate-400 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {data?.activeProfileData.recentApps.map((app, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 pr-4">
                      <p className="font-semibold text-slate-900 text-sm">{app.role}</p>
                      <p className="text-xs text-slate-400">{app.company}</p>
                    </td>
                    <td className="py-3 pr-4 text-xs text-slate-500 whitespace-nowrap">{app.date}</td>
                    <td className="py-3"><span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColors[app.status] || "bg-slate-100 text-slate-600"}`}>{app.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ORIGINAL AWS RECOMMENDATION BOX */}
        <div className="mt-5 pt-5 border-t border-slate-100">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center"><Briefcase size={15} className="text-blue-600" /></div>
            <div><p className="text-sm font-semibold text-slate-900">Suggested: AWS Solutions Architect</p><p className="text-xs text-slate-400">Course recommendation based on your gaps</p></div>
          </div>
          <Link href="/skill-gap" className="block w-full text-center bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-xs py-2.5 rounded-xl transition-colors">
            Explore Recommended Courses
          </Link>
        </div>
      </div>
    </div>
  );
}
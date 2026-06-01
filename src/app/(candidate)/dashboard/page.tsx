"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Bell, TrendingUp, Briefcase, BarChart2, ArrowRight, Search,
  Plus, Trash2, AlertTriangle, Loader2, Target
} from "lucide-react";
import axios from "axios";
import { auth } from "@/lib/firebaseConfig";

const API_URL = "http://localhost:5167/api/Dashboard";

type Profile = { id: string; jobRole: string; isMaster?: boolean };
type GlobalStats = { applied: number; requests: number; rejects: number };
type RecentApp = { role: string; company: string; date: string; status: string };
type SkillGapDetail = { skillName: string; requirementSource: string; expectedLevel: string; userDeclaredLevel: string; };
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

const statusColors: Record<string, string> = {
  "In Review": "bg-amber-100 text-amber-700",
  "Interviewing": "bg-purple-100 text-purple-700",
  "Pending": "bg-slate-100 text-slate-600",
  "Rejected": "bg-red-100 text-red-700",
  "Offer Received": "bg-green-100 text-green-700",
};

const pieColorPalette = ["#2563eb", "#ef4444", "#f59e0b"];

// ✅ FIX: Visually aligned perfectly with the backend math logic
const levelVisualPercentages: Record<number, number> = { 0: 0, 1: 7.5, 2: 34, 3: 85 };
const levelLabels: Record<number, string> = { 0: "Missing", 1: "Beginner", 2: "Intermediate", 3: "Expert" };

const parseLevel = (lvl?: string) => {
  if (!lvl) return 0;
  const lower = lvl.toLowerCase();
  if (lower.includes("expert") || lower.includes("advanced")) return 3;
  if (lower.includes("intermediate")) return 2;
  if (lower.includes("beginner")) return 1;
  return 0;
};

const getSkillGapColor = (u: number, e: number) => {
  if (u === 0) return "bg-transparent";
  if (u >= e) return "bg-emerald-400";
  if (u === 1 && e >= 3) return "bg-red-400"; 
  return "bg-orange-400"; 
};

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [activeProfileId, setActiveProfileId] = useState<string>("");
  const [availableTracks, setAvailableTracks] = useState<CategoryTrack[]>([]);
  const [skillBreakdown, setSkillBreakdown] = useState<SkillGapDetail[]>([]);
  const [matrixMatchScore, setMatrixMatchScore] = useState(0);
  
  const [targetCategory, setTargetCategory] = useState<string>("");
  const [targetRole, setTargetRole] = useState<string>("");
  
  const [isLoading, setIsLoading] = useState(true);
  const [showAddTrack, setShowAddTrack] = useState(false);
  const [deleteWarningMsg, setDeleteWarningMsg] = useState<string | null>(null);

  const fetchDashboardData = async (profileId?: string) => {
    try {
      if (!auth.currentUser) return;
      const idToken = await auth.currentUser.getIdToken();
      
      const summaryConfig = { headers: { Authorization: `Bearer ${idToken}` }, ...(profileId ? { params: { profileId } } : {}) };
      const res = await axios.get(`${API_URL}/summary`, summaryConfig);
      setData(res.data);
      
      const currentActiveId = profileId || res.data?.activeProfileId;
      if (currentActiveId) {
        setActiveProfileId(currentActiveId);
        
        // Grabs the newly implemented mathematical breakdown
        const matrixRes = await axios.get(`${API_URL}/readiness-matrix`, {
          headers: { Authorization: `Bearer ${idToken}` },
          params: { profileId: currentActiveId }
        });
        
        setSkillBreakdown(matrixRes.data?.breakdown || []);
        setMatrixMatchScore(matrixRes.data?.matchScore || 0);
      }
    } catch (err: any) {
      console.error("Dashboard payload loading failure:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadTrackMeta = async () => {
    try {
      if (!auth.currentUser) return;
      const idToken = await auth.currentUser.getIdToken();
      const res = await axios.get(`${API_URL}/available-tracks`, { headers: { Authorization: `Bearer ${idToken}` } });
      setAvailableTracks(res.data || []);
      if (res.data && res.data.length > 0) {
        setTargetCategory(res.data[0].categoryName);
        setTargetRole(res.data[0].roles[0] || "");
      }
    } catch (err: any) {
      console.error("Failed to load metrics:", err);
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) { loadTrackMeta(); fetchDashboardData(); } 
      else { setIsLoading(false); }
    });
    return () => unsubscribe();
  }, []);

  const handleAddTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetRole || !targetCategory) return;
    setIsLoading(true);
    try {
      const idToken = await auth.currentUser?.getIdToken();
      await axios.post(`${API_URL}/roles`, { jobRole: targetRole, category: targetCategory }, { headers: { Authorization: `Bearer ${idToken}` } });
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
      const res = await axios.delete(`${API_URL}/roles/${activeProfileId}?force=${force}`, { headers: { Authorization: `Bearer ${idToken}` } });
      
      if (res.data?.isBlocked) { alert(`Blocked: ${res.data.message}`); setDeleteWarningMsg(null); return; }
      if (res.data?.needsConfirmation && !force) { setDeleteWarningMsg(res.data.message); return; }
      
      setDeleteWarningMsg(null);
      fetchDashboardData();
    } catch (err) { console.error(err); }
  };

  const jobRoleProfiles = useMemo(() => {
    return (data?.profiles || []).filter(p => p.jobRole !== "General CV Profile");
  }, [data?.profiles]);

  const pieSegments = useMemo(() => {
    const items = [
      { label: "Applied Jobs", value: data?.globalStats?.applied || 0 },
      { label: "Rejects", value: data?.globalStats?.rejects || 0 },
      { label: "Interviewing", value: data?.globalStats?.requests || 0 },
    ].filter(item => item.value > 0);
    return items.map((item, idx) => ({ ...item, color: pieColorPalette[idx % pieColorPalette.length] }));
  }, [data?.globalStats]);

  const totalApps = (data?.globalStats?.applied || 0) + (data?.globalStats?.requests || 0) + (data?.globalStats?.rejects || 0);
  const chartRadius = 44;
  const chartCircumference = 2 * Math.PI * chartRadius;
  
  const chartSegments = useMemo(() => {
    if (totalApps === 0) return [];
    let consumed = 0;
    return pieSegments.map(({ value, color }) => {
      const length = (value / totalApps) * chartCircumference;
      const offset = consumed;
      consumed += length;
      return { color, length, offset };
    });
  }, [chartCircumference, pieSegments, totalApps]);

  const displaySkills = useMemo(() => {
    if (!skillBreakdown || skillBreakdown.length === 0) return [];

    return skillBreakdown.slice(0, 5).map(s => {
      const uVal = parseLevel(s.userDeclaredLevel);
      const eVal = parseLevel(s.expectedLevel);
      return {
        name: s.skillName,
        uVal,
        eVal,
        expectedPercentage: levelVisualPercentages[eVal] || 7.5
      };
    });
  }, [skillBreakdown]);

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-[70vh]"><Loader2 className="animate-spin text-blue-600" size={48} /></div>;
  }

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto">
      
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

      {/* TOP BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
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

      {/* ROLE MANAGER */}
      <div className="bg-white border border-slate-100 rounded-2xl p-5 mb-6 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="w-full sm:w-1/2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block flex items-center gap-1.5"><Target size={14}/> Active Target Role</label>
            <div className="flex items-center gap-2">
              <select 
                value={activeProfileId} 
                onChange={(e) => { 
                  const targetId = e.target.value;
                  setActiveProfileId(targetId); 
                  setIsLoading(true); 
                  fetchDashboardData(targetId); 
                }}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-blue-700 bg-slate-50 outline-none focus:border-blue-500 cursor-pointer"
              >
                {jobRoleProfiles.length === 0 ? <option value="">No Target Roles Configured</option> : jobRoleProfiles.map(p => <option key={p.id} value={p.id}>{p.jobRole}</option>)}
              </select>
              {activeProfileId && jobRoleProfiles.length > 0 && (
                <button onClick={() => handleRemoveRole(false)} className="p-2.5 text-slate-400 hover:bg-red-50 hover:text-red-600 rounded-xl transition-colors border border-transparent hover:border-red-100">
                  <Trash2 size={18} />
                </button>
              )}
            </div>
          </div>

          <div className="w-full sm:w-1/2">
            {!showAddTrack ? (
              <button onClick={() => setShowAddTrack(true)} className="mt-6 w-full bg-slate-50 border border-slate-200 border-dashed hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 text-slate-600 font-semibold py-2.5 rounded-xl transition-colors flex justify-center items-center gap-2 text-sm">
                <Plus size={16}/> Build New Job Target
              </button>
            ) : (
              <form onSubmit={handleAddTrack} className="flex flex-col gap-2 relative bg-slate-50 p-3 rounded-xl border border-slate-200">
                <label className="text-xs font-bold text-slate-500">Select Category & Role</label>
                <div className="flex gap-2">
                  <select value={targetCategory} onChange={(e) => { setTargetCategory(e.target.value); setTargetRole(availableTracks.find(t => t.categoryName === e.target.value)?.roles[0] || ""); }} className="w-1/2 rounded-lg border border-slate-200 px-2 py-1.5 text-sm outline-none">
                    {availableTracks.map(t => <option key={t.categoryName} value={t.categoryName}>{t.categoryName}</option>)}
                  </select>
                  <select value={targetRole} onChange={(e) => setTargetRole(e.target.value)} className="w-1/2 rounded-lg border border-slate-200 px-2 py-1.5 text-sm outline-none">
                    {(availableTracks.find(t => t.categoryName === targetCategory)?.roles || []).map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div className="flex gap-2 mt-1">
                  <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-1.5 rounded-lg transition-colors">Save</button>
                  <button type="button" onClick={() => setShowAddTrack(false)} className="flex-1 bg-white border border-slate-200 text-slate-600 font-bold text-xs py-1.5 rounded-lg transition-colors">Cancel</button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* STATS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-slate-500">Profile Completeness</p>
              <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center"><TrendingUp size={17} className="text-blue-600" /></div>
            </div>
            <p className="text-2xl font-extrabold text-blue-600">{data?.activeProfileData?.completenessPercentage || 0}%</p>
          </div>
          <div className="mt-4 border-t border-slate-50 pt-3 flex items-center justify-between text-xs">
            <span className="text-slate-400 font-medium">Click to update sections</span>
            <Link href="/cv" className="font-bold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-0.5">View &rarr;</Link>
          </div>
        </div>

        {/* MATH-SYNCED SKILL MATCH */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3"><p className="text-sm font-medium text-slate-500">Skill Match</p><div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center"><BarChart2 size={17} className="text-emerald-600" /></div></div>
          <p className="text-2xl font-extrabold text-emerald-600">{matrixMatchScore}%</p>
          <p className="text-xs text-slate-400 mt-1">Weighted Math Analysis out of 85%</p>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3"><p className="text-sm font-medium text-slate-500">Total Applied Count</p><div className="w-9 h-9 rounded-xl bg-violet-50 flex items-center justify-center"><Briefcase size={17} className="text-violet-600" /></div></div>
          <p className="text-2xl font-extrabold text-violet-600">{data?.activeProfileData?.roleAppliedCount || 0}</p>
          <p className="text-xs text-slate-400 mt-1">For current active track</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        
        {/* SVG APPLICATION BREAKDOWN */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm mb-6 lg:mb-0">
          <div className="flex items-center justify-between mb-5">
            <div><h2 className="font-bold text-slate-900">Application Breakdown</h2><p className="text-xs text-slate-400 mt-0.5">Applied jobs, requests, and rejects</p></div>
            <Link href="/applications" className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">View Applications <ArrowRight size={12} /></Link>
          </div>

          <div className="grid gap-6 xl:grid-cols-[auto_1fr] xl:items-center">
            <div className="flex items-center justify-center">
              <svg viewBox="0 0 120 120" className="h-48 w-48 drop-shadow-sm">
                {totalApps === 0 ? (
                  <circle cx="60" cy="60" r={chartRadius} fill="none" stroke="#f1f5f9" strokeWidth="18" />
                ) : (
                  chartSegments.map(({ color, length, offset }) => (
                    <circle key={`${color}-${offset}`} cx="60" cy="60" r={chartRadius} fill="none" stroke={color} strokeWidth="18" strokeDasharray={`${length} ${chartCircumference - length}`} strokeDashoffset={-offset} transform="rotate(-90 60 60)" strokeLinecap="round" />
                  ))
                )}
                <circle cx="60" cy="60" r="34" fill="white" />
                <text x="60" y="57" textAnchor="middle" className="fill-slate-900 text-[18px] font-extrabold">{totalApps}</text>
                <text x="60" y="72" textAnchor="middle" className="fill-slate-400 text-[8px] font-medium">Total tracked</text>
              </svg>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
              {pieSegments.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No applications processed yet.</p>
              ) : (
                pieSegments.map(({ label, value, color }) => (
                  <div key={label} className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="h-3 w-3 rounded-full" style={{ backgroundColor: color }} />
                      <p className="text-xs font-bold text-slate-700">{label}</p>
                    </div>
                    <div className="flex items-end justify-between">
                      <p className="text-xl font-extrabold text-slate-900">{value}</p>
                      <p className="text-[10px] font-semibold text-slate-400 mb-1">{totalApps > 0 ? Math.round((value / totalApps) * 100) : 0}%</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* SKILLS GAP WIDGET */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-5">
              <div><h2 className="font-bold text-slate-900">Skills Gap Analysis</h2><p className="text-xs text-slate-400 mt-0.5">Candidate vs. Job Requirements</p></div>
              <Link href="/skill-gap" className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">View Details <ArrowRight size={12} /></Link>
            </div>

            <h3 className="text-sm font-semibold text-slate-700 mb-4">Top Core Requirements</h3>
            {(!displaySkills || displaySkills.length === 0) ? (
              <p className="text-sm text-slate-400 py-4 text-center">No track selected or matrix is generating.</p>
            ) : (
              <div className="space-y-4">
                {displaySkills.map((skill, idx) => {
                  const barColor = getSkillGapColor(skill.uVal, skill.eVal);
                  const fillPercentage = levelVisualPercentages[skill.uVal] || 0;

                  return (
                    <div key={idx} className="flex flex-col gap-1.5">
                      <div className="flex items-end justify-between">
                        <div>
                          <span className="text-[13px] font-extrabold text-slate-800 block">{skill.name}</span>
                          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Current: {levelLabels[skill.uVal]}</span>
                        </div>
                        {/* THE CORNER TARGET BADGE */}
                        <span className="text-[9px] uppercase font-extrabold tracking-widest text-blue-700 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded flex items-center gap-1 shadow-sm">
                          <Target size={10} /> Target: {levelLabels[skill.eVal]}
                        </span>
                      </div>
                      <div className="relative bg-slate-100 rounded-full h-2 w-full mt-1">
                        {/* User Level Fill */}
                        <div className={`absolute top-0 bottom-0 left-0 rounded-full transition-all duration-500 ${barColor}`} style={{ width: `${fillPercentage}%` }} />
                        {/* Expected Level Tick */}
                        <div className="absolute top-[-3px] bottom-[-3px] w-0.5 bg-slate-800 z-10 rounded-full" style={{ left: `${skill.expectedPercentage}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          
          {/* COURSE RECOMMENDATION BOX */}
          {displaySkills && displaySkills.length > 0 && displaySkills.some(s => s.uVal > 0 && s.uVal < s.eVal) && (
            <div className="mt-6 pt-5 border-t border-slate-100">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0"><Briefcase size={15} className="text-blue-600" /></div>
                <div>
                  <p className="text-sm font-semibold text-slate-900 leading-tight">
                    Suggested: {displaySkills.find(s => s.uVal > 0 && s.uVal < s.eVal)?.name} Course
                  </p>
                  <p className="text-xs text-slate-400">Recommendation based on your top skill gap</p>
                </div>
              </div>
              <Link href="/skill-gap" className="block w-full text-center bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-xs py-2.5 rounded-xl transition-colors">
                Explore Recommended Courses
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* RECENT APPLICATIONS TABLE */}
      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm mt-6">
        <div className="flex items-center justify-between mb-5">
          <div><h2 className="font-bold text-slate-900">Recent Applications</h2><p className="text-xs text-slate-400 mt-0.5">Your latest job applications</p></div>
          <Link href="/applications" className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">View All <ArrowRight size={12} /></Link>
        </div>

        {(!data?.activeProfileData?.recentApps || data.activeProfileData.recentApps.length === 0) ? (
           <div className="text-center py-8 bg-slate-50 border border-dashed border-slate-200 rounded-xl"><p className="text-sm font-bold text-slate-600 mb-1">No Applications Found</p><p className="text-xs text-slate-400">Start applying to see your history tracked here.</p></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left pb-3 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Role & Company</th>
                  <th className="text-left pb-3 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Date</th>
                  <th className="text-left pb-3 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {(data.activeProfileData.recentApps || []).slice(0, 5).map((app, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 pr-4">
                      <p className="font-semibold text-slate-900 text-sm">{app.role}</p>
                      <p className="text-xs text-slate-500">{app.company}</p>
                    </td>
                    <td className="py-3 pr-4 text-xs font-medium text-slate-400 whitespace-nowrap">{app.date}</td>
                    <td className="py-3"><span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold tracking-wide uppercase ${statusColors[app.status] || "bg-slate-100 text-slate-600"}`}>{app.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  BookOpen,
  Zap,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Target,
  Loader2,
  PlusCircle
} from "lucide-react";
import axios from "axios";
import { auth } from "@/lib/firebaseConfig";

const API_URL = "http://localhost:5167/api/SkillGap";

const statusConfig: Record<string, { bg: string; text: string }> = {
  "Critical Gap": { bg: "bg-red-100", text: "text-red-700" },
  "Moderate Gap": { bg: "bg-amber-100", text: "text-amber-700" },
  "Matched": { bg: "bg-green-100", text: "text-green-700" },
};

// Safe level mapping to prevent JS alphabet sorting bugs
const levelMap: Record<string, number> = {
  "None Detected": 0,
  "Missing": 0,
  "Beginner": 1,
  "Intermediate": 2,
  "Advanced": 3,
  "Expert": 4, 
};

function computeStatus(yourLevel: string, required: string) {
  const u = levelMap[yourLevel] ?? 0;
  const e = levelMap[required] ?? 1;

  if (u === 0) return "Critical Gap";
  if (u >= e) return "Matched";
  if (u === 1 && e >= 3) return "Critical Gap"; 
  return "Moderate Gap"; 
}

export default function SkillGapPage() {
  const [data, setData] = useState<any>(null);
  const [activeProfileId, setActiveProfileId] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const fetchSkillGapData = async (profileId?: string) => {
    try {
      if (!auth.currentUser) return;
      const idToken = await auth.currentUser.getIdToken();
      
      const endpoint = profileId ? `${API_URL}/analysis?profileId=${profileId}` : `${API_URL}/analysis`;
      const res = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${idToken}` }
      });
      
      setData(res.data);
      if (res.data.activeProfileId) setActiveProfileId(res.data.activeProfileId);
    } catch (err: any) {
      console.error("C# Backend Network Error:", err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) fetchSkillGapData();
      else setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (isLoading) return <div className="flex items-center justify-center min-h-[70vh]"><Loader2 className="animate-spin text-blue-600" size={40} /></div>;
  if (!data) return <div className="p-8 text-center text-slate-500">Ensure your C# Backend is running on port 5167!</div>;

  const matchScore = data.matchScore || 0;
  const industryScore = data.industryScore || 80;
  const matchedCount = data.matchedCount || 0;
  const missingCount = data.missingCount || 0;
  const matchedSkills = data.matchedSkills || [];
  const missingSkills = data.missingSkills || [];
  const breakdown = data.breakdown || [];

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100">
      <div className="p-6 sm:p-8 max-w-7xl mx-auto">
        <div className="mb-6 flex flex-col sm:flex-row items-start justify-between gap-4">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-8 h-8 text-blue-600" />
              Skill Gap Analysis
            </h2>
            <p className="text-slate-500 text-sm mt-2">
              Deep dive into your market readiness and personalized development roadmap
            </p>
            <p className="mt-3 text-xs text-amber-700 bg-amber-50 border border-amber-100 px-3 py-2 rounded inline-block">
              Note: These analytics evaluate your raw extracted CV data against industry-standard job categories using weighted readiness algorithms.
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-6">
          {/* Target Role Card */}
          <div className="lg:col-span-2 bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex flex-col sm:flex-row items-start justify-between gap-6 mb-6">
              
              <div className="flex-1 w-full sm:w-auto">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full inline-flex items-center gap-1">
                    <Target size={12} /> Target Job Role
                  </span>
                  
                  {/* Build New Target Button */}
                  <Link href="/dashboard" className="text-xs font-bold text-slate-500 hover:text-blue-600 flex items-center gap-1 transition-colors">
                    <PlusCircle size={14} /> Build new job target
                  </Link>
                </div>
                
                <select 
                  value={activeProfileId} 
                  onChange={(e) => { 
                    setActiveProfileId(e.target.value); 
                    setIsLoading(true); 
                    fetchSkillGapData(e.target.value); 
                  }}
                  className="block w-full max-w-md text-2xl font-extrabold text-slate-900 border-b-2 border-slate-200 bg-transparent py-1 outline-none focus:border-blue-600 transition-colors cursor-pointer"
                >
                  {(data.profiles || []).map((p: any) => <option key={p.id} value={p.id}>{p.jobRole}</option>)}
                </select>
                
                <p className="text-sm text-slate-500 mt-2">
                  Analytics adjusted for <span className="font-bold text-slate-700">{data.jobRole || "Selected Role"}</span>.
                </p>
              </div>

              {/* Advanced Readiness Widget */}
              <div className="shrink-0 w-full sm:w-64">
                <div className="flex flex-col items-center">
                  <div className="relative w-32 h-32 mb-2">
                    <svg viewBox="0 0 80 80" className="w-32 h-32 -rotate-90 drop-shadow-sm">
                      <circle cx="40" cy="40" r="34" fill="none" stroke="#e2e8f0" strokeWidth="7" />
                      
                      {/* ✅ FIX: Divides by 85 to perfectly scale against Max Expertise */}
                      <circle 
                        cx="40" cy="40" r="34" fill="none" stroke="#bfdbfe" strokeWidth="7" 
                        strokeDasharray={`${(2 * Math.PI * 34 * industryScore) / 85} ${2 * Math.PI * 34}`} 
                        strokeLinecap="round" 
                      />
                      <circle 
                        cx="40" cy="40" r="34" fill="none" 
                        stroke={matchScore >= industryScore ? "#10b981" : "#2563eb"} 
                        strokeWidth="7" 
                        strokeDasharray={`${(2 * Math.PI * 34 * matchScore) / 85} ${2 * Math.PI * 34}`} 
                        strokeLinecap="round" 
                        className="transition-all duration-1000 ease-out"
                      />
                      <g style={{ transform: `rotate(${(industryScore / 85) * 360}deg)`, transformOrigin: '40px 40px' }}>
                        <line x1="40" y1="2" x2="40" y2="10" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" />
                      </g>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-3xl font-black text-slate-900">{matchScore}%</span>
                      <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mt-0.5">Score</span>
                    </div>
                  </div>

                  {/* Colorful Point-Form Details */}
                  <div className="w-full space-y-2 mt-2">
                    <div className="flex items-center justify-between bg-blue-50/50 border border-blue-100 px-3 py-2 rounded-lg">
                      <div className="flex items-center gap-1.5">
                        <Zap className="text-blue-500 w-3.5 h-3.5" />
                        <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">Max Expertise</span>
                      </div>
                      <span className="text-[11px] font-black text-blue-700">85%</span>
                    </div>

                    <div className="flex items-center justify-between bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg relative overflow-hidden">
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-slate-400"></div>
                      <div className="flex items-center gap-1.5 pl-1">
                        <Target className="text-slate-500 w-3.5 h-3.5" />
                        <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wide">Industry Expected</span>
                      </div>
                      <span className="text-[11px] font-black text-slate-800">{industryScore}%</span>
                    </div>

                    <div className={`flex items-center justify-between px-3 py-2 rounded-lg border relative overflow-hidden ${matchScore >= industryScore ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
                      <div className={`absolute left-0 top-0 bottom-0 w-1 ${matchScore >= industryScore ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                      <div className="flex items-center gap-1.5 pl-1">
                        {matchScore >= industryScore ? <CheckCircle className="text-emerald-600 w-3.5 h-3.5" /> : <AlertCircle className="text-red-600 w-3.5 h-3.5" />}
                        <span className={`text-[11px] font-bold uppercase tracking-wide ${matchScore >= industryScore ? 'text-emerald-800' : 'text-red-800'}`}>Your Readiness</span>
                      </div>
                      <span className={`text-[11px] font-black ${matchScore >= industryScore ? 'text-emerald-700' : 'text-red-700'}`}>{matchScore}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Grid using EXACT Core + 1 Block numbers */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="bg-linear-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-4 text-center hover:shadow-md transition">
                <CheckCircle className="w-6 h-6 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-extrabold text-green-700">{matchedCount}</p>
                <p className="text-xs text-green-700 font-medium mt-1">Matched Skills Verified</p>
              </div>
              <div className="bg-linear-to-br from-red-50 to-red-100 border border-red-200 rounded-xl p-4 text-center hover:shadow-md transition">
                <AlertCircle className="w-6 h-6 text-red-600 mx-auto mb-2" />
                <p className="text-2xl font-extrabold text-red-700">{missingCount}</p>
                <p className="text-xs text-red-700 font-medium mt-1">Missing Critical Skills</p>
              </div>
            </div>

            {/* Clean Pie Chart for Skill Distribution */}
            <div className="mt-6 bg-white border border-slate-100 rounded-xl p-4 shadow-sm text-center">
              <h4 className="text-sm font-semibold text-slate-800 mb-3">Skill Match Breakdown</h4>
              <div className="flex items-center justify-center gap-6">
                <div className="relative w-28 h-28">
                  {(() => {
                    // Uses exact matchedCount logic (Core + 1)
                    const total = matchedCount + missingCount || 1;
                    const matchedPct = Math.round((matchedCount / total) * 100);
                    const missingPct = 100 - matchedPct;
                    const circumference = 2 * Math.PI * 34;
                    const dashMatched = (circumference * matchedPct) / 100;
                    const dashMissing = circumference - dashMatched;

                    return (
                      <svg viewBox="0 0 80 80" className="-rotate-90 w-28 h-28">
                        <circle cx="40" cy="40" r="34" fill="none" stroke="#ef4444" strokeWidth="10" />
                        <circle 
                          cx="40" cy="40" r="34" fill="none" stroke="#10b981" strokeWidth="10" 
                          strokeDasharray={`${dashMatched} ${dashMissing}`} 
                          strokeLinecap="round" 
                          className="transition-all duration-1000 ease-out"
                        />
                      </svg>
                    );
                  })()}
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-lg font-bold text-slate-900">{matchedCount}/{matchedCount + missingCount}</span>
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total</span>
                  </div>
                </div>
                <div className="text-left text-xs space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-green-500 inline-block shadow-xs" />
                    <span className="text-slate-700 font-bold">{matchedCount} Matched</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-red-500 inline-block shadow-xs" />
                    <span className="text-slate-700 font-bold">{missingCount} Missing</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Learning Path & Skills Sidebar */}
          <div className="space-y-4">
            <div className="bg-linear-to-br from-blue-600 to-blue-700 rounded-2xl p-6 shadow-lg text-white">
              <div className="flex items-start justify-between mb-3">
                <BookOpen className="w-6 h-6 opacity-80" />
                <span className="text-[10px] uppercase tracking-widest bg-white text-blue-600 px-2 py-1 rounded-full font-bold">
                  AI Recommended
                </span>
              </div>
              <h3 className="font-bold text-lg mb-2">Accelerate Your Growth</h3>
              <p className="text-sm text-blue-100 mb-4 leading-relaxed">
                Focus on your critical gaps. We've created a personalized learning roadmap just for you.
              </p>
              <Link href="/dashboard" className="block w-full text-center bg-white hover:bg-blue-50 text-blue-600 font-bold text-[11px] uppercase tracking-widest py-3 rounded-xl transition-colors mb-3">
                Start Learning Path
              </Link>
            </div>

            <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <h3 className="font-bold text-slate-900">Matched Skills</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {matchedSkills.length === 0 ? <p className="text-xs font-medium text-slate-400">No specific skills matched yet.</p> : matchedSkills.map((s: string) => (
                  <span key={s} className="text-xs bg-green-50 text-green-700 border border-green-200 px-3 py-1.5 rounded-full font-semibold transition">
                    ✓ {s}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition">
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <h3 className="font-bold text-slate-900">Missing Critical Skills</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {missingSkills.length === 0 ? <p className="text-xs font-medium text-slate-400">All skills matched!</p> : missingSkills.map((s: string) => (
                  <span key={s} className="text-xs bg-red-50 text-red-600 border border-red-200 px-3 py-1.5 rounded-full font-semibold transition">
                    ✗ {s}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Gap Analysis */}
        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 bg-slate-50">
            <h2 className="font-bold text-lg text-slate-900 flex items-center gap-2"><TrendingUp className="w-6 h-6 text-blue-600" /> Skill Gap Breakdown</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Skill / Tool</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Your Level</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Required Level</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {breakdown.map((item: any, idx: number) => {
                  const status = computeStatus(item.yourLevel, item.required);
                  return (
                    <tr key={idx} className="hover:bg-blue-50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-semibold text-slate-900">{item.skill}</p>
                        <p className="text-xs text-slate-400">{item.category}</p>
                      </td>
                      <td className="px-4 py-4 text-xs font-medium text-slate-600">{item.yourLevel}</td>
                      <td className="px-4 py-4 text-xs font-medium text-slate-600">{item.required}</td>
                      <td className="px-4 py-4">
                        <span className={`px-3 py-1.5 rounded-full text-xs font-bold inline-flex items-center gap-1 ${statusConfig[status]?.bg} ${statusConfig[status]?.text}`}>
                          {status === "Matched" ? <CheckCircle size={14} /> : <AlertCircle size={14} />} {status}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
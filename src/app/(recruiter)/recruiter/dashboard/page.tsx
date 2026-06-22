'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Plus, TrendingUp, Users, Briefcase, Loader2, AlertCircle } from 'lucide-react';

const stageColors: Record<string, string> = {
  'Interview': 'bg-blue-100 text-blue-700',
  'Technical Test': 'bg-violet-100 text-violet-700',
  'Screening': 'bg-amber-100 text-amber-700',
  'Pending': 'bg-slate-100 text-slate-700',
};

interface DashboardData {
  totalApplications: number;
  averageMatchScore: number;
  openPositions: number;
  applicationTrends: { month: string; count: number }[];
  topCandidates: {
    name: string;
    email: string;
    role: string;
    matchScore: number;
    stage: string;
  }[];
}

export default function RecruiterDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // 1. Grab the Firebase token securely from the browser cookies
        const token = document.cookie
          .split("; ")
          .find((row) => row.startsWith("cvnet_token="))
          ?.split("=")[1];

        if (!token) {
          throw new Error("No authentication token found.");
        }

        // 2. Attach the token to the Authorization header for the .NET backend
        const response = await axios.get('http://localhost:5167/api/CompanyDashboard', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        setData(response.data);
      } catch (err: any) {
        console.error("Dashboard error:", err);
        setError("Failed to load dashboard data. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="bg-red-50 text-red-600 p-6 rounded-2xl flex items-center gap-3 font-bold border border-red-200">
          <AlertCircle size={24} /> {error}
        </div>
      </div>
    );
  }

  const maxBar = Math.max(...data.applicationTrends.map(t => t.count), 1); 

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Recruitment Overview</p>
          <h1 className="text-2xl font-extrabold text-slate-900">Dashboard</h1>
        </div>
        <div className="flex gap-3">
          <div className="relative hidden sm:block">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input placeholder="Search candidates..." className="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 w-48 transition-all" />
          </div>
          <Link href="/recruiter/post-job" className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors shadow-sm">
            <Plus size={16} /> Post Job
          </Link>
        </div>
      </div>

      {/* Dynamic Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <p className="text-sm font-medium text-slate-500">Total Applications</p>
            <Users size={16} className="text-blue-500" />
          </div>
          <p className="text-3xl font-extrabold text-slate-900">{data.totalApplications}</p>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <p className="text-sm font-medium text-slate-500">Avg Match Score</p>
            <TrendingUp size={16} className="text-emerald-500" />
          </div>
          <p className="text-3xl font-extrabold text-slate-900">{data.averageMatchScore}%</p>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <p className="text-sm font-medium text-slate-500">Open Positions</p>
            <Briefcase size={16} className="text-violet-500" />
          </div>
          <p className="text-3xl font-extrabold text-slate-900">{data.openPositions}</p>
        </div>
      </div>

      {/* Application Trends Chart */}
      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm mb-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-bold text-slate-900">Application Trends</h2>
            <p className="text-xs text-slate-400 mt-0.5">Monthly applicant volume over time</p>
          </div>
          <span className="text-xs font-bold text-slate-500 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg">Last 6 Months</span>
        </div>
        
        <div className="flex items-end justify-between gap-4 h-48 mt-4">
          {data.applicationTrends.map((trend) => (
            <div key={trend.month} className="flex-1 flex flex-col items-center gap-2 group">
              <span className="text-xs font-bold text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                {trend.count}
              </span>
              <div
                className="w-full max-w-[60px] bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-xl opacity-80 hover:opacity-100 transition-all cursor-default shadow-sm group-hover:shadow-md"
                style={{ height: `${(trend.count / maxBar) * 100}%`, minHeight: trend.count > 0 ? '10%' : '2px' }}
              />
              <span className="text-xs font-bold text-slate-400">{trend.month}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Top Candidates */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <div>
            <h2 className="font-bold text-slate-900">Top Ranked Candidates</h2>
            <p className="text-xs text-slate-400 mt-0.5">Showing highly matched available candidates across all open jobs</p>
          </div>
          <Link href="/recruiter/candidates" className="text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg transition-colors">
            View All Database →
          </Link>
        </div>
        
        {data.topCandidates.length === 0 ? (
          <div className="p-8 text-center text-slate-500 font-medium">
            No active candidates found. Start by posting a job!
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="text-left px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Candidate</th>
                <th className="text-left px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Role Applied</th>
                <th className="text-left px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Match Score</th>
                <th className="text-left px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Stage</th>
                <th className="text-left px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {data.topCandidates.map((candidate, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center text-blue-700 text-sm font-black flex-shrink-0 border border-blue-100">
                        {candidate.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-extrabold text-slate-900 text-sm">{candidate.name}</p>
                        <p className="text-xs font-medium text-slate-400">{candidate.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-xs font-bold text-slate-600">{candidate.role}</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${candidate.matchScore}%` }} />
                      </div>
                      <span className="text-xs font-black text-emerald-600">{candidate.matchScore}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${stageColors[candidate.stage] || stageColors['Pending']}`}>
                      {candidate.stage}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <Link href={`/recruiter/candidates?email=${candidate.email}`} className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors">
                      Review Profile
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
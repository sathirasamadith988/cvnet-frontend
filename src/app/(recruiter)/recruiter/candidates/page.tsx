'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Search, SlidersHorizontal, Plus, ChevronDown, Briefcase, Loader2 } from 'lucide-react';
import axios from 'axios';
import { auth } from '@/lib/firebaseConfig';

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

const statusConfig: Record<string, string> = {
  Interview: 'bg-blue-100 text-blue-700',
  'Technical Test': 'bg-violet-100 text-violet-700',
  Screening: 'bg-amber-100 text-amber-700',
  Applied: 'bg-slate-100 text-slate-600',
  Rejected: 'bg-red-100 text-red-700',
  Pending: 'bg-amber-100 text-amber-700',
};

const getInitials = (name: string) => {
  if (!name) return '??';
  return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
};

export default function CandidatesPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [jobs, setJobs] = useState<JobFilter[]>([]);
  const [search, setSearch] = useState('');
  const [selectedJobId, setSelectedJobId] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [loading, setLoading] = useState(true);
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);

  // 1. Fetch Jobs for the Filter Sidebar
  const fetchJobs = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;
      const token = await user.getIdToken();
      
      const res = await axios.get('http://localhost:5167/api/candidates/jobs', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setJobs(res.data);
    } catch (err) {
      console.error("Failed to fetch jobs", err);
    }
  };

  // 2. Fetch Candidates dynamically based on filters
  const fetchCandidates = async () => {
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) return;
      const token = await user.getIdToken();

      const queryParams = new URLSearchParams();
      if (selectedJobId) queryParams.append('jobId', selectedJobId);
      if (search) queryParams.append('search', search);
      queryParams.append('sortOrder', sortOrder);

      const res = await axios.get(`http://localhost:5167/api/candidates?${queryParams.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCandidates(res.data);
    } catch (err) {
      console.error("Failed to fetch candidates", err);
    } finally {
      setLoading(false);
    }
  };

  // Wait for Firebase Auth before making the initial fetch
  useEffect(() => {
    const unsub = auth.onAuthStateChanged(user => { 
      if (user) {
        fetchJobs();
      }
    });
    return () => unsub();
  }, []);

  // Trigger candidate fetch when filters change (with debounce)
  useEffect(() => {
    const debounce = setTimeout(() => {
      // Only fetch if auth is ready
      if (auth.currentUser) {
        fetchCandidates();
      }
    }, 300);

    return () => clearTimeout(debounce);
  }, [selectedJobId, search, sortOrder]);

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Candidates Directory</p>
          <h1 className="text-2xl font-extrabold text-slate-900">Candidates</h1>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* Filters Sidebar */}
        <div className="hidden lg:block w-64 flex-shrink-0 space-y-5">
          <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm sticky top-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-800">Filters</h3>
              <button 
                onClick={() => { setSelectedJobId(''); setSearch(''); }}
                className="text-xs text-blue-600 font-semibold hover:text-blue-700"
              >
                Clear all
              </button>
            </div>

            {/* Filter by Job Post */}
            <div className="mb-4 pt-2">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Filter by Job Post</h4>
              <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input 
                    type="radio" 
                    name="jobFilter" 
                    checked={selectedJobId === ''} 
                    onChange={() => setSelectedJobId('')}
                    className="mt-0.5 w-4 h-4 rounded-full border-slate-300 text-blue-600 focus:ring-blue-500" 
                  />
                  <span className="text-sm font-bold text-slate-700 group-hover:text-blue-600 transition-colors">All Jobs</span>
                </label>
                
                {jobs.map(job => (
                  <label key={job.id} className="flex items-start gap-3 cursor-pointer group">
                    <input 
                      type="radio" 
                      name="jobFilter" 
                      value={job.id}
                      checked={selectedJobId === job.id}
                      onChange={(e) => setSelectedJobId(e.target.value)}
                      className="mt-0.5 w-4 h-4 rounded-full border-slate-300 text-blue-600 focus:ring-blue-500 shrink-0" 
                    />
                    <span className="text-sm font-medium text-slate-600 group-hover:text-blue-600 transition-colors line-clamp-2 leading-tight">
                      {job.title}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Candidates List */}
        <div className="flex-1">
          {/* Search + Sort */}
          <div className="flex items-center gap-3 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search candidates by name or email..."
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              />
            </div>
            <div className="relative">
              <select 
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                className="appearance-none pl-4 pr-10 py-2.5 text-sm border border-slate-200 rounded-xl bg-white text-slate-700 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-sm"
              >
                <option value="desc">Highest Match Score</option>
                <option value="asc">Lowest Match Score</option>
                <option value="gpa_desc">Highest GPA</option> 
                <option value="gpa_asc">Lowest GPA</option>
              </select>
              <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="animate-spin text-blue-600" size={40} />
            </div>
          ) : candidates.length === 0 ? (
            <div className="bg-white border border-slate-100 rounded-2xl p-12 text-center shadow-sm border-dashed">
              <Search size={32} className="text-slate-300 mx-auto mb-4" />
              <p className="text-slate-800 font-bold text-lg mb-1">No candidates found</p>
              <p className="text-slate-500 text-sm">Try adjusting your search or selecting a different job post.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-xs text-slate-500 font-bold mb-4">
                Showing {candidates.length} candidate{candidates.length !== 1 && 's'}
              </p>
              
              {candidates.map((c) => (
                <div key={c.appId} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all hover:border-blue-300">
                  <div className="flex flex-col sm:flex-row items-start justify-between gap-5">
                    
                    {/* Identity */}
                    <div className="flex items-start gap-4 flex-1">
                      {c.profileImageUrl ? (
                        <img src={c.profileImageUrl} alt={c.fullName} className="w-14 h-14 rounded-full object-cover shadow-sm border border-slate-100 shrink-0" />
                      ) : (
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-xl shrink-0 shadow-inner">
                          {getInitials(c.fullName)}
                        </div>
                      )}
                      
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <p className="font-extrabold text-slate-900 text-lg">{c.fullName}</p>
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${statusConfig[c.status] || statusConfig.Pending}`}>
                            {c.status}
                          </span>
                        </div>
                        <p className="text-sm font-bold text-blue-600 mb-2">{c.jobTitle}</p>
                        <p className="text-xs font-semibold text-slate-500 mb-3">{c.email}</p>
                        
                        {/* Skills */}
                        {c.skills && c.skills.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {c.skills.map((skill, idx) => (
                              <span key={idx} className="bg-slate-50 border border-slate-100 text-[10px] font-bold px-2.5 py-1 rounded-lg text-slate-600">
                                {skill}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Score & Action */}
                    <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-4 w-full sm:w-auto border-t sm:border-t-0 border-slate-100 pt-4 sm:pt-0">
                      <div className="flex items-center gap-3">
                        <div className="text-right hidden sm:block">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Match Score</p>
                        </div>
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg shadow-sm border
                          ${c.industryScore >= 70 ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 
                            c.industryScore >= 50 ? 'bg-amber-50 border-amber-100 text-amber-600' : 
                            'bg-rose-50 border-rose-100 text-rose-600'}
                        `}>
                          {c.industryScore}%
                        </div>
                      </div>
                      
                      <Link
                        href={`/recruiter/candidates/${c.appId}`}
                        className="text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-600 hover:text-white px-5 py-2.5 rounded-xl transition-all border border-blue-200"
                      >
                        Review Profile
                      </Link>
                    </div>

                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
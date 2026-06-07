'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Plus, Eye, ChevronDown, Loader2 } from 'lucide-react';
import axios from 'axios';
import { auth } from '@/lib/firebaseConfig';

type JobListing = {
  id: string;
  title: string;
  dept: string;
  posted: string;
  applicants: number;
  newApplicants: number;
  matchAvg: number;
  status: 'Active' | 'Closed';
};

const statusConfig: Record<string, { bg: string; text: string }> = {
  Active: { bg: 'bg-green-100', text: 'text-green-700' },
  Closed: { bg: 'bg-slate-100', text: 'text-slate-500' },
};

const deptColors: Record<string, string> = {
  Design: 'bg-violet-100 text-violet-700',
  Engineering: 'bg-blue-100 text-blue-700',
  Marketing: 'bg-pink-100 text-pink-700',
  Data: 'bg-cyan-100 text-cyan-700',
  'Human Resources': 'bg-amber-100 text-amber-700',
};

const filterStatuses = ['All Jobs', 'Active', 'Closed'];

export default function JobsPage() {
  const [jobsList, setJobsList] = useState<JobListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Jobs');
  const [deptFilter, setDeptFilter] = useState('Department: All');
  const [sortBy, setSortBy] = useState('Newest First');

  useEffect(() => {
    const fetchCompanyJobs = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;
        const token = await user.getIdToken();

        const response = await axios.get("http://localhost:5167/api/CompanyJob/list", {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log("BACKEND DATA:", response.data);
        setJobsList(response.data);
      } catch (error) {
        console.error("Failed to fetch jobs:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) fetchCompanyJobs();
    });

    return () => unsubscribe();
  }, []);

  // Extract unique departments for the dropdown
  const deptFilters = Array.from(new Set(jobsList.map(j => j.dept)));

  // Filter logic
  const filteredJobs = jobsList.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(search.toLowerCase()) || 
                          job.id.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'All Jobs' || job.status === statusFilter;
    const matchesDept = deptFilter === 'Department: All' || job.dept === deptFilter;
    return matchesSearch && matchesStatus && matchesDept;
  });

  // Sort logic
  const sortedJobs = [...filteredJobs].sort((a, b) => {
    if (sortBy === 'Most Applicants') return b.applicants - a.applicants;
    if (sortBy === 'Match Average') return b.matchAvg - a.matchAvg;
    return 0; // Default ordering handled by DB
  });

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen"><Loader2 className="animate-spin text-blue-600" size={48} /></div>;
  }

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Job Management</p>
          <h1 className="text-2xl font-extrabold text-slate-900">Active & Past Postings</h1>
        </div>
        <Link href="/recruiter/post-job" className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-sm">
          <Plus size={15} /> Post New Job
        </Link>
      </div>

      {/* Filters Row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search title or ID..." 
            className="pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-56 shadow-sm" 
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {filterStatuses.map(f => (
            <button 
              key={f} 
              onClick={() => setStatusFilter(f)}
              className={`px-4 py-2 text-xs font-bold rounded-xl border transition-colors shadow-sm ${f === statusFilter ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="relative ml-auto w-full sm:w-auto">
          <select 
            value={deptFilter}
            onChange={e => setDeptFilter(e.target.value)}
            className="appearance-none w-full sm:w-auto pl-4 pr-10 py-2.5 text-sm font-semibold border border-slate-200 rounded-xl bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-sm"
          >
            <option>Department: All</option>
            {deptFilters.map(d => <option key={d}>{d}</option>)}
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>
        <div className="relative w-full sm:w-auto">
          <select 
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="appearance-none w-full sm:w-auto pl-4 pr-10 py-2.5 text-sm font-semibold border border-slate-200 rounded-xl bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-sm"
          >
            <option>Newest First</option>
            <option>Most Applicants</option>
            <option>Match Average</option>
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden animate-in fade-in duration-300">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="text-left px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Job Title</th>
                <th className="text-left px-4 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Department</th>
                <th className="text-left px-4 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Applicants</th>
                <th className="text-left px-4 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Match Avg</th>
                <th className="text-left px-4 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="text-left px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedJobs.length > 0 ? (
                sortedJobs.map(({ title, id, posted, dept, applicants, newApplicants, matchAvg, status }) => (
                  <tr key={id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-900">{title}</p>
                      <p className="text-xs font-semibold text-slate-400 mt-0.5">{posted}</p>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${deptColors[dept] || 'bg-slate-100 text-slate-600'}`}>
                        {dept}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <p className="font-extrabold text-slate-900 text-base">{applicants}</p>
                        {newApplicants > 0 && <span className="bg-green-100 text-green-700 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">+{newApplicants} New</span>}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        {applicants > 0 ? (
                          <div className="w-10 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 font-bold text-xs shadow-sm">
                            {matchAvg}%
                          </div>
                        ) : (
                          <div className="w-10 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 font-bold text-xs">
                            -
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusConfig[status]?.bg} ${statusConfig[status]?.text}`}>
                        {status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Link 
                        href={`/recruiter/jobs/${id}`}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 border border-blue-100 px-4 py-2 rounded-xl hover:bg-blue-100 transition-colors"
                      >
                        <Eye size={14} /> View Applicants
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-16">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                        <Search size={24} className="text-slate-300" />
                      </div>
                      <p className="text-slate-500 font-bold">No jobs found</p>
                      <p className="text-sm text-slate-400 mt-1">Try adjusting your filters or search terms.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/50">
          <span className="text-xs font-bold text-slate-500">Showing {sortedJobs.length} of {jobsList.length} total postings</span>
        </div>
      </div>
    </div>
  );
}
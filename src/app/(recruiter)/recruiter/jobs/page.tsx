'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Plus, Eye, ChevronDown } from 'lucide-react';

const jobs = [
  {
    title: 'Senior Product Designer', id: '#JOB-2491', posted: '2 days ago',
    dept: 'Design', applicants: 48, newApplicants: 12, matchAvg: '85%', status: 'Active',
  },
  {
    title: 'Full Stack Engineer', id: '#JOB-2488', posted: '5 days ago',
    dept: 'Engineering', applicants: 124, newApplicants: 8, matchAvg: '65%', status: 'Active',
  },
  {
    title: 'Marketing Manager', id: '#JOB-2501', posted: '2 hours ago',
    dept: 'Marketing', applicants: 18, newApplicants: 2, matchAvg: '72%', status: 'Draft',
  },
  {
    title: 'Data Scientist', id: '#JOB-2305', posted: '1 week ago',
    dept: 'Data', applicants: 62, newApplicants: 0, matchAvg: '91%', status: 'Closed',
  },
  {
    title: 'Head of HR', id: '#JOB-2495', posted: '1 day ago',
    dept: 'Human Resources', applicants: 0, newApplicants: 0, matchAvg: '—', status: 'Active',
  },
];

const statusConfig: Record<string, { bg: string; text: string }> = {
  Active: { bg: 'bg-green-100', text: 'text-green-700' },
  Draft: { bg: 'bg-amber-100', text: 'text-amber-700' },
  Closed: { bg: 'bg-slate-100', text: 'text-slate-500' },
};

const deptColors: Record<string, string> = {
  Design: 'bg-violet-100 text-violet-700',
  Engineering: 'bg-blue-100 text-blue-700',
  Marketing: 'bg-pink-100 text-pink-700',
  Data: 'bg-cyan-100 text-cyan-700',
  'Human Resources': 'bg-amber-100 text-amber-700',
};

const filterDepts = ['All Jobs', 'Active', 'Draft', 'Closed'];
const deptFilters = ['Data', 'Design', 'Engineering', 'Marketing', 'Human Resources'];

export default function JobsPage() {
  const [jobsList, setJobsList] = useState(jobs);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Jobs');
  const [deptFilter, setDeptFilter] = useState('Department: All');
  const [sortBy, setSortBy] = useState('Newest First');

  useEffect(() => {
    const saved = localStorage.getItem('cvnet_jobs');
    if (saved) {
      try {
        setJobsList(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    } else {
      localStorage.setItem('cvnet_jobs', JSON.stringify(jobs));
    }
  }, []);

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
    if (sortBy === 'Most Applicants') {
      return b.applicants - a.applicants;
    }
    if (sortBy === 'Oldest First') {
      return a.id.localeCompare(b.id);
    }
    // Newest First (default mock)
    return b.id.localeCompare(a.id);
  });

  return (
    <div className="p-6 sm:p-8 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Job Management</p>
          <h1 className="text-2xl font-extrabold text-slate-900">Jobs</h1>
        </div>
        <Link href="/recruiter/post-job" className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors">
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
            placeholder="Search job title or ID..." 
            className="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 w-56" 
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {filterDepts.map(f => (
            <button 
              key={f} 
              onClick={() => setStatusFilter(f)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${f === statusFilter ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="relative ml-auto">
          <select 
            value={deptFilter}
            onChange={e => setDeptFilter(e.target.value)}
            className="appearance-none pl-3 pr-8 py-2 text-sm border border-slate-200 rounded-xl bg-white text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <option>Department: All</option>
            {deptFilters.map(d => <option key={d}>{d}</option>)}
          </select>
          <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>
        <div className="relative">
          <select 
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="appearance-none pl-3 pr-8 py-2 text-sm border border-slate-200 rounded-xl bg-white text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <option>Newest First</option>
            <option>Oldest First</option>
            <option>Most Applicants</option>
          </select>
          <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden animate-in fade-in duration-300">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Job Title</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Department</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Applicants</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Match Avg</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {sortedJobs.length > 0 ? (
                sortedJobs.map(({ title, id, posted, dept, applicants, newApplicants, matchAvg, status }) => (
                  <tr key={id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-900">{title}</p>
                      <p className="text-xs text-slate-400">{id} · Posted {posted}</p>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${deptColors[dept] || 'bg-slate-100 text-slate-600'}`}>{dept}</span>
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-semibold text-slate-900">{applicants}</p>
                      {newApplicants > 0 && <p className="text-xs text-green-600 font-medium">+{newApplicants} new</p>}
                    </td>
                    <td className="px-4 py-4">
                      <span className={`font-bold text-sm ${matchAvg !== '—' ? 'text-blue-600' : 'text-slate-400'}`}>{matchAvg}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusConfig[status]?.bg} ${statusConfig[status]?.text}`}>{status}</span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex gap-2 flex-wrap">
                        {status === 'Active' && (
                          <Link 
                            href={`/recruiter/jobs/${id.replace('#', '')}`}
                            className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 border border-blue-200 px-2.5 py-1 rounded-lg hover:bg-blue-50 transition-colors"
                          >
                            <Eye size={12} /> View Applicants
                          </Link>
                        )}
                        {status === 'Draft' && (
                          <Link 
                            href="/recruiter/post-job"
                            className="text-xs font-semibold text-amber-600 border border-amber-200 px-2.5 py-1 rounded-lg hover:bg-amber-50 transition-colors"
                          >
                            Continue Edit
                          </Link>
                        )}
                        {status === 'Closed' && (
                          <button 
                            onClick={() => alert(`Reposting ${title}...`)}
                            className="text-xs font-semibold text-slate-600 border border-slate-200 px-2.5 py-1 rounded-lg hover:bg-slate-50 transition-colors"
                          >
                            Repost
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-400">
                    No jobs found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-slate-100 text-xs text-slate-400">
          <span>Showing {sortedJobs.length} of {jobsList.length} results</span>
          <div className="flex gap-1">
            <button className="px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50">1</button>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, SlidersHorizontal, Plus, ChevronDown } from 'lucide-react';

const candidates = [
  {
    initials: 'SJ', name: 'Sarah Jenkins', email: 'sarah.j@example.com',
    skills: ['Product Design', 'Figma', '+3 more'], experience: '6 Years',
    match: 95, status: 'Interview', bg: 'bg-blue-100', text: 'text-blue-700',
  },
  {
    initials: 'MC', name: 'Michael Chen', email: 'm.chen@dev.io',
    skills: ['Python', 'Django', 'PostgreSQL'], experience: '4 Years',
    match: 88, status: 'Technical Test', bg: 'bg-violet-100', text: 'text-violet-700',
  },
  {
    initials: 'DR', name: 'David Ross', email: 'd.ross@mail.com',
    skills: ['Data Science', 'Python'], experience: '3 Years',
    match: 82, status: 'Screening', bg: 'bg-emerald-100', text: 'text-emerald-700',
  },
  {
    initials: 'AL', name: 'Amanda Lee', email: 'amanda.l@design.co',
    skills: ['UX Research', 'Wireframing'], experience: '5 Years',
    match: 65, status: 'Applied', bg: 'bg-amber-100', text: 'text-amber-700',
  },
  {
    initials: 'JW', name: 'James Wilson', email: 'j.wilson@tech.net',
    skills: ['Java', 'Spring Boot', '+2 more'], experience: '8 Years',
    match: 78, status: 'Applied', bg: 'bg-blue-100', text: 'text-blue-700',
  },
  {
    initials: 'EP', name: 'Emma Parker', email: 'emma.p@marketing.io',
    skills: ['SEO', 'Content'], experience: '2 Years',
    match: 45, status: 'Rejected', bg: 'bg-rose-100', text: 'text-rose-700',
  },
];

const matchRanges = [
  { label: '90% - 100%', count: 12 },
  { label: '80% - 89%', count: 24 },
  { label: '70% - 79%', count: 45 },
  { label: '< 70%', count: 156 },
];

const filterSkills = ['Python', 'React', 'Figma', 'SQL', 'Marketing'];
const filterLocations = ['San Francisco, CA', 'New York, NY', 'London, UK', 'Remote'];

const statusConfig: Record<string, string> = {
  Interview: 'bg-blue-100 text-blue-700',
  'Technical Test': 'bg-violet-100 text-violet-700',
  Screening: 'bg-amber-100 text-amber-700',
  Applied: 'bg-slate-100 text-slate-600',
  Rejected: 'bg-red-100 text-red-700',
};

export default function CandidatesPage() {
  const [search, setSearch] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

  const filtered = candidates.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  const toggleSkill = (skill: string) =>
    setSelectedSkills(s => s.includes(skill) ? s.filter(x => x !== skill) : [...s, skill]);

  return (
    <div className="p-6 sm:p-8 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Candidates Directory</p>
          <h1 className="text-2xl font-extrabold text-slate-900">Candidates</h1>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors">
          <Plus size={15} /> Add Candidate
        </button>
      </div>

      <div className="flex gap-6">
        {/* Filters Sidebar */}
        <div className="hidden lg:block w-56 flex-shrink-0 space-y-5">
          <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-800">Filters</h3>
              <button className="text-xs text-blue-600 font-semibold hover:text-blue-700">Clear all</button>
            </div>

            <div className="mb-4">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Match Percentage</h4>
              <div className="space-y-1">
                {matchRanges.map(({ label, count }) => (
                  <label key={label} className="flex items-center justify-between py-1 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <input type="checkbox" className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                      <span className="text-xs text-slate-600">{label}</span>
                    </div>
                    <span className="text-xs text-slate-400">{count}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="mb-4 pt-4 border-t border-slate-100">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Skills</h4>
              <div className="relative mb-2">
                <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input placeholder="Find skill..." className="w-full pl-7 pr-2 py-1.5 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-1 focus:ring-blue-500" />
              </div>
              <div className="flex flex-wrap gap-1">
                {filterSkills.map(skill => (
                  <button key={skill} onClick={() => toggleSkill(skill)} className={`text-xs px-2 py-1 rounded-full border transition-colors ${selectedSkills.includes(skill) ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300'}`}>{skill}</button>
                ))}
              </div>
            </div>

            <div className="mb-4 pt-4 border-t border-slate-100">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Location</h4>
              {filterLocations.map(loc => (
                <label key={loc} className="flex items-center gap-2 py-0.5 cursor-pointer">
                  <input type="checkbox" className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                  <span className="text-xs text-slate-600">{loc}</span>
                </label>
              ))}
            </div>

            <div className="pt-4 border-t border-slate-100">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Experience</h4>
              <div className="flex gap-2">
                <input placeholder="Min" className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500" />
                <span className="text-xs text-slate-400 self-center">–</span>
                <input placeholder="Max" className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Candidates List */}
        <div className="flex-1">
          {/* Search + Sort */}
          <div className="flex items-center gap-3 mb-4">
            <div className="relative flex-1 max-w-xs">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by name, email..."
                className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="relative">
              <select 
                aria-label="Sort candidates"
                className="appearance-none pl-3 pr-8 py-2 text-sm border border-slate-200 rounded-xl bg-white text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option>Match Score</option>
                <option>Experience</option>
                <option>Name A-Z</option>
              </select>
              <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
            <button 
              aria-label="Filter candidates"
              className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors lg:hidden"
            >
              <SlidersHorizontal size={16} className="text-slate-600" />
            </button>
          </div>

          <p className="text-xs text-slate-400 mb-4">Showing {filtered.length} of 237 candidates</p>

          <div className="space-y-3">
            {filtered.map(({ initials, name, email, skills, experience, match, status, bg, text }) => (
              <div key={email} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full ${bg} ${text} flex items-center justify-center text-sm font-bold flex-shrink-0`}>
                      {initials}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{name}</p>
                      <p className="text-xs text-slate-400">{email}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {skills.map(s => (
                          <span key={s} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{s}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 flex-wrap">
                    <div className="text-center">
                      <p className="text-xs text-slate-400">Experience</p>
                      <p className="text-sm font-bold text-slate-900">{experience}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-slate-400">Match Score</p>
                      <p className={`text-lg font-extrabold ${match >= 80 ? 'text-green-600' : match >= 60 ? 'text-amber-500' : 'text-red-500'}`}>{match}%</p>
                    </div>
                    <div>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusConfig[status]}`}>{status}</span>
                    </div>
                    <Link
                      href={`/recruiter/candidates/${email}`}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-700 border border-blue-200 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      View Profile
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-5">
            <p className="text-xs text-slate-400">Showing {filtered.length} of 237</p>
            <div className="flex gap-1">
              <button className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50">Previous</button>
              {[1, 2, 3].map(n => (
                <button key={n} className={`px-3 py-1.5 text-xs rounded-lg ${n === 1 ? 'bg-blue-600 text-white' : 'border border-slate-200 text-slate-500 hover:bg-slate-50'}`}>{n}</button>
              ))}
              <button className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50">Next</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useState } from "react";
import { Search, ChevronDown, ArrowUpDown, Briefcase } from "lucide-react";

type Application = {
  role: string;
  company: string;
  location: string;
  date: string;
  match: number;
  status: string;
};

const seedApplications: Application[] = [
  {
    role: "Senior Frontend Developer",
    company: "TechCorp Inc.",
    location: "Remote",
    date: "Oct 24, 2023",
    match: 92,
    status: "In Review",
  },
  {
    role: "Product Designer",
    company: "Design Studio",
    location: "New York",
    date: "Oct 20, 2023",
    match: 88,
    status: "Interviewing",
  },
  {
    role: "Senior React Engineer",
    company: "Global Systems",
    location: "Remote",
    date: "Oct 18, 2023",
    match: 65,
    status: "Applied",
  },
  {
    role: "UX Researcher",
    company: "InnovateLab",
    location: "San Francisco",
    date: "Oct 15, 2023",
    match: 95,
    status: "Offer Received",
  },
  {
    role: "Full Stack Dev",
    company: "Future Web",
    location: "Remote",
    date: "Oct 12, 2023",
    match: 45,
    status: "Rejected",
  },
  {
    role: "Backend Engineer",
    company: "FintechFlow",
    location: "London",
    date: "Oct 10, 2023",
    match: 85,
    status: "Applied",
  },
  {
    role: "Engineering Manager",
    company: "PayGrid",
    location: "Remote",
    date: "Oct 8, 2023",
    match: 72,
    status: "In Review",
  },
];

const statusConfig: Record<string, { bg: string; text: string }> = {
  "In Review": { bg: "bg-amber-100", text: "text-amber-700" },
  Interviewing: { bg: "bg-blue-100", text: "text-blue-700" },
  Applied: { bg: "bg-slate-100", text: "text-slate-600" },
  "Offer Received": { bg: "bg-green-100", text: "text-green-700" },
  Rejected: { bg: "bg-red-100", text: "text-red-700" },
};

const stats = [{ label: "Total Applied", value: 24, change: "" }];

function getMatchBarWidthClass(match: number) {
  if (match >= 95) return "w-[95%]";
  if (match >= 90) return "w-[90%]";
  if (match >= 85) return "w-[85%]";
  if (match >= 75) return "w-[75%]";
  if (match >= 65) return "w-[65%]";
  if (match >= 50) return "w-[50%]";
  return "w-[40%]";
}

export default function ApplicationsPage() {
  const [applications, setApplications] =
    useState<Application[]>(seedApplications);
  const [filterStatus, setFilterStatus] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const statuses = ["All", "In Review", "Interviewing", "Applied", "Rejected"];

  const filtered = applications.filter((a) => {
    const matchesStatus = filterStatus === "All" || a.status === filterStatus;
    const matchesSearch =
      a.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.company.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="p-6 sm:p-8 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            My Applications
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Track and manage your job search
          </p>
        </div>
        <Link
          href="/applications/jobs"
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
        >
          <Briefcase size={16} /> Apply here
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 gap-4 mb-6 sm:max-w-xs">
        {stats.map(({ label, value, change }) => (
          <div
            key={label}
            className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm"
          >
            <p className="text-sm font-medium text-slate-500 mb-1">{label}</p>
            <p className="text-3xl font-extrabold text-slate-900">{value}</p>
            {change && <p className="text-xs text-slate-400 mt-1">{change}</p>}
          </div>
        ))}
      </div>

      {/* Table Card */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-6 py-4 border-b border-slate-100">
          <div className="relative">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search applications..."
              className="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 w-56 focus:bg-white transition-all"
            />
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                aria-label="Filter applications by status"
                className="appearance-none pl-3 pr-8 py-2 text-sm border border-slate-200 rounded-xl bg-white text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                {statuses.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
              <ChevronDown
                size={14}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
            </div>
            <button className="flex items-center gap-1.5 px-3 py-2 text-sm border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors">
              <ArrowUpDown size={13} /> Sort by: Newest
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Role / Company
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Applied Date
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map(({ role, company, location, date }) => (
                <tr
                  key={role + company}
                  className="hover:bg-slate-50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <p className="font-semibold text-slate-900">{role}</p>
                    <p className="text-xs text-slate-400">
                      {company} · {location}
                    </p>
                  </td>
                  <td className="px-4 py-4 text-xs text-slate-500 whitespace-nowrap">
                    {date}
                  </td>
                  <td className="px-4 py-4">
                    <button className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-colors">
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-slate-100">
          <p className="text-xs text-slate-400">
            Showing 1–{filtered.length} of {applications.length} entries
          </p>
          <div className="flex gap-1">
            <button className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50 transition-colors">
              Previous
            </button>
            {[1, 2, 3].map((n) => (
              <button
                key={n}
                className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${n === 1 ? "bg-blue-600 text-white" : "border border-slate-200 text-slate-500 hover:bg-slate-50"}`}
              >
                {n}
              </button>
            ))}
            <button className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

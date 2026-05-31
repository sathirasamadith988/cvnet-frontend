"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Search, ChevronDown, ArrowUpDown, Briefcase, Loader2 } from "lucide-react";
import axios from "axios";
import { auth } from "@/lib/firebaseConfig";

export type ApplicationRecord = {
  id: string;
  role: string;
  company: string;
  location: string;
  date: string;
  status: string;
};

// Brought status config inline to ensure styling is completely bulletproof
const statusConfig: Record<string, { label: string; bg: string; text: string }> = {
  "Pending": { label: "Pending", bg: "bg-slate-100", text: "text-slate-600" },
  "In Review": { label: "In Review", bg: "bg-blue-100", text: "text-blue-700" },
  "Interviewing": { label: "Interviewing", bg: "bg-purple-100", text: "text-purple-700" },
  "Offer Received": { label: "Offer Received", bg: "bg-green-100", text: "text-green-700" },
  "Rejected": { label: "Rejected", bg: "bg-red-100", text: "text-red-700" },
};

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<ApplicationRecord[]>([]);
  const [filterStatus, setFilterStatus] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;
        
        const token = await user.getIdToken();
        const response = await axios.get("http://localhost:5167/api/Application/my-applications", {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setApplications(response.data);
      } catch (error) {
        console.error("Failed to fetch applications:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) fetchApplications();
      else setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const statuses = ["All", ...Object.keys(statusConfig)];

  const filtered = applications.filter((a) => {
    const matchesStatus = filterStatus === "All" || a.status === filterStatus;
    const matchesSearch =
      a.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.company.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const stats = useMemo(
    () => [
      { label: "Total Applied", value: filtered.length, change: "" },
      {
        label: "Rejected Applications",
        value: filtered.filter((application) => application.status === "Rejected").length,
        change: "",
      },
      {
        label: "Offers Received",
        value: filtered.filter((application) => application.status === "Offer Received").length,
        change: "",
      },
    ],
    [filtered]
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">My Applications</h1>
          <p className="text-slate-500 text-sm mt-0.5">Track and manage your job search</p>
        </div>
        <Link
          href="/applications/jobs"
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors shrink-0"
        >
          <Briefcase size={16} /> Apply here
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 gap-4 mb-6 sm:grid-cols-3">
        {stats.map(({ label, value, change }) => (
          <div key={label} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500 mb-1">{label}</p>
            <p className="text-3xl font-extrabold text-slate-900">{value}</p>
            {change && <p className="text-xs text-slate-400 mt-1">{change}</p>}
          </div>
        ))}
      </div>

      {/* Table Card */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="relative w-full sm:w-auto">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search applications..."
              className="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 w-full sm:w-64 transition-all"
            />
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-auto">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                aria-label="Filter applications by status"
                className="appearance-none w-full pl-3 pr-8 py-2 text-sm font-semibold border border-slate-200 rounded-xl bg-white text-slate-700 focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                {statuses.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
            <button className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold border border-slate-200 rounded-xl text-slate-600 bg-white hover:bg-slate-50 transition-colors shrink-0">
              <ArrowUpDown size={13} /> Sort by: Newest
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-left px-6 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Role / Company</th>
                <th className="text-left px-4 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="text-left px-4 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Applied Date</th>
                <th className="text-left px-4 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                    No applications found matching your criteria.
                  </td>
                </tr>
              ) : (
                filtered.map(({ id, role, company, location, date, status }) => (
                  <tr key={id} className="hover:bg-blue-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-900">{role}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{company} · {location || "Remote"}</p>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex rounded-md px-2.5 py-1 text-[11px] uppercase tracking-wider font-extrabold ${statusConfig[status]?.bg || "bg-slate-100"} ${statusConfig[status]?.text || "text-slate-600"}`}>
                        {statusConfig[status]?.label || status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-xs font-semibold text-slate-600 whitespace-nowrap">
                      {date}
                    </td>
                    <td className="px-4 py-4">
                      <Link
                        href={`/applications/${id}`}
                        className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filtered.length > 0 && (
          <div className="flex items-center justify-between px-6 py-3 border-t border-slate-100 bg-slate-50/50">
            <p className="text-xs font-medium text-slate-500">
              Showing 1–{filtered.length} of {applications.length} entries
            </p>
            <div className="flex gap-1">
              <button className="px-3 py-1.5 text-xs font-semibold border border-slate-200 rounded-lg text-slate-500 bg-white hover:bg-slate-50 transition-colors">
                Previous
              </button>
              <button className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 text-white transition-colors">
                1
              </button>
              <button className="px-3 py-1.5 text-xs font-semibold border border-slate-200 rounded-lg text-slate-500 bg-white hover:bg-slate-50 transition-colors">
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
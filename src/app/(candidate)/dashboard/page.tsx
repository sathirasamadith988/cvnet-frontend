"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Bell,
  TrendingUp,
  Briefcase,
  BarChart2,
  ArrowRight,
  ExternalLink,
  Search,
} from "lucide-react";
import {
  defaultApplications,
  getApplicationsFromStorage,
  type ApplicationRecord,
} from "../../../lib/applications";
import { skillMatchScore } from "../../../lib/skill-gap-data";

const readinessScore = 78;

const topMissingSkills = [
  {
    name: "Python",
    priority: "Critical",
    match: 60,
    color: "bg-red-500",
    widthClass: "w-[60%]",
  },
  {
    name: "AWS",
    priority: "Critical",
    match: 45,
    color: "bg-red-500",
    widthClass: "w-[45%]",
  },
  {
    name: "Leadership",
    priority: "Medium",
    match: 30,
    color: "bg-amber-500",
    widthClass: "w-[30%]",
  },
  {
    name: "SQL",
    priority: "Medium",
    match: 60,
    color: "bg-amber-500",
    widthClass: "w-[60%]",
  },
  {
    name: "Cloud Architecture",
    priority: "Low Priority",
    match: 20,
    color: "bg-slate-400",
    widthClass: "w-[20%]",
  },
  {
    name: "Team Management",
    priority: "Low Priority",
    match: 30,
    color: "bg-slate-400",
    widthClass: "w-[30%]",
  },
];

const recentApplications = [
  {
    role: "Senior Frontend Developer",
    company: "TechCorp Inc.",
    date: "Oct 24, 2023",
    status: "In Review",
    match: 92,
  },
  {
    role: "Product Designer",
    company: "Design Studio",
    date: "Oct 20, 2023",
    status: "Interview",
    match: 78,
  },
];

const jobCategories = [
  "Technology & IT",
  "Business & Management",
  "Finance & Accounting",
  "Marketing & Advertising",
  "Sales & Customer Relations",
];

const rolesByCategory: Record<string, string[]> = {
  "Technology & IT": [
    "Frontend Developer",
    "Backend Developer",
    "DevOps Engineer",
    "Data Scientist",
  ],
  "Business & Management": ["Product Manager", "Business Analyst"],
  "Finance & Accounting": ["Accountant", "Financial Analyst"],
  "Marketing & Advertising": ["Marketing Manager", "SEO Specialist"],
  "Sales & Customer Relations": ["Sales Executive", "Account Manager"],
};

const mockApplications = [
  {
    role: "Senior Frontend Developer",
    company: "TechCorp Inc.",
    date: "Oct 24, 2023",
    status: "In Review",
    match: 92,
    category: "Technology & IT",
  },
  {
    role: "DevOps Engineer",
    company: "CloudWorks",
    date: "Nov 2, 2023",
    status: "Applied",
    match: 68,
    category: "Technology & IT",
  },
  {
    role: "Product Manager",
    company: "BizCorp",
    date: "Sep 9, 2023",
    status: "Interview",
    match: 75,
    category: "Business & Management",
  },
  {
    role: "Marketing Manager",
    company: "AdWorks",
    date: "Aug 12, 2023",
    status: "Rejected",
    match: 40,
    category: "Marketing & Advertising",
  },
];

const statusColors: Record<string, string> = {
  "In Review": "bg-amber-100 text-amber-700",
  Interview: "bg-blue-100 text-blue-700",
  Applied: "bg-slate-100 text-slate-600",
  Rejected: "bg-red-100 text-red-700",
  Offer: "bg-green-100 text-green-700",
};

export default function DashboardPage() {
  const [applications, setApplications] =
    useState<ApplicationRecord[]>(defaultApplications);

  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedRole, setSelectedRole] = useState<string>("");

  useEffect(() => {
    const syncApplications = () => {
      setApplications(getApplicationsFromStorage());
    };

    syncApplications();
    window.addEventListener("storage", syncApplications);

    return () => {
      window.removeEventListener("storage", syncApplications);
    };
  }, []);

  const applicationSummary = useMemo(() => {
    const appliedJobs = applications.filter(({ status }) =>
      ["In Review", "Application Closed", "Offer Received"].includes(status),
    ).length;
    const requests = applications.filter(
      ({ status }) => status === "Call for Interview",
    ).length;
    const rejects = applications.filter(
      ({ status }) => status === "Rejected",
    ).length;

    return {
      totalApplied: applications.length,
      appliedJobs,
      requests,
      rejects,
    };
  }, [applications]);

  const availableRoles = useMemo(() => {
    if (!selectedCategory) return Object.values(rolesByCategory).flat();
    return rolesByCategory[selectedCategory] ?? [];
  }, [selectedCategory]);

  const filteredApplications = useMemo(() => {
    return mockApplications.filter((a) => {
      if (selectedCategory && a.category !== selectedCategory) return false;
      if (
        selectedRole &&
        !a.role.toLowerCase().includes(selectedRole.toLowerCase())
      )
        return false;
      return true;
    });
  }, [selectedCategory, selectedRole]);

  const filteredSummary = useMemo(() => {
    const appliedJobs = filteredApplications.filter(({ status }) =>
      ["In Review", "Applied", "Interview", "Offer"].includes(status),
    ).length;
    const requests = filteredApplications.filter(
      ({ status }) => status === "Interview",
    ).length;
    const rejects = filteredApplications.filter(
      ({ status }) => status === "Rejected",
    ).length;

    return {
      totalApplied: filteredApplications.length,
      appliedJobs,
      requests,
      rejects,
    };
  }, [filteredApplications]);

  const displayReadiness = useMemo(() => {
    let val = readinessScore;
    if (selectedCategory) val += 5;
    if (selectedRole) val += 2;
    return Math.min(100, val);
  }, [selectedCategory, selectedRole]);

  const displaySkillMatch = useMemo(() => {
    let val = skillMatchScore;
    if (selectedCategory) val = Math.min(100, val + 3);
    if (selectedRole) val = Math.min(100, val + 1);
    return val;
  }, [selectedCategory, selectedRole]);

  const displayedRecent = useMemo(() => {
    return filteredApplications.length
      ? filteredApplications
      : recentApplications;
  }, [filteredApplications]);

  const pieSegments = useMemo(
    () => [
      {
        label: "Applied Jobs",
        value: applicationSummary.appliedJobs,
        color: "#2563eb",
        bg: "bg-blue-600",
      },
      {
        label: "Rejects",
        value: applicationSummary.rejects,
        color: "#ef4444",
        bg: "bg-red-500",
      },
      {
        label: "Request Jobs",
        value: applicationSummary.requests,
        color: "#f59e0b",
        bg: "bg-amber-500",
      },
    ],
    [
      applicationSummary.appliedJobs,
      applicationSummary.rejects,
      applicationSummary.requests,
    ],
  );

  const chartRadius = 44;
  const chartCircumference = 2 * Math.PI * chartRadius;
  const chartSegments = useMemo(() => {
    const total = pieSegments.reduce((sum, segment) => sum + segment.value, 0);

    if (!total) {
      return [];
    }

    let consumed = 0;

    return pieSegments.map(({ value, color }) => {
      const length = (value / total) * chartCircumference;
      const offset = consumed;
      consumed += length;

      return { color, length, offset };
    });
  }, [chartCircumference, pieSegments]);

  const stats = [
    {
      label: "Readiness Score",
      value: `${displayReadiness}/100`,
      sub: "Good",
      color: "text-blue-600",
      bg: "bg-blue-50",
      icon: TrendingUp,
    },
    {
      label: "Skill Match",
      value: `${displaySkillMatch}%`,
      sub: "From skill gap analysis",
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      icon: BarChart2,
    },
    {
      label: "Total Applied Count",
      value: String(
        filteredSummary.totalApplied ?? applicationSummary.totalApplied,
      ),
      sub: "Across saved applications",
      color: "text-violet-600",
      bg: "bg-violet-50",
      icon: Briefcase,
    },
  ];

  return (
    <div className="p-6 sm:p-8 max-w-7xl">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            Welcome back, Alex
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Here&apos;s what&apos;s happening with your career today.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/applications/jobs"
            className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-white px-4 py-2 text-sm font-semibold text-blue-700 shadow-sm transition-colors hover:bg-blue-50"
          >
            <Search size={16} /> Search Jobs &amp; Skills
          </Link>
          <button
            aria-label="Notifications"
            className="relative p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
          >
            <Bell size={18} className="text-slate-600" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </button>
        </div>
      </div>

      {/* Profile Readiness Banner */}
      <div className="bg-linear-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 mb-6 text-white">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-blue-100 text-sm font-medium mb-1">
              Ready for your next big role?
            </p>
            <p className="text-base font-semibold">
              Your profile readiness has increased by <strong>5%</strong> this
              week. Keep going!
            </p>
            <div className="flex gap-6 mt-3 text-sm">
              <span className="flex items-center gap-1.5">
                <TrendingUp size={14} className="text-green-300" />
                <strong>+5%</strong> Readiness
              </span>
              <span className="flex items-center gap-1.5">
                <BarChart2 size={14} className="text-blue-200" />
                <strong>+12%</strong> Skill Match
              </span>
              <span className="flex items-center gap-1.5">
                <Briefcase size={14} className="text-violet-200" />
                <strong>+20%</strong> Applied Jobs
              </span>
            </div>
          </div>
          <div className="flex gap-3 shrink-0">
            <Link
              href="/cv"
              className="bg-white text-blue-600 font-semibold text-sm px-4 py-2 rounded-xl hover:bg-blue-50 transition-colors whitespace-nowrap"
            >
              View Profile
            </Link>
            <Link
              href="/skill-gap"
              className="border border-blue-300 text-white font-semibold text-sm px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors whitespace-nowrap"
            >
              Update Skills
            </Link>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-100 rounded-2xl p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3 items-center">
          <div className="w-full sm:w-1/2">
            <label className="text-xs font-medium text-slate-500 mb-1 block">
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setSelectedRole("");
              }}
              className="w-full rounded-xl border border-slate-100 px-3 py-2 text-sm"
            >
              <option value="">All categories</option>
              {jobCategories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="w-full sm:w-1/2">
            <label className="text-xs font-medium text-slate-500 mb-1 block">
              Role
            </label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full rounded-xl border border-slate-100 px-3 py-2 text-sm"
            >
              <option value="">All roles</option>
              {availableRoles.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {stats.map(({ label, value, sub, color, bg, icon: Icon }) => (
          <div
            key={label}
            className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm"
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-slate-500">{label}</p>
              <div
                className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center`}
              >
                <Icon size={17} className={color} />
              </div>
            </div>
            <p className={`text-2xl font-extrabold ${color}`}>{value}</p>
            <p className="text-xs text-slate-400 mt-1">{sub}</p>
          </div>
        ))}
      </div>

      {/* Application Status Pie Chart */}
      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm mb-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-bold text-slate-900">Application Breakdown</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Applied jobs, requests, and rejects from your frontend application
              data
            </p>
          </div>
          <Link
            href="/applications/jobs"
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            Apply here <ArrowRight size={12} />
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-[auto_1fr] lg:items-center">
          <div className="flex items-center justify-center">
            <svg
              viewBox="0 0 120 120"
              className="h-48 w-48 drop-shadow-sm"
              aria-label="Application breakdown pie chart"
            >
              <circle
                cx="60"
                cy="60"
                r={chartRadius}
                fill="none"
                stroke="#e2e8f0"
                strokeWidth="18"
              />
              {chartSegments.map(({ color, length, offset }) => (
                <circle
                  key={`${color}-${offset}`}
                  cx="60"
                  cy="60"
                  r={chartRadius}
                  fill="none"
                  stroke={color}
                  strokeWidth="18"
                  strokeDasharray={`${length} ${chartCircumference - length}`}
                  strokeDashoffset={-offset}
                  transform="rotate(-90 60 60)"
                  strokeLinecap="round"
                />
              ))}
              <circle cx="60" cy="60" r="34" fill="white" />
              <text
                x="60"
                y="57"
                textAnchor="middle"
                className="fill-slate-900 text-[18px] font-extrabold"
              >
                {applicationSummary.totalApplied}
              </text>
              <text
                x="60"
                y="72"
                textAnchor="middle"
                className="fill-slate-400 text-[8px] font-medium"
              >
                Total applied
              </text>
            </svg>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {pieSegments.map(({ label, value, bg }) => (
              <div
                key={label}
                className="rounded-2xl border border-slate-100 bg-slate-50 p-4"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className={`h-3 w-3 rounded-full ${bg}`} />
                  <p className="text-sm font-semibold text-slate-700">
                    {label}
                  </p>
                </div>
                <p className="text-2xl font-extrabold text-slate-900">
                  {value}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  {applicationSummary.totalApplied
                    ? Math.round(
                        (value / applicationSummary.totalApplied) * 100,
                      )
                    : 0}
                  % of total
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom two columns */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Skills Gap Widget */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-bold text-slate-900">Skills Gap Analysis</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Candidate vs. Job Requirements
              </p>
            </div>
            <Link
              href="/skill-gap"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              View Details <ArrowRight size={12} />
            </Link>
          </div>

          <div className="mb-4">
            <div className="flex justify-between text-xs text-slate-500 mb-1.5">
              <span>React (Your Skill)</span>
              <span>Job Requirement</span>
            </div>
            <div className="relative bg-slate-100 rounded-full h-3">
              <div className="absolute left-0 top-0 h-full w-[70%] bg-blue-500 rounded-full" />
              <div className="absolute top-0 h-full border-r-2 border-slate-900 left-[85%]" />
            </div>
          </div>

          <h3 className="text-sm font-semibold text-slate-700 mb-3">
            Top Missing Skills
          </h3>
          <div className="space-y-2.5">
            {topMissingSkills
              .slice(0, 4)
              .map(({ name, priority, color, widthClass }) => (
                <div key={name} className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-slate-700">
                        {name}
                      </span>
                      <span
                        className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${priority === "Critical" ? "bg-red-100 text-red-600" : priority === "Medium" ? "bg-amber-100 text-amber-600" : "bg-slate-100 text-slate-500"}`}
                      >
                        {priority}
                      </span>
                    </div>
                    <div className="bg-slate-100 rounded-full h-1.5">
                      <div
                        className={`${color} h-full rounded-full ${widthClass}`}
                      />
                    </div>
                  </div>
                </div>
              ))}
          </div>
          <Link
            href="/skill-gap"
            className="mt-4 flex items-center justify-center gap-1 text-xs text-blue-600 font-semibold hover:text-blue-700"
          >
            Find Courses <ExternalLink size={11} />
          </Link>
        </div>

        {/* Recent Applications */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-bold text-slate-900">Recent Applications</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Your latest job applications
              </p>
            </div>
            <Link
              href="/applications"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              View All <ArrowRight size={12} />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left pb-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="text-left pb-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="text-left pb-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {displayedRecent.map(
                  ({ role, company, date, status, match }) => (
                    <tr
                      key={role}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="py-3 pr-4">
                        <p className="font-semibold text-slate-900 text-sm">
                          {role}
                        </p>
                        <p className="text-xs text-slate-400">{company}</p>
                      </td>
                      <td className="py-3 pr-4 text-xs text-slate-500 whitespace-nowrap">
                        {date}
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColors[status]}`}
                          >
                            {status}
                          </span>
                          <span className="text-xs font-bold text-blue-600">
                            {match}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-5 pt-5 border-t border-slate-100">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <Briefcase size={15} className="text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  Suggested: AWS Solutions Architect
                </p>
                <p className="text-xs text-slate-400">
                  Course recommendation based on your gaps
                </p>
              </div>
            </div>
            <Link
              href="/skill-gap"
              className="block w-full text-center bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-xs py-2.5 rounded-xl transition-colors"
            >
              Explore Recommended Courses
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

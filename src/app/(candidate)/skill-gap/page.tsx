import Link from "next/link";
import {
  BookOpen,
  Zap,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Target,
  Code2,
} from "lucide-react";

const matchedSkills = [
  "React",
  "TypeScript",
  "Tailwind",
  "Git",
  "Responsive Design",
  "JavaScript",
  "Redux",
  "REST API",
];
const missingSkills = ["Docker", "GraphQL", "AWS", "Jest"];

const gapBreakdown = [
  {
    skill: "Docker",
    category: "Containerization",
    demand: "High",
    yourLevel: "None Detected",
    required: "Intermediate",
    status: "Critical",
    action: "Find Course",
  },
  {
    skill: "GraphQL",
    category: "API Query Language",
    demand: "Medium",
    yourLevel: "Beginner",
    required: "Advanced",
    status: "Critical",
    action: "Find Course",
  },
  {
    skill: "AWS",
    category: "Cloud Infrastructure",
    demand: "High",
    yourLevel: "None Detected",
    required: "Intermediate",
    status: "Critical",
    action: "Find Course",
  },
  {
    skill: "Jest",
    category: "Testing Framework",
    demand: "Medium",
    yourLevel: "Beginner",
    required: "Intermediate",
    status: "Moderate",
    action: "Find Course",
  },
  {
    skill: "TypeScript",
    category: "Programming Language",
    demand: "High",
    yourLevel: "Expert",
    required: "Expert",
    status: "Matched",
    action: "Review",
  },
  {
    skill: "React.js",
    category: "Frontend Framework",
    demand: "High",
    yourLevel: "Beginner",
    required: "Intermediate",
    status: "Minor",
    action: "Practice",
  },
];

const statusConfig: Record<string, { bg: string; text: string }> = {
  Critical: { bg: "bg-red-100", text: "text-red-700" },
  Moderate: { bg: "bg-amber-100", text: "text-amber-700" },
  Minor: { bg: "bg-yellow-100", text: "text-yellow-700" },
  Matched: { bg: "bg-green-100", text: "text-green-700" },
};

const demandConfig: Record<string, string> = {
  High: "text-red-600 font-semibold",
  Medium: "text-amber-600 font-semibold",
  Low: "text-slate-500",
};

export default function SkillGapPage() {
  const matchScore = 68;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header with Logo */}
      <div className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Logo */}
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center shadow-lg">
                <Code2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-900">CVNet</h1>
                <p className="text-xs text-slate-500">Career Intelligence</p>
              </div>
            </div>
            <nav className="hidden md:flex items-center gap-6">
              <Link
                href="#"
                className="text-sm text-slate-600 hover:text-slate-900 transition"
              >
                Analysis
              </Link>
              <Link
                href="#"
                className="text-sm text-slate-600 hover:text-slate-900 transition"
              >
                Learning Path
              </Link>
              <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition">
                Profile
              </button>
            </nav>
          </div>
        </div>
      </div>

      <div className="p-6 sm:p-8 max-w-7xl mx-auto">
        {/* Breadcrumb & Subtitle */}
        <div className="mb-8">
          <p className="text-sm text-slate-500 mb-2">
            <span className="text-slate-400">Dashboard</span> →{" "}
            <span className="text-blue-600 font-semibold">
              Skill Gap Analysis
            </span>
          </p>
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-3xl font-extrabold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-8 h-8 text-blue-600" />
                Skill Gap Analysis
              </h2>
              <p className="text-slate-500 text-sm mt-1">
                Deep dive into your market readiness and personalized
                development roadmap
              </p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-6">
          {/* Target Role Card */}
          <div className="lg:col-span-2 bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex flex-col sm:flex-row items-start justify-between gap-4 mb-6">
              <div className="flex-1">
                <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full inline-flex items-center gap-1">
                  <Target size={12} />
                  Target Job Role
                </span>
                <h3 className="text-2xl font-extrabold text-slate-900 mt-3">
                  Senior Frontend Engineer
                </h3>
                <p className="text-sm text-slate-500 mt-2">
                  Based on 1,420 active job listings in your region.
                </p>
              </div>
              <div className="shrink-0 text-center">
                {/* Circular Progress */}
                <div className="relative w-28 h-28 mx-auto">
                  <svg
                    viewBox="0 0 80 80"
                    className="w-28 h-28 -rotate-90 drop-shadow-lg"
                  >
                    <circle
                      cx="40"
                      cy="40"
                      r="34"
                      fill="none"
                      stroke="#e2e8f0"
                      strokeWidth="7"
                    />
                    <circle
                      cx="40"
                      cy="40"
                      r="34"
                      fill="none"
                      stroke="#2563eb"
                      strokeWidth="7"
                      strokeDasharray={`${(2 * Math.PI * 34 * matchScore) / 100} ${2 * Math.PI * 34 * (1 - matchScore / 100)}`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-extrabold text-slate-900">
                      {matchScore}%
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      Match
                    </span>
                  </div>
                </div>
                <div className="mt-3 space-y-1">
                  <p className="text-sm font-bold text-blue-600">
                    Strong Candidate
                  </p>
                  <p className="text-xs text-slate-500">
                    Top 20% of candidates
                  </p>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid sm:grid-cols-3 gap-3">
              <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-4 text-center hover:shadow-md transition">
                <CheckCircle className="w-6 h-6 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-extrabold text-green-700">
                  {matchedSkills.length}
                </p>
                <p className="text-xs text-green-700 font-medium mt-1">
                  Matched Skills Verified
                </p>
              </div>
              <div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-xl p-4 text-center hover:shadow-md transition">
                <AlertCircle className="w-6 h-6 text-red-600 mx-auto mb-2" />
                <p className="text-2xl font-extrabold text-red-700">
                  {missingSkills.length}
                </p>
                <p className="text-xs text-red-700 font-medium mt-1">
                  Missing Critical Skills
                </p>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-4 text-center hover:shadow-md transition">
                <Zap className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                <p className="text-2xl font-extrabold text-blue-700">+12%</p>
                <p className="text-xs text-blue-700 font-medium mt-1">
                  Impact of Adding Docker
                </p>
              </div>
            </div>
          </div>

          {/* Learning Path & Skills Sidebar */}
          <div className="space-y-4">
            {/* Learning Path Card */}
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-6 shadow-lg text-white">
              <div className="flex items-start justify-between mb-3">
                <BookOpen className="w-6 h-6 opacity-80" />
                <span className="text-xs bg-white bg-opacity-20 px-2 py-1 rounded-full font-semibold">
                  AI Recommended
                </span>
              </div>
              <h3 className="font-bold text-lg mb-2">Accelerate Your Growth</h3>
              <p className="text-sm text-blue-100 mb-4">
                Master AWS and System Design. We've created a personalized
                learning roadmap just for you.
              </p>
              <Link
                href="#"
                className="block w-full text-center bg-white hover:bg-blue-50 text-blue-600 font-semibold text-sm py-3 rounded-xl transition-colors mb-3"
              >
                Start Learning Path
              </Link>
              <div className="text-xs text-blue-100 text-center">
                Estimated time: 4-6 weeks ⏱️
              </div>
            </div>

            {/* Matched Skills */}
            <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <h3 className="font-bold text-slate-900">Matched Skills</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {matchedSkills.map((skill) => (
                  <span
                    key={skill}
                    className="text-xs bg-green-50 text-green-700 border border-green-200 px-3 py-1.5 rounded-full font-medium hover:bg-green-100 transition"
                  >
                    ✓ {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Missing Skills */}
            <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition">
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <h3 className="font-bold text-slate-900">Missing Skills</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {missingSkills.map((skill) => (
                  <span
                    key={skill}
                    className="text-xs bg-red-50 text-red-600 border border-red-200 px-3 py-1.5 rounded-full font-medium hover:bg-red-100 transition"
                  >
                    ✗ {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Gap Analysis */}
        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition">
          <div className="px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-slate-50">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-blue-600" />
              <h2 className="font-bold text-lg text-slate-900">
                Skill Gap Breakdown
              </h2>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Skill / Tool
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Market Demand
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Your Level
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Required Level
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {gapBreakdown.map(
                  ({
                    skill,
                    category,
                    demand,
                    yourLevel,
                    required,
                    status,
                    action,
                  }) => (
                    <tr
                      key={skill}
                      className="hover:bg-blue-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <p className="font-semibold text-slate-900">{skill}</p>
                        <p className="text-xs text-slate-400">{category}</p>
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`text-xs font-semibold ${demandConfig[demand]}`}
                        >
                          {demand === "High" && "🔴"}
                          {demand === "Medium" && "🟡"}
                          {demand === "Low" && "🟢"} {demand}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-xs text-slate-600">
                        {yourLevel}
                      </td>
                      <td className="px-4 py-4 text-xs text-slate-600">
                        {required}
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`px-3 py-1.5 rounded-full text-xs font-semibold inline-flex items-center gap-1 ${statusConfig[status]?.bg} ${statusConfig[status]?.text}`}
                        >
                          {status === "Matched" ? (
                            <>
                              <CheckCircle size={14} /> Matched
                            </>
                          ) : (
                            <>
                              <AlertCircle size={14} /> {status} Gap
                            </>
                          )}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <button className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition">
                          <BookOpen size={14} /> {action}
                        </button>
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 bg-slate-50">
            <span className="font-medium">
              Showing {gapBreakdown.length} of 19 skills
            </span>
            <div className="flex gap-2">
              <button className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-100 font-medium transition">
                ← Previous
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition">
                Next →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

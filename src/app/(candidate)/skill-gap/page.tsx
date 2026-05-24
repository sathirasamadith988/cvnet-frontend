import Link from "next/link";
import {
  BookOpen,
  Zap,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Target,
} from "lucide-react";
import {
  gapBreakdown,
  matchedSkills,
  missingSkills,
  skillMatchScore,
} from "../../../lib/skill-gap-data";

const statusConfig: Record<string, { bg: string; text: string }> = {
  Critical: { bg: "bg-red-100", text: "text-red-700" },
  Moderate: { bg: "bg-amber-100", text: "text-amber-700" },
  Minor: { bg: "bg-yellow-100", text: "text-yellow-700" },
  Matched: { bg: "bg-green-100", text: "text-green-700" },
};

const levelMap: Record<string, number> = {
  "None Detected": 0,
  Beginner: 1,
  Intermediate: 2,
  Advanced: 3,
  Expert: 4,
};

function computeStatus(yourLevel: string, required: string) {
  const yourNum = levelMap[yourLevel] ?? 0;
  const reqNum = levelMap[required] ?? 0;
  const diff = reqNum - yourNum;

  if (diff <= 0) return "Matched";
  if (diff === 1) return "Moderate";
  return "Critical";
}

export default function SkillGapPage() {
  const matchScore = skillMatchScore;

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100">
      {/* Top header removed per design request */}

      <div className="p-6 sm:p-8 max-w-7xl mx-auto">
        <div className="mb-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-3xl font-extrabold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-8 h-8 text-blue-600" />
                Skill Gap Analysis
              </h2>
              <p className="text-slate-500 text-sm mt-2">
                Deep dive into your market readiness and personalized
                development roadmap
              </p>
              <p className="mt-3 text-xs text-amber-700 bg-amber-50 border border-amber-100 px-3 py-2 rounded">
                Note: These analytics are not 100% accurate and should be used
                as guidance only — verify critical decisions independently.
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
              <div className="bg-linear-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-4 text-center hover:shadow-md transition">
                <CheckCircle className="w-6 h-6 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-extrabold text-green-700">
                  {matchedSkills.length}
                </p>
                <p className="text-xs text-green-700 font-medium mt-1">
                  Matched Skills Verified
                </p>
              </div>
              <div className="bg-linear-to-br from-red-50 to-red-100 border border-red-200 rounded-xl p-4 text-center hover:shadow-md transition">
                <AlertCircle className="w-6 h-6 text-red-600 mx-auto mb-2" />
                <p className="text-2xl font-extrabold text-red-700">
                  {missingSkills.length}
                </p>
                <p className="text-xs text-red-700 font-medium mt-1">
                  Missing Critical Skills
                </p>
              </div>
              <div className="bg-linear-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-4 text-center hover:shadow-md transition">
                <Zap className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                <p className="text-2xl font-extrabold text-blue-700">+12%</p>
                <p className="text-xs text-blue-700 font-medium mt-1">
                  Impact of Adding Docker
                </p>
              </div>
            </div>
            {/* Pie chart showing matched vs missing skills */}
            <div className="mt-6 bg-white border border-slate-100 rounded-xl p-4 shadow-sm text-center">
              <h4 className="text-sm font-semibold text-slate-800 mb-3">
                Skill Distribution
              </h4>
              <div className="flex items-center justify-center gap-6">
                <div className="relative w-28 h-28">
                  {(() => {
                    const matched = matchedSkills.length;
                    const missing = missingSkills.length;
                    const total = matched + missing || 1;
                    const matchedPct = Math.round((matched / total) * 100);
                    const missingPct = 100 - matchedPct;
                    const circumference = 2 * Math.PI * 34;
                    const dashMatched = (circumference * matchedPct) / 100;
                    const dashMissing = circumference - dashMatched;

                    return (
                      <svg viewBox="0 0 80 80" className="-rotate-90 w-28 h-28">
                        <circle
                          cx="40"
                          cy="40"
                          r="34"
                          fill="none"
                          stroke="#e6edf3"
                          strokeWidth="12"
                        />
                        <circle
                          cx="40"
                          cy="40"
                          r="34"
                          fill="none"
                          stroke="#10b981"
                          strokeWidth="12"
                          strokeDasharray={`${dashMatched} ${dashMissing}`}
                          strokeLinecap="round"
                        />
                      </svg>
                    );
                  })()}
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-sm font-bold">
                      {matchedSkills.length}/
                      {matchedSkills.length + missingSkills.length}
                    </span>
                    <span className="text-xs text-slate-400">
                      Matched / Total
                    </span>
                  </div>
                </div>
                <div className="text-left text-xs">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-3 h-3 rounded-full bg-green-500 inline-block" />
                    <span className="text-slate-700">Matched Skills</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-red-500 inline-block" />
                    <span className="text-slate-700">Missing Skills</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Learning Path & Skills Sidebar */}
          <div className="space-y-4">
            {/* Learning Path Card */}
            <div className="bg-linear-to-br from-blue-600 to-blue-700 rounded-2xl p-6 shadow-lg text-white">
              <div className="flex items-start justify-between mb-3">
                <BookOpen className="w-6 h-6 opacity-80" />
                <span className="text-xs bg-white text-blue-600 bg-opacity-20 px-2 py-1 rounded-full font-semibold">
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
                <h3 className="font-bold text-slate-900">Missing Skill</h3>
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
          <div className="px-6 py-5 border-b border-slate-100 bg-linear-to-r from-slate-50 to-slate-50">
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
                  ({ skill, category, yourLevel, required, action }) => (
                    <tr
                      key={skill}
                      className="hover:bg-blue-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <p className="font-semibold text-slate-900">{skill}</p>
                        <p className="text-xs text-slate-400">{category}</p>
                      </td>
                      <td className="px-4 py-4 text-xs text-slate-600">
                        {yourLevel}
                      </td>
                      <td className="px-4 py-4 text-xs text-slate-600">
                        {required}
                      </td>
                      <td className="px-4 py-4">
                        {(() => {
                          const computed = computeStatus(yourLevel, required);
                          return (
                            <span
                              className={`px-3 py-1.5 rounded-full text-xs font-semibold inline-flex items-center gap-1 ${statusConfig[computed]?.bg} ${statusConfig[computed]?.text}`}
                            >
                              {computed === "Matched" ? (
                                <>
                                  <CheckCircle size={14} /> Matched
                                </>
                              ) : (
                                <>
                                  <AlertCircle size={14} /> {computed} Gap
                                </>
                              )}
                            </span>
                          );
                        })()}
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
"use client";

import Link from "next/link";
import { useState } from "react";
import { Upload, Download, Eye, Plus } from "lucide-react";

const experience = [
  {
    title: "Senior Frontend Developer",
    company: "TechFlow Solutions",
    period: "Jan 2021 – Present",
    bullets: [
      "Lead a team of 5 developers in redesigning the core product dashboard using React and TypeScript.",
      "Improved application performance by 40% through code splitting and lazy loading.",
      "Implemented comprehensive unit testing coverage increasing reliability by 25%.",
    ],
  },
  {
    title: "UI/UX Developer",
    company: "Creative Agency X",
    period: "Jun 2018 – Dec 2020",
    bullets: [
      "Collaborated with designers to translate Figma prototypes into responsive web interfaces.",
      "Maintained the company's internal component library.",
    ],
  },
];

const education = [
  {
    degree: "Master of Computer Science",
    school: "Stanford University",
    period: "2016 – 2018",
  },
  {
    degree: "Bachelor of Science in Information Technology",
    school: "University of Technology",
    period: "2012 – 2016",
  },
];

const skills = [
  "React.js",
  "TypeScript",
  "Tailwind CSS",
  "Node.js",
  "GraphQL",
  "AWS",
];

const aiScores = [
  {
    label: "Readability",
    value: 92,
    sub: "Excellent sentence structure.",
    color: "bg-green-500",
  },
  {
    label: "Keyword Match",
    value: 78,
    sub: 'Missing: "Docker", "CI/CD".',
    color: "bg-amber-500",
  },
  {
    label: "Formatting",
    value: 85,
    sub: "Consistent font usage detected.",
    color: "bg-blue-500",
  },
];

// Top recommendations removed from UI per request

export default function CVPage() {
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const sections = ["Personal Info", "Experience", "Certifications"];

  return (
    <div className="p-6 sm:p-8 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            My CV Profile
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Manage your professional identity
          </p>
        </div>
        <div className="flex items-center gap-3" />
      </div>

      {/* Completion banner */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-5 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative w-14 h-14 flex-shrink-0">
            <svg viewBox="0 0 48 48" className="w-14 h-14 -rotate-90">
              <circle
                cx="24"
                cy="24"
                r="20"
                fill="none"
                stroke="#e2e8f0"
                strokeWidth="4"
              />
              <circle
                cx="24"
                cy="24"
                r="20"
                fill="none"
                stroke="#2563eb"
                strokeWidth="4"
                strokeDasharray={`${2 * Math.PI * 20 * 0.85} ${2 * Math.PI * 20 * 0.15}`}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-sm font-extrabold text-blue-600">
              85%
            </span>
          </div>
          <div>
            <p className="font-bold text-slate-900">
              Your profile is almost complete!
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              Add your certifications and one more project to reach 100%
              readiness for top tier jobs.
            </p>
          </div>
        </div>
        <div className="flex gap-3 flex-shrink-0">
          <Link
            href="/cv/complete"
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
          >
            <Plus size={14} /> Complete Profile
          </Link>
          <Link
            href="/cv/preview"
            className="flex items-center gap-1.5 border border-blue-200 text-blue-600 text-sm font-semibold px-4 py-2 rounded-xl hover:bg-blue-50 transition-colors"
          >
            <Eye size={14} /> Preview Public View
          </Link>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Resume Upload */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h2 className="font-bold text-slate-900 mb-1">Resume</h2>
            <p className="text-xs text-slate-400 mb-4">
              Last updated: 2 days ago
            </p>
            <label className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-xl py-8 cursor-pointer transition-colors group">
              <div className="w-12 h-12 rounded-xl bg-blue-50 group-hover:bg-blue-100 flex items-center justify-center transition-colors">
                <Upload size={22} className="text-blue-600" />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-slate-700">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  PDF, DOCX up to 10MB
                </p>
              </div>
              <input type="file" className="hidden" accept=".pdf,.docx" />
            </label>
          </div>

          {/* Section Tabs */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex gap-2 mb-6 flex-wrap">
              {sections.map((s) => (
                <button
                  key={s}
                  onClick={() =>
                    setActiveSection(activeSection === s ? null : s)
                  }
                  className={`px-4 py-2 text-sm font-semibold rounded-xl border transition-colors ${activeSection === s ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"}`}
                >
                  {s}
                </button>
              ))}
            </div>

            {/* Professional Summary */}
            <div className="mb-6">
              <h3 className="font-bold text-slate-800 mb-3">
                Professional Summary
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Senior Frontend Developer with 7+ years of experience in
                building scalable web applications. Proficient in React,
                TypeScript, and modern CSS frameworks. Proven track record of
                improving site performance by 40% and leading a team of 5
                developers. Passionate about UI/UX design and accessibility
                standards.
              </p>
              <button className="mt-3 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                Generate New Summary
              </button>
            </div>

            {/* Experience */}
            <div className="mb-6">
              <h3 className="font-bold text-slate-800 mb-4">Experience</h3>
              <div className="space-y-5">
                {experience.map(({ title, company, period, bullets }) => (
                  <div key={title} className="border-l-2 border-blue-200 pl-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold text-slate-900 text-sm">
                          {title}
                        </h4>
                        <p className="text-xs text-blue-600 font-medium">
                          {company}
                        </p>
                      </div>
                      <span className="text-xs text-slate-400 whitespace-nowrap ml-4">
                        {period}
                      </span>
                    </div>
                    <ul className="mt-2 space-y-1">
                      {bullets.map((b) => (
                        <li
                          key={b}
                          className="text-xs text-slate-500 leading-relaxed flex gap-2"
                        >
                          <span className="text-blue-400 flex-shrink-0 mt-0.5">
                            •
                          </span>
                          {b}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* Education */}
            <div className="mb-6">
              <h3 className="font-bold text-slate-800 mb-4">Education</h3>
              <div className="space-y-3">
                {education.map(({ degree, school, period }) => (
                  <div
                    key={degree}
                    className="flex items-start justify-between"
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {degree}
                      </p>
                      <p className="text-xs text-slate-500">{school}</p>
                    </div>
                    <span className="text-xs text-slate-400 whitespace-nowrap ml-4">
                      {period}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Technical Skills */}
            <div>
              <h3 className="font-bold text-slate-800 mb-3">
                Technical Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <span
                    key={skill}
                    className="bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1.5 rounded-full border border-blue-100"
                  >
                    {skill}
                  </span>
                ))}
                <button className="flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-blue-600 px-3 py-1.5 border border-dashed border-slate-200 rounded-full transition-colors">
                  <Plus size={12} /> Add Skill
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* AI CV Analysis */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900 text-sm">
                AI CV Analysis
              </h3>
              <span className="text-xs bg-blue-100 text-blue-700 font-semibold px-2 py-0.5 rounded-full">
                Live
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Real-time feedback on your profile strength.
            </p>
            <div className="space-y-4">
              {aiScores.map(({ label, value, sub, color }) => (
                <div key={label}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="font-semibold text-slate-700">
                      {label}
                    </span>
                    <span className="font-bold text-slate-900">
                      {value}/100
                    </span>
                  </div>
                  <div className="bg-slate-100 rounded-full h-2">
                    <div
                      className={`${color} h-full rounded-full transition-all`}
                      style={{ width: `${value}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{sub}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100 flex gap-2">
              <button className="flex-1 flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-2.5 rounded-xl transition-colors">
                <Download size={13} /> Download PDF
              </button>
              <button className="flex-1 border border-slate-200 text-slate-600 text-xs font-semibold py-2.5 rounded-xl hover:bg-slate-50 transition-colors">
                View CV
              </button>
            </div>
          </div>
          {/* Sidebar blocks removed per request */}
        </div>
      </div>
    </div>
  );
}

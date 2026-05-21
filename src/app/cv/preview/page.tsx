"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Download } from "lucide-react";

const STORAGE_KEY = "publicCV";

const fallback = {
  name: "John Doe",
  subtitle:
    "Senior Frontend Developer — San Francisco, CA — john.doe@example.com",
  summary:
    "Senior Frontend Developer with 7+ years building scalable web applications. Expert in React, TypeScript, and accessible UI design.",
  experience: [
    {
      title: "Senior Frontend Developer",
      company: "TechFlow Solutions",
      period: "Jan 2021 – Present",
      bullets: [
        "Led redesign of core dashboard; improved performance by 40%.",
        "Introduced component-driven development and testing.",
      ],
    },
    {
      title: "UI/UX Developer",
      company: "Creative Agency X",
      period: "Jun 2018 – Dec 2020",
      bullets: ["Implemented responsive interfaces from Figma prototypes."],
    },
  ],
  skills: ["React", "TypeScript", "Tailwind CSS", "Node.js"],
  education: "M.S. Computer Science, Stanford University",
  portfolio: "github.com/johndoe · LinkedIn: /in/johndoe",
};

export default function CVPreview() {
  const [data, setData] = useState(fallback);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setData(JSON.parse(raw));
    } catch (e) {
      console.error(e);
    }
  }, []);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            {data.name}
          </h1>
          <p className="text-sm text-slate-500">{data.subtitle}</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/cv"
            className="border border-slate-200 px-3 py-2 rounded-lg text-sm text-slate-700"
          >
            Back
          </Link>
          <button className="flex items-center gap-2 bg-blue-600 text-white text-sm font-semibold px-3 py-2 rounded-lg">
            <Download size={14} /> Download CV
          </button>
        </div>
      </header>

      <section className="bg-white border border-slate-200 rounded-lg p-6 mb-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 mb-2">
          Professional Summary
        </h2>
        <p className="text-sm text-slate-600 leading-relaxed">{data.summary}</p>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">
            Experience
          </h3>
          <div>
            {data.experience.map((exp, i) => (
              <div key={i} className="mb-4">
                <h4 className="font-semibold text-slate-900">{exp.title}</h4>
                <p className="text-xs text-slate-500">
                  {exp.company} — {exp.period}
                </p>
                <ul className="mt-2 text-sm text-slate-600 list-disc list-inside space-y-1">
                  {exp.bullets &&
                    exp.bullets.map((b, bi) => <li key={bi}>{b}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">
            Skills & Education
          </h3>
          <div className="mb-4">
            <p className="text-sm text-slate-600 mb-2">
              <strong>Skills:</strong> {data.skills.join(", ")}
            </p>
            <p className="text-sm text-slate-600">
              <strong>Education:</strong> {data.education}
            </p>
          </div>
          <div className="text-xs text-slate-400">{data.portfolio}</div>
        </div>
      </section>

      <footer className="text-xs text-slate-500 text-center mt-8">
        This public view is generated from your CV. Keep it professional and
        concise.
      </footer>
    </div>
  );
}

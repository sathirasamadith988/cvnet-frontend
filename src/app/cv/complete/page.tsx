"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const STORAGE_KEY = "publicCV";

const defaultData = {
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
  ],
  skills: ["React", "TypeScript", "Tailwind CSS", "GraphQL"],
  education: "M.S. Computer Science, Stanford University",
  portfolio: "github.com/johndoe · LinkedIn: /in/johndoe",
};

export default function CompleteProfileEditor() {
  const [data, setData] = useState(() => {
    try {
      const raw =
        typeof window !== "undefined"
          ? localStorage.getItem(STORAGE_KEY)
          : null;
      return raw ? JSON.parse(raw) : defaultData;
    } catch (e) {
      return defaultData;
    }
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSaved(false);
  }, [data]);

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      console.error(e);
    }
  }

  function updateField<K extends keyof typeof data>(key: K, value: any) {
    setData((prev) => ({ ...prev, [key]: value }));
  }

  function addExperience() {
    setData((prev) => ({
      ...prev,
      experience: [
        ...prev.experience,
        { title: "", company: "", period: "", bullets: [""] },
      ],
    }));
  }

  function removeExperience(idx: number) {
    setData((prev) => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== idx),
    }));
  }

  function updateExperience(idx: number, field: string, value: any) {
    setData((prev) => {
      const exp = [...prev.experience];
      // @ts-ignore
      exp[idx][field] = value;
      return { ...prev, experience: exp };
    });
  }

  function addBullet(idx: number) {
    setData((prev) => {
      const exp = [...prev.experience];
      exp[idx].bullets.push("");
      return { ...prev, experience: exp };
    });
  }

  function updateBullet(expIdx: number, bIdx: number, value: string) {
    setData((prev) => {
      const exp = [...prev.experience];
      exp[expIdx].bullets[bIdx] = value;
      return { ...prev, experience: exp };
    });
  }

  function removeBullet(expIdx: number, bIdx: number) {
    setData((prev) => {
      const exp = [...prev.experience];
      exp[expIdx].bullets = exp[expIdx].bullets.filter((_, i) => i !== bIdx);
      return { ...prev, experience: exp };
    });
  }

  function addSkill() {
    setData((prev) => ({ ...prev, skills: [...prev.skills, ""] }));
  }

  function updateSkill(idx: number, value: string) {
    setData((prev) => {
      const s = [...prev.skills];
      s[idx] = value;
      return { ...prev, skills: s };
    });
  }

  function removeSkill(idx: number) {
    setData((prev) => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== idx),
    }));
  }

  function removeSection(key: keyof typeof data) {
    // set the section to empty/default
    setData((prev) => ({
      ...prev,
      [key]: key === "experience" ? [] : key === "skills" ? [] : "",
    }));
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-extrabold">
          Complete Profile — Edit Public View
        </h1>
        <div className="flex items-center gap-3">
          <Link
            href="/cv"
            className="border border-slate-200 px-3 py-2 rounded-md text-sm text-slate-700"
          >
            Back
          </Link>
          <button
            onClick={save}
            className="bg-green-600 text-white px-4 py-2 rounded-md"
          >
            Save
          </button>
          <Link
            href="/cv/preview"
            className="border border-slate-200 px-4 py-2 rounded-md text-sm text-slate-700"
          >
            View Preview
          </Link>
        </div>
      </header>

      <section className="mb-6">
        <h2 className="font-semibold mb-2">Header</h2>
        <input
          value={data.name}
          onChange={(e) => updateField("name", e.target.value)}
          className="w-full mb-2 p-2 border rounded"
        />
        <input
          value={data.subtitle}
          onChange={(e) => updateField("subtitle", e.target.value)}
          className="w-full p-2 border rounded"
        />
        <div className="mt-2">
          <button
            className="text-xs text-red-600"
            onClick={() => removeSection("name")}
          >
            Remove Header
          </button>
        </div>
      </section>

      <section className="mb-6">
        <h2 className="font-semibold mb-2">Professional Summary</h2>
        <textarea
          value={data.summary}
          onChange={(e) => updateField("summary", e.target.value)}
          className="w-full p-2 border rounded h-24"
        />
        <div className="mt-2">
          <button
            className="text-xs text-red-600"
            onClick={() => removeSection("summary")}
          >
            Remove Section
          </button>
        </div>
      </section>

      <section className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-semibold">Experience</h2>
          <div className="flex gap-2">
            <button
              onClick={addExperience}
              className="text-sm bg-blue-600 text-white px-3 py-1 rounded"
            >
              Add Experience
            </button>
            <button
              className="text-sm text-red-600"
              onClick={() => removeSection("experience")}
            >
              Remove Section
            </button>
          </div>
        </div>
        <div className="space-y-4">
          {data.experience.map((exp, idx) => (
            <div key={idx} className="border p-3 rounded">
              <div className="flex items-center justify-between mb-2">
                <input
                  value={exp.title}
                  onChange={(e) =>
                    updateExperience(idx, "title", e.target.value)
                  }
                  placeholder="Title"
                  className="flex-1 mr-2 p-1 border rounded"
                />
                <input
                  value={exp.company}
                  onChange={(e) =>
                    updateExperience(idx, "company", e.target.value)
                  }
                  placeholder="Company"
                  className="w-48 mr-2 p-1 border rounded"
                />
                <input
                  value={exp.period}
                  onChange={(e) =>
                    updateExperience(idx, "period", e.target.value)
                  }
                  placeholder="Period"
                  className="w-40 p-1 border rounded"
                />
              </div>
              <div className="space-y-1">
                {exp.bullets.map((b, bIdx) => (
                  <div key={bIdx} className="flex gap-2 items-center">
                    <input
                      value={b}
                      onChange={(e) => updateBullet(idx, bIdx, e.target.value)}
                      className="flex-1 p-1 border rounded"
                    />
                    <button
                      className="text-xs text-red-600"
                      onClick={() => removeBullet(idx, bIdx)}
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  className="text-sm text-blue-600 mt-2"
                  onClick={() => addBullet(idx)}
                >
                  Add Bullet
                </button>
              </div>
              <div className="mt-2 text-right">
                <button
                  className="text-sm text-red-600"
                  onClick={() => removeExperience(idx)}
                >
                  Remove Entry
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-semibold">Skills</h2>
          <div className="flex gap-2">
            <button
              onClick={addSkill}
              className="text-sm bg-blue-600 text-white px-3 py-1 rounded"
            >
              Add Skill
            </button>
            <button
              className="text-sm text-red-600"
              onClick={() => removeSection("skills")}
            >
              Remove Section
            </button>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {data.skills.map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                value={s}
                onChange={(e) => updateSkill(i, e.target.value)}
                className="p-1 border rounded"
              />
              <button
                className="text-xs text-red-600"
                onClick={() => removeSkill(i)}
              >
                x
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-semibold">Education & Portfolio</h2>
          <button
            className="text-sm text-red-600"
            onClick={() => removeSection("education")}
          >
            Remove Section
          </button>
        </div>
        <input
          value={data.education}
          onChange={(e) => updateField("education", e.target.value)}
          className="w-full p-2 border rounded mb-2"
        />
        <input
          value={data.portfolio}
          onChange={(e) => updateField("portfolio", e.target.value)}
          className="w-full p-2 border rounded"
        />
      </section>

      <div className="mt-6 flex items-center gap-3">
        <Link
          href="/cv"
          className="border border-slate-200 px-3 py-2 rounded-md text-sm text-slate-700"
        >
          Back
        </Link>
        <button
          onClick={save}
          className="bg-green-600 text-white px-4 py-2 rounded-md"
        >
          Save
        </button>
        <Link
          href="/cv/preview"
          className="border border-slate-200 px-4 py-2 rounded-md text-sm text-slate-700"
        >
          View Preview
        </Link>
        {saved && <span className="text-sm text-green-600">Saved</span>}
      </div>
    </div>
  );
}

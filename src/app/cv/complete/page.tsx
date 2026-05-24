"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Eye, Download, Save } from "lucide-react";

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
  skills: [
    { name: "React", level: "Expert" },
    { name: "TypeScript", level: "Expert" },
    { name: "Tailwind CSS", level: "Intermediate" },
    { name: "GraphQL", level: "Intermediate" },
  ],
  projects: [
    {
      name: "DesignOps Portal",
      role: "Lead Frontend Engineer",
      description:
        "Built an internal operations dashboard for design and engineering teams with role-aware workflows.",
    },
  ],
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
      const parsed = raw ? JSON.parse(raw) : defaultData;

      // normalize skills: accept legacy array of strings
      if (Array.isArray(parsed.skills)) {
        parsed.skills = parsed.skills.map((s: any) =>
          typeof s === "string"
            ? { name: s, level: "Intermediate" }
            : { name: s.name || "", level: s.level || "Intermediate" },
        );
      } else {
        parsed.skills = [];
      }

      // normalize projects
      if (!Array.isArray(parsed.projects)) {
        parsed.projects = [];
      } else {
        parsed.projects = parsed.projects.map((p: any) => ({
          name: p.name || p.title || "",
          role: p.role || "",
          description: p.description || "",
        }));
      }

      return parsed;
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
    setData((prev) => ({
      ...prev,
      skills: [...prev.skills, { name: "", level: "Intermediate" }],
    }));
  }

  function updateSkillField(
    idx: number,
    field: "name" | "level",
    value: string,
  ) {
    setData((prev) => {
      const s = [...prev.skills];
      s[idx] = { ...s[idx], [field]: value };
      return { ...prev, skills: s };
    });
  }

  function removeSkill(idx: number) {
    setData((prev) => ({
      ...prev,
      skills: prev.skills.filter((_: any, i: number) => i !== idx),
    }));
  }

  function addProject() {
    setData((prev) => ({
      ...prev,
      projects: [
        ...(prev.projects || []),
        { name: "", role: "", description: "" },
      ],
    }));
  }

  function removeProject(idx: number) {
    setData((prev) => ({
      ...prev,
      projects: (prev.projects || []).filter((_: any, i: number) => i !== idx),
    }));
  }

  function updateProjectField(idx: number, field: string, value: string) {
    setData((prev) => {
      const ps = [...(prev.projects || [])];
      ps[idx] = { ...ps[idx], [field]: value };
      return { ...prev, projects: ps };
    });
  }

  function removeSection(key: keyof typeof data) {
    // set the section to empty/default
    setData((prev) => ({
      ...prev,
      [key]:
        key === "experience"
          ? []
          : key === "skills"
            ? []
            : key === "projects"
              ? []
              : "",
    }));
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <header className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold">Complete Profile</h1>
          <p className="text-sm text-slate-500">
            Edit the public-facing CV preview
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/cv"
            className="border border-slate-200 px-3 py-2 rounded-md text-sm text-slate-700"
          >
            Back
          </Link>

          <button
            onClick={save}
            className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-xl"
          >
            <Save size={14} />
            Save
          </button>

          <Link
            href="/cv/preview"
            className="flex items-center gap-2 border border-slate-200 px-4 py-2 rounded-xl text-sm text-slate-700 hover:bg-slate-50"
          >
            <Eye size={14} /> View Preview
          </Link>

          <button
            type="button"
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl"
          >
            <Download size={14} /> Download PDF
          </button>
        </div>
      </header>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h2 className="font-semibold mb-3">Header</h2>
            <input
              value={data.name}
              onChange={(e) => updateField("name", e.target.value)}
              className="w-full mb-3 p-3 border border-slate-200 rounded-xl"
            />
            <input
              value={data.subtitle}
              onChange={(e) => updateField("subtitle", e.target.value)}
              className="w-full p-3 border border-slate-200 rounded-xl"
            />
            <div className="mt-3">
              <button
                className="text-xs text-red-600"
                onClick={() => removeSection("name")}
              >
                Remove Header
              </button>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold">Projects</h2>
              <div className="flex gap-2">
                <button
                  onClick={addProject}
                  className="text-sm bg-blue-600 text-white px-3 py-1 rounded-xl"
                >
                  Add Project
                </button>
                <button
                  className="text-sm text-red-600"
                  onClick={() => removeSection("projects")}
                >
                  Remove Section
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {(data.projects || []).map((p: any, idx: number) => (
                <div
                  key={idx}
                  className="rounded-xl border border-slate-100 p-4"
                >
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div className="flex-1">
                      <input
                        value={p.name}
                        onChange={(e) =>
                          updateProjectField(idx, "name", e.target.value)
                        }
                        placeholder="Project name"
                        className="w-full mb-2 p-2 border border-slate-200 rounded-lg"
                      />
                      <input
                        value={p.role}
                        onChange={(e) =>
                          updateProjectField(idx, "role", e.target.value)
                        }
                        placeholder="Your role"
                        className="w-full p-2 border border-slate-200 rounded-lg"
                      />
                    </div>
                    <div className="text-right">
                      <button
                        className="text-xs text-red-600"
                        onClick={() => removeProject(idx)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>

                  <textarea
                    value={p.description}
                    onChange={(e) =>
                      updateProjectField(idx, "description", e.target.value)
                    }
                    placeholder="Short description"
                    className="w-full p-2 border border-slate-200 rounded-lg h-20"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h2 className="font-semibold mb-3">Professional Summary</h2>
            <textarea
              value={data.summary}
              onChange={(e) => updateField("summary", e.target.value)}
              className="w-full p-3 border border-slate-200 rounded-xl h-28"
            />
            <div className="mt-3">
              <button
                className="text-xs text-red-600"
                onClick={() => removeSection("summary")}
              >
                Remove Section
              </button>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold">Experience</h2>
              <div className="flex gap-2">
                <button
                  onClick={addExperience}
                  className="text-sm bg-blue-600 text-white px-3 py-1 rounded-xl"
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
                <div
                  key={idx}
                  className="rounded-xl border border-slate-100 p-4"
                >
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div className="flex-1">
                      <input
                        value={exp.title}
                        onChange={(e) =>
                          updateExperience(idx, "title", e.target.value)
                        }
                        placeholder="Title"
                        className="w-full mb-2 p-2 border border-slate-200 rounded-lg"
                      />
                      <div className="flex gap-2">
                        <input
                          value={exp.company}
                          onChange={(e) =>
                            updateExperience(idx, "company", e.target.value)
                          }
                          placeholder="Company"
                          className="flex-1 p-2 border border-slate-200 rounded-lg"
                        />
                        <input
                          value={exp.period}
                          onChange={(e) =>
                            updateExperience(idx, "period", e.target.value)
                          }
                          placeholder="Period"
                          className="w-40 p-2 border border-slate-200 rounded-lg"
                        />
                      </div>
                    </div>
                    <div className="text-right">
                      <button
                        className="text-xs text-red-600"
                        onClick={() => removeExperience(idx)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {exp.bullets.map((b, bIdx) => (
                      <div key={bIdx} className="flex gap-2 items-center">
                        <input
                          value={b}
                          onChange={(e) =>
                            updateBullet(idx, bIdx, e.target.value)
                          }
                          className="flex-1 p-2 border border-slate-200 rounded-lg"
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
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold">Skills</h2>
              <div className="flex gap-2">
                <button
                  onClick={addSkill}
                  className="text-sm bg-blue-600 text-white px-3 py-1 rounded-xl"
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
            <div className="flex flex-col gap-3">
              {data.skills.map((skill: any, i: number) => (
                <div key={i} className="flex items-center gap-3">
                  <input
                    value={skill.name}
                    onChange={(e) =>
                      updateSkillField(i, "name", e.target.value)
                    }
                    placeholder="Skill name"
                    className="flex-1 p-2 border border-slate-200 rounded-lg"
                  />

                  <select
                    value={skill.level}
                    onChange={(e) =>
                      updateSkillField(i, "level", e.target.value)
                    }
                    className="w-40 p-2 border border-slate-200 rounded-lg"
                  >
                    <option>Expert</option>
                    <option>Intermediate</option>
                    <option>Beginner</option>
                  </select>

                  <button
                    className="text-xs text-red-600"
                    onClick={() => removeSkill(i)}
                  >
                    Remove
                  </button>
                </div>
              ))}
              <div>
                <button onClick={addSkill} className="text-sm text-blue-600">
                  + Add another skill
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-3">
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
              className="w-full p-3 border border-slate-200 rounded-xl mb-3"
            />
            <input
              value={data.portfolio}
              onChange={(e) => updateField("portfolio", e.target.value)}
              className="w-full p-3 border border-slate-200 rounded-xl"
            />
          </div>
        </div>

        <aside className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm sticky top-6">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-lg">
                {data.name.split(" ")[0].charAt(0) || "J"}
              </div>
              <div>
                <h3 className="font-bold text-slate-900">{data.name}</h3>
                <p className="text-xs text-slate-500 mt-1">{data.subtitle}</p>
              </div>
            </div>

            <p className="text-sm text-slate-700 mt-4">{data.summary}</p>

            {data.skills.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {data.skills.map((s: any, i: number) => (
                  <span
                    key={i}
                    className="bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1.5 rounded-full border border-blue-100"
                  >
                    {s.name} {s.level ? `· ${s.level}` : ""}
                  </span>
                ))}
              </div>
            )}

            {data.projects && data.projects.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-semibold text-slate-900">
                  Projects
                </h4>
                <div className="mt-2 space-y-2 text-sm text-slate-600">
                  {data.projects.map((p: any, i: number) => (
                    <div key={i}>
                      <p className="font-medium text-slate-900 text-sm">
                        {p.name}{" "}
                        <span className="text-xs text-slate-400">
                          · {p.role}
                        </span>
                      </p>
                      <p className="text-xs text-slate-500">{p.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-4 flex gap-2">
              <Link
                href="/cv/preview"
                className="flex-1 flex items-center justify-center gap-2 border border-slate-200 text-slate-700 text-sm font-semibold px-3 py-2 rounded-xl hover:bg-slate-50"
              >
                <Eye size={14} /> Preview
              </Link>
              <button className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white text-sm font-semibold px-3 py-2 rounded-xl">
                <Download size={14} /> Export
              </button>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h4 className="font-semibold mb-2">Tips</h4>
            <ul className="text-sm text-slate-600 space-y-2 list-disc list-inside">
              <li>Keep your summary short and scannable.</li>
              <li>Use bullets for achievements and impact.</li>
              <li>Include links in the portfolio field.</li>
            </ul>
          </div>
        </aside>
      </div>

      <div className="mt-6 flex items-center gap-3">
        <Link
          href="/cv"
          className="border border-slate-200 px-3 py-2 rounded-md text-sm text-slate-700"
        >
          Back
        </Link>
        <button
          onClick={save}
          className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-xl"
        >
          <Save size={14} /> Save
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

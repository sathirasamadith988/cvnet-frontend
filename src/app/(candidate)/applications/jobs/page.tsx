"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Search,
  Briefcase,
  MapPin,
  Clock3,
  BadgeCheck,
  PencilLine,
  Send,
  FileText,
  User,
  Mail,
  Paperclip,
} from "lucide-react";

type Job = {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  posted: string;
  salary: string;
  tags: string[];
  match: number;
  description: string;
};

const jobs: Job[] = [
  {
    id: "frontend-lead",
    title: "Frontend Lead",
    company: "TechCorp Inc.",
    location: "Remote",
    type: "Full-time",
    posted: "2 days ago",
    salary: "$110k - $140k",
    tags: ["React", "TypeScript", "Design Systems"],
    match: 94,
    description:
      "Lead the UI team, improve product performance, and shape the design system for a fast-growing SaaS product.",
  },
  {
    id: "product-designer",
    title: "Product Designer",
    company: "Design Studio",
    location: "New York",
    type: "Hybrid",
    posted: "4 days ago",
    salary: "$95k - $120k",
    tags: ["Figma", "UX Research", "Prototyping"],
    match: 88,
    description:
      "Own product experiences from concept to handoff and collaborate closely with engineering and product leaders.",
  },
  {
    id: "react-engineer",
    title: "Senior React Engineer",
    company: "Global Systems",
    location: "Remote",
    type: "Contract",
    posted: "1 week ago",
    salary: "$90/hr",
    tags: ["React", "Performance", "Testing"],
    match: 91,
    description:
      "Build user-facing features, improve reliability, and support a component-driven workflow with modern React patterns.",
  },
  {
    id: "frontend-engineer",
    title: "Frontend Engineer",
    company: "Future Web",
    location: "San Francisco",
    type: "Full-time",
    posted: "1 week ago",
    salary: "$105k - $135k",
    tags: ["Next.js", "Accessibility", "Tailwind"],
    match: 86,
    description:
      "Deliver polished web interfaces, maintain high accessibility standards, and collaborate on product launches.",
  },
];

const candidateProfile = {
  fullName: "Alex Johnson",
  email: "alex.johnson@example.com",
  phone: "+1 (555) 014-2244",
  location: "Remote",
  currentRole: "Senior Frontend Developer",
  cvFileName: "alex-johnson-resume.pdf",
  portfolio: "https://portfolio.example.com/alex-johnson",
  availability: "2 weeks notice",
  summary:
    "Senior Frontend Developer with 7+ years of experience in React, TypeScript, and scalable UI systems.",
  skills: "React.js, TypeScript, Tailwind CSS, Node.js, GraphQL, AWS",
};

type QuickApplyState = {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  currentRole: string;
  cvFileName: string;
  portfolio: string;
  availability: string;
  summary: string;
  coverLetter: string;
};

export default function JobsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedJobId, setSelectedJobId] = useState(jobs[0].id);
  const [applicationSubmitted, setApplicationSubmitted] = useState(false);
  const [formState, setFormState] = useState<QuickApplyState>({
    fullName: candidateProfile.fullName,
    email: candidateProfile.email,
    phone: candidateProfile.phone,
    location: candidateProfile.location,
    currentRole: candidateProfile.currentRole,
    cvFileName: candidateProfile.cvFileName,
    portfolio: candidateProfile.portfolio,
    availability: candidateProfile.availability,
    summary: candidateProfile.summary,
    coverLetter:
      "I am interested in this role and would like to be considered for the next stage.",
  });

  const filteredJobs = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      return jobs;
    }

    return jobs.filter((job) =>
      [job.title, job.company, job.location, job.type, job.tags.join(" ")]
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [searchQuery]);

  const selectedJob =
    filteredJobs.find((job) => job.id === selectedJobId) ??
    filteredJobs[0] ??
    jobs[0];

  const handleQuickApply = (jobId: string) => {
    setSelectedJobId(jobId);
    setApplicationSubmitted(false);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setApplicationSubmitted(true);
  };

  return (
    <div className="p-6 sm:p-8 max-w-7xl">
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 mb-3">
            <Briefcase size={13} /> Jobs board
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">Apply here</h1>
          <p className="text-slate-500 text-sm mt-0.5 max-w-2xl">
            Browse open roles, open quick apply on any job, and review your
            details before submitting.
          </p>
        </div>

        <div className="relative w-full lg:w-96">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search title, company, location, skill..."
            className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.3fr_0.9fr]">
        <div className="space-y-4">
          {filteredJobs.map((job) => {
            const isActive = selectedJob?.id === job.id;

            return (
              <article
                key={job.id}
                className={`rounded-2xl border bg-white p-5 shadow-sm transition-all ${isActive ? "border-blue-300 ring-2 ring-blue-100" : "border-slate-100 hover:border-slate-200"}`}
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-bold text-slate-900">
                        {job.title}
                      </h2>
                      <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                        {job.match}% match
                      </span>
                    </div>
                    <p className="mt-1 text-sm font-medium text-slate-600">
                      {job.company}
                    </p>

                    <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-slate-500">
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin size={13} /> {job.location}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Clock3 size={13} /> {job.posted}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Briefcase size={13} /> {job.type}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <BadgeCheck size={13} /> {job.salary}
                      </span>
                    </div>

                    <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600">
                      {job.description}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {job.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 md:items-end">
                    <button
                      type="button"
                      onClick={() => handleQuickApply(job.id)}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
                    >
                      <PencilLine size={15} /> Quick Apply
                    </button>
                    <p className="text-xs text-slate-400">
                      Prefilled with your CV profile
                    </p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <aside className="lg:sticky lg:top-6 h-fit rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Quick Apply
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Review your details, edit anything needed, then submit.
              </p>
            </div>
            <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
              Ready
            </span>
          </div>

          <div className="mt-5 rounded-2xl bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Selected role
            </p>
            <p className="mt-1 font-bold text-slate-900">{selectedJob.title}</p>
            <p className="text-sm text-slate-600">
              {selectedJob.company} · {selectedJob.location}
            </p>
            <p className="mt-2 text-xs text-slate-500">
              {selectedJob.description}
            </p>
          </div>

          <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                Full Name
              </label>
              <div className="relative">
                <User
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  value={formState.fullName}
                  onChange={(event) =>
                    setFormState((current) => ({
                      ...current,
                      fullName: event.target.value,
                    }))
                  }
                  placeholder="Alex Johnson"
                  className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                Email Address
              </label>
              <div className="relative">
                <Mail
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  value={formState.email}
                  onChange={(event) =>
                    setFormState((current) => ({
                      ...current,
                      email: event.target.value,
                    }))
                  }
                  placeholder="alex.johnson@example.com"
                  className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Phone
                </label>
                <input
                  value={formState.phone}
                  onChange={(event) =>
                    setFormState((current) => ({
                      ...current,
                      phone: event.target.value,
                    }))
                  }
                  placeholder="+1 (555) 014-2244"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Location
                </label>
                <input
                  value={formState.location}
                  onChange={(event) =>
                    setFormState((current) => ({
                      ...current,
                      location: event.target.value,
                    }))
                  }
                  placeholder="Remote"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Current Role
                </label>
                <input
                  value={formState.currentRole}
                  onChange={(event) =>
                    setFormState((current) => ({
                      ...current,
                      currentRole: event.target.value,
                    }))
                  }
                  placeholder="Senior Frontend Developer"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Availability
                </label>
                <input
                  value={formState.availability}
                  onChange={(event) =>
                    setFormState((current) => ({
                      ...current,
                      availability: event.target.value,
                    }))
                  }
                  placeholder="2 weeks notice"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                CV Details
              </label>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                <div className="flex items-center gap-2 font-semibold text-slate-900">
                  <FileText size={15} className="text-blue-600" />{" "}
                  {formState.cvFileName}
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  You can replace or edit the filename and the summary below
                  before submitting.
                </p>
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                Portfolio / LinkedIn
              </label>
              <input
                value={formState.portfolio}
                onChange={(event) =>
                  setFormState((current) => ({
                    ...current,
                    portfolio: event.target.value,
                  }))
                }
                placeholder="https://portfolio.example.com/alex-johnson"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                CV Summary
              </label>
              <textarea
                rows={4}
                value={formState.summary}
                onChange={(event) =>
                  setFormState((current) => ({
                    ...current,
                    summary: event.target.value,
                  }))
                }
                placeholder="Short summary of your experience and strengths"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                Cover Note
              </label>
              <textarea
                rows={4}
                value={formState.coverLetter}
                onChange={(event) =>
                  setFormState((current) => ({
                    ...current,
                    coverLetter: event.target.value,
                  }))
                }
                placeholder="Write a short note to the hiring team"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="rounded-xl border border-dashed border-slate-200 bg-white p-4 text-xs text-slate-500">
              Primary skills: {candidateProfile.skills}
              <div className="mt-2 flex items-center gap-2 text-slate-400">
                <Paperclip size={14} /> Resume is preselected from your profile,
                but can be changed here.
              </div>
            </div>

            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
            >
              <Send size={15} /> Submit Application
            </button>

            {applicationSubmitted && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
                Your application draft is ready to send. This is a frontend-only
                confirmation state for now.
              </div>
            )}
          </form>
        </aside>
      </div>

      <div className="mt-6 rounded-2xl border border-slate-100 bg-white p-5 text-sm text-slate-600 shadow-sm">
        <p className="font-semibold text-slate-900">What happens next</p>
        <p className="mt-1">
          The jobs list and quick apply form are static UI for now. Once you
          wire the backend, the submit button can post the edited data directly.
        </p>
      </div>
    </div>
  );
}

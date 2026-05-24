"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Award,
  BookOpen,
  Briefcase,
  Download,
  Eye,
  FileText,
  GraduationCap,
  Globe,
  Languages,
  Link2,
  Plus,
  Upload,
  Users,
} from "lucide-react";

type SectionName =
  | "All"
  | "Personal Info"
  | "Experience"
  | "Education"
  | "Skills"
  | "Certifications"
  | "Languages"
  | "Projects"
  | "Publications"
  | "Teaching"
  | "Research"
  | "Awards"
  | "Volunteer"
  | "Memberships"
  | "Social Links";

type CVProfile = {
  fullName: string;
  email: string;
  jobrole: string;
  phone: string;
  address: string;
  portfolioUrl: string;
  gpa: string;
  employmentStatus: string;
  currentOrg: string;
  currentPosition: string;
  personalStatement: string;
  aboutMe: string;
  socialLinks: Array<{ platformName: string; profileUrl: string }>;
  skills: Array<{ skillName: string; level: string }>;
  experience: Array<{
    roleTitle: string;
    companyName: string;
    startDate: string;
    endDate: string;
    roleDescription: string;
  }>;
  education: Array<{
    degreeTitle: string;
    fieldOfStudy: string;
    organization: string;
    startDate: string;
    endDate: string;
    honors: string;
    thesisTitle: string;
    relevantCoursework: string;
  }>;
  certifications: Array<{
    organization: string;
    field: string;
    issueDate: string;
  }>;
  memberships: Array<{ organizationName: string }>;
  languages: Array<{ languageName: string; proficiency: string }>;
  projects: Array<{
    name: string;
    description: string;
    timePeriod: string;
    role: string;
    organization: string;
    sourceLink: string;
  }>;
  publications: Array<{
    title: string;
    description: string;
    sourceLink: string;
    organization: string;
    year: string;
  }>;
  teachingExperience: Array<{
    coursesTaught: string;
    organization: string;
    timePeriod: string;
    curriculumDescription: string;
  }>;
  researchExperience: Array<{
    projectName: string;
    labOrFieldWork: string;
    organization: string;
    resultsDescription: string;
    linkedPublication: string;
  }>;
  awards: Array<{
    awardName: string;
    organization: string;
    description: string;
  }>;
  volunteer: Array<{
    organization: string;
    role: string;
    description: string;
  }>;
};

const STORAGE_KEYS = ["publicCV-v2", "publicCV"];

const defaultProfile: CVProfile = {
  fullName: "John Doe",
  email: "john.doe@example.com",
  jobrole: "Senior Frontend Developer",
  phone: "+1 (555) 014-2244",
  address: "San Francisco, CA",
  portfolioUrl: "https://portfolio.example.com/john-doe",
  gpa: "3.82",
  employmentStatus: "Employed",
  currentOrg: "TechFlow Solutions",
  currentPosition: "Senior Frontend Developer",
  personalStatement:
    "Senior Frontend Developer with 7+ years building scalable web applications and accessible product experiences.",
  aboutMe:
    "I enjoy turning complex workflows into calm, high-confidence interfaces and mentoring teammates on maintainable frontend architecture.",
  socialLinks: [
    { platformName: "LinkedIn", profileUrl: "https://linkedin.com/in/johndoe" },
    { platformName: "GitHub", profileUrl: "https://github.com/johndoe" },
    {
      platformName: "Portfolio",
      profileUrl: "https://portfolio.example.com/john-doe",
    },
  ],
  skills: [
    { skillName: "React", level: "Expert" },
    { skillName: "TypeScript", level: "Expert" },
    { skillName: "Tailwind CSS", level: "Intermediate" },
    { skillName: "GraphQL", level: "Intermediate" },
    { skillName: "AWS", level: "Beginner" },
  ],
  experience: [
    {
      roleTitle: "Senior Frontend Developer",
      companyName: "TechFlow Solutions",
      startDate: "Jan 2021",
      endDate: "Present",
      roleDescription:
        "Led a team of 5 developers in redesigning the core product dashboard using React and TypeScript. Improved application performance by 40% through code splitting and lazy loading.",
    },
    {
      roleTitle: "UI/UX Developer",
      companyName: "Creative Agency X",
      startDate: "Jun 2018",
      endDate: "Dec 2020",
      roleDescription:
        "Collaborated with designers to translate Figma prototypes into responsive web interfaces and maintained the internal component library.",
    },
  ],
  education: [
    {
      degreeTitle: "Master of Computer Science",
      fieldOfStudy: "Computer Science",
      organization: "Stanford University",
      startDate: "2016",
      endDate: "2018",
      honors: "Distinction",
      thesisTitle: "Design Systems for Large-Scale Product Teams",
      relevantCoursework:
        "Human-computer interaction, distributed systems, advanced frontend engineering",
    },
    {
      degreeTitle: "Bachelor of Science",
      fieldOfStudy: "Information Technology",
      organization: "University of Technology",
      startDate: "2012",
      endDate: "2016",
      honors: "Dean's List",
      thesisTitle: "Progressive Web Applications",
      relevantCoursework: "Databases, UI engineering, software testing",
    },
  ],
  certifications: [
    {
      organization: "Google",
      field: "Professional Cloud Developer",
      issueDate: "2023",
    },
    {
      organization: "Meta",
      field: "Frontend Developer Professional Certificate",
      issueDate: "2022",
    },
  ],
  memberships: [
    { organizationName: "Association for Computing Machinery" },
    { organizationName: "Frontend Developers Guild" },
  ],
  languages: [
    { languageName: "English", proficiency: "Expert" },
    { languageName: "Arabic", proficiency: "Intermediate" },
    { languageName: "French", proficiency: "Beginner" },
  ],
  projects: [
    {
      name: "DesignOps Portal",
      description:
        "Built an internal operations dashboard for design and engineering teams with role-aware workflows.",
      timePeriod: "2023",
      role: "Lead Frontend Engineer",
      organization: "TechFlow Solutions",
      sourceLink: "https://example.com/designops",
    },
    {
      name: "Candidate Hub",
      description:
        "Shipped a CV and application tracking interface with analytics, filters, and export flows.",
      timePeriod: "2022",
      role: "Full Stack Contributor",
      organization: "CV.net",
      sourceLink: "https://example.com/candidate-hub",
    },
  ],
  publications: [
    {
      title: "Accessible Component Systems for Growing Teams",
      description:
        "A practical guide to scaling accessible design systems across product teams.",
      sourceLink: "https://example.com/publication/accessibility-systems",
      organization: "Frontend Journal",
      year: "2024",
    },
  ],
  teachingExperience: [
    {
      coursesTaught: "Modern Frontend Architecture",
      organization: "Tech Academy",
      timePeriod: "2024",
      curriculumDescription:
        "Covered component architecture, state management, accessibility, and testing strategies.",
    },
  ],
  researchExperience: [
    {
      projectName: "Interface Friction Study",
      labOrFieldWork: "Usability lab",
      organization: "Product Research Lab",
      resultsDescription:
        "Identified interaction patterns that reduced task completion time in dense dashboard experiences.",
      linkedPublication: "Accessible Component Systems for Growing Teams",
    },
  ],
  awards: [
    {
      awardName: "Engineering Excellence Award",
      organization: "TechFlow Solutions",
      description: "Recognized for leadership on the core product redesign.",
    },
  ],
  volunteer: [
    {
      organization: "Code for Good",
      role: "Mentor",
      description:
        "Supported students building their first accessible web apps.",
    },
  ],
};

function hasText(value: unknown) {
  return typeof value === "string" ? value.trim().length > 0 : Boolean(value);
}

function pickString(...values: unknown[]) {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
    if (typeof value === "number" && Number.isFinite(value)) {
      return String(value);
    }
  }
  return "";
}

function isLegacyExperienceItem(item: Record<string, unknown>) {
  return (
    hasText(item.title) || hasText(item.company) || Array.isArray(item.bullets)
  );
}

function normalizeProfile(raw: unknown): CVProfile {
  const source = (raw ?? {}) as Record<string, unknown>;

  return {
    ...defaultProfile,
    fullName: pickString(source.fullName, source.name, defaultProfile.fullName),
    email: pickString(source.email, defaultProfile.email),
    jobrole: pickString(
      source.jobrole,
      source.currentRole,
      defaultProfile.jobrole,
    ),
    phone: pickString(source.phone, defaultProfile.phone),
    address: pickString(source.address, defaultProfile.address),
    portfolioUrl: pickString(
      source.portfolioUrl,
      source.portfolio,
      defaultProfile.portfolioUrl,
    ),
    gpa: pickString(source.gpa, defaultProfile.gpa),
    employmentStatus: pickString(
      source.employmentStatus,
      defaultProfile.employmentStatus,
    ),
    currentOrg: pickString(source.currentOrg, defaultProfile.currentOrg),
    currentPosition: pickString(
      source.currentPosition,
      source.subtitle,
      defaultProfile.currentPosition,
    ),
    personalStatement: pickString(
      source.personalStatement,
      source.summary,
      defaultProfile.personalStatement,
    ),
    aboutMe: pickString(source.aboutMe, defaultProfile.aboutMe),
    socialLinks: Array.isArray(source.socialLinks)
      ? source.socialLinks
          .map((item) => item as Record<string, unknown>)
          .map((item) => ({
            platformName: pickString(item.platformName, item.platform, ""),
            profileUrl: pickString(item.profileUrl, item.url, ""),
          }))
          .filter(
            (item) => hasText(item.platformName) || hasText(item.profileUrl),
          )
      : defaultProfile.socialLinks,
    skills: Array.isArray(source.skills)
      ? source.skills
          .map((item) => {
            if (typeof item === "string") {
              return { skillName: item.trim(), level: "" };
            }

            const record = item as Record<string, unknown>;
            return {
              skillName: pickString(record.skillName, record.name, ""),
              level: pickString(record.level, ""),
            };
          })
          .filter((item) => hasText(item.skillName))
      : defaultProfile.skills,
    experience: Array.isArray(source.experience)
      ? source.experience
          .map((item) => item as Record<string, unknown>)
          .filter(isLegacyExperienceItem)
          .map((item) => ({
            roleTitle: pickString(
              item.roleTitle,
              item.title,
              defaultProfile.experience[0].roleTitle,
            ),
            companyName: pickString(item.companyName, item.company, ""),
            startDate: pickString(item.startDate, ""),
            endDate: pickString(item.endDate, item.period, ""),
            roleDescription: pickString(
              item.roleDescription,
              Array.isArray(item.bullets)
                ? (item.bullets as unknown[]).filter(hasText).join(" ")
                : "",
              "",
            ),
          }))
          .filter(
            (item) =>
              hasText(item.roleTitle) ||
              hasText(item.companyName) ||
              hasText(item.roleDescription),
          )
      : defaultProfile.experience,
    education: Array.isArray(source.education)
      ? source.education
          .map((item) => item as Record<string, unknown>)
          .map((item) => ({
            degreeTitle: pickString(item.degreeTitle, item.degree, ""),
            fieldOfStudy: pickString(item.fieldOfStudy, ""),
            organization: pickString(item.organization, item.school, ""),
            startDate: pickString(item.startDate, ""),
            endDate: pickString(item.endDate, item.period, ""),
            honors: pickString(item.honors, ""),
            thesisTitle: pickString(item.thesisTitle, ""),
            relevantCoursework: pickString(item.relevantCoursework, ""),
          }))
          .filter(
            (item) => hasText(item.degreeTitle) || hasText(item.organization),
          )
      : defaultProfile.education,
    certifications: Array.isArray(source.certifications)
      ? source.certifications
          .map((item) => item as Record<string, unknown>)
          .map((item) => ({
            organization: pickString(item.organization, ""),
            field: pickString(item.field, ""),
            issueDate: pickString(item.issueDate, ""),
          }))
          .filter((item) => hasText(item.organization) || hasText(item.field))
      : defaultProfile.certifications,
    memberships: Array.isArray(source.memberships)
      ? source.memberships
          .map((item) => item as Record<string, unknown>)
          .map((item) => ({
            organizationName: pickString(
              item.organizationName,
              item.organization,
              "",
            ),
          }))
          .filter((item) => hasText(item.organizationName))
      : defaultProfile.memberships,
    languages: Array.isArray(source.languages)
      ? source.languages
          .map((item) => item as Record<string, unknown>)
          .map((item) => ({
            languageName: pickString(item.languageName, item.name, ""),
            proficiency: pickString(item.proficiency, ""),
          }))
          .filter((item) => hasText(item.languageName))
      : defaultProfile.languages,
    projects: Array.isArray(source.projects)
      ? source.projects
          .map((item) => item as Record<string, unknown>)
          .map((item) => ({
            name: pickString(item.name, ""),
            description: pickString(item.description, ""),
            timePeriod: pickString(item.timePeriod, ""),
            role: pickString(item.role, ""),
            organization: pickString(item.organization, ""),
            sourceLink: pickString(item.sourceLink, item.link, ""),
          }))
          .filter((item) => hasText(item.name) || hasText(item.description))
      : defaultProfile.projects,
    publications: Array.isArray(source.publications)
      ? source.publications
          .map((item) => item as Record<string, unknown>)
          .map((item) => ({
            title: pickString(item.title, ""),
            description: pickString(item.description, ""),
            sourceLink: pickString(item.sourceLink, item.link, ""),
            organization: pickString(item.organization, ""),
            year: pickString(item.year, ""),
          }))
          .filter((item) => hasText(item.title) || hasText(item.description))
      : defaultProfile.publications,
    teachingExperience: Array.isArray(source.teachingExperience)
      ? source.teachingExperience
          .map((item) => item as Record<string, unknown>)
          .map((item) => ({
            coursesTaught: pickString(item.coursesTaught, ""),
            organization: pickString(item.organization, ""),
            timePeriod: pickString(item.timePeriod, ""),
            curriculumDescription: pickString(item.curriculumDescription, ""),
          }))
          .filter(
            (item) => hasText(item.coursesTaught) || hasText(item.organization),
          )
      : defaultProfile.teachingExperience,
    researchExperience: Array.isArray(source.researchExperience)
      ? source.researchExperience
          .map((item) => item as Record<string, unknown>)
          .map((item) => ({
            projectName: pickString(item.projectName, ""),
            labOrFieldWork: pickString(item.labOrFieldWork, ""),
            organization: pickString(item.organization, ""),
            resultsDescription: pickString(item.resultsDescription, ""),
            linkedPublication: pickString(item.linkedPublication, ""),
          }))
          .filter(
            (item) =>
              hasText(item.projectName) || hasText(item.resultsDescription),
          )
      : defaultProfile.researchExperience,
    awards: Array.isArray(source.awards)
      ? source.awards
          .map((item) => item as Record<string, unknown>)
          .map((item) => ({
            awardName: pickString(item.awardName, ""),
            organization: pickString(item.organization, ""),
            description: pickString(item.description, ""),
          }))
          .filter(
            (item) => hasText(item.awardName) || hasText(item.description),
          )
      : defaultProfile.awards,
    volunteer: Array.isArray(source.volunteer)
      ? source.volunteer
          .map((item) => item as Record<string, unknown>)
          .map((item) => ({
            organization: pickString(item.organization, ""),
            role: pickString(item.role, ""),
            description: pickString(item.description, ""),
          }))
          .filter((item) => hasText(item.organization) || hasText(item.role))
      : defaultProfile.volunteer,
  };
}

function loadProfile() {
  if (typeof window === "undefined") {
    return defaultProfile;
  }

  for (const key of STORAGE_KEYS) {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw) {
        return normalizeProfile(JSON.parse(raw));
      }
    } catch {
      // Ignore malformed persisted data and fall back to defaults.
    }
  }

  return defaultProfile;
}

function sectionButtonClass(isActive: boolean) {
  return isActive
    ? "bg-blue-600 text-white border-blue-600"
    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50";
}

function SectionCard({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
          {icon}
        </div>
        <h3 className="font-bold text-slate-900">{title}</h3>
      </div>
      {children}
    </section>
  );
}

function InfoPill({ label, value }: { label: string; value: string }) {
  if (!hasText(value)) {
    return null;
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
      <p className="text-[11px] uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="text-sm font-semibold text-slate-900">{value}</p>
    </div>
  );
}

export default function CVPage() {
  const [activeSection, setActiveSection] = useState<SectionName>("All");
  const profile = useMemo(() => loadProfile(), []);

  const sections: SectionName[] = [
    "All",
    "Personal Info",
    "Experience",
    "Education",
    "Skills",
    "Certifications",
    "Languages",
    "Projects",
    "Publications",
    "Teaching",
    "Research",
    "Awards",
    "Volunteer",
    "Memberships",
    "Social Links",
  ];

  const populatedSections = [
    profile.personalStatement,
    profile.aboutMe,
    profile.socialLinks,
    profile.skills,
    profile.experience,
    profile.education,
    profile.certifications,
    profile.languages,
    profile.projects,
    profile.publications,
    profile.teachingExperience,
    profile.researchExperience,
    profile.awards,
    profile.volunteer,
    profile.memberships,
  ].filter((item) => (Array.isArray(item) ? item.length > 0 : hasText(item)));

  const completion = Math.round((populatedSections.length / 15) * 100);
  const showSection = (section: SectionName) =>
    activeSection === "All" || activeSection === section;

  return (
    <div className="p-6 sm:p-8 max-w-7xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            My CV Profile
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Filter the full CV schema and surface only the populated sections.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/cv/preview"
            className="flex items-center gap-1.5 border border-blue-200 text-blue-600 text-sm font-semibold px-3 py-2 rounded-xl hover:bg-blue-50 transition-colors"
          >
            <Eye size={14} /> View CV
          </Link>
          <button
            type="button"
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-3 py-2 rounded-xl transition-colors"
          >
            <Download size={14} /> Download PDF
          </button>
        </div>
      </div>

      <div className="bg-linear-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-5 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative w-14 h-14 shrink-0">
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
                strokeDasharray={`${2 * Math.PI * 20 * (completion / 100)} ${2 * Math.PI * 20 * (1 - completion / 100)}`}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-sm font-extrabold text-blue-600">
              {completion}%
            </span>
          </div>
          <div>
            <p className="font-bold text-slate-900">
              Your profile is now schema-aware.
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              Added filtering for personal info, experience, education, skills,
              certifications, languages, projects, publications, teaching,
              research, awards, volunteer work, and memberships.
            </p>
          </div>
        </div>
        <div className="flex gap-3 shrink-0">
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
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex gap-2 mb-6 flex-wrap">
              {sections.map((section) => (
                <button
                  key={section}
                  onClick={() => setActiveSection(section)}
                  className={`px-4 py-2 text-sm font-semibold rounded-xl border transition-colors ${sectionButtonClass(activeSection === section)}`}
                >
                  {section}
                </button>
              ))}
            </div>

            {showSection("Personal Info") && (
              <SectionCard icon={<Briefcase size={18} />} title="Personal Info">
                <div className="grid sm:grid-cols-2 gap-3">
                  <InfoPill label="Full name" value={profile.fullName} />
                  <InfoPill label="Role" value={profile.jobrole} />
                  <InfoPill label="Email" value={profile.email} />
                  <InfoPill label="Phone" value={profile.phone} />
                  <InfoPill label="Address" value={profile.address} />
                  <InfoPill
                    label="Employment status"
                    value={profile.employmentStatus}
                  />
                  <InfoPill label="Current org" value={profile.currentOrg} />
                  <InfoPill
                    label="Current position"
                    value={profile.currentPosition}
                  />
                  <InfoPill label="Portfolio" value={profile.portfolioUrl} />
                  <InfoPill label="GPA" value={profile.gpa} />
                </div>
                {hasText(profile.personalStatement) && (
                  <div className="mt-4 rounded-xl bg-slate-50 border border-slate-200 p-4">
                    <p className="text-xs uppercase tracking-wide text-slate-400 mb-2">
                      Personal Statement
                    </p>
                    <p className="text-sm text-slate-700 leading-relaxed">
                      {profile.personalStatement}
                    </p>
                  </div>
                )}
                {hasText(profile.aboutMe) && (
                  <div className="mt-4 rounded-xl bg-slate-50 border border-slate-200 p-4">
                    <p className="text-xs uppercase tracking-wide text-slate-400 mb-2">
                      About Me
                    </p>
                    <p className="text-sm text-slate-700 leading-relaxed">
                      {profile.aboutMe}
                    </p>
                  </div>
                )}
              </SectionCard>
            )}

            {showSection("Social Links") && profile.socialLinks.length > 0 && (
              <SectionCard icon={<Link2 size={18} />} title="Social Links">
                <div className="grid gap-3 sm:grid-cols-2">
                  {profile.socialLinks
                    .filter(
                      (item) =>
                        hasText(item.platformName) || hasText(item.profileUrl),
                    )
                    .map((item) => (
                      <div
                        key={`${item.platformName}-${item.profileUrl}`}
                        className="rounded-xl border border-slate-200 p-4"
                      >
                        <p className="text-sm font-semibold text-slate-900">
                          {item.platformName}
                        </p>
                        <p className="text-xs text-slate-500 break-all mt-1">
                          {item.profileUrl}
                        </p>
                      </div>
                    ))}
                </div>
              </SectionCard>
            )}

            {showSection("Experience") && profile.experience.length > 0 && (
              <SectionCard icon={<Briefcase size={18} />} title="Experience">
                <div className="space-y-5">
                  {profile.experience.map((item) => (
                    <div
                      key={`${item.roleTitle}-${item.companyName}-${item.startDate}`}
                      className="border-l-2 border-blue-200 pl-4"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h4 className="font-semibold text-slate-900 text-sm">
                            {item.roleTitle}
                          </h4>
                          <p className="text-xs text-blue-600 font-medium">
                            {item.companyName}
                          </p>
                        </div>
                        <span className="text-xs text-slate-400 whitespace-nowrap">
                          {[item.startDate, item.endDate]
                            .filter(hasText)
                            .join(" - ")}
                        </span>
                      </div>
                      {hasText(item.roleDescription) && (
                        <p className="mt-2 text-xs text-slate-500 leading-relaxed">
                          {item.roleDescription}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </SectionCard>
            )}

            {showSection("Education") && profile.education.length > 0 && (
              <SectionCard icon={<GraduationCap size={18} />} title="Education">
                <div className="space-y-4">
                  {profile.education.map((item) => (
                    <div
                      key={`${item.degreeTitle}-${item.organization}-${item.endDate}`}
                      className="rounded-xl border border-slate-200 p-4"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            {item.degreeTitle}
                          </p>
                          <p className="text-xs text-slate-500">
                            {item.organization}
                          </p>
                        </div>
                        <span className="text-xs text-slate-400 whitespace-nowrap">
                          {[item.startDate, item.endDate]
                            .filter(hasText)
                            .join(" - ")}
                        </span>
                      </div>
                      <div className="mt-3 grid sm:grid-cols-2 gap-2 text-xs text-slate-500">
                        <InfoPill label="Field" value={item.fieldOfStudy} />
                        <InfoPill label="Honors" value={item.honors} />
                        <InfoPill label="Thesis" value={item.thesisTitle} />
                        <InfoPill
                          label="Coursework"
                          value={item.relevantCoursework}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </SectionCard>
            )}

            {showSection("Skills") && profile.skills.length > 0 && (
              <SectionCard icon={<Globe size={18} />} title="Skills">
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((item) => (
                    <span
                      key={`${item.skillName}-${item.level}`}
                      className="bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1.5 rounded-full border border-blue-100"
                    >
                      {item.skillName}
                      {hasText(item.level) ? ` · ${item.level}` : ""}
                    </span>
                  ))}
                </div>
              </SectionCard>
            )}

            {showSection("Certifications") &&
              profile.certifications.length > 0 && (
                <SectionCard icon={<Award size={18} />} title="Certifications">
                  <div className="space-y-3">
                    {profile.certifications.map((item) => (
                      <div
                        key={`${item.organization}-${item.field}-${item.issueDate}`}
                        className="rounded-xl border border-slate-200 p-4"
                      >
                        <p className="text-sm font-semibold text-slate-900">
                          {item.field}
                        </p>
                        <p className="text-xs text-slate-500">
                          {item.organization}
                        </p>
                        <p className="text-[11px] uppercase tracking-wide text-slate-400 mt-2">
                          Issued {item.issueDate}
                        </p>
                      </div>
                    ))}
                  </div>
                </SectionCard>
              )}

            {showSection("Languages") && profile.languages.length > 0 && (
              <SectionCard icon={<Languages size={18} />} title="Languages">
                <div className="flex flex-wrap gap-2">
                  {profile.languages.map((item) => (
                    <span
                      key={`${item.languageName}-${item.proficiency}`}
                      className="bg-slate-50 text-slate-700 text-xs font-semibold px-3 py-1.5 rounded-full border border-slate-200"
                    >
                      {item.languageName}
                      {hasText(item.proficiency)
                        ? ` · ${item.proficiency}`
                        : ""}
                    </span>
                  ))}
                </div>
              </SectionCard>
            )}

            {showSection("Projects") && profile.projects.length > 0 && (
              <SectionCard icon={<FileText size={18} />} title="Projects">
                <div className="space-y-4">
                  {profile.projects.map((item) => (
                    <div
                      key={`${item.name}-${item.timePeriod}`}
                      className="rounded-xl border border-slate-200 p-4"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            {item.name}
                          </p>
                          <p className="text-xs text-slate-500">
                            {item.organization}
                          </p>
                        </div>
                        <span className="text-xs text-slate-400 whitespace-nowrap">
                          {item.timePeriod}
                        </span>
                      </div>
                      <p className="mt-2 text-xs text-slate-500 leading-relaxed">
                        {item.description}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-slate-400">
                        <span className="rounded-full border border-slate-200 px-2 py-1">
                          {item.role}
                        </span>
                        {hasText(item.sourceLink) && (
                          <span className="rounded-full border border-slate-200 px-2 py-1 break-all">
                            {item.sourceLink}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </SectionCard>
            )}

            {showSection("Publications") && profile.publications.length > 0 && (
              <SectionCard icon={<BookOpen size={18} />} title="Publications">
                <div className="space-y-3">
                  {profile.publications.map((item) => (
                    <div
                      key={`${item.title}-${item.year}`}
                      className="rounded-xl border border-slate-200 p-4"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            {item.title}
                          </p>
                          <p className="text-xs text-slate-500">
                            {item.organization}
                          </p>
                        </div>
                        <span className="text-xs text-slate-400 whitespace-nowrap">
                          {item.year}
                        </span>
                      </div>
                      <p className="mt-2 text-xs text-slate-500 leading-relaxed">
                        {item.description}
                      </p>
                      {hasText(item.sourceLink) && (
                        <p className="mt-2 text-[11px] text-slate-400 break-all">
                          {item.sourceLink}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </SectionCard>
            )}

            {showSection("Teaching") &&
              profile.teachingExperience.length > 0 && (
                <SectionCard
                  icon={<Users size={18} />}
                  title="Teaching Experience"
                >
                  <div className="space-y-3">
                    {profile.teachingExperience.map((item) => (
                      <div
                        key={`${item.coursesTaught}-${item.organization}`}
                        className="rounded-xl border border-slate-200 p-4"
                      >
                        <p className="text-sm font-semibold text-slate-900">
                          {item.coursesTaught}
                        </p>
                        <p className="text-xs text-slate-500">
                          {item.organization} · {item.timePeriod}
                        </p>
                        <p className="mt-2 text-xs text-slate-500 leading-relaxed">
                          {item.curriculumDescription}
                        </p>
                      </div>
                    ))}
                  </div>
                </SectionCard>
              )}

            {showSection("Research") &&
              profile.researchExperience.length > 0 && (
                <SectionCard
                  icon={<BookOpen size={18} />}
                  title="Research Experience"
                >
                  <div className="space-y-3">
                    {profile.researchExperience.map((item) => (
                      <div
                        key={`${item.projectName}-${item.organization}`}
                        className="rounded-xl border border-slate-200 p-4"
                      >
                        <p className="text-sm font-semibold text-slate-900">
                          {item.projectName}
                        </p>
                        <p className="text-xs text-slate-500">
                          {item.organization}
                        </p>
                        <p className="mt-2 text-xs text-slate-500 leading-relaxed">
                          {item.resultsDescription}
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-slate-400">
                          {hasText(item.labOrFieldWork) && (
                            <span className="rounded-full border border-slate-200 px-2 py-1">
                              {item.labOrFieldWork}
                            </span>
                          )}
                          {hasText(item.linkedPublication) && (
                            <span className="rounded-full border border-slate-200 px-2 py-1 break-all">
                              {item.linkedPublication}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </SectionCard>
              )}

            {showSection("Awards") && profile.awards.length > 0 && (
              <SectionCard icon={<Award size={18} />} title="Awards">
                <div className="space-y-3">
                  {profile.awards.map((item) => (
                    <div
                      key={`${item.awardName}-${item.organization}`}
                      className="rounded-xl border border-slate-200 p-4"
                    >
                      <p className="text-sm font-semibold text-slate-900">
                        {item.awardName}
                      </p>
                      <p className="text-xs text-slate-500">
                        {item.organization}
                      </p>
                      <p className="mt-2 text-xs text-slate-500 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  ))}
                </div>
              </SectionCard>
            )}

            {showSection("Volunteer") && profile.volunteer.length > 0 && (
              <SectionCard icon={<Users size={18} />} title="Volunteer Work">
                <div className="space-y-3">
                  {profile.volunteer.map((item) => (
                    <div
                      key={`${item.organization}-${item.role}`}
                      className="rounded-xl border border-slate-200 p-4"
                    >
                      <p className="text-sm font-semibold text-slate-900">
                        {item.role}
                      </p>
                      <p className="text-xs text-slate-500">
                        {item.organization}
                      </p>
                      <p className="mt-2 text-xs text-slate-500 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  ))}
                </div>
              </SectionCard>
            )}

            {showSection("Memberships") && profile.memberships.length > 0 && (
              <SectionCard icon={<Users size={18} />} title="Memberships">
                <div className="flex flex-wrap gap-2">
                  {profile.memberships.map((item) => (
                    <span
                      key={item.organizationName}
                      className="bg-slate-50 text-slate-700 text-xs font-semibold px-3 py-1.5 rounded-full border border-slate-200"
                    >
                      {item.organizationName}
                    </span>
                  ))}
                </div>
              </SectionCard>
            )}
          </div>
        </div>

        <div className="space-y-5">
          <div className="grid gap-5 xl:grid-cols-2">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <h3 className="font-bold text-slate-900 mb-4">Resume</h3>
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

            {/* Quick Details removed per request */}

            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <h3 className="font-bold text-slate-900 mb-4">Export</h3>
              <p className="text-xs text-slate-500">
                Use the header actions to view or download the CV.
              </p>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-4">Coverage</h3>
            <div className="space-y-2 text-sm text-slate-600">
              <p>{profile.experience.length} experience entries</p>
              <p>{profile.education.length} education entries</p>
              <p>{profile.projects.length} projects</p>
              <p>{profile.publications.length} publications</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Briefcase, GraduationCap, Brain, FolderGit2, BookOpen,
  Microscope, Code, Award, Globe2, Users, HeartHandshake,
  User as UserIcon, ArrowLeft, Mail, Phone, ExternalLink,
  Download, Loader2, Sparkles, ChevronRight
} from 'lucide-react';
import axios from 'axios';
import { auth } from '@/lib/firebaseConfig';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ScoreRingProps {
  score: number;
  label: string;
  subLabel: string;
  color: string;
  trackColor: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatMonthYear = (dateString?: string) => {
  if (!dateString) return 'Present';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric' }).format(d);
  } catch { return dateString; }
};

const asArray = <T,>(v: T | T[] | null | undefined): T[] => {
  if (!v) return [];
  return Array.isArray(v) ? v : [v as T];
};

const firstNonEmpty = (...values: unknown[]) => {
  for (const v of values) {
    if (typeof v === 'string' && v.trim()) return v.trim();
    if (typeof v === 'number' && Number.isFinite(v)) return String(v);
  }
  return '';
};

const getSkillName = (skill: any, i: number) =>
  typeof skill === 'string' ? skill :
    firstNonEmpty(skill?.skillName, skill?.skill_name, skill?.name, skill?.title, skill?.label, skill?.skill, skill?.domain) || `Skill ${i + 1}`;

const getSkillLevel = (skill: any) =>
  typeof skill === 'string' ? 'Not specified' :
    firstNonEmpty(skill?.level, skill?.proficiency, skill?.proficiencyLevel, skill?.experienceLevel) || 'Not specified';

const getLinkLabel = (link: any, i: number) =>
  typeof link === 'string' ? link :
    firstNonEmpty(link?.platformName, link?.platform_name, link?.platform, link?.name, link?.title, link?.label) || `Link ${i + 1}`;

const normalizeProfile = (raw: any) => ({
  appId: firstNonEmpty(raw?.appId, raw?.id),
  gpa: raw?.gpa ? Number(raw.gpa) : null,
  fullName: firstNonEmpty(raw?.fullName, raw?.name, raw?.displayName, raw?.candidateName),
  email: firstNonEmpty(raw?.email),
  phone: firstNonEmpty(raw?.phone, raw?.phoneNumber),
  profileImageUrl: firstNonEmpty(raw?.profileImageUrl, raw?.profile_image_url, raw?.photoUrl, raw?.avatarUrl),
  jobRole: firstNonEmpty(raw?.jobRole, raw?.role, raw?.title),
  currentOrg: firstNonEmpty(raw?.currentOrg, raw?.currentOrganization, raw?.organization),
  currentPosition: firstNonEmpty(raw?.currentPosition, raw?.position, raw?.currentTitle),
  matchScore: Number(raw?.matchScore ?? raw?.match_score ?? 0),
  industryScore: Number(raw?.industryScore ?? raw?.industry_score ?? 0),
  companySkillMatchScore: Number(raw?.companySkillMatchScore ?? raw?.CompanySkillMatchScore ?? raw?.company_skill_match_score ?? 0),
  personalStatement: firstNonEmpty(raw?.personalStatement, raw?.personal_statement),
  aboutMe: firstNonEmpty(raw?.aboutMe, raw?.about_me),
  cvUrl: firstNonEmpty(raw?.cvUrl, raw?.cv_url, raw?.resumeUrl),
  portfolioUrl: firstNonEmpty(raw?.portfolioUrl, raw?.portfolio_url),
  experience: asArray(raw?.experience ?? raw?.snapshotExperience),
  education: asArray(raw?.education ?? raw?.snapshotEducation),
  skills: asArray(raw?.skills ?? raw?.snapshotSkills),
  projects: asArray(raw?.projects ?? raw?.snapshotProjects),
  publications: asArray(raw?.publications ?? raw?.snapshotPublications),
  certifications: asArray(raw?.certifications ?? raw?.snapshotCertifications),
  memberships: asArray(raw?.memberships ?? raw?.snapshotMemberships),
  languages: asArray(raw?.languages ?? raw?.snapshotLanguages),
  teachingExperience: asArray(raw?.teachingExperience ?? raw?.snapshotTeachingExperience),
  researchExperience: asArray(raw?.researchExperience ?? raw?.snapshotResearchExperience),
  awards: asArray(raw?.awards ?? raw?.snapshotAwards),
  volunteers: asArray(raw?.volunteers ?? raw?.snapshotVolunteers),
  socialLinks: asArray(raw?.socialLinks ?? raw?.snapshotSocialLinks),
});

// ─── Score Ring ───────────────────────────────────────────────────────────────

function ScoreRing({ score, label, subLabel, color, trackColor }: ScoreRingProps) {
  const r = 34;
  const circ = 2 * Math.PI * r;
  const safe = score || 0;
  const offset = circ - (safe / 100) * circ;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative flex items-center justify-center">
        <svg width="88" height="88" className="-rotate-90">
          <circle cx="44" cy="44" r={r} strokeWidth="7" fill="transparent" stroke={trackColor} />
          <circle
            cx="44" cy="44" r={r} strokeWidth="7" fill="transparent"
            stroke={color} strokeDasharray={circ} strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <span className="absolute text-lg font-black text-white tabular-nums">{safe}%</span>
      </div>
      <div className="text-center">
        <p className="text-sm font-bold text-white">{label}</p>
        <p className="text-[10px] text-slate-400 mt-0.5 leading-snug max-w-[100px]">{subLabel}</p>
      </div>
    </div>
  );
}

// ─── Section label ────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">{children}</p>
  );
}

// ─── Timeline Item ────────────────────────────────────────────────────────────

function TimelineItem({
  icon: Icon, iconBg, iconColor,
  title, subtitle, meta, children
}: {
  icon: React.ElementType; iconBg: string; iconColor: string;
  title: string; subtitle?: string; meta?: string; children?: React.ReactNode;
}) {
  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: iconBg, color: iconColor }}>
          <Icon size={15} />
        </div>
        <div className="flex-1 w-px bg-slate-100 mt-2 mb-0" />
      </div>
      <div className="pb-6 flex-1 min-w-0">
        <p className="font-semibold text-slate-900 text-sm leading-snug">{title}</p>
        {subtitle && <p className="text-xs font-semibold mt-0.5" style={{ color: iconColor }}>{subtitle}</p>}
        {meta && <p className="text-xs text-slate-400 mt-0.5">{meta}</p>}
        {children && <div className="mt-3">{children}</div>}
      </div>
    </div>
  );
}

// ─── Tab content wrapper ──────────────────────────────────────────────────────

function CardGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-3 sm:grid-cols-2">{children}</div>;
}

function InfoCard({ title, meta, description, href }: {
  title: string; meta?: string; description?: string; href?: string;
}) {
  return (
    <div className="bg-slate-50 rounded-xl border border-slate-100 p-4 space-y-1.5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-semibold text-slate-900 leading-snug">{title}</p>
        {href && (
          <a href={href} target="_blank" rel="noreferrer"
            className="shrink-0 w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:border-blue-200 transition-colors">
            <ExternalLink size={12} />
          </a>
        )}
      </div>
      {meta && <p className="text-xs text-slate-400 font-medium">{meta}</p>}
      {description && <p className="text-xs text-slate-600 leading-relaxed">{description}</p>}
    </div>
  );
}

// ─── Avatar ───────────────────────────────────────────────────────────────────

function ProfileAvatar({ name, imageUrl }: { name: string; imageUrl: string }) {
  if (imageUrl) {
    return <img src={imageUrl} alt={name} className="w-16 h-16 rounded-2xl object-cover border-2 border-white shadow-lg shrink-0" />;
  }
  return (
    <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-white text-2xl font-black shrink-0 border-2 border-white/30">
      {name?.charAt(0)?.toUpperCase() ?? '?'}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function CandidateProfilePage() {
  const params = useParams();
  const router = useRouter();
  const appId = params.id as string;

  const [data, setData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;
        const token = await user.getIdToken();
        const res = await axios.get(`http://localhost:5167/api/JobDetails/applicant-profile/${appId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setData(normalizeProfile(res.data?.data ?? res.data));
      } catch (e) {
        console.error('Failed to load full profile', e);
      } finally {
        setIsLoading(false);
      }
    };

    const unsub = auth.onAuthStateChanged(user => { if (user) fetchProfile(); });
    return () => unsub();
  }, [appId]);

  const sections = data ? [
    { key: 'experience', label: 'Experience', icon: Briefcase, hasData: !!data.experience?.length },
    { key: 'education', label: 'Education', icon: GraduationCap, hasData: !!data.education?.length },
    { key: 'skills', label: 'Skills', icon: Brain, hasData: !!data.skills?.length },
    { key: 'projects', label: 'Projects', icon: FolderGit2, hasData: !!data.projects?.length },
    { key: 'publications', label: 'Publications', icon: BookOpen, hasData: !!data.publications?.length },
    { key: 'researchExperience', label: 'Research', icon: Microscope, hasData: !!data.researchExperience?.length },
    { key: 'teachingExperience', label: 'Teaching', icon: Code, hasData: !!data.teachingExperience?.length },
    { key: 'certifications', label: 'Certifications', icon: Award, hasData: !!data.certifications?.length },
    { key: 'awards', label: 'Awards', icon: Award, hasData: !!data.awards?.length },
    { key: 'languages', label: 'Languages', icon: Globe2, hasData: !!data.languages?.length },
    { key: 'memberships', label: 'Memberships', icon: Users, hasData: !!data.memberships?.length },
    { key: 'volunteers', label: 'Volunteer', icon: HeartHandshake, hasData: !!data.volunteers?.length },
    { key: 'about', label: 'About', icon: UserIcon, hasData: !!(data.aboutMe || data.personalStatement) },
  ].filter(s => s.hasData) : [];

  useEffect(() => {
    if (!data || sections.length === 0) return;
    setActiveTab(prev => {
      if (!prev) return sections[0].key;
      return sections.some(s => s.key === prev) ? prev : sections[0].key;
    });
  }, [data]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <header className="bg-white border-b border-slate-100 sticky top-0 z-40 h-14" />
        <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-5">
          {/* Hero Banner Skeleton */}
          <div className="bg-slate-800 rounded-2xl p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row gap-5">
              <div className="flex items-start gap-4 flex-1 min-w-0">
                <div className="w-16 h-16 rounded-2xl bg-slate-700 animate-pulse shrink-0"></div>
                <div className="space-y-3 flex-1 pt-1 min-w-0">
                  <div className="h-6 bg-slate-700 rounded-lg animate-pulse w-3/4 max-w-[200px]"></div>
                  <div className="h-4 bg-slate-700/50 rounded animate-pulse w-1/2 max-w-[150px]"></div>
                  <div className="flex gap-2 pt-2">
                    <div className="h-7 bg-slate-700/30 rounded-lg animate-pulse w-24"></div>
                    <div className="h-7 bg-slate-700/30 rounded-lg animate-pulse w-24"></div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-6 sm:gap-8 justify-center sm:justify-start sm:border-l sm:border-white/10 sm:pl-8 pt-4 sm:pt-0 border-t border-white/10 sm:border-t-0">
                 <div className="w-20 h-20 rounded-full bg-slate-700 animate-pulse"></div>
                 <div className="w-20 h-20 rounded-full bg-slate-700 animate-pulse"></div>
              </div>
            </div>
          </div>
          
          {/* Main Content Skeleton */}
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
            <div className="flex gap-1 p-2 border-b border-slate-100 bg-slate-50/50">
              <div className="h-8 bg-slate-200 rounded-xl animate-pulse w-24"></div>
              <div className="h-8 bg-slate-200 rounded-xl animate-pulse w-24"></div>
              <div className="h-8 bg-slate-200 rounded-xl animate-pulse w-24"></div>
            </div>
            <div className="p-5 sm:p-6 space-y-6">
              {[1, 2].map(i => (
                <div key={i} className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 animate-pulse shrink-0"></div>
                  <div className="space-y-2.5 flex-1 pt-1">
                    <div className="h-4 bg-slate-200 rounded animate-pulse w-1/3"></div>
                    <div className="h-3 bg-slate-100 rounded animate-pulse w-1/4"></div>
                    <div className="h-2.5 bg-slate-50 rounded animate-pulse w-1/5 mt-1"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4">
        <p className="text-base font-bold text-slate-800">Profile not found</p>
        <button
          onClick={() => router.back()}
          className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
        >
          Go back
        </button>
      </div>
    );
  }

  const GENERIC_LIST_TABS = ['publications', 'certifications', 'awards', 'languages', 'memberships', 'volunteers'];

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── Top Bar ── */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-3">
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-sm font-semibold text-slate-900 hidden sm:block">Recruiter</span>
            <ChevronRight size={14} className="text-slate-300 hidden sm:block" />
            <button onClick={() => router.back()} className="text-sm font-semibold text-slate-400 hover:text-slate-700 transition-colors hidden sm:block">
              Candidates
            </button>
            <ChevronRight size={14} className="text-slate-300 hidden sm:block" />
            <span className="text-sm font-semibold text-slate-900 truncate max-w-[180px] hidden sm:block">{data.fullName}</span>
          </div>

          <button
            onClick={() => router.back()}
            className="sm:hidden flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft size={15} /> Back
          </button>

          {data.cvUrl && (
            <a
              href={data.cvUrl} target="_blank" rel="noopener noreferrer"
              className="ml-auto shrink-0 inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-3.5 py-2 rounded-xl transition-colors"
            >
              <Download size={13} /> CV
            </a>
          )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-5">

        {/* ── Hero banner ── */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row gap-5">

            {/* Left: identity */}
            <div className="flex items-start gap-4 flex-1 min-w-0">
              <ProfileAvatar name={data.fullName} imageUrl={data.profileImageUrl} />
              <div className="min-w-0 pt-0.5">
                <h1 className="text-xl font-bold text-white truncate">{data.fullName}</h1>
                <p className="text-sm font-medium text-blue-300 mt-0.5 truncate">
                  {data.currentPosition || data.jobRole}
                  {data.currentOrg && <span className="text-slate-400"> · {data.currentOrg}</span>}
                </p>

                {/* Contact pills */}
                <div className="flex flex-wrap gap-2 mt-3">
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-300 bg-white/10 px-3 py-1.5 rounded-lg">
                    <Mail size={11} className="text-slate-400" /> {data.email}
                  </span>
                  {data.phone && (
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-300 bg-white/10 px-3 py-1.5 rounded-lg">
                      <Phone size={11} className="text-slate-400" /> {data.phone}
                    </span>
                  )}
                </div>

                {/* Links */}
                <div className="flex flex-wrap gap-2 mt-3">
                  {data.portfolioUrl && (
                    <a href={data.portfolioUrl} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-300 bg-emerald-900/30 border border-emerald-700/30 px-3 py-1.5 rounded-lg hover:bg-emerald-900/50 transition-colors">
                      <ExternalLink size={11} /> Portfolio
                    </a>
                  )}
                  {data.cvUrl && (
                    <a href={data.cvUrl} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300 bg-white/10 border border-white/10 px-3 py-1.5 rounded-lg hover:bg-white/20 transition-colors">
                      <Download size={11} /> Resume
                    </a>
                  )}
                  {asArray(data.socialLinks).map((link, i) => {
                    const href = firstNonEmpty(link?.profileUrl, link?.url, link?.href);
                    if (!href) return null;
                    return (
                      <a key={i} href={href} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-300 bg-blue-900/30 border border-blue-700/30 px-3 py-1.5 rounded-lg hover:bg-blue-900/50 transition-colors">
                        <Globe2 size={11} /> {getLinkLabel(link, i)}
                      </a>
                    );
                  })}
                  {data.gpa && data.gpa > 0 && (
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-violet-300 bg-violet-900/30 border border-violet-700/30 px-3 py-1.5 rounded-lg">
                      <GraduationCap size={11} /> GPA {data.gpa.toFixed(2)}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Right: score rings */}
            <div className="flex items-center gap-6 sm:gap-8 justify-center sm:justify-start sm:border-l sm:border-white/10 sm:pl-8 pt-4 sm:pt-0 border-t border-white/10 sm:border-t-0">
              <ScoreRing
                score={data.industryScore}
                label="Match score"
                subLabel="Against posted skills"
                color="#34d399"
                trackColor="rgba(255,255,255,0.1)"
              />
              <ScoreRing
                score={data.matchScore}
                label="Industry score"
                subLabel="Overall industry fit"
                color="#60a5fa"
                trackColor="rgba(255,255,255,0.1)"
              />
            </div>
          </div>
        </div>

        {/* ── Main content ── */}
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">

          {/* Tab bar */}
          <div className="flex gap-1 p-2 border-b border-slate-100 overflow-x-auto scrollbar-none bg-slate-50/50">
            {sections.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl transition-all whitespace-nowrap ${activeTab === tab.key
                      ? 'bg-white text-blue-600 shadow-sm border border-slate-100'
                      : 'text-slate-500 hover:text-slate-800 hover:bg-white/60'
                    }`}
                >
                  <Icon size={12} /> {tab.label}
                </button>
              );
            })}
          </div>

          {/* Tab content */}
          <div className="p-5 sm:p-6">

            {/* Experience */}
            {activeTab === 'experience' && (
              <div className="space-y-0">
                {data.experience?.map((exp: any, i: number) => (
                  <TimelineItem
                    key={i} icon={Briefcase} iconBg="#eff6ff" iconColor="#2563eb"
                    title={exp.roleDescription}
                    subtitle={exp.companyName}
                    meta={`${formatMonthYear(exp.startDate)} – ${formatMonthYear(exp.endDate)}`}
                  />
                ))}
              </div>
            )}

            {/* Education */}
            {activeTab === 'education' && (
              <div className="space-y-0">
                {data.education?.map((edu: any, i: number) => (
                  <TimelineItem
                    key={i} icon={GraduationCap} iconBg="#f5f3ff" iconColor="#7c3aed"
                    title={`${edu.degreeTitle}${edu.fieldOfStudy ? ` · ${edu.fieldOfStudy}` : ''}`}
                    subtitle={edu.organization}
                    meta={`${formatMonthYear(edu.startDate)} – ${formatMonthYear(edu.endDate)}`}
                  >
                    {(edu.honors || edu.thesisTitle || edu.relevantCoursework) && (
                      <div className="bg-slate-50 rounded-xl border border-slate-100 p-4 text-xs space-y-1.5 text-slate-600">
                        {edu.honors && <p><span className="font-semibold text-slate-700">Honors:</span> {edu.honors}</p>}
                        {edu.thesisTitle && <p><span className="font-semibold text-slate-700">Thesis:</span> {edu.thesisTitle}</p>}
                        {edu.relevantCoursework && <p><span className="font-semibold text-slate-700">Coursework:</span> {edu.relevantCoursework}</p>}
                      </div>
                    )}
                  </TimelineItem>
                ))}
              </div>
            )}

            {/* Skills */}
            {activeTab === 'skills' && (
              <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                {asArray(data.skills).map((skill, i) => {
                  const level = getSkillLevel(skill);
                  const name = getSkillName(skill, i);
                  const levelStyle =
                    level === 'Expert' ? { bg: '#f0fdf4', color: '#15803d', tag: '#dcfce7', tagColor: '#166534' } :
                      level === 'Intermediate' ? { bg: '#eff6ff', color: '#1d4ed8', tag: '#dbeafe', tagColor: '#1e40af' } :
                        { bg: '#f8fafc', color: '#475569', tag: '#e2e8f0', tagColor: '#475569' };
                  return (
                    <div key={i} className="flex items-center justify-between p-3.5 rounded-xl border"
                      style={{ backgroundColor: levelStyle.bg, borderColor: levelStyle.tag }}>
                      <span className="text-sm font-semibold text-slate-800 leading-snug">{name}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md ml-2 shrink-0"
                        style={{ backgroundColor: levelStyle.tag, color: levelStyle.tagColor }}>
                        {level}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Projects */}
            {activeTab === 'projects' && (
              <CardGrid>
                {data.projects?.map((proj: any, i: number) => (
                  <InfoCard
                    key={i}
                    title={proj.name}
                    meta={[proj.role, proj.organization, proj.timePeriod].filter(Boolean).join(' · ')}
                    description={proj.description}
                    href={proj.sourceLink}
                  />
                ))}
              </CardGrid>
            )}

            {/* Research */}
            {activeTab === 'researchExperience' && (
              <CardGrid>
                {data.researchExperience?.map((res: any, i: number) => (
                  <InfoCard
                    key={i}
                    title={res.projectName}
                    meta={res.organization}
                    description={res.resultsDescription}
                  />
                ))}
              </CardGrid>
            )}

            {/* Teaching */}
            {activeTab === 'teachingExperience' && (
              <CardGrid>
                {data.teachingExperience?.map((teach: any, i: number) => (
                  <InfoCard
                    key={i}
                    title={teach.coursesTaught}
                    meta={[teach.organization, teach.timePeriod].filter(Boolean).join(' · ')}
                    description={teach.curriculumDescription}
                  />
                ))}
              </CardGrid>
            )}

            {/* About */}
            {activeTab === 'about' && (
              <div className="space-y-5">
                {data.personalStatement && (
                  <div>
                    <SectionLabel>Personal statement</SectionLabel>
                    <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 rounded-xl border border-slate-100 p-5">
                      {data.personalStatement}
                    </p>
                  </div>
                )}
                {data.aboutMe && (
                  <div>
                    <SectionLabel>About me</SectionLabel>
                    <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 rounded-xl border border-slate-100 p-5">
                      {data.aboutMe}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Generic list tabs */}
            {GENERIC_LIST_TABS.includes(activeTab) && (
              <CardGrid>
                {asArray((data as any)[activeTab]).map((item: any, i: number) => {
                  const title = firstNonEmpty(
                    item?.title, item?.field, item?.awardName, item?.award_name,
                    item?.languageName, item?.language_name, item?.organizationName,
                    item?.organization_name, item?.role, item?.organization
                  ) || `Item ${i + 1}`;
                  const meta = firstNonEmpty(item?.issuer, item?.issuedBy, item?.organization, item?.organizationName);
                  const href = firstNonEmpty(item?.sourceLink, item?.url);
                  return (
                    <InfoCard
                      key={i}
                      title={title}
                      meta={meta}
                      description={item?.description}
                      href={href || undefined}
                    />
                  );
                })}
              </CardGrid>
            )}

          </div>
        </div>

        {/* ── AI score note ── */}
        <p className="text-center text-xs text-slate-400 font-medium pb-4">
          Scores are calculated from the frozen snapshot at the exact time of application.
        </p>

      </main>
    </div>
  );
}
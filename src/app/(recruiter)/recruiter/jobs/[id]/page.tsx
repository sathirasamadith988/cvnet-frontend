'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { 
  MapPin, Briefcase, Search, ChevronDown, Mail, Phone, Loader2,
  GraduationCap, Clock, Users, FileText, UserCircle, DollarSign,
  Brain, Download, ArrowLeft, Award, BookOpen, FolderGit2,
  Globe2, Microscope, HeartHandshake, User as UserIcon, X, ChevronRight,
  ExternalLink, Code
} from 'lucide-react';
import axios from 'axios';
import { auth } from '@/lib/firebaseConfig';

// ─── Constants ────────────────────────────────────────────────────────────────
const pipelineStatuses = ['Pending', 'Interview', 'Rejected'];

// ─── Types ────────────────────────────────────────────────────────────────────
interface ScoreRingProps {
  score: number;
  label: string;
  colorClass: string;
  subLabel: string;
  dark?: boolean;
}

type FullApplicantProfileDto = {
  appId: string;
  fullName: string;
  email: string;
  phone?: string;
  profileImageUrl?: string;
  gpa?: number | null;
  jobRole: string;
  currentOrg?: string;
  currentPosition?: string;

  matchScore: number;
  industryScore: number;
  companySkillMatchScore: number;

  personalStatement: string;
  aboutMe: string;

  cvUrl: string;
  portfolioUrl: string;

  experience?: any[];
  education?: any[];
  skills?: any[];
  projects?: any[];
  publications?: any[];
  certifications?: any[];
  memberships?: any[];
  languages?: any[];
  teachingExperience?: any[];
  researchExperience?: any[];
  awards?: any[];
  volunteers?: any[];
  socialLinks?: any[];
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatMonthYear = (dateString?: string) => {
  if (!dateString) return 'Present';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric' }).format(date);
  } catch { return dateString; }
};

const asArray = <T,>(value: T | T[] | null | undefined): T[] => {
  if (!value) return [];
  return Array.isArray(value) ? value : [value as T];
};

const firstNonEmpty = (...values: unknown[]) => {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) return value.trim();
    if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  }
  return '';
};

// Fix 1: Handle when 'skill' is a pure string in Inline Quick-View mapping
const getSkillName = (skill: any, index: number) => {
  if (typeof skill === 'string') return skill;
  return firstNonEmpty(skill?.skillName, skill?.skill_name, skill?.name, skill?.title, skill?.label, skill?.skill, skill?.domain) || `Skill ${index + 1}`;
};

const getSkillLevel = (skill: any) => {
  if (typeof skill === 'string') return 'Not specified';
  return firstNonEmpty(skill?.level, skill?.proficiency, skill?.proficiencyLevel, skill?.experienceLevel) || 'Not specified';
};

const getLinkLabel = (link: any, index: number) => {
  if (typeof link === 'string') return link;
  return firstNonEmpty(link?.platformName, link?.platform_name, link?.platform, link?.name, link?.title, link?.label) || `Link ${index + 1}`;
};

const normalizeTextList = (value: any) =>
  asArray(value).map((item) => (typeof item === 'string' ? item : firstNonEmpty(item?.name, item?.title, item?.label, item?.skillName, item?.degreeTitle, item?.organizationName, item?.role) || '')).filter(Boolean);

const normalizeProfile = (raw: any): FullApplicantProfileDto => ({
  appId: firstNonEmpty(raw?.appId, raw?.id),
  fullName: firstNonEmpty(raw?.fullName, raw?.name, raw?.displayName, raw?.candidateName),
  email: firstNonEmpty(raw?.email),
  gpa: raw?.gpa ? Number(raw.gpa) : null,
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
  experience: asArray(raw?.experience ?? raw?.snapshotExperience ?? raw?.snapshot_experience),
  education: asArray(raw?.education ?? raw?.snapshotEducation ?? raw?.snapshot_education),
  skills: asArray(raw?.skills ?? raw?.snapshotSkills ?? raw?.snapshot_skills),
  projects: asArray(raw?.projects ?? raw?.snapshotProjects ?? raw?.snapshot_projects),
  publications: asArray(raw?.publications ?? raw?.snapshotPublications ?? raw?.snapshot_publications),
  certifications: asArray(raw?.certifications ?? raw?.snapshotCertifications ?? raw?.snapshot_certifications),
  memberships: asArray(raw?.memberships ?? raw?.snapshotMemberships ?? raw?.snapshot_memberships),
  languages: asArray(raw?.languages ?? raw?.snapshotLanguages ?? raw?.snapshot_languages),
  teachingExperience: asArray(raw?.teachingExperience ?? raw?.snapshotTeachingExperience ?? raw?.snapshot_teaching_experience),
  researchExperience: asArray(raw?.researchExperience ?? raw?.snapshotResearchExperience ?? raw?.snapshot_research_experience),
  awards: asArray(raw?.awards ?? raw?.snapshotAwards ?? raw?.snapshot_awards),
  volunteers: asArray(raw?.volunteers ?? raw?.snapshotVolunteers ?? raw?.snapshot_volunteers),
  socialLinks: asArray(raw?.socialLinks ?? raw?.snapshotSocialLinks ?? raw?.snapshot_social_links),
});
// ─── ScoreRing ────────────────────────────────────────────────────────────────
const ScoreRing = ({ score, label, colorClass, subLabel, dark = false }: ScoreRingProps) => {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const safeScore = score || 0;
  const strokeDashoffset = circumference - (safeScore / 100) * circumference;

  return (
    <div className={`flex flex-col items-center p-4 rounded-2xl border ${
      dark 
        ? 'bg-white/5 border-white/10 backdrop-blur-sm' 
        : 'bg-white border-slate-100 shadow-sm'
    }`}>
      <div className="relative flex items-center justify-center">
        <svg className="w-24 h-24 transform -rotate-90">
          <circle cx="48" cy="48" r={radius} stroke="currentColor" strokeWidth="8" fill="transparent"
            className={dark ? 'text-white/10' : 'text-slate-100'} />
          <circle cx="48" cy="48" r={radius} stroke="currentColor" strokeWidth="8" fill="transparent"
            strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
            className={`transition-all duration-1000 ease-out ${colorClass}`}
            strokeLinecap="round"
          />
        </svg>
        <span className={`absolute text-xl font-black ${dark ? 'text-white' : 'text-slate-800'}`}>{safeScore}%</span>
      </div>
      <p className={`mt-3 text-sm font-bold ${dark ? 'text-white' : 'text-slate-800'}`}>{label}</p>
      <p className={`text-[10px] font-medium text-center ${dark ? 'text-slate-400' : 'text-slate-400'}`}>{subLabel}</p>
    </div>
  );
};

// ─── Full Profile Modal ───────────────────────────────────────────────────────
function FullProfileModal({ appId, jobId, onClose }: { appId: string; jobId: string; onClose: () => void }) {
  const [data, setData] = useState<FullApplicantProfileDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('');

  useEffect(() => {
    const fetch = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;
        const token = await user.getIdToken();
        const res = await axios.get(`http://localhost:5167/api/JobDetails/applicant-profile/${appId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setData(normalizeProfile(res.data?.data ?? res.data));
      } catch (e) {
        console.error('Failed to load full profile', e);
      } finally {
        setIsLoading(false);
      }
    };
    fetch();
  }, [appId]);

  const availableSections = data ? [
    { key: 'experience',        label: 'Experience',    icon: Briefcase,     hasData: !!data.experience?.length },
    { key: 'education',         label: 'Education',     icon: GraduationCap, hasData: !!data.education?.length },
    { key: 'skills',            label: 'Skills',        icon: Brain,         hasData: !!data.skills?.length },
    { key: 'projects',          label: 'Projects',      icon: FolderGit2,    hasData: !!data.projects?.length },
    { key: 'publications',      label: 'Publications',  icon: BookOpen,      hasData: !!data.publications?.length },
    { key: 'researchExperience',label: 'Research',      icon: Microscope,    hasData: !!data.researchExperience?.length },
    { key: 'teachingExperience',label: 'Teaching',      icon: Code,          hasData: !!data.teachingExperience?.length },
    { key: 'certifications',    label: 'Certifications',icon: Award,         hasData: !!data.certifications?.length },
    { key: 'awards',            label: 'Awards',        icon: Award,         hasData: !!data.awards?.length },
    { key: 'languages',         label: 'Languages',     icon: Globe2,        hasData: !!data.languages?.length },
    { key: 'memberships',       label: 'Memberships',   icon: Users,         hasData: !!data.memberships?.length },
    { key: 'volunteers',        label: 'Volunteer',     icon: HeartHandshake,hasData: !!data.volunteers?.length },
    { key: 'about',             label: 'About',         icon: UserIcon,      hasData: !!data.aboutMe || !!data.personalStatement },
  ].filter(s => s.hasData) : [];

  useEffect(() => {
    if (!data || availableSections.length === 0) return;
    setActiveTab(prev => {
      if (!prev) return availableSections[0].key;
      const stillValid = availableSections.some(section => section.key === prev);
      return stillValid ? prev : availableSections[0].key;
    });
  }, [data, availableSections]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-stretch justify-end">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative z-10 w-full max-w-5xl bg-slate-50 h-full overflow-y-auto shadow-2xl animate-in slide-in-from-right duration-300">
        
        {/* Panel Header */}
        <div className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b border-slate-100 px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
            <button type="button" onClick={onClose} className="hover:text-blue-600 transition-colors flex items-center gap-1">
              <ArrowLeft size={14} /> Back to Job Dashboard
            </button>
            {data && (
              <>
                <ChevronRight size={14} />
                <span className="text-slate-900">{data.fullName}</span>
              </>
            )}
          </div>
          <button type="button" aria-label="Close" onClick={onClose} className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors">
            <X size={16} className="text-slate-600" />
          </button>
        </div>

        {isLoading && (
          <div className="flex justify-center items-center h-96">
            <Loader2 className="animate-spin text-blue-600" size={40} />
          </div>
        )}

        {!isLoading && !data && (
          <div className="flex flex-col items-center justify-center h-96 text-slate-500">
            <p className="text-xl font-bold text-slate-800 mb-2">Profile Not Found</p>
            <button type="button" onClick={onClose} className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold mt-4">Go Back</button>
          </div>
        )}

        {data && (
          <div className="p-6 sm:p-8 space-y-8">
            
            {/* Identity Banner */}
            <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm">
              <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
                {data.profileImageUrl ? (
                  <img src={data.profileImageUrl} alt={data.fullName} className="w-24 h-24 shrink-0 rounded-3xl object-cover shadow-lg border border-slate-100" />
                ) : (
                  <div className="w-24 h-24 shrink-0 rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white text-4xl font-black shadow-lg">
                    {data.fullName.charAt(0).toUpperCase()}
                  </div>
                )}
                
                <div className="flex-1 text-center md:text-left pt-1">
                  <h1 className="text-3xl font-black text-slate-900 mb-1">{data.fullName}</h1>
                  {data.currentPosition || data.currentOrg ? (
                    <p className="text-sm font-bold text-blue-600 mb-4">
                      {data.currentPosition || data.jobRole} {data.currentOrg && <span className="text-slate-400">@ {data.currentOrg}</span>}
                    </p>
                  ) : (
                    <p className="text-sm font-bold text-blue-600 mb-4">{data.jobRole}</p>
                  )}

                  <div className="flex flex-wrap justify-center md:justify-start gap-3 text-sm font-semibold text-slate-600 mb-4">
                    <span className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                      <Mail size={14} className="text-slate-400" /> {data.email}
                    </span>
                    {data.phone && (
                      <span className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                        <Phone size={14} className="text-slate-400" /> {data.phone}
                      </span>
                    )}
                  </div>

                  {/* Socials & Portfolios */}
                  <div className="mt-5 grid gap-3">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">
                      <Globe2 size={12} /> Online Presence
                    </div>
                    <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                      {data.portfolioUrl && (
                        <a
                          href={data.portfolioUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-extrabold text-emerald-700 shadow-sm transition hover:bg-emerald-100 hover:shadow-md"
                        >
                          <ExternalLink size={13} /> Portfolio
                        </a>
                      )}
                      {data.cvUrl && (
                        <a
                          href={data.cvUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-extrabold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:shadow-md"
                        >
                          <Download size={13} /> CV / Resume
                        </a>
                      )}
                      {asArray(data.socialLinks).map((link, i) => {
                        const href = firstNonEmpty(link?.profileUrl, link?.url, link?.href);
                        if (!href) return null;
                        const label = getLinkLabel(link, i);
                        return (
                          <a
                            key={`${label}-${i}`}
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-xs font-extrabold text-blue-700 shadow-sm transition hover:bg-blue-100 hover:shadow-md"
                          >
                            <Globe2 size={13} /> {label}
                          </a>
                        );
                      })}
                    </div>
                  </div>
                </div>
                {data.gpa !== null && data.gpa !== undefined && data.gpa > 0 && (
                    <div className="mt-5 grid gap-3">
                      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">
                        <Award size={12} /> Academic Excellence
                      </div>
                      <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                        <span className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-4 py-2 text-xs font-extrabold text-violet-700 shadow-sm transition hover:bg-violet-100 hover:shadow-md">
                          <GraduationCap size={13} /> GPA: {data.gpa.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  )}

                {data.cvUrl && (
                  <a href={data.cvUrl} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-3 rounded-xl font-bold shadow-md transition-colors shrink-0 text-sm mt-4 md:mt-0">
                    <Download size={16} /> Original CV
                  </a>
                )}
              </div>
            </div>

            {/* Main Grid */}
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden min-h-[400px]">
                  
                  {/* Tab Bar */}
                  <div className="flex border-b border-slate-100 overflow-x-auto p-3 gap-1.5 scrollbar-none">
                    {availableSections.map(tab => {
                      const Icon = tab.icon;
                      return (
                        <button type="button" key={tab.key} onClick={() => setActiveTab(tab.key)}
                          className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-lg transition-all whitespace-nowrap ${
                            activeTab === tab.key
                              ? 'bg-slate-900 text-white shadow-sm'
                              : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                          }`}>
                          <Icon size={13} /> {tab.label}
                        </button>
                      );
                    })}
                  </div>

                  {/* Tab Content */}
                  <div className="p-7">
                    
                    {activeTab === 'experience' && (
                      <div className="space-y-6">
                        {data.experience?.map((exp, i) => (
                          <div key={i} className="flex gap-4">
                            <div className="w-10 h-10 shrink-0 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                              <Briefcase size={16} />
                            </div>
                            <div>
                              <h4 className="font-extrabold text-slate-800 text-base">{exp.roleDescription}</h4>
                              <p className="text-blue-600 font-bold text-sm mb-1">{exp.companyName}</p>
                              <p className="text-slate-400 text-xs font-semibold">{formatMonthYear(exp.startDate)} — {formatMonthYear(exp.endDate)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {activeTab === 'education' && (
                      <div className="space-y-6">
                        {data.education?.map((edu, i) => (
                          <div key={i} className="flex gap-4 border-b border-slate-50 pb-6 last:border-0 last:pb-0">
                            <div className="w-10 h-10 shrink-0 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
                              <GraduationCap size={16} />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-extrabold text-slate-800 text-base">{edu.degreeTitle} <span className="font-medium text-slate-500">in {edu.fieldOfStudy}</span></h4>
                              <p className="text-indigo-600 font-bold text-sm mb-1">{edu.organization}</p>
                              <p className="text-slate-400 text-xs font-semibold mb-3">{formatMonthYear(edu.startDate)} — {formatMonthYear(edu.endDate)}</p>
                              
                              {(edu.honors || edu.thesisTitle || edu.relevantCoursework) && (
                                <div className="bg-slate-50 rounded-xl p-4 text-sm space-y-2 border border-slate-100">
                                  {edu.honors && <p><span className="font-bold text-slate-700">Honors:</span> {edu.honors}</p>}
                                  {edu.thesisTitle && <p><span className="font-bold text-slate-700">Thesis:</span> {edu.thesisTitle}</p>}
                                  {edu.relevantCoursework && <p><span className="font-bold text-slate-700">Coursework:</span> {edu.relevantCoursework}</p>}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {activeTab === 'skills' && (
                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {asArray(data.skills).map((skill, i) => {
                          const level = getSkillLevel(skill);
                          const name = getSkillName(skill, i);
                          const levelTone =
                            level === 'Expert' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' :
                            level === 'Intermediate' ? 'border-blue-200 bg-blue-50 text-blue-700' :
                            'border-slate-200 bg-slate-50 text-slate-600';
                          return (
                            <div key={`${name}-${i}`} className={`rounded-2xl border p-4 shadow-sm transition hover:shadow-md ${levelTone}`}>
                              <div className="flex items-start justify-between gap-3">
                                <h4 className="font-extrabold text-slate-900 text-sm leading-snug">{name}</h4>
                                <span className="rounded-full bg-white/80 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest">
                                  {level}
                                </span>
                              </div>
                              {skill?.description && (
                                <p className="mt-3 text-xs leading-relaxed text-slate-600">{skill.description}</p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {activeTab === 'projects' && (
                      <div className="space-y-4">
                        {data.projects?.map((proj, i) => (
                          <div key={i} className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-bold text-slate-800 text-base">{proj.name}</h4>
                              {proj.sourceLink && (
                                <a href={proj.sourceLink} target="_blank" rel="noreferrer" className="text-blue-600 hover:text-blue-700 bg-blue-50 p-2 rounded-lg">
                                  <ExternalLink size={14} />
                                </a>
                              )}
                            </div>
                            <p className="text-xs text-slate-500 font-bold mb-3">{proj.role} • {proj.organization} • {proj.timePeriod}</p>
                            <p className="text-sm text-slate-600">{proj.description}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {activeTab === 'researchExperience' && (
                      <div className="space-y-4">
                        {data.researchExperience?.map((res, i) => (
                          <div key={i} className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                            <h4 className="font-bold text-slate-800 text-base mb-1">{res.projectName}</h4>
                            <p className="text-xs text-blue-600 font-bold mb-3">{res.organization}</p>
                            <p className="text-sm text-slate-600 mb-3">{res.resultsDescription}</p>
                            {(res.labOrFieldWork || res.linkedPublicationTitle) && (
                              <div className="text-xs text-slate-500 border-t border-slate-200 pt-3 space-y-1">
                                {res.labOrFieldWork && <p><strong>Methodology:</strong> {res.labOrFieldWork}</p>}
                                {res.linkedPublicationTitle && <p><strong>Publication:</strong> {res.linkedPublicationTitle}</p>}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {activeTab === 'teachingExperience' && (
                      <div className="space-y-4">
                        {data.teachingExperience?.map((teach, i) => (
                          <div key={i} className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                            <h4 className="font-bold text-slate-800 text-base mb-1">{teach.coursesTaught}</h4>
                            <p className="text-xs text-slate-500 font-bold mb-3">{teach.organization} • {teach.timePeriod}</p>
                            <p className="text-sm text-slate-600">{teach.curriculumDescription}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {activeTab === 'about' && (
                      <div className="space-y-8">
                        {data.personalStatement && (
                          <div>
                            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Personal Statement</h4>
                            <p className="text-sm text-slate-700 leading-relaxed font-medium bg-slate-50 p-6 rounded-2xl border border-slate-100">{data.personalStatement}</p>
                          </div>
                        )}
                        {data.aboutMe && (
                          <div>
                            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">About Me</h4>
                            <p className="text-sm text-slate-700 leading-relaxed font-medium bg-slate-50 p-6 rounded-2xl border border-slate-100">{data.aboutMe}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {['publications','certifications','awards','languages','memberships','volunteers'].includes(activeTab) && (
                      <div className="grid gap-4 sm:grid-cols-2">
                        {asArray((data as any)[activeTab]).map((item: any, i: number) => {
                          const title = firstNonEmpty(
                            item?.title, 
                            item?.field, 
                            item?.awardName, 
                            item?.award_name,
                            item?.languageName, 
                            item?.language_name,
                            item?.organizationName, 
                            item?.organization_name,
                            item?.role, 
                            item?.organization
                          ) || `Item ${i + 1}`;
                          const meta = firstNonEmpty(item?.issuer, item?.issuedBy, item?.organization, item?.organizationName);
                          return (
                            <div key={`${title}-${i}`} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <h4 className="text-sm font-extrabold text-slate-900 leading-snug">{title}</h4>
                                  {meta && <p className="mt-1 text-xs font-medium text-slate-500">{meta}</p>}
                                </div>
                                {item?.sourceLink && (
                                  <a href={item.sourceLink} target="_blank" rel="noreferrer" className="rounded-xl bg-blue-50 p-2 text-blue-700 transition hover:bg-blue-100">
                                    <ExternalLink size={14} />
                                  </a>
                                )}
                              </div>
                              {item?.description && <p className="mt-3 text-sm leading-relaxed text-slate-600">{item.description}</p>}
                              {item?.role && activeTab !== 'volunteers' && (
                                <p className="mt-3 text-xs font-semibold uppercase tracking-widest text-slate-400">{item.role}</p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* AI Score Column */}
              <div>
                <div className="bg-gradient-to-b from-slate-900 to-slate-800 rounded-[2rem] p-7 text-white shadow-xl relative overflow-hidden border border-slate-700">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500 rounded-full blur-[80px] opacity-20 pointer-events-none" />
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 bg-white/10 border border-white/5 px-3 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest mb-6 w-max">
                      <Brain size={13} className="text-blue-400" /> Matrix Analysis
                    </div>
                    
                    <div className="flex flex-col gap-4 mb-5">
                      <ScoreRing
                        score={data.industryScore}
                        label="Company Match"
                        subLabel="Overall industry requirement fit"
                        colorClass="text-emerald-400"
                        dark
                      />

                      <ScoreRing
                        score={data.matchScore}
                        label="Skill Alignment"
                        subLabel="Benchmark against posted skills"
                        colorClass="text-blue-400"
                        dark
                      />
                    </div>
                    
                    <div className="bg-slate-950/50 rounded-xl p-4 border border-white/5">
                      <p className="text-[11px] text-slate-400 font-medium leading-relaxed text-center">
                        Scores calculated from the frozen snapshot at the exact time of application.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Job Detail Page ─────────────────────────────────────────────────────
export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.id as string;

  const [job, setJob] = useState<any>(null);
  const [applicants, setApplicants] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [selectedApplicant, setSelectedApplicant] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('About');

  const [fullProfileAppId, setFullProfileAppId] = useState<string | null>(null);

  const sections = [
    { key: 'aboutMe',    label: 'About' },
    { key: 'experience', label: 'Experience' },
    { key: 'education',  label: 'Education' },
    { key: 'skills',     label: 'Skills' },
    { key: 'projects',   label: 'Projects' },
  ];

  const availableTabs = sections.filter(section => {
    if (section.key === 'aboutMe') return !!selectedApplicant?.aboutMe;
    return selectedApplicant?.[section.key] && selectedApplicant[section.key].length > 0;
  });

  useEffect(() => {
    if (!selectedApplicant) return;
    const firstTab = availableTabs[0]?.key || 'aboutMe';
    setActiveTab(firstTab);
  }, [selectedApplicant?.appId]);


  const fetchJobData = useCallback(async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;
      const token = await user.getIdToken();
      const res = await axios.get(`http://localhost:5167/api/JobDetails/${jobId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setJob(res.data.details);
      setApplicants(res.data.applicants);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(user => { if (user) fetchJobData(); });
    return () => unsub();
  }, [jobId]);

  const handleCloseJob = async () => {
    if (!confirm("Are you sure? This will close the job and reject all pending applicants.")) return;
    try {
      const token = await auth.currentUser?.getIdToken();
      await axios.post(`http://localhost:5167/api/JobDetails/${jobId}/close`, {}, { headers: { Authorization: `Bearer ${token}` } });
      alert("Job Closed successfully.");
      fetchJobData();
      setIsStatusOpen(false);
    } catch { alert("Error closing job."); }
  };

  const handleRepostJob = async () => {
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await axios.post(`http://localhost:5167/api/JobDetails/${jobId}/repost`, {}, { headers: { Authorization: `Bearer ${token}` } });
      alert("Job Reposted successfully!");
      router.push(`/recruiter/jobs/${res.data.newJobId}`);
    } catch { alert("Error reposting job."); }
  };

  const handleApplicantAction = async (appId: string, action: 'interview' | 'reject') => {
    try {
      const token = await auth.currentUser?.getIdToken();
      const endpoint = action === 'interview' ? 'interview' : 'reject';
      const payload = action === 'interview' ? { message: "Invitation to interview" } : { reason: "Position closed or candidate mismatch" };
      await axios.post(`http://localhost:5167/api/JobDetails/applicant/${appId}/${endpoint}`, payload, { headers: { Authorization: `Bearer ${token}` } });
      fetchJobData();
    } catch { alert(`Error processing ${action}`); }
  };

  if (isLoading) return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-100 sticky top-0 z-40 h-14" />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        <div className="animate-pulse">
          <div className="h-6 bg-slate-200 rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-slate-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-white border border-slate-100 rounded-2xl"></div>)}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-6">
            <div className="h-[600px] bg-white border border-slate-100 rounded-2xl"></div>
            <div className="h-[600px] bg-white border border-slate-100 rounded-2xl"></div>
          </div>
        </div>
      </main>
    </div>
  );
  if (!job) return <div className="p-10 text-center text-slate-500">Job Not Found.</div>;

  const filteredCandidates = applicants.filter(c => {
    const matchesSearch = c.fullName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = selectedStatus === 'All' || c.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ── Top Bar ── */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-sm font-semibold text-slate-900 hidden sm:block">Recruiter</span>
            <ChevronRight size={14} className="text-slate-300 hidden sm:block" />
            <Link href="/recruiter/jobs" className="text-sm font-semibold text-slate-400 hover:text-slate-600 transition-colors hidden sm:block">Jobs</Link>
            <ChevronRight size={14} className="text-slate-300 hidden sm:block" />
            <span className="text-sm font-semibold text-slate-900 hidden sm:block">{job.title}</span>
            {/* Mobile breadcrumb */}
            <Link href="/recruiter/jobs" className="text-sm font-semibold text-slate-400 hover:text-slate-600 transition-colors sm:hidden flex items-center gap-1">
              <ArrowLeft size={14} /> Back
            </Link>
          </div>

          <div className="relative">
            <button type="button" onClick={() => setIsStatusOpen(!isStatusOpen)}
              className="flex items-center gap-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-semibold px-4 py-2 rounded-xl transition-colors shadow-sm">
              <span className="hidden sm:inline">Manage Job</span>
              <span className="sm:hidden">Manage</span>
              <ChevronDown size={14} className="text-slate-400" />
            </button>
            {isStatusOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl z-50 p-2 text-slate-700 border border-slate-100">
                {job.status === 1 && <button type="button" onClick={handleCloseJob} className="w-full text-left px-3 py-2 text-xs font-bold hover:bg-red-50 hover:text-red-600 rounded-xl transition-colors">Close Job</button>}
                {job.status === 0 && <button type="button" onClick={handleRepostJob} className="w-full text-left px-3 py-2 text-xs font-bold hover:bg-green-50 hover:text-green-600 rounded-xl transition-colors">Repost Job</button>}
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        
        {/* ── Page Heading ── */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700">{job.dept}</span>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${
                job.status === 1 ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-600'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${job.status === 1 ? 'bg-green-500' : 'bg-slate-400'}`} />
                {job.status === 1 ? 'Active' : 'Closed'}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">{job.title}</h1>
            <p className="text-sm text-slate-500 mt-0.5 flex items-center gap-1.5">
              <MapPin size={14} className="text-slate-400" /> {job.location} · Posted {job.posted}
            </p>
          </div>
        </div>

        {/* ── KPI Strip ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {[
            { label: 'Total Applicants', value: job.totalApplicants, icon: Users, accent: '#6366f1' },
            { label: 'Avg Match', value: job.totalApplicants > 0 ? `${job.avgMatchScore}%` : '-', icon: Brain, accent: '#16a34a' },
            { label: 'New Applied', value: job.newApplied, icon: UserIcon, accent: '#8b5cf6' },
            { label: 'Days Active', value: job.daysActive, icon: Clock, accent: '#d97706' },
          ].map(({ label, value, icon: Icon, accent }) => (
            <div key={label} className="bg-white rounded-2xl border border-slate-100 p-4 sm:p-5 flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: accent + '15', color: accent }}>
                <Icon size={18} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5 truncate">{label}</p>
                <p className="text-xl sm:text-2xl font-black text-slate-900 tabular-nums leading-none">{value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Main Layout ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-6 items-start">
          
          {/* LEFT: Job Specs Panel */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5 sm:p-6 lg:sticky lg:top-[5.5rem] shadow-sm max-h-[calc(100vh-6.5rem)] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 hover:scrollbar-thumb-slate-300">
            <h2 className="text-sm font-bold text-slate-900 mb-5 pb-4 border-b border-slate-100 flex items-center gap-2">
              <FileText size={16} className="text-blue-600" /> Job Details
            </h2>
            
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-xl bg-slate-50 text-slate-600 flex items-center justify-center shrink-0"><Briefcase size={14} /></div>
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Employment</p>
                  <p className="text-sm font-semibold text-slate-700">{job.employmentType} · {job.workplaceType}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{job.openings} Opening{job.openings > 1 ? 's' : ''}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-xl bg-slate-50 text-slate-600 flex items-center justify-center shrink-0"><DollarSign size={14} /></div>
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Compensation</p>
                  <p className="text-sm font-semibold text-slate-700">{job.currency} {job.salaryRange || 'Not specified'}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-xl bg-slate-50 text-slate-600 flex items-center justify-center shrink-0"><Clock size={14} /></div>
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Experience</p>
                  <p className="text-sm font-semibold text-slate-700">
                    {job.experience ? `${job.experience.levelName} (${job.experience.minYears}${job.experience.maxYears ? `-${job.experience.maxYears}` : '+'} yrs)` : 'Not specified'}
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-xl bg-slate-50 text-slate-600 flex items-center justify-center shrink-0"><GraduationCap size={14} /></div>
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Education</p>
                  {job.education.length > 0
                    ? job.education.map((e: string, i: number) => <p key={i} className="text-sm font-semibold text-slate-700">{e}</p>)
                    : <p className="text-sm font-semibold text-slate-700">Not specified</p>}
                </div>
              </div>
            </div>

            <div className="mt-6 pt-5 border-t border-slate-100">
              <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">Required Skills</h3>
              <div className="flex flex-wrap gap-1.5">
                {job.skills.map((s: any, i: number) => (
                  <span key={i} className="bg-slate-50 border border-slate-100 text-[11px] font-bold text-slate-700 px-2.5 py-1 rounded-lg">
                    {firstNonEmpty(s?.name, s?.skillName, s?.title, s?.label) || `Skill ${i + 1}`}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="mt-6 pt-5 border-t border-slate-100">
               <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">About the Role</h3>
               <p className="text-xs text-slate-600 whitespace-pre-line leading-relaxed mb-4">{job.description}</p>
               
               <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">Responsibilities</h3>
               <p className="text-xs text-slate-600 whitespace-pre-line leading-relaxed">{job.responsibilities}</p>
            </div>
          </div>

          {/* RIGHT: Applicants Panel */}
          <div className="space-y-4">
            
            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
              <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h2 className="text-sm font-bold text-slate-900">Applicants</h2>
                
                <div className="flex items-center bg-slate-50 border border-slate-100 rounded-xl p-1 gap-0.5 overflow-x-auto scrollbar-none">
                  {['All', ...pipelineStatuses].map(tab => (
                    <button type="button" key={tab} onClick={() => setSelectedStatus(tab)}
                      className={`px-3 py-1.5 text-[11px] font-bold rounded-lg transition-all whitespace-nowrap ${
                        tab === selectedStatus ? 'bg-white text-slate-900 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100/50'
                      }`}>
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/50">
                <div className="relative max-w-md">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input aria-label="Search candidates" value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="Search candidates by name..."
                    className="w-full pl-8 pr-4 py-2 text-sm text-slate-700 bg-white border border-slate-200 rounded-xl placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all" />
                </div>
              </div>

              <div className="divide-y divide-slate-50">
                {filteredCandidates.map(c => (
                  <div key={c.appId}
                    className="p-4 sm:p-5 hover:bg-slate-50/60 transition-colors cursor-pointer group"
                    onClick={() => {
                      if (selectedApplicant?.appId === c.appId) {
                        setSelectedApplicant(null);
                      } else {
                        setSelectedApplicant(c);
                        setActiveTab('About');
                      }
                    }}>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {c.profileImageUrl ? (
                          <img src={c.profileImageUrl} alt={c.fullName} className="w-10 h-10 shrink-0 rounded-xl object-cover border border-slate-100" />
                        ) : (
                          <div className="w-10 h-10 shrink-0 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-sm">
                            {c.fullName.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <h3 className="font-bold text-slate-900 text-sm truncate">{c.fullName}</h3>
                            <span className={`shrink-0 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                              c.status === 'Pending'  ? 'bg-amber-50 text-amber-600' :
                              c.status === 'Interview'? 'bg-purple-50 text-purple-600' :
                              c.status === 'Rejected' ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-600'
                            }`}>{c.status}</span>
                          </div>
                          <p className="text-xs text-slate-400 truncate">{c.email}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 border-slate-100 pt-3 sm:pt-0 mt-1 sm:mt-0">
                        
                        <div className="flex items-center gap-2">
                           <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider sm:hidden">Match</span>
                           <span className={`text-sm font-black tabular-nums ${c.industryScore >= 75 ? 'text-green-600' : c.industryScore >= 50 ? 'text-blue-600' : 'text-amber-600'}`}>
                             {c.industryScore}%
                           </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button type="button"
                            onClick={e => { e.stopPropagation(); setFullProfileAppId(c.appId); }}
                            className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors"
                          >
                            <UserCircle size={14} /> <span className="hidden sm:inline">Profile</span>
                          </button>
                          
                          <div className="relative">
                            <select aria-label="Applicant action" value="" onChange={e => handleApplicantAction(c.appId, e.target.value as any)} onClick={e => e.stopPropagation()}
                              className="appearance-none bg-white text-xs font-semibold pl-2 pr-6 py-1.5 rounded-lg border border-slate-200 cursor-pointer focus:outline-none focus:border-blue-500 text-slate-700 shadow-sm">
                              <option value="" disabled>Action</option>
                              {c.status !== 'Rejected' && <option value="reject">Reject</option>}
                              {c.status === 'Pending' && <option value="interview">Call</option>}
                            </select>
                            <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                          </div>
                        </div>
                        
                      </div>
                    </div>
                  </div>
                ))}
                
                {filteredCandidates.length === 0 && (
                  <div className="text-center py-12 px-4">
                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                      <Search size={20} className="text-slate-300" />
                    </div>
                    <p className="text-sm font-semibold text-slate-700">No candidates found</p>
                    <p className="text-xs text-slate-400 mt-1">Try adjusting your filters or search query.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Inline Quick-View Panel */}
            {selectedApplicant && (
              <div className="bg-white rounded-2xl border border-slate-100 p-5 sm:p-6 shadow-sm">
                <div className="flex justify-between items-start mb-5">
                  <div className="min-w-0">
                    <h3 className="text-base font-bold text-slate-900 truncate">{selectedApplicant.fullName}</h3>
                    <p className="text-xs text-slate-500 truncate mt-0.5">{selectedApplicant.jobRole}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 ml-4">
                    <button type="button"
                      onClick={() => setFullProfileAppId(selectedApplicant.appId)}
                      className="hidden sm:flex items-center gap-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors">
                      <Brain size={13} /> Full AI Profile
                    </button>
                    <div className="text-right">
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Match</p>
                       <p className={`text-sm font-black tabular-nums leading-none ${selectedApplicant.industryScore >= 75 ? 'text-green-600' : selectedApplicant.industryScore >= 50 ? 'text-blue-600' : 'text-amber-600'}`}>
                         {selectedApplicant.industryScore}%
                       </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-1.5 overflow-x-auto border-b border-slate-100 mb-4 pb-0.5 scrollbar-none">
                  {availableTabs.map(tab => (
                    <button type="button" key={tab.key} onClick={() => setActiveTab(tab.key)}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors whitespace-nowrap ${
                        activeTab === tab.key ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                      }`}>
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div className="text-xs text-slate-600 min-h-[100px]">
                  {activeTab === 'aboutMe' && <p className="whitespace-pre-line leading-relaxed">{selectedApplicant.aboutMe}</p>}
                  
                  {activeTab === 'experience' && selectedApplicant.experience && (
                    <div className="space-y-4">
                      {selectedApplicant.experience.map((exp: any, i: number) => (
                        <div key={i} className="flex gap-3">
                           <div className="w-1.5 bg-blue-100 rounded-full shrink-0" />
                           <div>
                             <p className="font-bold text-slate-800">{exp.title}</p>
                             <p className="text-slate-500 mt-0.5">{exp.company}</p>
                           </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {activeTab === 'skills' && selectedApplicant.skills && (
                    <div className="flex flex-wrap gap-1.5">
                      {asArray(selectedApplicant.skills).map((s: any, i: number) => (
                        <span key={`${getSkillName(s, i)}-${i}`} className="inline-flex items-center gap-1.5 bg-slate-50 border border-slate-100 px-2 py-1 rounded-md text-[11px] font-semibold text-slate-700">
                          {getSkillName(s, i)}
                          {firstNonEmpty(s?.level, s?.proficiency) && (
                            <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">
                              {firstNonEmpty(s?.level, s?.proficiency)}
                            </span>
                          )}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 flex justify-between items-center">
                  <button type="button"
                    onClick={() => setFullProfileAppId(selectedApplicant.appId)}
                    className="sm:hidden flex items-center gap-1.5 text-blue-600 text-xs font-bold">
                    <Brain size={13} /> Full AI Profile
                  </button>
                  <button type="button" onClick={() => setSelectedApplicant(null)} className="text-xs font-semibold text-slate-400 hover:text-slate-600 transition-colors ml-auto">
                    Close preview
                  </button>
                </div>
              </div>
            )}
            
          </div>
        </div>
      </main>

      {fullProfileAppId && (
        <FullProfileModal
          appId={fullProfileAppId}
          jobId={jobId}
          onClose={() => setFullProfileAppId(null)}
        />
      )}
    </div>
  );
}
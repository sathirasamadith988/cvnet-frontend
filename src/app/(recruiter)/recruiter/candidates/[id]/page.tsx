'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { 
  Briefcase, GraduationCap, Brain, FolderGit2, BookOpen, 
  Microscope, Code, Award, Globe2, Users, HeartHandshake, 
  User as UserIcon, ArrowLeft, Mail, Phone, ExternalLink, 
  Download, Loader2 
} from 'lucide-react';
import axios from 'axios';
import { auth } from '@/lib/firebaseConfig';

// ─── Types ────────────────────────────────────────────────────────────────────
interface ScoreRingProps {
  score: number;
  label: string;
  colorClass: string;
  subLabel: string;
  dark?: boolean;
}

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

const normalizeProfile = (raw: any): any => ({
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

// ─── ScoreRing Component ──────────────────────────────────────────────────────
const ScoreRing = ({ score, label, colorClass, subLabel, dark = false }: ScoreRingProps) => {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const safeScore = score || 0;
  const strokeDashoffset = circumference - (safeScore / 100) * circumference;

  return (
    <div className={`flex flex-col items-center p-4 rounded-2xl border ${
      dark ? 'bg-white/5 border-white/10 backdrop-blur-sm' : 'bg-white border-slate-100 shadow-sm'
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

// ─── Main Page Component ──────────────────────────────────────────────────────
export default function CandidateProfilePage() {
  const params = useParams();
  const router = useRouter();
  const appId = params.id as string; // Grabs the ID from the URL

  const [data, setData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;
        const token = await user.getIdToken();
        
        // Connects to the same robust endpoint you already set up
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

    const unsub = auth.onAuthStateChanged(user => { 
      if (user) fetchProfile(); 
    });
    return () => unsub();
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-slate-50/30">
        <Loader2 className="animate-spin text-blue-600" size={48} />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-50/30 text-slate-500">
        <p className="text-xl font-bold text-slate-800 mb-2">Profile Not Found</p>
        <button onClick={() => router.back()} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl font-bold mt-4 transition-colors">
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto min-h-screen bg-slate-50/30">
      
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">
        <button onClick={() => router.back()} className="hover:text-blue-600 transition-colors flex items-center gap-1">
          <ArrowLeft size={14} /> Back
        </button>
        <span className="text-slate-300">/</span>
        <span className="text-slate-900">Candidate Profile</span>
      </div>

      <div className="space-y-8">
        
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
                    <a href={data.portfolioUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-extrabold text-emerald-700 shadow-sm transition hover:bg-emerald-100 hover:shadow-md">
                      <ExternalLink size={13} /> Portfolio
                    </a>
                  )}
                  {data.cvUrl && (
                    <a href={data.cvUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-extrabold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:shadow-md">
                      <Download size={13} /> CV / Resume
                    </a>
                  )}
                  {asArray(data.socialLinks).map((link, i) => {
                    const href = firstNonEmpty(link?.profileUrl, link?.url, link?.href);
                    if (!href) return null;
                    const label = getLinkLabel(link, i);
                    return (
                      <a key={`${label}-${i}`} href={href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-xs font-extrabold text-blue-700 shadow-sm transition hover:bg-blue-100 hover:shadow-md">
                        <Globe2 size={13} /> {label}
                      </a>
                    );
                  })}
                </div>
                {data.gpa !== null && data.gpa > 0 && (
                <div className="mt-5 grid gap-3">
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">
                    <Award size={12} /> Academic Excellence
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-4 py-2 text-xs font-extrabold text-violet-700 shadow-sm transition hover:bg-violet-100 hover:shadow-md">
                      <GraduationCap size={13} /> GPA: {data.gpa.toFixed(2)}
                    </span>
                  </div>
                </div>
              )}
              </div>
            </div>

            {data.cvUrl && (
              <a href={data.cvUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-3 rounded-xl font-bold shadow-md transition-colors shrink-0 text-sm mt-4 md:mt-0">
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
              <div className="flex border-b border-slate-100 overflow-x-auto bg-slate-50/50 p-2 gap-2 custom-scrollbar">
                {availableSections.map(tab => {
                  const Icon = tab.icon;
                  return (
                    <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                      className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
                        activeTab === tab.key
                          ? 'bg-white text-blue-600 shadow-sm border border-slate-100'
                          : 'text-slate-500 hover:bg-slate-100'
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
                    {data.experience?.map((exp: any, i: number) => (
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
                    {data.education?.map((edu: any, i: number) => (
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
                        </div>
                      );
                    })}
                  </div>
                )}

                {activeTab === 'projects' && (
                  <div className="space-y-4">
                    {data.projects?.map((proj: any, i: number) => (
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
                    {data.researchExperience?.map((res: any, i: number) => (
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
                    {data.teachingExperience?.map((teach: any, i: number) => (
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
                        item?.title, item?.field, item?.awardName, item?.award_name,
                        item?.languageName, item?.language_name, item?.organizationName, 
                        item?.organization_name, item?.role, item?.organization
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
            <div className="bg-gradient-to-b from-slate-900 to-slate-800 rounded-[2rem] p-7 text-white shadow-xl relative overflow-hidden border border-slate-700 sticky top-6">
              <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500 rounded-full blur-[80px] opacity-20 pointer-events-none" />
              <div className="relative z-10">
                <div className="flex items-center gap-2 bg-white/10 border border-white/5 px-3 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest mb-6 w-max">
                  <Brain size={13} className="text-blue-400" /> Matrix Analysis
                </div>
                
                <div className="flex flex-col gap-4 mb-5">
                  <ScoreRing
                    score={data.industryScore}
                    label="Match Score"
                    subLabel="Benchmark against posted skills"
                    colorClass="text-emerald-400"
                    dark
                  />

                  <ScoreRing
                    score={data.matchScore}
                    label="Industry Score"
                    subLabel="Overall industry requirement fit"
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
    </div>
  );
}
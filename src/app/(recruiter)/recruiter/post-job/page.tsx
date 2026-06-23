'use client';

import { useState, useEffect } from 'react';
import {
  X, MapPin, Briefcase, Calendar, Loader2, EyeOff,
  GraduationCap, Banknote, ListChecks, Sparkles, ChevronRight,
  Plus, Check, AlertTriangle
} from 'lucide-react';
import axios from 'axios';
import { auth } from '@/lib/firebaseConfig';

// ─── Types ────────────────────────────────────────────────────────────────────

type CategoryData = { id: string; name: string; roles: string[] };
type SkillData = { name: string; level: string; isVisible: boolean; showLevel: boolean };

// ─── Constants ────────────────────────────────────────────────────────────────

const WORLD_CURRENCIES = [
  { code: 'LKR', symbol: 'Rs', name: 'Sri Lankan Rupee' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
];

const STEPS = [
  { number: 1, label: 'Basics' },
  { number: 2, label: 'Requirements' },
  { number: 3, label: 'Details' },
];

// ─── Small shared components ──────────────────────────────────────────────────

function Label({ children, optional }: { children: React.ReactNode; optional?: boolean }) {
  return (
    <label className="block text-xs font-bold text-slate-700 mb-1.5">
      {children}
      {optional && <span className="ml-1.5 text-slate-400 font-medium">(optional)</span>}
    </label>
  );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all ${props.className ?? ''}`}
    />
  );
}

function Select({ children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all cursor-pointer ${props.className ?? ''}`}
    >
      {children}
    </select>
  );
}

function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all resize-none ${props.className ?? ''}`}
    />
  );
}

function SectionCard({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 sm:p-6 space-y-4">
      <div>
        <h3 className="text-sm font-bold text-slate-900">{title}</h3>
        {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

// Preview pill
function PreviewPill({ icon: Icon, children }: { icon: React.ElementType; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 bg-slate-50 border border-slate-100 text-slate-600 text-[11px] font-semibold px-2.5 py-1.5 rounded-lg">
      <Icon size={11} className="text-slate-400" /> {children}
    </span>
  );
}

// ─── Step indicator ───────────────────────────────────────────────────────────

function StepBar({ step }: { step: number }) {
  return (
    <div className="flex items-center gap-0 mb-6">
      {STEPS.map((s, i) => {
        const done = step > s.number;
        const active = step === s.number;
        return (
          <div key={s.number} className="flex items-center flex-1 last:flex-none">
            <div className="flex items-center gap-2 shrink-0">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${done ? 'bg-blue-600 text-white' :
                  active ? 'bg-slate-900 text-white' :
                    'bg-slate-100 text-slate-400'
                }`}>
                {done ? <Check size={13} /> : s.number}
              </div>
              <span className={`text-xs font-semibold hidden sm:block ${active ? 'text-slate-900' : done ? 'text-blue-600' : 'text-slate-400'
                }`}>
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-px mx-3 transition-colors ${step > s.number ? 'bg-blue-300' : 'bg-slate-100'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function PostJobPage() {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [categories, setCategories] = useState<CategoryData[]>([]);

  const [categoryId, setCategoryId] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [employmentType, setEmploymentType] = useState('FULL_TIME');
  const [workplaceType, setWorkplaceType] = useState('REMOTE');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [responsibilities, setResponsibilities] = useState('');

  const [skills, setSkills] = useState<SkillData[]>([]);
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillLevel, setNewSkillLevel] = useState('INTERMEDIATE');
  const [newSkillIsVisible, setNewSkillIsVisible] = useState(true);
  const [newSkillShowLevel, setNewSkillShowLevel] = useState(true);

  const [expLevelName, setExpLevelName] = useState('');
  const [expMinYears, setExpMinYears] = useState(0);
  const [expMaxYears, setExpMaxYears] = useState(0);

  const [educations, setEducations] = useState<string[]>([]);
  const [newDegree, setNewDegree] = useState('');

  const [salaryRange, setSalaryRange] = useState('');
  const [currency, setCurrency] = useState('LKR');
  const [openings, setOpenings] = useState(1);
  const [hrEmail, setHrEmail] = useState('');
  const [applicationDeadline, setApplicationDeadline] = useState(
    new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().split('T')[0]
  );

  useEffect(() => {
    const fetchMeta = async (token: string) => {
      try {
        const res = await axios.get('http://localhost:5167/api/CompanyJob/categories', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCategories(res.data);
        if (res.data.length > 0) {
          setCategoryId(res.data[0].id);
          setJobTitle(res.data[0].roles[0] || '');
        }
      } catch (err) { console.error('Failed to load categories', err); }
    };

    const unsub = auth.onAuthStateChanged(async user => {
      if (user) {
        setHrEmail(user.email || '');
        const token = await user.getIdToken(true).catch(() => null);
        if (token) fetchMeta(token);
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const cat = categories.find(c => c.id === categoryId);
    if (cat?.roles.length) setJobTitle(cat.roles[0]);
  }, [categoryId, categories]);

  const addSkill = () => {
    const name = newSkillName.trim();
    if (name && !skills.find(s => s.name.toLowerCase() === name.toLowerCase())) {
      setSkills([...skills, { name, level: newSkillLevel, isVisible: newSkillIsVisible, showLevel: newSkillShowLevel }]);
      setNewSkillName('');
      setNewSkillIsVisible(true);
      setNewSkillShowLevel(true);
    }
  };

  const addEducation = () => {
    const deg = newDegree.trim();
    if (deg && !educations.includes(deg)) {
      setEducations([...educations, deg]);
      setNewDegree('');
    }
  };

  const handlePostJob = async () => {
    setIsLoading(true);
    try {
      let token = await auth.currentUser?.getIdToken();
      if (!token) {
        const m = document.cookie.match(/(?:^|; )cvnet_token=([^;]*)/);
        token = m?.[1];
      }
      if (!token) { alert('Authentication lost. Please reload.'); setIsLoading(false); return; }

      await axios.post('http://localhost:5167/api/CompanyJob/create', {
        categoryId, jobTitle, employmentType, workplaceType,
        location: location || null,
        openings,
        description: description || null,
        responsibilities: responsibilities || null,
        salaryRange: salaryRange || null,
        currency,
        applicationDeadline: new Date(applicationDeadline).toISOString(),
        hrContactEmail: hrEmail,
        skills,
        experience: expLevelName ? { levelName: expLevelName, minYears: expMinYears, maxYears: expMaxYears } : null,
        educations,
      }, { headers: { Authorization: `Bearer ${token}` } });

      alert('Job posted successfully!');
      window.location.href = '/recruiter/dashboard';
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to post job.');
      setIsLoading(false);
    }
  };

  const deptName = categories.find(c => c.id === categoryId)?.name ?? 'Department';
  const currencySymbol = WORLD_CURRENCIES.find(c => c.code === currency)?.symbol ?? currency;
  const visibleSkills = skills.filter(s => s.isVisible);

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── Top Bar ── */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-900 hidden sm:block">Recruiter</span>
          <ChevronRight size={14} className="text-slate-300 hidden sm:block" />
          <span className="text-sm font-semibold text-slate-400 hidden sm:block">Post job</span>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">

        {/* ── Heading ── */}
        <div className="mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Post a new position</h1>
          <p className="text-sm text-slate-500 mt-0.5">Fill in the details to publish this role to the network.</p>
        </div>

        <div className="grid lg:grid-cols-5 gap-5 lg:gap-6 items-start">

          {/* ── Form ── */}
          <div className="lg:col-span-3 space-y-4">

            {/* Step bar */}
            <StepBar step={step} />

            {/* ── Step 1: Basics ── */}
            {step === 1 && (
              <div className="space-y-4">
                <SectionCard title="Role" subtitle="Select the department and job title for this posting.">
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <Label>Department</Label>
                      <Select value={categoryId} onChange={e => setCategoryId(e.target.value)}>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </Select>
                    </div>
                    <div>
                      <Label>Job title</Label>
                      <Select value={jobTitle} onChange={e => setJobTitle(e.target.value)}>
                        {(categories.find(c => c.id === categoryId)?.roles ?? []).map(r => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </Select>
                    </div>
                  </div>
                </SectionCard>

                <SectionCard title="Work arrangement" subtitle="How and where will this role be performed?">
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <Label>Employment type</Label>
                      <Select value={employmentType} onChange={e => setEmploymentType(e.target.value)}>
                        <option value="FULL_TIME">Full Time</option>
                        <option value="PART_TIME">Part Time</option>
                        <option value="CONTRACT">Contract</option>
                        <option value="INTERNSHIP">Internship</option>
                      </Select>
                    </div>
                    <div>
                      <Label>Workplace type</Label>
                      <Select value={workplaceType} onChange={e => setWorkplaceType(e.target.value)}>
                        <option value="REMOTE">Remote</option>
                        <option value="HYBRID">Hybrid</option>
                        <option value="ONSITE">On-Site</option>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label optional>Location</Label>
                    <Input value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g. San Francisco, CA" />
                  </div>
                </SectionCard>

                <SectionCard title="Description" subtitle="Give candidates a clear overview of the role.">
                  <div>
                    <Label optional>Job description</Label>
                    <Textarea value={description} onChange={e => setDescription(e.target.value)} rows={4} placeholder="General overview of the role and its impact…" />
                  </div>
                </SectionCard>
              </div>
            )}

            {/* ── Step 2: Requirements ── */}
            {step === 2 && (
              <div className="space-y-4">

                <SectionCard title="Responsibilities" subtitle="What will this person do day-to-day?">
                  <Textarea
                    value={responsibilities}
                    onChange={e => setResponsibilities(e.target.value)}
                    rows={5}
                    placeholder={'• Lead the development of…\n• Collaborate with cross-functional teams…\n• Own the design and architecture of…'}
                  />
                </SectionCard>

                <SectionCard title="Technical skills" subtitle="Add required skills — control what candidates see.">
                  {/* Skill tags */}
                  {skills.length > 0 && (
                    <div className="flex flex-wrap gap-2 pb-2">
                      {skills.map(skill => (
                        <span
                          key={skill.name}
                          className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg border ${skill.isVisible
                              ? 'bg-blue-50 text-blue-700 border-blue-100'
                              : 'bg-slate-100 text-slate-500 border-slate-200'
                            }`}
                        >
                          {!skill.isVisible && <EyeOff size={10} />}
                          {skill.name}
                          {skill.showLevel && <span className="opacity-60 text-[10px]">({skill.level.toLowerCase()})</span>}
                          <button onClick={() => setSkills(skills.filter(s => s.name !== skill.name))} className="hover:text-red-500 transition-colors ml-0.5">
                            <X size={11} />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Add skill row */}
                  <div className="bg-slate-50 rounded-xl border border-slate-100 p-4 space-y-3">
                    <div className="flex gap-2">
                      <Input
                        value={newSkillName}
                        onChange={e => setNewSkillName(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && addSkill()}
                        placeholder="e.g. React.js"
                        className="flex-1 min-w-0"
                      />
                      <Select value={newSkillLevel} onChange={e => setNewSkillLevel(e.target.value)} className="!w-36 shrink-0">
                        <option value="BEGINNER">Beginner</option>
                        <option value="INTERMEDIATE">Intermediate</option>
                        <option value="EXPERT">Expert</option>
                      </Select>
                      <button
                        onClick={addSkill}
                        disabled={!newSkillName.trim()}
                        className="shrink-0 inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2.5 rounded-xl disabled:opacity-40 transition-colors"
                      >
                        <Plus size={13} /> Add
                      </button>
                    </div>

                    <div className="flex gap-5 pt-1 border-t border-slate-200">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox" checked={newSkillIsVisible}
                          onChange={e => setNewSkillIsVisible(e.target.checked)}
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-xs font-semibold text-slate-600">Show to candidates</span>
                      </label>
                      <label className={`flex items-center gap-2 cursor-pointer ${!newSkillIsVisible ? 'opacity-40 pointer-events-none' : ''}`}>
                        <input
                          type="checkbox" checked={newSkillShowLevel}
                          onChange={e => setNewSkillShowLevel(e.target.checked)}
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-xs font-semibold text-slate-600">Show level</span>
                      </label>
                    </div>
                  </div>
                </SectionCard>

                <SectionCard title="Education" subtitle="Specify any required degrees or qualifications.">
                  {educations.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {educations.map(deg => (
                        <span key={deg} className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg bg-violet-50 text-violet-700 border border-violet-100">
                          <GraduationCap size={11} />
                          {deg}
                          <button onClick={() => setEducations(educations.filter(e => e !== deg))} className="hover:text-red-500 transition-colors ml-0.5">
                            <X size={11} />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Input
                      value={newDegree}
                      onChange={e => setNewDegree(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && addEducation()}
                      placeholder="e.g. BSc Hons in Computer Science"
                      className="flex-1 min-w-0"
                    />
                    <button
                      onClick={addEducation}
                      disabled={!newDegree.trim()}
                      className="shrink-0 inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2.5 rounded-xl disabled:opacity-40 transition-colors"
                    >
                      <Plus size={13} /> Add
                    </button>
                  </div>
                </SectionCard>

                <SectionCard title="Experience" subtitle="Set the experience level required for this role.">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-3 sm:col-span-1">
                      <Label optional>Level name</Label>
                      <Input value={expLevelName} onChange={e => setExpLevelName(e.target.value)} placeholder="e.g. Mid-Level" />
                    </div>
                    <div>
                      <Label optional>Min years</Label>
                      <Input type="number" value={expMinYears} onChange={e => setExpMinYears(Number(e.target.value))} min={0} />
                    </div>
                    <div>
                      <Label optional>Max years</Label>
                      <Input type="number" value={expMaxYears} onChange={e => setExpMaxYears(Number(e.target.value))} min={0} />
                    </div>
                  </div>
                </SectionCard>
              </div>
            )}

            {/* ── Step 3: Final details ── */}
            {step === 3 && (
              <div className="space-y-4">

                <SectionCard title="Compensation" subtitle="Salary details help attract the right candidates.">
                  <div>
                    <Label optional>Salary range</Label>
                    <div className="flex gap-2">
                      <Select value={currency} onChange={e => setCurrency(e.target.value)} className="!w-28 shrink-0">
                        {WORLD_CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.code}</option>)}
                      </Select>
                      <Input
                        value={salaryRange}
                        onChange={e => setSalaryRange(e.target.value)}
                        placeholder="80,000 – 120,000"
                        className="flex-1 min-w-0"
                      />
                    </div>
                  </div>
                </SectionCard>

                <SectionCard title="Listing settings" subtitle="Configure deadline, openings, and contact details.">
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <Label>Application deadline</Label>
                      <Input type="date" value={applicationDeadline} onChange={e => setApplicationDeadline(e.target.value)} />
                    </div>
                    <div>
                      <Label>Number of openings</Label>
                      <Input type="number" value={openings} onChange={e => setOpenings(Number(e.target.value))} min={1} />
                    </div>
                  </div>
                  <div>
                    <Label>HR contact email</Label>
                    <Input type="email" value={hrEmail} onChange={e => setHrEmail(e.target.value)} placeholder="hr@company.com" />
                  </div>
                </SectionCard>
              </div>
            )}

            {/* ── Nav buttons ── */}
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => setStep(s => s - 1)}
                disabled={step === 1}
                className="px-5 py-2.5 text-sm font-semibold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-30 disabled:pointer-events-none transition-colors"
              >
                Back
              </button>

              <button
                onClick={() => step < 3 ? setStep(s => s + 1) : setShowConfirmModal(true)}
                disabled={isLoading}
                className={`inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold rounded-xl text-white transition-colors disabled:opacity-70 ${step === 3
                    ? 'bg-green-600 hover:bg-green-700 shadow-sm shadow-green-200'
                    : 'bg-blue-600 hover:bg-blue-700 shadow-sm shadow-blue-200'
                  }`}
              >
                {isLoading && <Loader2 size={14} className="animate-spin" />}
                {step === 3 ? 'Publish position' : 'Continue'}
              </button>
            </div>
          </div>

          {/* ── Live preview ── */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden sticky top-20">

              {/* Preview header */}
              <div className="bg-slate-900 px-5 py-3.5 flex items-center gap-2.5">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <p className="text-xs font-bold text-white uppercase tracking-widest">Candidate preview</p>
              </div>

              <div className="p-5 space-y-5">

                {/* Title + dept */}
                <div className="flex items-start gap-3.5">
                  <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                    <Briefcase size={18} />
                  </div>
                  <div className="min-w-0 pt-0.5">
                    <h4 className="font-bold text-slate-900 text-base leading-snug truncate">{jobTitle || 'Job title'}</h4>
                    <p className="text-xs font-semibold text-blue-600 mt-0.5">{deptName}</p>
                  </div>
                </div>

                {/* Meta pills */}
                <div className="flex flex-wrap gap-1.5">
                  <PreviewPill icon={Briefcase}>{employmentType.replace('_', ' ')}</PreviewPill>
                  {location && <PreviewPill icon={MapPin}>{location}</PreviewPill>}
                  {salaryRange && (
                    <PreviewPill icon={Banknote}>{currencySymbol} {salaryRange}</PreviewPill>
                  )}
                  {applicationDeadline && (
                    <PreviewPill icon={Calendar}>Deadline {applicationDeadline}</PreviewPill>
                  )}
                </div>

                {/* Responsibilities */}
                {responsibilities && (
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <ListChecks size={11} /> Responsibilities
                    </p>
                    <p className="text-xs text-slate-600 whitespace-pre-line leading-relaxed bg-slate-50 rounded-xl border border-slate-100 p-3.5">
                      {responsibilities}
                    </p>
                  </div>
                )}

                {/* Experience */}
                {expLevelName && (
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Experience</p>
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-700 bg-slate-50 rounded-xl border border-slate-100 px-4 py-2.5">
                      <span>{expLevelName}</span>
                      <span className="text-slate-400">{expMinYears}{expMaxYears > 0 ? `–${expMaxYears}` : '+'} yrs</span>
                    </div>
                  </div>
                )}

                {/* Education */}
                {educations.length > 0 && (
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Education</p>
                    <div className="space-y-1.5">
                      {educations.map((deg, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs font-medium text-slate-700 bg-violet-50 rounded-xl border border-violet-100 px-3.5 py-2.5">
                          <GraduationCap size={12} className="text-violet-500 mt-0.5 shrink-0" />
                          <span className="leading-snug">{deg}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Skills */}
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Required skills</p>
                  {visibleSkills.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {visibleSkills.map(s => (
                        <span key={s.name} className="inline-flex items-center gap-1 text-[11px] font-semibold bg-slate-900 text-white px-2.5 py-1 rounded-lg">
                          {s.name}
                          {s.showLevel && <span className="text-slate-400 text-[9px] ml-0.5">({s.level.toLowerCase()})</span>}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-300">No public skills added yet.</p>
                  )}
                </div>

                {/* Apply button (disabled preview) */}
                <button disabled className="w-full bg-slate-900 text-white text-sm font-semibold py-3 rounded-xl opacity-40 cursor-default mt-2">
                  Apply for this position
                </button>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* ── Confirmation Modal ── */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 w-full max-w-sm overflow-hidden animate-in zoom-in-95">
            <div className="p-6">
              <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mb-4">
                <AlertTriangle size={24} className="text-amber-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Publish this position?</h3>
              <p className="text-sm text-slate-500">
                Posted jobs cannot be edited later, they can only be deleted. Please review your details before publishing.
              </p>
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center gap-3 justify-end">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  handlePostJob();
                }}
                disabled={isLoading}
                className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold bg-amber-600 hover:bg-amber-700 text-white rounded-xl shadow-sm shadow-amber-200 transition-colors disabled:opacity-70"
              >
                {isLoading && <Loader2 size={14} className="animate-spin" />}
                Yes, publish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
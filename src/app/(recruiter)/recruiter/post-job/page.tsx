'use client';

import { useState, useEffect } from 'react';
import { X, MapPin, Briefcase, Calendar, Loader2, EyeOff, GraduationCap, Banknote, ListChecks } from 'lucide-react';
import axios from 'axios';
import { auth } from '@/lib/firebaseConfig';

type CategoryData = { id: string; name: string; roles: string[] };
type SkillData = { name: string; level: string; isVisible: boolean; showLevel: boolean };

// Global Currency List for the Select Dropdown
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
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' }
];

export default function PostJobPage() {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<CategoryData[]>([]);

  // Relational Form State
  const [categoryId, setCategoryId] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [employmentType, setEmploymentType] = useState('FULL_TIME');
  const [workplaceType, setWorkplaceType] = useState('REMOTE');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  
  // Advanced Skills State
  const [skills, setSkills] = useState<SkillData[]>([]);
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillLevel, setNewSkillLevel] = useState('INTERMEDIATE');
  const [newSkillIsVisible, setNewSkillIsVisible] = useState(true);
  const [newSkillShowLevel, setNewSkillShowLevel] = useState(true);
  
  // Experience State
  const [expLevelName, setExpLevelName] = useState('');
  const [expMinYears, setExpMinYears] = useState(0);
  const [expMaxYears, setExpMaxYears] = useState(0);
  
  // Education & Responsibilities State
  const [educations, setEducations] = useState<string[]>([]);
  const [newDegree, setNewDegree] = useState('');
  const [responsibilities, setResponsibilities] = useState(''); // ✅ State is here
  
  // Currency & Salary State
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
          headers: { Authorization: `Bearer ${token}` }
        });
        setCategories(res.data);
        if (res.data.length > 0) {
          setCategoryId(res.data[0].id);
          setJobTitle(res.data[0].roles[0] || '');
        }
      } catch (err) { console.error("Failed to load DB Meta", err); }
    };
    
    const unsub = auth.onAuthStateChanged(async (user) => {
      if(user) { 
        setHrEmail(user.email || '');
        try {
          const token = await user.getIdToken(true); 
          fetchMeta(token); 
        } catch (e) {
          console.error("Failed to fetch fresh token.");
        }
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const cat = categories.find(c => c.id === categoryId);
    if (cat && cat.roles.length > 0) setJobTitle(cat.roles[0]);
  }, [categoryId, categories]);

  const addSkill = () => {
    if (newSkillName.trim() && !skills.find(s => s.name.toLowerCase() === newSkillName.trim().toLowerCase())) {
      setSkills([...skills, { 
        name: newSkillName.trim(), 
        level: newSkillLevel, 
        isVisible: newSkillIsVisible, 
        showLevel: newSkillShowLevel 
      }]);
      setNewSkillName('');
      setNewSkillIsVisible(true);
      setNewSkillShowLevel(true);
    }
  };
  const removeSkill = (name: string) => setSkills(skills.filter(s => s.name !== name));

  const addEducation = () => {
    if (newDegree.trim() && !educations.includes(newDegree.trim())) {
      setEducations([...educations, newDegree.trim()]);
      setNewDegree('');
    }
  };
  const removeEducation = (deg: string) => setEducations(educations.filter(e => e !== deg));

  const handlePostJob = async () => {
    setIsLoading(true);
    try {
      let token = await auth.currentUser?.getIdToken();
      if (!token) {
        const cookieMatch = document.cookie.match(/(?:^|; )cvnet_token=([^;]*)/);
        token = cookieMatch ? cookieMatch[1] : undefined;
      }

      if (!token) {
        alert("Authentication lost. Please reload the page.");
        setIsLoading(false);
        return;
      }

      const payload = {
        categoryId, jobTitle, employmentType, workplaceType, 
        location: location || null, 
        openings,
        description: description || null, 
        responsibilities: responsibilities || null, // ✅ Sends to Backend
        salaryRange: salaryRange || null, 
        currency: currency,
        applicationDeadline: new Date(applicationDeadline).toISOString(),
        hrContactEmail: hrEmail,
        skills,
        experience: expLevelName ? { levelName: expLevelName, minYears: expMinYears, maxYears: expMaxYears } : null,
        educations 
      };

      await axios.post('http://localhost:5167/api/CompanyJob/create', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      alert('Job Successfully Posted to the Network!');
      window.location.href = '/recruiter/dashboard';
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.error || 'Failed to post job. Please verify your connection.');
      setIsLoading(false);
    }
  };

  const currentDepartmentName = categories.find(c => c.id === categoryId)?.name || 'Department';
  const selectedCurrencySymbol = WORLD_CURRENCIES.find(c => c.code === currency)?.symbol || currency;

  return (
    <div className="p-6 sm:p-8 max-w-7xl">
      <div className="mb-8">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Company Dashboard</p>
        <h1 className="text-2xl font-extrabold text-slate-900">Post a New Position</h1>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* FORM AREA */}
        <div className="lg:col-span-2 space-y-5">
          
          {step === 1 && (
            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm animate-in fade-in">
              <h2 className="font-bold text-slate-900 mb-5">Job Logistics</h2>
              <div className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Department (Category)</label>
                    <select value={categoryId} onChange={e => setCategoryId(e.target.value)} className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 outline-none">
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Job Title</label>
                    <select value={jobTitle} onChange={e => setJobTitle(e.target.value)} className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 outline-none">
                      {(categories.find(c => c.id === categoryId)?.roles || []).map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Employment & Workplace</label>
                    <div className="flex gap-2">
                        <select value={employmentType} onChange={e => setEmploymentType(e.target.value)} className="flex-1 px-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 outline-none">
                        <option value="FULL_TIME">Full Time</option><option value="PART_TIME">Part Time</option><option value="CONTRACT">Contract</option><option value="INTERNSHIP">Internship</option>
                        </select>
                        <select value={workplaceType} onChange={e => setWorkplaceType(e.target.value)} className="flex-1 px-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 outline-none">
                        <option value="REMOTE">Remote</option><option value="HYBRID">Hybrid</option><option value="ONSITE">On-Site</option>
                        </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Location (Optional)</label>
                    <input value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g. San Francisco, CA" className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 outline-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Job Description (Optional)</label>
                  <textarea value={description} onChange={e => setDescription(e.target.value)} rows={4} placeholder="General overview of the role..." className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 outline-none resize-none" />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm animate-in fade-in">
              <h2 className="font-bold text-slate-900 mb-5">Job Requirements</h2>
              <div className="space-y-6">
                
                {/* ✅ RESTORED: Responsibilities Input */}
                <div className="bg-slate-50 p-4 border border-slate-200 rounded-xl">
                  <label className="block text-sm font-bold text-slate-800 mb-1.5">Key Responsibilities (Optional)</label>
                  <p className="text-xs text-slate-500 mb-3">What will this person do on a day-to-day basis?</p>
                  <textarea 
                    value={responsibilities} 
                    onChange={e => setResponsibilities(e.target.value)} 
                    rows={4} 
                    placeholder="• Lead the development of...&#10;• Collaborate with..." 
                    className="w-full px-4 py-3 text-sm border border-slate-200 rounded-lg bg-white outline-none resize-none" 
                  />
                </div>

                <div className="bg-slate-50 p-4 border border-slate-200 rounded-xl">
                  <label className="block text-sm font-bold text-slate-800 mb-3">Required Technical Skills</label>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {skills.map(skill => (
                      <span key={skill.name} className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border ${skill.isVisible ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-slate-200 text-slate-500 border-slate-300'}`}>
                        {!skill.isVisible && <EyeOff size={10} className="mr-0.5" />}
                        {skill.name} {skill.showLevel && <span className="opacity-60 text-[10px]">({skill.level})</span>}
                        <button onClick={() => removeSkill(skill.name)} className="hover:text-red-600 transition-colors ml-1"><X size={11} /></button>
                      </span>
                    ))}
                  </div>

                  <div className="space-y-3 p-3 bg-white border border-slate-200 rounded-lg shadow-sm">
                    <div className="flex gap-2">
                        <input value={newSkillName} onChange={e => setNewSkillName(e.target.value)} placeholder="e.g. React.js" className="flex-1 px-3 py-2 text-sm border rounded-lg outline-none focus:border-blue-500" />
                        <select value={newSkillLevel} onChange={e => setNewSkillLevel(e.target.value)} className="px-3 py-2 text-sm border rounded-lg outline-none font-bold text-slate-600 bg-slate-50">
                        <option value="BEGINNER">Beginner</option><option value="INTERMEDIATE">Intermediate</option><option value="EXPERT">Expert</option>
                        </select>
                        <button onClick={addSkill} disabled={!newSkillName.trim()} className="bg-slate-900 text-white px-4 py-2 rounded-lg text-xs font-bold disabled:opacity-50 transition-colors hover:bg-slate-800">Add</button>
                    </div>
                    
                    <div className="flex gap-4 border-t border-slate-100 pt-3">
                        <label className="flex items-center gap-2 cursor-pointer group">
                            <input type="checkbox" checked={newSkillIsVisible} onChange={e => setNewSkillIsVisible(e.target.checked)} className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                            <span className="text-xs font-semibold text-slate-600 group-hover:text-slate-900 transition-colors">Show to Candidates</span>
                        </label>
                        <label className={`flex items-center gap-2 cursor-pointer group ${!newSkillIsVisible && 'opacity-40 pointer-events-none'}`}>
                            <input type="checkbox" checked={newSkillShowLevel} onChange={e => setNewSkillShowLevel(e.target.checked)} className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                            <span className="text-xs font-semibold text-slate-600 group-hover:text-slate-900 transition-colors">Display Expected Level</span>
                        </label>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 border border-slate-200 rounded-xl">
                  <label className="block text-sm font-bold text-slate-800 mb-3">Specific Education Degrees (Optional)</label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {educations.map(deg => (
                      <span key={deg} className="flex items-center gap-1 bg-indigo-100 text-indigo-700 text-xs font-semibold px-2.5 py-1 rounded-full border border-indigo-200">
                        {deg}
                        <button onClick={() => removeEducation(deg)} className="hover:text-red-600 transition-colors ml-1"><X size={11} /></button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input 
                      value={newDegree} 
                      onChange={e => setNewDegree(e.target.value)} 
                      placeholder="e.g. BSc Hons in Computing and Information Systems" 
                      className="flex-1 px-3 py-2 text-sm border rounded-lg outline-none focus:border-blue-500" 
                    />
                    <button 
                      onClick={addEducation} 
                      disabled={!newDegree.trim()} 
                      className="bg-slate-900 text-white px-4 py-2 rounded-lg text-xs font-bold disabled:opacity-50 transition-colors hover:bg-slate-800"
                    >
                      Add Degree
                    </button>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 border border-slate-200 rounded-xl">
                  <label className="block text-sm font-bold text-slate-800 mb-3">Experience Requirement (Optional)</label>
                  <div className="grid grid-cols-3 gap-3">
                    <div><label className="text-[10px] uppercase font-bold text-slate-400">Level Name</label><input value={expLevelName} onChange={e => setExpLevelName(e.target.value)} placeholder="e.g. Mid-Level" className="w-full px-3 py-2 text-sm border rounded-lg outline-none" /></div>
                    <div><label className="text-[10px] uppercase font-bold text-slate-400">Min Years</label><input type="number" value={expMinYears} onChange={e => setExpMinYears(Number(e.target.value))} className="w-full px-3 py-2 text-sm border rounded-lg outline-none" /></div>
                    <div><label className="text-[10px] uppercase font-bold text-slate-400">Max Years</label><input type="number" value={expMaxYears} onChange={e => setExpMaxYears(Number(e.target.value))} className="w-full px-3 py-2 text-sm border rounded-lg outline-none" /></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm animate-in fade-in">
              <h2 className="font-bold text-slate-900 mb-5">Final Configurations</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Salary Range (Optional)</label>
                  <div className="flex gap-2">
                    <select 
                      value={currency} 
                      onChange={e => setCurrency(e.target.value)} 
                      className="w-24 px-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 outline-none font-bold text-slate-600"
                    >
                      {WORLD_CURRENCIES.map(c => (
                        <option key={c.code} value={c.code}>{c.code}</option>
                      ))}
                    </select>
                    <input 
                      value={salaryRange} 
                      onChange={e => setSalaryRange(e.target.value)} 
                      placeholder="80,000 - 120,000" 
                      className="flex-1 px-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 outline-none" 
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Application Deadline</label>
                  <input type="date" value={applicationDeadline} onChange={e => setApplicationDeadline(e.target.value)} className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 outline-none" />
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-between">
            <button onClick={() => setStep(step - 1)} disabled={step === 1} className="px-5 py-2.5 text-sm font-bold border rounded-xl text-slate-500 disabled:opacity-30">Back</button>
            <button 
              onClick={() => step < 3 ? setStep(step + 1) : handlePostJob()} 
              disabled={isLoading}
              className={`px-5 py-2.5 text-sm font-bold rounded-xl text-white transition-all flex items-center gap-2 ${step === 3 ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}`}
            >
              {isLoading && <Loader2 size={14} className="animate-spin"/>}
              {step === 3 ? 'Publish Job' : 'Next Step'}
            </button>
          </div>
        </div>

        {/* LIVE CANDIDATE VIEW */}
        <div className="space-y-4">
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xl shadow-slate-200/50 sticky top-6 overflow-hidden">
            <div className="bg-slate-900 px-6 py-4 flex items-center justify-between -mx-6 -mt-6 mb-6">
              <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" /><h3 className="font-bold text-white text-xs uppercase tracking-widest">Candidate View</h3></div>
            </div>

            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400"><Briefcase size={20}/></div>
              <div>
                <h4 className="font-black text-slate-900 text-lg leading-tight">{jobTitle || 'Select Job Title'}</h4>
                <p className="text-sm text-blue-600 font-semibold">{currentDepartmentName}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              {location && <span className="flex items-center gap-1.5 bg-slate-50 border border-slate-100 text-slate-600 text-[11px] font-bold px-3 py-1.5 rounded-xl"><MapPin size={12}/> {location}</span>}
              <span className="flex items-center gap-1.5 bg-slate-50 border border-slate-100 text-slate-600 text-[11px] font-bold px-3 py-1.5 rounded-xl"><Briefcase size={12}/> {employmentType.replace('_', ' ')}</span>
              {salaryRange && <span className="flex items-center gap-1.5 bg-slate-50 border border-slate-100 text-slate-600 text-[11px] font-bold px-3 py-1.5 rounded-xl"><Banknote size={12}/> {selectedCurrencySymbol} {salaryRange}</span>}
            </div>

            <div className="mb-6">
              <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Requirements</h5>
              
              {/* ✅ RESTORED: Responsibilities Preview */}
              {responsibilities && (
                <div className="mb-4">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-2">
                    <ListChecks size={14} className="text-blue-500" /> Day-to-Day Responsibilities
                  </div>
                  <p className="text-xs text-slate-600 whitespace-pre-line leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                    {responsibilities}
                  </p>
                </div>
              )}

              {expLevelName && (
                <div className="text-xs font-semibold text-slate-600 flex justify-between bg-slate-50 p-2 rounded-lg border border-slate-100 mb-2">
                  <span>{expLevelName}</span><span>{expMinYears} {expMaxYears > 0 ? `- ${expMaxYears}` : '+'} Yrs</span>
                </div>
              )}
              
              {educations.length > 0 && (
                <div className="mt-3 space-y-1">
                  {educations.map((deg, i) => (
                    <div key={i} className="flex items-start gap-1.5 text-xs font-semibold text-slate-600 bg-indigo-50 p-2 rounded-lg border border-indigo-100">
                      <GraduationCap size={14} className="text-indigo-500 mt-0.5" />
                      <span className="leading-tight">{deg}</span>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="flex flex-wrap gap-1.5 mt-3">
                {skills.filter(s => s.isVisible).length > 0 ? skills.filter(s => s.isVisible).map(s => (
                  <span key={s.name} className="text-[10px] bg-slate-900 text-white font-bold px-2 py-1 rounded-md">
                    {s.name} 
                    {s.showLevel && <span className="text-[9px] text-slate-400 ml-1">({s.level})</span>}
                  </span>
                )) : <span className="text-xs text-slate-300">No public skills requested</span>}
              </div>
            </div>

            <button disabled className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl opacity-50">Apply for position</button>
            <p className="text-center text-[10px] text-slate-400 mt-3 font-medium flex items-center justify-center gap-1.5"><Calendar size={10}/> Deadline: {applicationDeadline}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
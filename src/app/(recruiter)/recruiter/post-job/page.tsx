'use client';

import { useState } from 'react';
import { X, Plus, MapPin, DollarSign, Eye } from 'lucide-react';

const requiredSkillOptions = ['Figma', 'UI Design', 'Design Systems', 'Prototyping', 'React', 'Python', 'SQL', 'AWS', 'Product Management', 'Agile'];

export default function PostJobPage() {
  const [step, setStep] = useState(1);
  const [skills, setSkills] = useState(['Figma', 'UI Design', 'Design Systems']);
  const [newSkill, setNewSkill] = useState('');
  const [jobTitle, setJobTitle] = useState('Senior Product Designer');
  const [dept, setDept] = useState('Design');
  const [description, setDescription] = useState('We are looking for a Senior Product Designer to join our fast-growing team. You will be responsible for leading the design of our core platform features...');
  const [expLevel, setExpLevel] = useState('Mid-Senior Level (5+ years)');
  const [education, setEducation] = useState("Bachelor's Degree");
  const [location, setLocation] = useState('San Francisco, CA (Remote Friendly)');
  const [salaryMin, setSalaryMin] = useState('120,000');
  const [salaryMax, setSalaryMax] = useState('160,000');

  // New States for Step 2 & 3
  const [responsibilities, setResponsibilities] = useState('• Lead the design of core platform features from concept to launch\n• Work closely with product managers and engineers to define requirements\n• Mentor junior designers and provide constructive feedback');
  const [qualifications, setQualifications] = useState('• 5+ years of experience in product design\n• Strong portfolio demonstrating excellence in UI/UX\n• Experience with Figma and modern design tools');
  const [benefits, setBenefits] = useState(['Health Insurance', 'Remote Work', '401(k) Matching']);

  const addSkill = (skill: string) => {
    if (skill && !skills.includes(skill)) {
      setSkills([...skills, skill]);
      setNewSkill('');
    }
  };
  const removeSkill = (skill: string) => setSkills(skills.filter(s => s !== skill));

  const steps = ['Basic Info', 'Requirements', 'Review & Post'];

  return (
    <div className="p-6 sm:p-8 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Job Management</p>
          <h1 className="text-2xl font-extrabold text-slate-900">Post a New Job</h1>
        </div>
      </div>

      {/* Stepper */}
      <div className="flex items-center gap-3 mb-8">
        {steps.map((label, i) => (
          <div key={label} className="flex items-center gap-2">
            <div className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold transition-colors ${i + 1 === step ? 'bg-blue-600 text-white' : i + 1 < step ? 'bg-green-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
              {i + 1 < step ? '✓' : i + 1}
            </div>
            <span className={`text-sm font-semibold hidden sm:block ${i + 1 === step ? 'text-blue-600' : 'text-slate-400'}`}>{label}</span>
            {i < steps.length - 1 && <div className="h-px w-6 bg-slate-200 mx-1 hidden sm:block" />}
          </div>
        ))}
        <span className="ml-auto text-xs text-slate-400 font-medium">Step {step} of {steps.length}</span>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Form Area */}
        <div className="lg:col-span-2 space-y-5">

          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
              <h2 className="font-bold text-slate-900 mb-5">Basic Job Information</h2>
              <div className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="jobTitle" className="block text-sm font-semibold text-slate-700 mb-1.5">Job Title</label>
                    <input id="jobTitle" value={jobTitle} onChange={e => setJobTitle(e.target.value)} className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
                  </div>
                  <div>
                    <label htmlFor="dept" className="block text-sm font-semibold text-slate-700 mb-1.5">Department</label>
                    <select id="dept" value={dept} onChange={e => setDept(e.target.value)} className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all">
                      {['Design', 'Engineering', 'Marketing', 'Data', 'Human Resources', 'Product'].map(d => <option key={d}>{d}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-semibold text-slate-700 mb-1.5">Job Description</label>
                  <textarea id="description" value={description} onChange={e => setDescription(e.target.value)} rows={4} className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none" />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Required Skills</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {skills.map(skill => (
                      <span key={skill} className="flex items-center gap-1 bg-blue-100 text-blue-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                        {skill}
                        <button
                          aria-label={`Remove ${skill}`}
                          onClick={() => removeSkill(skill)}
                          className="hover:text-red-600 transition-colors"
                        >
                          <X size={11} />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <input
                        value={newSkill}
                        onChange={e => setNewSkill(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && addSkill(newSkill)}
                        placeholder="Add skills..."
                        className="w-full px-4 py-2 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <button onClick={() => addSkill(newSkill)} className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-2 rounded-xl transition-colors">
                      <Plus size={14} /> Add
                    </button>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="expLevel" className="block text-sm font-semibold text-slate-700 mb-1.5">Experience Level</label>
                    <select id="expLevel" value={expLevel} onChange={e => setExpLevel(e.target.value)} className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                      {['Entry Level (0-2 years)', 'Mid Level (2-5 years)', 'Mid-Senior Level (5+ years)', 'Senior (8+ years)', 'Director/Executive'].map(e => <option key={e}>{e}</option>)}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="education" className="block text-sm font-semibold text-slate-700 mb-1.5">Education Requirement</label>
                    <select id="education" value={education} onChange={e => setEducation(e.target.value)} className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                      {["High School", "Associate's Degree", "Bachelor's Degree", "Master's Degree", "PhD", "Any"].map(e => <option key={e}>{e}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="location" className="block text-sm font-semibold text-slate-700 mb-1.5">
                      <MapPin size={13} className="inline mr-1 text-slate-400" />Location
                    </label>
                    <input
                      id="location"
                      value={location}
                      onChange={e => setLocation(e.target.value)}
                      className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="salaryMin" className="block text-sm font-semibold text-slate-700 mb-1.5">
                      <DollarSign size={13} className="inline mr-1 text-slate-400" />Salary Range (Annual)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        id="salaryMin"
                        value={`$${salaryMin}`}
                        onChange={e => setSalaryMin(e.target.value.replace('$', ''))}
                        className="flex-1 min-w-0 px-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-slate-400 text-sm">–</span>
                      <input
                        id="salaryMax"
                        aria-label="Maximum salary"
                        value={`$${salaryMax}`}
                        onChange={e => setSalaryMax(e.target.value.replace('$', ''))}
                        className="flex-1 min-w-0 px-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Requirements */}
          {step === 2 && (
            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
              <h2 className="font-bold text-slate-900 mb-5">Job Requirements & Details</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Key Responsibilities</label>
                  <p className="text-xs text-slate-400 mb-2">Use bullet points for better readability.</p>
                  <textarea
                    value={responsibilities}
                    onChange={e => setResponsibilities(e.target.value)}
                    rows={6}
                    placeholder="Enter key responsibilities..."
                    className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Essential Qualifications</label>
                  <textarea
                    value={qualifications}
                    onChange={e => setQualifications(e.target.value)}
                    rows={6}
                    placeholder="Enter required qualifications..."
                    className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">Employee Benefits & Perks</label>
                  <div className="flex flex-wrap gap-2">
                    {['Health Insurance', 'Remote Work', '401(k) Matching', 'Unlimited PTO', 'Gym Membership', 'Stock Options', 'Relocation Bonus'].map(b => (
                      <button
                        key={b}
                        onClick={() => benefits.includes(b) ? setBenefits(benefits.filter(item => item !== b)) : setBenefits([...benefits, b])}
                        className={`text-xs px-4 py-2 rounded-xl border transition-all ${benefits.includes(b) ? 'bg-blue-50 border-blue-200 text-blue-700 font-bold' : 'bg-white border-slate-100 text-slate-500 hover:border-slate-200'}`}
                      >
                        {benefits.includes(b) && '✓ '} {b}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Review & Post */}
          {step === 3 && (
            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
              <h2 className="font-bold text-slate-900 mb-5">Review & Publish</h2>

              <div className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-6 bg-slate-50 rounded-2xl p-5 border border-slate-100">
                  <div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Job Details</h3>
                    <div className="space-y-2">
                      <p className="text-sm font-bold text-slate-800">{jobTitle}</p>
                      <p className="text-sm text-slate-600">{dept} Department</p>
                      <p className="text-sm text-slate-600">{location}</p>
                      <p className="text-sm text-blue-600 font-semibold">${salaryMin} - ${salaryMax}</p>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Requirements</h3>
                    <div className="space-y-2 text-sm text-slate-600">
                      <p><span className="font-medium text-slate-800">Exp:</span> {expLevel}</p>
                      <p><span className="font-medium text-slate-800">Edu:</span> {education}</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {skills.map(s => <span key={s} className="bg-white border border-slate-200 text-[10px] px-1.5 py-0.5 rounded text-slate-500">{s}</span>)}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 mb-2">Job Description Preview</h3>
                    <p className="text-sm text-slate-600 leading-relaxed bg-slate-50/50 p-4 rounded-xl border border-dashed border-slate-200">{description}</p>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="bg-blue-50/30 p-4 rounded-xl border border-blue-100/50">
                      <h4 className="text-xs font-bold text-blue-800 mb-2 uppercase">Responsibilities</h4>
                      <div className="text-xs text-slate-600 whitespace-pre-line leading-relaxed">{responsibilities}</div>
                    </div>
                    <div className="bg-indigo-50/30 p-4 rounded-xl border border-indigo-100/50">
                      <h4 className="text-xs font-bold text-indigo-800 mb-2 uppercase">Qualifications</h4>
                      <div className="text-xs text-slate-600 whitespace-pre-line leading-relaxed">{qualifications}</div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input type="checkbox" className="w-5 h-5 rounded-lg border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer" />
                    <span className="text-sm text-slate-600 group-hover:text-slate-900 transition-colors">I have reviewed the job details and confirm they are accurate.</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setStep(Math.max(1, step - 1))}
              disabled={step === 1}
              className="px-5 py-2.5 text-sm font-semibold border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              ← Back
            </button>
            <div className="flex gap-3">
              <button className="px-5 py-2.5 text-sm font-semibold border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors">Save Draft</button>
              <button
                onClick={() => {
                  if (step < steps.length) {
                    setStep(step + 1);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  } else {
                    alert('Job Published Successfully!');
                  }
                }}
                className={`px-5 py-2.5 text-sm font-semibold rounded-xl transition-all shadow-sm ${step === steps.length ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
              >
                {step === 1 ? 'Continue to Requirements →' : step === 2 ? 'Review & Post →' : 'Publish Job Now'}
              </button>
            </div>
          </div>
        </div>

        {/* Live Preview Sidebar */}
        <div className="space-y-4">
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xl shadow-slate-200/50 sticky top-6 overflow-hidden">
            {/* Header with Animation */}
            <div className="bg-slate-900 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <h3 className="font-bold text-white text-xs uppercase tracking-widest">Live Candidate View</h3>
              </div>
              <span className="text-[10px] font-bold text-slate-400 bg-white/10 px-2 py-0.5 rounded">CVNet AI Preview</span>
            </div>

            <div className="p-6">
              {/* Company Header */}
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-200">
                  CV
                </div>
                <div>
                  <h4 className="font-black text-slate-900 text-lg leading-tight">{jobTitle || 'Job Title'}</h4>
                  <p className="text-sm text-blue-600 font-semibold">{dept} Department · <span className="text-slate-400">CVNet Corp</span></p>
                </div>
              </div>

              {/* Quick Info Tags */}
              <div className="flex flex-wrap gap-2 mb-6">
                <span className="flex items-center gap-1.5 bg-slate-50 border border-slate-100 text-slate-600 text-[11px] font-bold px-3 py-1.5 rounded-xl">
                  <MapPin size={12} className="text-blue-500" /> {location || 'Remote'}
                </span>
                <span className="flex items-center gap-1.5 bg-slate-50 border border-slate-100 text-slate-600 text-[11px] font-bold px-3 py-1.5 rounded-xl">
                  <DollarSign size={12} className="text-green-500" /> ${salaryMin} – ${salaryMax}
                </span>
                <span className="flex items-center gap-1.5 bg-slate-50 border border-slate-100 text-slate-600 text-[11px] font-bold px-3 py-1.5 rounded-xl">
                  <Eye size={12} className="text-indigo-500" /> {expLevel.split(' ')[0]}
                </span>
              </div>

              {/* Description Snippet */}
              <div className="mb-6">
                <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Overview</h5>
                <p className="text-sm text-slate-600 leading-relaxed line-clamp-4 italic">
                  "{description || 'Enter a description to see it here...'}"
                </p>
              </div>

              {/* Skills & Benefits */}
              <div className="space-y-4 mb-8">
                <div>
                  <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Top Skills Required</h5>
                  <div className="flex flex-wrap gap-1.5">
                    {skills.length > 0 ? skills.slice(0, 4).map(s => (
                      <span key={s} className="text-[10px] bg-slate-900 text-white font-bold px-2.5 py-1 rounded-lg">{s}</span>
                    )) : <span className="text-xs text-slate-300">No skills added</span>}
                    {skills.length > 4 && <span className="text-[10px] text-slate-400 font-bold px-1">+ {skills.length - 4} more</span>}
                  </div>
                </div>

                {benefits.length > 0 && (
                  <div>
                    <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Key Benefits</h5>
                    <div className="flex flex-wrap gap-1.5">
                      {benefits.slice(0, 3).map(b => (
                        <span key={b} className="text-[10px] bg-green-50 text-green-700 border border-green-100 font-bold px-2.5 py-1 rounded-lg">✓ {b}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <button className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-2xl transition-all shadow-lg shadow-slate-200 active:scale-[0.98]">
                Apply for this position
              </button>

              <p className="text-center text-[10px] text-slate-400 mt-4 font-medium flex items-center justify-center gap-1.5">
                Not visible until published
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

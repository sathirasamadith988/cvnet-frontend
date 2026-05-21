'use client';

import { 
  User, 
  Building2, 
  Bell, 
  ShieldCheck, 
  CreditCard, 
  Brain, 
  Save, 
  Camera,
  Globe,
  Mail,
  Zap,
  ChevronRight
} from 'lucide-react';
import { useState } from 'react';

export default function RecruiterSettingsPage() {
  const [activeSection, setActiveSection] = useState('profile');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => setIsSaving(false), 1500);
  };

  const sections = [
    { id: 'profile', label: 'My Profile', icon: User },
    { id: 'company', label: 'Company Info', icon: Building2 },
    { id: 'ai', label: 'AI Preferences', icon: Brain },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: ShieldCheck },
  ];

  return (
    <div className="p-6 sm:p-10 max-w-6xl mx-auto min-h-screen">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Settings</h1>
        <p className="text-slate-500 font-medium">Manage your personal account and company preferences</p>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        
        {/* Sidebar Navigation */}
        <div className="space-y-1">
          {sections.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveSection(s.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-sm transition-all ${
                activeSection === s.id 
                ? 'bg-slate-900 text-white shadow-lg shadow-slate-200' 
                : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              <s.icon size={18} />
              {s.label}
              {activeSection === s.id && <ChevronRight size={14} className="ml-auto opacity-50" />}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3 space-y-6">
          
          <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/40">
            
            {/* Profile Section */}
            {activeSection === 'profile' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-6">
                  <div className="relative group">
                    <div className="w-24 h-24 rounded-3xl bg-slate-100 flex items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 group-hover:border-blue-400 transition-colors cursor-pointer overflow-hidden">
                      <Camera size={24} />
                    </div>
                    <div className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-2 rounded-xl shadow-lg border-2 border-white">
                      <Zap size={12} fill="white" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg">Your Photo</h3>
                    <p className="text-xs text-slate-500 mb-3">Upload a professional headshot for your recruiter profile</p>
                    <div className="flex gap-2">
                      <button className="text-xs font-bold text-blue-600 hover:underline">Upload new</button>
                      <button className="text-xs font-bold text-red-500 hover:underline">Remove</button>
                    </div>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="full-name" className="text-xs font-black text-slate-400 uppercase tracking-widest">Full Name</label>
                    <input id="full-name" defaultValue="Gaviru Bihan" className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-slate-800" />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="job-title" className="text-xs font-black text-slate-400 uppercase tracking-widest">Job Title</label>
                    <input id="job-title" defaultValue="Senior Talent Acquisition" className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-slate-800" />
                  </div>
                  <div className="space-y-2 lg:col-span-2">
                    <label htmlFor="email" className="text-xs font-black text-slate-400 uppercase tracking-widest">Email Address</label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input id="email" defaultValue="gaviru@cvnet.ai" className="w-full pl-12 pr-4 py-3 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-slate-800" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Company Section */}
            {activeSection === 'company' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label htmlFor="company-name" className="text-xs font-black text-slate-400 uppercase tracking-widest">Company Name</label>
                    <input id="company-name" defaultValue="CvNet Corp" className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-slate-800" />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="website" className="text-xs font-black text-slate-400 uppercase tracking-widest">Website URL</label>
                    <div className="relative">
                      <Globe size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input id="website" defaultValue="https://cvnet-frontend.vercel.app" className="w-full pl-12 pr-4 py-3 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-slate-800" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="company-desc" className="text-xs font-black text-slate-400 uppercase tracking-widest">Company Description</label>
                    <textarea id="company-desc" rows={4} defaultValue="CvNet is a modern, AI-powered recruitment and career development platform..." className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-slate-800 resize-none" />
                  </div>
                </div>
              </div>
            )}

            {/* AI Preferences Section */}
            {activeSection === 'ai' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="bg-blue-50 border border-blue-100 rounded-3xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Brain className="text-blue-600" />
                    <h3 className="font-bold text-blue-900">AI Screening Settings</h3>
                  </div>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-blue-900 text-sm">Strictness Level</p>
                        <p className="text-xs text-blue-600 font-medium">How strict should the AI be when matching skills?</p>
                      </div>
                      <select 
                        aria-label="AI Strictness Level"
                        className="bg-white border-none rounded-xl text-xs font-bold text-blue-600 px-4 py-2 focus:ring-2 focus:ring-blue-400"
                      >
                        <option>Balanced</option>
                        <option>Very Strict</option>
                        <option>Flexible</option>
                      </select>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-blue-900 text-sm">Auto-reject Candidates</p>
                        <p className="text-xs text-blue-600 font-medium">Reject candidates with a match score below 40%</p>
                      </div>
                      <div className="w-12 h-6 bg-blue-600 rounded-full relative cursor-pointer">
                        <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Bottom Actions */}
            <div className="mt-10 pt-8 border-t border-slate-50 flex items-center justify-between">
              <p className="text-xs text-slate-400 font-medium italic">Last updated today at 10:45 AM</p>
              <button 
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-8 py-3.5 rounded-2xl font-bold shadow-xl shadow-slate-200 transition-all active:scale-95 disabled:opacity-70"
              >
                {isSaving ? (
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <Save size={18} />
                )}
                {isSaving ? 'Saving Changes...' : 'Save Preferences'}
              </button>
            </div>

          </div>

          {/* Danger Zone */}
          {activeSection === 'profile' && (
            <div className="bg-red-50 border border-red-100 rounded-[2.5rem] p-8">
              <h3 className="font-bold text-red-900 mb-2">Danger Zone</h3>
              <p className="text-sm text-red-600 mb-6 font-medium">Once you delete your account, there is no going back. Please be certain.</p>
              <button className="text-sm font-bold text-red-600 bg-white border border-red-200 px-6 py-2.5 rounded-xl hover:bg-red-600 hover:text-white transition-all">
                Delete Account
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

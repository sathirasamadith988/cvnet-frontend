'use client';

import { 
  User, Building2, Bell, ShieldCheck, Brain, Save, Camera, Globe, Mail, Zap, ChevronRight, Loader2, CheckCircle2, AlertCircle
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { auth } from '@/lib/firebaseConfig'; // Removed Firestore DB import
import { onAuthStateChanged, updateProfile, updateEmail, User as FirebaseUser } from 'firebase/auth';
import axios from 'axios';

export default function RecruiterSettingsPage() {
  const [activeSection, setActiveSection] = useState('profile');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);

  // Status Messaging
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string | null }>({ type: 'success', text: null });

  // Profile State (Firebase Auth specifics)
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);

  // Company State (PostgreSQL specifics)
  const [companyName, setCompanyName] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [companyDescription, setCompanyDescription] = useState('');
  const [hrContactPhone, setHrContactPhone] = useState('');

  // Load PostgreSQL Company Data on Mount
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        setFullName(user.displayName || '');
        setEmail(user.email || '');

        try {
          const token = await user.getIdToken();
          // ✅ Fetch data from our new PostgreSQL Company endpoint
          const res = await axios.get('http://localhost:5167/api/CompanyProfile', {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          if (res.data) {
            setCompanyName(res.data.name || '');
            setWebsiteUrl(res.data.siteLink || '');
            setCompanyDescription(res.data.description || '');
            setHrContactPhone(res.data.hrContactPhone || '');
            setProfileImageUrl(res.data.logoUrl || null); // Load real DB logo
          }
        } catch (error) {
          console.error("Failed to load PostgreSQL company data", error);
        }
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // 1. Handle Image Upload via .NET Company Endpoint
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser) return;

    if (file.size > 5 * 1024 * 1024) {
      setStatusMessage({ type: 'error', text: 'File size exceeds the 5MB limit.' });
      return;
    }

    setIsSaving(true);
    setStatusMessage({ type: 'success', text: null });

    const formData = new FormData();
    formData.append('file', file);

    try {
      const idToken = await currentUser.getIdToken();
      // ✅ Hits the correct UploadLogo endpoint in CompanyProfileController
      const response = await axios.post('http://localhost:5167/api/CompanyProfile/upload-logo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${idToken}`,
        },
      });

      if (response.data.status === 'success') {
        const newImageUrl = response.data.logoUrl;
        
        // Update local state and Firebase Auth for sync
        await updateProfile(currentUser, { photoURL: newImageUrl });
        setProfileImageUrl(newImageUrl);
        
        setStatusMessage({ type: 'success', text: 'Company logo updated successfully!' });
      }
    } catch (error: any) {
      setStatusMessage({ type: 'error', text: error.response?.data?.error || 'Failed to upload logo.' });
    } finally {
      setIsSaving(false);
    }
  };

  // 2. Handle Saving Profile Section (Login credentials)
  const handleSaveProfile = async () => {
    if (!currentUser) return;
    setIsSaving(true);
    setStatusMessage({ type: 'success', text: null });

    try {
      // ✅ Only updates Firebase Auth (Login credentials)
      if (fullName !== currentUser.displayName) await updateProfile(currentUser, { displayName: fullName });
      if (email !== currentUser.email) await updateEmail(currentUser, email);

      setStatusMessage({ type: 'success', text: 'Account credentials saved successfully!' });
    } catch (error: any) {
      setStatusMessage({ type: 'error', text: error.message || 'Failed to save account details.' });
    } finally {
      setIsSaving(false);
    }
  };

  // 3. Handle Saving Company Section (PostgreSQL Sync)
  const handleSaveCompany = async () => {
    if (!currentUser) return;
    setIsSaving(true);
    setStatusMessage({ type: 'success', text: null });

    try {
      const idToken = await currentUser.getIdToken();
      
      // ✅ Save directly to PostgreSQL `companies` table using UpdateCompanyDto
      await axios.put('http://localhost:5167/api/CompanyProfile/update', {
        name: companyName,
        description: companyDescription,
        siteLink: websiteUrl,
        hrContactPhone: hrContactPhone,
        employeeCount: "SMALL_2_10" // Default for now
      }, {
        headers: { Authorization: `Bearer ${idToken}` }
      });

      setStatusMessage({ type: 'success', text: 'Company details updated securely!' });
    } catch (error: any) {
      setStatusMessage({ type: 'error', text: error.response?.data?.error || 'Failed to update company details.' });
    } finally {
      setIsSaving(false);
    }
  };

  // Dynamic Save Router
  const handleSave = () => {
    if (activeSection === 'profile') handleSaveProfile();
    else if (activeSection === 'company') handleSaveCompany();
    else {
      setIsSaving(true);
      setTimeout(() => setIsSaving(false), 1000);
    }
  };

  const sections = [
    { id: 'profile', label: 'My Profile', icon: User },
    { id: 'company', label: 'Company Info', icon: Building2 },
    { id: 'ai', label: 'AI Preferences', icon: Brain },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: ShieldCheck },
  ];

  if (isLoading) return <div className="flex justify-center items-center min-h-screen"><Loader2 className="animate-spin text-blue-600" size={40} /></div>;

  return (
    <div className="p-6 sm:p-10 max-w-6xl mx-auto min-h-screen">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Settings</h1>
        <p className="text-slate-500 font-medium">Manage your personal account and company preferences</p>
      </div>

      {statusMessage.text && (
        <div className={`flex items-start gap-2.5 border rounded-xl p-4 text-sm mb-6 transition-all ${statusMessage.type === "success" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-rose-50 text-rose-700 border-rose-200"}`}>
          {statusMessage.type === "success" ? <CheckCircle2 size={18} className="mt-0.5" /> : <AlertCircle size={18} className="mt-0.5" />}
          <div className="font-medium">{statusMessage.text}</div>
        </div>
      )}

      <div className="grid lg:grid-cols-4 gap-8">
        
        {/* Sidebar Navigation */}
        <div className="space-y-1">
          {sections.map((s) => (
            <button
              key={s.id}
              onClick={() => { setActiveSection(s.id); setStatusMessage({ type: 'success', text: null }); }}
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
            
            {/* Profile Section (Now updated to clarify Logo vs Personal Info) */}
            {activeSection === 'profile' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-6">
                  <label className="relative group cursor-pointer block">
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={isSaving} />
                    {profileImageUrl ? (
                      <img src={profileImageUrl} alt="Company Logo" className="w-24 h-24 rounded-3xl object-cover border-2 border-slate-200 group-hover:border-blue-400 transition-colors" />
                    ) : (
                      <div className="w-24 h-24 rounded-3xl bg-slate-100 flex items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 group-hover:border-blue-400 transition-colors">
                        <Camera size={24} />
                      </div>
                    )}
                    <div className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-2 rounded-xl shadow-lg border-2 border-white">
                      <Zap size={12} fill="white" />
                    </div>
                  </label>
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg">Company Logo</h3>
                    <p className="text-xs text-slate-500 mb-3">Upload your company's logo. This will appear on all job listings.</p>
                    <div className="flex gap-2">
                      <label className="text-xs font-bold text-blue-600 hover:underline cursor-pointer">
                        Upload new
                        <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={isSaving} />
                      </label>
                    </div>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                  <div className="space-y-2 lg:col-span-2">
                    <p className="text-sm font-bold text-slate-900 mb-2">Login Credentials</p>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="full-name" className="text-xs font-black text-slate-400 uppercase tracking-widest">Your Full Name</label>
                    <input id="full-name" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-slate-800" />
                  </div>
                  <div className="space-y-2 lg:col-span-2">
                    <label htmlFor="email" className="text-xs font-black text-slate-400 uppercase tracking-widest">Email Address</label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input id="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full pl-12 pr-4 py-3 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-slate-800" />
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
                    <input id="company-name" value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="e.g. CVNet Corp" className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-slate-800" />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="website" className="text-xs font-black text-slate-400 uppercase tracking-widest">Website URL</label>
                    <div className="relative">
                      <Globe size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input id="website" value={websiteUrl} onChange={(e) => setWebsiteUrl(e.target.value)} placeholder="https://example.com" className="w-full pl-12 pr-4 py-3 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-slate-800" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="phone" className="text-xs font-black text-slate-400 uppercase tracking-widest">HR Contact Phone</label>
                    <input id="phone" value={hrContactPhone} onChange={(e) => setHrContactPhone(e.target.value)} placeholder="+1 (555) 123-4567" className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-slate-800" />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="company-desc" className="text-xs font-black text-slate-400 uppercase tracking-widest">Company Description</label>
                    <textarea id="company-desc" rows={4} value={companyDescription} onChange={(e) => setCompanyDescription(e.target.value)} placeholder="Tell candidates about your company's mission..." className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-slate-800 resize-none" />
                  </div>
                </div>
              </div>
            )}

            {/* AI Preferences Section (Static as requested) */}
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
                      <select aria-label="AI Strictness Level" className="bg-white border-none rounded-xl text-xs font-bold text-blue-600 px-4 py-2 focus:ring-2 focus:ring-blue-400">
                        <option>Balanced</option><option>Very Strict</option><option>Flexible</option>
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
              <p className="text-xs text-slate-400 font-medium italic">All data synced securely with PostgreSQL.</p>
              <button 
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-8 py-3.5 rounded-2xl font-bold shadow-xl shadow-slate-200 transition-all active:scale-95 disabled:opacity-70"
              >
                {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                {isSaving ? 'Processing...' : 'Save Preferences'}
              </button>
            </div>

          </div>

          {/* Danger Zone */}
          {activeSection === 'profile' && (
            <div className="bg-red-50 border border-red-100 rounded-[2.5rem] p-8 mt-6">
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
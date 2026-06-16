'use client';

import { 
  Mail, 
  Phone, 
  MapPin, 
  Download, 
  CheckCircle2, 
  Briefcase, 
  GraduationCap,
  ChevronRight,
  Brain,
  ArrowLeft,
  Loader2,
  User as UserIcon
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { auth } from '@/lib/firebaseConfig';

// --- TYPES ---
type SnapshotSkill = { skillName: string; level: string; };
type SnapshotExperience = { companyName: string; startDate: string; endDate?: string; roleDescription: string; };
type SnapshotEducation = { degreeTitle: string; fieldOfStudy?: string; organization: string; year: string; };

type ApplicationData = {
  id: string;
  appliedDate: string;
  status: string;
  user: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    profileImageUrl?: string | null; // ✅ Added profile image field
  };
  snapshot: {
    jobRole: string;
    personalStatement: string;
    aboutMe: string;
    cvUrl: string;
    matchScore: number;
    industryScore: number;
    skills: SnapshotSkill[];
    experience: SnapshotExperience[];
    education: SnapshotEducation[];
  };
};

// Helper to format dates cleanly (e.g., "2021-05-01" -> "May 2021")
const formatMonthYear = (dateString?: string) => {
  if (!dateString) return 'Present';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString; // Fallback if invalid
    return new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric' }).format(date);
  } catch {
    return dateString;
  }
};

export default function CandidateProfilePage() {
  const params = useParams();
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState('experience');
  const [data, setData] = useState<ApplicationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchApplicationDetails = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;
        const token = await user.getIdToken();
        
        const response = await axios.get(`http://localhost:5167/api/Application/${params.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setData(response.data);
      } catch (error) {
        console.error("Failed to load application details", error);
      } finally {
        setIsLoading(false);
      }
    };

    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) fetchApplicationDetails();
    });
    
    return () => unsubscribe();
  }, [params.id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <Loader2 className="animate-spin text-blue-600" size={48} />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 text-slate-500">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Application Not Found</h2>
        <p className="mb-6">We couldn't locate the details for this application.</p>
        <button onClick={() => router.push('/applications')} className="bg-blue-600 hover:bg-blue-700 transition-colors text-white px-6 py-2.5 rounded-xl font-bold shadow-sm">
          Go Back
        </button>
      </div>
    );
  }

  const { user, snapshot } = data;
  const initials = user.fullName ? user.fullName.charAt(0).toUpperCase() : '?';

  return (
    <div className="p-6 sm:p-10 max-w-7xl mx-auto min-h-screen bg-slate-50/50">
      
      {/* Top Navigation / Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-widest mb-8">
        <Link href="/applications" className="hover:text-blue-600 transition-colors cursor-pointer flex items-center gap-1">
          <ArrowLeft size={14} /> My Applications
        </Link>
        <ChevronRight size={14} />
        <span className="text-slate-900">{snapshot.jobRole}</span>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* LEFT COLUMN: Main Profile Info */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Hero Section */}
          <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full -mr-32 -mt-32 blur-3xl opacity-50 pointer-events-none" />
            
            <div className="relative flex flex-col md:flex-row gap-8 items-center md:items-start">
              
              {/* Profile Image (Dynamic fallback) */}
              <div className="w-32 h-32 shrink-0 rounded-3xl bg-slate-100 flex items-center justify-center text-slate-400 text-4xl font-black shadow-lg border-4 border-white relative overflow-hidden group">
                {user.profileImageUrl ? (
                  <img 
                    src={user.profileImageUrl} 
                    alt={user.fullName} 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback to initials if image fails to load
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.parentElement?.classList.add('bg-gradient-to-br', 'from-slate-900', 'to-slate-800', 'text-white');
                      if (e.currentTarget.parentElement) {
                         e.currentTarget.parentElement.innerHTML = `${initials}`;
                      }
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center text-white">
                    {initials}
                  </div>
                )}
                <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-emerald-500 border-4 border-white rounded-full flex items-center justify-center text-white z-10 shadow-sm">
                  <CheckCircle2 size={16} />
                </div>
              </div>

              {/* Basic Info */}
              <div className="flex-1 text-center md:text-left min-w-0 pt-2">
                <div className="flex flex-col md:flex-row md:items-center gap-3 mb-1.5">
                  <h1 className="text-3xl font-black text-slate-900 tracking-tight truncate">{user.fullName}</h1>
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-bold border border-slate-200 shrink-0">
                    Status: {data.status}
                  </span>
                </div>
                <p className="text-lg text-blue-600 font-bold mb-5">{snapshot.jobRole}</p>
                
                <div className="flex flex-wrap justify-center md:justify-start gap-3 text-sm font-semibold text-slate-600">
                  {user.address && (
                    <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                      <MapPin size={15} className="text-slate-400" /> {user.address}
                    </div>
                  )}
                  {user.email && (
                    <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                      <Mail size={15} className="text-slate-400" /> {user.email}
                    </div>
                  )}
                  {user.phone && (
                    <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                      <Phone size={15} className="text-slate-400" /> {user.phone}
                    </div>
                  )}
                </div>
              </div>

              {/* Main Action */}
              {snapshot.cvUrl && (
                <a 
                  href={snapshot.cvUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-6 py-3.5 rounded-2xl font-bold shadow-lg transition-all active:scale-95 whitespace-nowrap shrink-0 mt-4 md:mt-0"
                >
                  <Download size={18} /> Original CV
                </a>
              )}
            </div>
          </div>

          {/* Detailed Info Tabs */}
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden">
            <div className="flex border-b border-slate-100 overflow-x-auto hide-scrollbar">
              {['Experience', 'Education', 'Skills', 'About'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab.toLowerCase())}
                  className={`px-8 py-5 text-sm font-bold transition-all relative whitespace-nowrap ${activeTab === tab.toLowerCase() ? 'text-blue-600 bg-blue-50/30' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}
                >
                  {tab}
                  {activeTab === tab.toLowerCase() && <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-t-full" />}
                </button>
              ))}
            </div>

            <div className="p-8">
              {/* EXPERIENCE TAB */}
              {activeTab === 'experience' && (
                <div className="space-y-6">
                  {(!snapshot.experience || snapshot.experience.length === 0) && (
                    <div className="flex flex-col items-center justify-center py-12 text-center bg-slate-50 rounded-3xl border border-slate-100 border-dashed">
                      <Briefcase size={28} className="text-slate-300 mb-3" />
                      <p className="text-slate-500 font-semibold text-sm">No experience recorded in this snapshot.</p>
                    </div>
                  )}
                  {snapshot.experience?.map((exp, i) => (
                    <div key={i} className="flex gap-5 group relative">
                      {/* Timeline Icon & Line */}
                      <div className="flex flex-col items-center mt-1">
                        <div className="w-12 h-12 shrink-0 rounded-2xl bg-white flex items-center justify-center text-slate-400 border border-slate-200 shadow-sm group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 group-hover:shadow-md group-hover:scale-110 transition-all duration-300 ease-out z-10">
                          <Briefcase size={18} />
                        </div>
                        {i !== snapshot.experience.length - 1 && (
                          <div className="w-0.5 h-full bg-slate-100 mt-2 group-hover:bg-blue-100 transition-colors duration-300" />
                        )}
                      </div>
                      
                      {/* Content Area */}
                      <div className="pb-8 w-full group-hover:translate-x-1 transition-transform duration-300 ease-out">
                        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-blue-100 transition-all duration-300">
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-2">
                            <div>
                              <h4 className="font-extrabold text-slate-700 text-lg tracking-tight leading-tight">
                                {exp.roleDescription}
                              </h4>
                              <p className="text-blue-600 font-bold text-sm mt-1">
                                {exp.companyName}
                              </p>
                            </div>
                            <span className="inline-flex items-center bg-slate-50 text-slate-500 text-xs font-bold px-3 py-1.5 rounded-full border border-slate-200 shadow-sm whitespace-nowrap shrink-0 group-hover:text-blue-600 group-hover:border-blue-200 group-hover:bg-blue-50 transition-colors">
                              {formatMonthYear(exp.startDate)} — {formatMonthYear(exp.endDate)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* EDUCATION TAB */}
              {activeTab === 'education' && (
                <div className="space-y-8">
                  {(!snapshot.education || snapshot.education.length === 0) && (
                    <p className="text-slate-400 font-medium text-sm text-center py-8">No education recorded in this snapshot.</p>
                  )}
                  {snapshot.education?.map((edu, i) => (
                    <div key={i} className="flex gap-6 group">
                      <div className="flex flex-col items-center">
                         <div className="w-12 h-12 shrink-0 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                          <GraduationCap size={20} />
                        </div>
                        {i !== snapshot.education.length - 1 && <div className="w-px h-full bg-slate-100 my-3" />}
                      </div>
                      <div className="pb-6 w-full">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-1">
                          <h4 className="font-bold text-slate-900 text-lg leading-tight">{edu.degreeTitle} {edu.fieldOfStudy && `in ${edu.fieldOfStudy}`}</h4>
                          <span className="inline-block bg-slate-50 text-slate-500 text-xs font-bold px-3 py-1 rounded-lg border border-slate-100 whitespace-nowrap shrink-0">
                            {edu.year || 'N/A'}
                          </span>
                        </div>
                        <p className="text-indigo-600 font-bold text-sm mb-2">{edu.organization}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* SKILLS TAB */}
              {activeTab === 'skills' && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {(!snapshot.skills || snapshot.skills.length === 0) && (
                    <p className="text-slate-400 font-medium text-sm text-center col-span-full py-8">No skills recorded in this snapshot.</p>
                  )}
                  {snapshot.skills?.map((skill, i) => (
                    <div key={i} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all group">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 group-hover:text-blue-500 transition-colors">{skill.level}</p>
                      <h4 className="font-bold text-slate-800">{skill.skillName}</h4>
                    </div>
                  ))}
                </div>
              )}

              {/* ABOUT TAB */}
              {activeTab === 'about' && (
                <div className="space-y-8">
                  {snapshot.personalStatement && (
                    <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                      <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2"><UserIcon size={16}/> Personal Statement</h4>
                      <p className="text-sm text-slate-700 leading-relaxed font-medium">{snapshot.personalStatement}</p>
                    </div>
                  )}
                  {snapshot.aboutMe && (
                    <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                      <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2"><Briefcase size={16}/> About Me</h4>
                      <p className="text-sm text-slate-700 leading-relaxed font-medium">{snapshot.aboutMe}</p>
                    </div>
                  )}
                  {!snapshot.personalStatement && !snapshot.aboutMe && (
                    <p className="text-slate-400 font-medium text-sm text-center py-8">No additional details recorded.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: AI Analysis */}
        <div className="space-y-8">
          
          <div className="bg-gradient-to-b from-slate-900 to-slate-800 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden border border-slate-700">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500 rounded-full blur-[80px] opacity-20 pointer-events-none" />
            
            <div className="relative z-10 text-center">
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/5 px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest mb-8 shadow-sm">
                <Brain size={14} className="text-blue-400" /> CvNet Matrix
              </div>
              
              <div className="relative w-48 h-48 mx-auto mb-8 drop-shadow-2xl">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="96" cy="96" r="84" className="stroke-white/10" strokeWidth="12" fill="transparent" />
                  <circle 
                    cx="96" cy="96" r="84" 
                    className="stroke-blue-500 drop-shadow-lg" 
                    strokeWidth="12" 
                    fill="transparent" 
                    strokeDasharray={528} 
                    strokeDashoffset={528 - (528 * (snapshot.matchScore || 0)) / 100}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-6xl font-black tracking-tighter">{snapshot.matchScore || 0}<span className="text-3xl text-slate-400">%</span></span>
                  <span className="text-[10px] font-bold text-blue-300 uppercase tracking-widest mt-1">Match Score</span>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 text-left">
                <p className="text-xs text-slate-300 font-medium leading-relaxed">
                  Snapshot captured at application time. The expected standard for this role was <span className="text-white font-bold">{snapshot.industryScore || 80}%</span>.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
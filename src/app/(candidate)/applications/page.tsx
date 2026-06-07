"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { 
  Search, ChevronDown, Briefcase, Loader2, 
  Building2, CheckCircle2, X, Send, User, Filter, 
  AlertTriangle, ArrowLeft, Trash2, Plus, MapPin, DollarSign
} from "lucide-react";
import axios from "axios";
import { auth } from "@/lib/firebaseConfig";

// --- TYPES & CONFIG ---
export type ApplicationRecord = { 
  id: string; role: string; company: string; location: string; date: string; status: string; 
};

type JobListing = { 
  id: string; title: string; companyName: string; companyLogo: string | null; 
  categoryName: string; 
  location: string | null; workplaceType: string; employmentType: string; 
  salaryRange: string | null; currency: string; description: string; 
  responsibilities: string; createdAt: string; skillsJson: string; 
  educationsJson: string; experienceJson: string; 
};

type TargetProfile = { 
  id: string; jobRole: string; personalStatement: string; 
};

// Review Form State Type
type ReviewData = {
  jobRole: string;
  personalStatement: string;
  aboutMe: string;
  portfolioUrl: string;
  cvUrl: string;
  coverLetter: string;
  matchScore: number;       
  industryScore: number;
  skills: { skillName: string; level: string }[];
  experience: { companyName: string; startDate: string; roleDescription: string }[];
};

const statusConfig: Record<string, { label: string; bg: string; text: string }> = {
  "Pending": { label: "Pending", bg: "bg-slate-100", text: "text-slate-600" },
  "In Review": { label: "In Review", bg: "bg-blue-100", text: "text-blue-700" },
  "Interviewing": { label: "Interviewing", bg: "bg-purple-100", text: "text-purple-700" },
  "Offer Received": { label: "Offer Received", bg: "bg-green-100", text: "text-green-700" },
  "Rejected": { label: "Rejected", bg: "bg-red-100", text: "text-red-700" },
};

const cleanString = (str: string) => {
  if (!str) return "";
  return str.replace(/\s*\([A-Za-z0-9_-]+\)$/, '').trim();
};

export default function UnifiedApplicationsPage() {
  const [activeTab, setActiveTab] = useState<"find-jobs" | "my-applications">("find-jobs");
  const [isLoading, setIsLoading] = useState(true);
  
  // Data States
  const [applications, setApplications] = useState<ApplicationRecord[]>([]);
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [profiles, setProfiles] = useState<TargetProfile[]>([]);
  
  // UI States
  const [filterStatus, setFilterStatus] = useState("All");
  const [appSearchQuery, setAppSearchQuery] = useState("");
  const [jobSearchQuery, setJobSearchQuery] = useState("");
  const [selectedJobCategory, setSelectedJobCategory] = useState("All"); 
  const [selectedJob, setSelectedJob] = useState<JobListing | null>(null);
  const [selectedProfileId, setSelectedProfileId] = useState<string>("");

  // Review Application States
  const [isReviewing, setIsReviewing] = useState(false);
  const [isFetchingProfile, setIsFetchingProfile] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [reviewData, setReviewData] = useState<ReviewData>({
    jobRole: "", personalStatement: "", aboutMe: "", portfolioUrl: "", cvUrl: "", coverLetter: "", matchScore: 0, industryScore: 0, skills: [], experience: []
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;
        const token = await user.getIdToken();
        
        const [jobsRes, appsRes, profilesRes] = await Promise.all([
          axios.get("http://localhost:5167/api/CandidateJob/active", { headers: { Authorization: `Bearer ${token}` } }).catch(() => ({ data: [] })),
          axios.get("http://localhost:5167/api/Application/my-applications", { headers: { Authorization: `Bearer ${token}` } }).catch(() => ({ data: [] })),
          axios.get("http://localhost:5167/api/Application/my-profiles", { headers: { Authorization: `Bearer ${token}` } }).catch(() => ({ data: [] }))
        ]);
        
        setJobs(jobsRes.data || []);
        setApplications(appsRes.data || []);
        setProfiles(profilesRes.data || []);
        if (profilesRes.data?.length > 0) setSelectedProfileId(profilesRes.data[0].id);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const unsubscribe = auth.onAuthStateChanged((user) => { if (user) fetchData(); });
    return () => unsubscribe();
  }, []);

  const availableCategories = useMemo(() => {
    const cats = jobs.map(j => cleanString(j.categoryName)).filter(Boolean);
    return ["All", ...Array.from(new Set(cats))];
  }, [jobs]);

  const recommendedJobs = useMemo(() => {
    let sortedJobs = [...jobs];
    if (selectedJobCategory !== "All") sortedJobs = sortedJobs.filter(j => cleanString(j.categoryName) === selectedJobCategory);
    if (jobSearchQuery) {
      const q = jobSearchQuery.toLowerCase();
      sortedJobs = sortedJobs.filter(j => cleanString(j.title).toLowerCase().includes(q) || cleanString(j.companyName).toLowerCase().includes(q));
    }
    if (profiles.length > 0 && !jobSearchQuery && selectedJobCategory === "All") {
      const targetRoles = profiles.map(p => cleanString(p.jobRole).toLowerCase());
      sortedJobs.sort((a, b) => {
        const aMatches = targetRoles.some(role => cleanString(a.title).toLowerCase().includes(role));
        const bMatches = targetRoles.some(role => cleanString(b.title).toLowerCase().includes(role));
        return (aMatches === bMatches) ? 0 : aMatches ? -1 : 1;
      });
    }
    return sortedJobs;
  }, [jobs, profiles, jobSearchQuery, selectedJobCategory]);

  const filteredApps = applications.filter((a) => {
    const matchesStatus = filterStatus === "All" || a.status === filterStatus;
    const matchesSearch = cleanString(a.role).toLowerCase().includes(appSearchQuery.toLowerCase()) || cleanString(a.company).toLowerCase().includes(appSearchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const stats = useMemo(() => [
    { label: "Total Applied", value: filteredApps.length }, 
    { label: "Rejected Applications", value: filteredApps.filter(a => a.status === "Rejected").length }, 
    { label: "Offers Received", value: filteredApps.filter(a => a.status === "Offer Received").length }
  ], [filteredApps]);
  
  const parseJson = (jsonStr: string, fallback: any) => { try { return JSON.parse(jsonStr); } catch { return fallback; } };

  // --- REVIEW FLOW METHODS ---
  const handleStartReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJob || !selectedProfileId) return;
    setIsFetchingProfile(true);

    try {
      const token = await auth.currentUser?.getIdToken();
      const [profileRes, matrixRes] = await Promise.all([
        axios.get(`http://localhost:5167/api/Application/profile-details/${selectedProfileId}`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`http://localhost:5167/api/Dashboard/readiness-matrix?profileId=${selectedProfileId}`, { headers: { Authorization: `Bearer ${token}` } }).catch(() => ({ data: { matchScore: 0, industryScore: 80 } })) // Fallback if matrix fails
      ]);
      
      setReviewData({
        jobRole: profileRes.data.jobRole || "",
        personalStatement: profileRes.data.personalStatement || "",
        aboutMe: profileRes.data.aboutMe || "",
        portfolioUrl: profileRes.data.portfolioUrl || "",
        cvUrl: profileRes.data.cvUrl || "",
        coverLetter: `Dear Hiring Team at ${cleanString(selectedJob.companyName)},\n\I am writing to express my interest in the ${cleanString(selectedJob.title)} position. I believe my skills and experience align well with your requirements.\n\nThank you for your consideration.`,
        matchScore: matrixRes.data.matchScore || 0,        
        industryScore: matrixRes.data.industryScore || 85, 
        skills: profileRes.data.skills || [],
        experience: profileRes.data.experience || []
      });
      setIsReviewing(true);
    } catch (error: any) {
      alert("Failed to load profile details for review.");
    } finally {
      setIsFetchingProfile(false);
    }
  };

  const handleConfirmSubmit = async () => {
    if (!selectedJob) return;
    setIsApplying(true);

    try {
      const token = await auth.currentUser?.getIdToken();

      const payload = {
        JobId: selectedJob.id,
        ProfileId: selectedProfileId, 
        CoverLetter: reviewData.coverLetter,
        JobRole: reviewData.jobRole,
        PersonalStatement: reviewData.personalStatement,
        AboutMe: reviewData.aboutMe,
        PortfolioUrl: reviewData.portfolioUrl,
        CvUrl: reviewData.cvUrl,
        MatchScore: reviewData.matchScore,       
        IndustryScore: reviewData.industryScore, 
        // CompanySkillMatchScore is removed! Backend will calculate it.
        SkillsJson: JSON.stringify(reviewData.skills),
        ExperienceJson: JSON.stringify(reviewData.experience)
      };

      await axios.post("http://localhost:5167/api/Application/apply", payload, { 
        headers: { Authorization: `Bearer ${token}` } 
      });

      alert("Application Submitted Successfully!");
      setSelectedJob(null);
      setIsReviewing(false);
      setActiveTab("my-applications"); 
      window.location.reload(); 
    } catch (error: any) {
      alert(error.response?.data?.error || "Failed to submit application.");
    } finally {
      setIsApplying(false);
    }
  };

  // State Updaters for Editable Form
  const updateField = (field: keyof ReviewData, value: string) => setReviewData(prev => ({ ...prev, [field]: value }));
  const updateArray = (collection: "skills" | "experience", index: number, field: string, value: string) => {
    setReviewData(prev => {
      const newArr = [...prev[collection]] as any[];
      newArr[index] = { ...newArr[index], [field]: value };
      return { ...prev, [collection]: newArr };
    });
  };
  const removeArrayItem = (collection: "skills" | "experience", index: number) => {
    setReviewData(prev => {
      const newArr = [...prev[collection]];
      newArr.splice(index, 1);
      return { ...prev, [collection]: newArr };
    });
  };

  if (isLoading) return <div className="flex items-center justify-center min-h-[70vh]"><Loader2 className="animate-spin text-blue-600" size={40} /></div>;

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto flex flex-col h-[calc(100vh-4rem)]">
      <div className="mb-6 shrink-0">
        <h1 className="text-3xl font-extrabold text-slate-900 mb-6">Career Portal</h1>
        <div className="flex gap-2 border-b border-slate-200">
          <button onClick={() => { setActiveTab("find-jobs"); setSelectedJob(null); setIsReviewing(false); }} className={`px-6 py-3 text-sm font-bold transition-all border-b-2 ${activeTab === "find-jobs" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-800"}`}>Find Jobs</button>
          <button onClick={() => setActiveTab("my-applications")} className={`px-6 py-3 text-sm font-bold transition-all border-b-2 ${activeTab === "my-applications" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-800"}`}>My Applications</button>
        </div>
      </div>

      {activeTab === "find-jobs" && (
        <div className="flex gap-6 flex-1 min-h-0 relative">
          
          {/* LEFT: JOB LIST */}
          <div className={`flex-1 flex flex-col h-full ${selectedJob ? 'hidden lg:flex lg:max-w-md' : 'w-full'}`}>
            <div className="flex flex-col sm:flex-row gap-3 mb-6 shrink-0">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input value={jobSearchQuery} onChange={(e) => setJobSearchQuery(e.target.value)} placeholder="Search title or company..." className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"/>
              </div>
              <div className="relative shrink-0 sm:w-48">
                <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <select value={selectedJobCategory} onChange={(e) => setSelectedJobCategory(e.target.value)} className="w-full pl-9 pr-8 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 appearance-none shadow-sm cursor-pointer">
                  {availableCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <div className="overflow-y-auto pr-2 space-y-3 pb-6">
              {recommendedJobs.length === 0 ? (
                <div className="text-center p-8 bg-white rounded-2xl border border-slate-100"><p className="text-sm text-slate-500 font-bold">No jobs found matching your criteria.</p></div>
              ) : (
                recommendedJobs.map((job) => (
                  <div key={job.id} onClick={() => { setSelectedJob(job); setIsReviewing(false); }} className={`p-5 rounded-2xl border cursor-pointer transition-all ${selectedJob?.id === job.id ? 'bg-blue-50 border-blue-200 shadow-md' : 'bg-white border-slate-100 hover:border-blue-300'}`}>
                    <div className="flex items-start gap-4">
                      {job.companyLogo && job.companyLogo.includes("http") ? (
                          <img src={job.companyLogo} alt={job.companyName} className="w-12 h-12 rounded-xl object-cover bg-slate-50 border border-slate-100 shrink-0" onError={(e) => { (e.target as HTMLImageElement).src = "/logo.jpeg"; }}/>
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center border border-slate-200 shrink-0"><Building2 size={20} className="text-slate-400"/></div>
                        )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-slate-900 truncate">{cleanString(job.title)}</h3>
                        <p className="text-xs font-semibold text-slate-500 mt-0.5">{cleanString(job.companyName)}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-3">
                          <span className="flex items-center gap-1 bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-1 rounded-md"><Briefcase size={10}/> {job.workplaceType}</span>
                          {job.salaryRange && <span className="flex items-center gap-1 bg-green-50 text-green-700 text-[10px] font-bold px-2 py-1 rounded-md"><DollarSign size={10}/> {job.currency} {job.salaryRange}</span>}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* RIGHT: APPLY PANEL / REVIEW PANEL */}
          {selectedJob ? (
            <div className="flex-[2] bg-white border border-slate-200 rounded-[2rem] shadow-xl overflow-hidden flex flex-col h-full animate-in slide-in-from-right-8 duration-300 relative z-10">
              
              {/* Common Header */}
              <div className="p-6 sm:p-8 border-b border-slate-100 bg-slate-50/50 relative shrink-0">
                <button onClick={() => { setSelectedJob(null); setIsReviewing(false); }} className="lg:hidden absolute top-6 right-6 p-2 bg-white rounded-full shadow-sm border border-slate-200"><X size={16}/></button>
                <div className="flex items-center gap-4">
                  {selectedJob.companyLogo && selectedJob.companyLogo.includes("http") ? (
                    <img src={selectedJob.companyLogo} alt={selectedJob.companyName} className="w-16 h-16 rounded-2xl object-cover bg-white border border-slate-200 shadow-sm" onError={(e) => { (e.target as HTMLImageElement).src = "/logo.jpeg"; }}/>
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200 flex items-center justify-center shadow-sm"><Building2 size={24} className="text-slate-400"/></div>
                  )}
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 leading-tight">{cleanString(selectedJob.title)}</h2>
                    <p className="text-sm font-bold text-blue-600 mt-1">{cleanString(selectedJob.companyName)}</p>
                  </div>
                </div>
              </div>

              <div className="p-6 sm:p-8 overflow-y-auto h-full space-y-8">
                
                {/* STATE 1: VIEWING JOB DESCRIPTION */}
                {!isReviewing ? (
                  <>
                    {/* Job Highlights Badges */}
                    <div className="flex flex-wrap gap-2 mb-2">
                      <span className="flex items-center gap-1.5 bg-slate-100 text-slate-700 text-xs font-bold px-3 py-1.5 rounded-lg">
                        <MapPin size={14}/> {selectedJob.location || "Remote"}
                      </span>
                      <span className="flex items-center gap-1.5 bg-slate-100 text-slate-700 text-xs font-bold px-3 py-1.5 rounded-lg">
                        <Briefcase size={14}/> {selectedJob.workplaceType} · {selectedJob.employmentType}
                      </span>
                      {selectedJob.salaryRange && (
                        <span className="flex items-center gap-1.5 bg-green-50 text-green-700 text-xs font-bold px-3 py-1.5 rounded-lg">
                          <DollarSign size={14}/> {selectedJob.currency} {selectedJob.salaryRange}
                        </span>
                      )}
                    </div>

                    {selectedJob.description && (
                      <section>
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Overview</h3>
                        <p className="text-sm text-slate-700 leading-relaxed">{selectedJob.description}</p>
                      </section>
                    )}

                    {/* Qualifications (Skills, Education, Experience) */}
                    <section className="grid sm:grid-cols-2 gap-4">
                      <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Required Skills</h4>
                        <div className="flex flex-wrap gap-2">
                          {parseJson(selectedJob.skillsJson, []).map((s: any, i: number) => (
                            <span key={i} className="bg-white border border-slate-200 text-xs font-bold text-slate-700 px-2.5 py-1 rounded-lg shadow-sm">
                              {s.name} {s.showLevel && <span className="text-slate-400 ml-1 font-medium text-[10px]">({s.level})</span>}
                            </span>
                          ))}
                          {parseJson(selectedJob.skillsJson, []).length === 0 && <span className="text-xs text-slate-500">None explicitly stated.</span>}
                        </div>
                      </div>

                      <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-5">
                        <div>
                          <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Experience</h4>
                          {parseJson(selectedJob.experienceJson, {}).level ? (
                            <p className="text-sm font-bold text-slate-700">{parseJson(selectedJob.experienceJson, {}).level} <span className="text-slate-500 font-medium ml-1">({parseJson(selectedJob.experienceJson, {}).min}+ years)</span></p>
                          ) : <p className="text-sm text-slate-500">Not specified</p>}
                        </div>
                        <div>
                          <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Education</h4>
                          {parseJson(selectedJob.educationsJson, []).map((e: any, i: number) => (
                            <p key={i} className="text-sm font-bold text-slate-700 flex items-center gap-2 mt-1"><CheckCircle2 size={14} className="text-blue-500"/> {e.degree}</p>
                          ))}
                          {parseJson(selectedJob.educationsJson, []).length === 0 && <p className="text-sm text-slate-500">Not specified</p>}
                        </div>
                      </div>
                    </section>

                    {/* Responsibilities */}
                    {selectedJob.responsibilities && (
                      <section>
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Key Responsibilities</h3>
                        <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-line bg-blue-50/30 p-5 rounded-2xl border border-blue-100">
                          {selectedJob.responsibilities}
                        </div>
                      </section>
                    )}

                    <section className="bg-blue-50 border border-blue-100 rounded-2xl p-6">
                      <h3 className="text-base font-bold text-slate-900 mb-2">Begin Application</h3>
                      <p className="text-xs text-slate-600 mb-5">Select a profile track. You will be able to review and edit your data before final submission.</p>
                      
                      {profiles.length > 0 ? (
                        <form onSubmit={handleStartReview} className="space-y-4">
                          <div>
                            <select value={selectedProfileId} onChange={(e) => setSelectedProfileId(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-sm font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500">
                              {profiles.map(p => <option key={p.id} value={p.id}>{cleanString(p.jobRole)} (Profile)</option>)}
                            </select>
                          </div>
                          <button type="submit" disabled={isFetchingProfile} className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-6 py-3.5 rounded-xl font-bold shadow-lg transition-all active:scale-95 disabled:opacity-70">
                            {isFetchingProfile ? <Loader2 size={16} className="animate-spin" /> : <User size={16} />}
                            Review Profile Details
                          </button>
                        </form>
                      ) : (
                        <div className="bg-white p-4 rounded-xl border border-slate-200 text-center">
                          <p className="text-sm font-bold text-slate-700">No Target Profiles Found</p>
                          <Link href="/cv" className="text-xs font-bold text-blue-600 hover:underline">Go to CV Builder →</Link>
                        </div>
                      )}
                    </section>
                  </>
                ) : (
                  
                  /* STATE 2: EDITING AND REVIEWING */
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <button onClick={() => setIsReviewing(false)} className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700 mb-6">
                      <ArrowLeft size={16} /> Back to Job Details
                    </button>

                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3 mb-8 shadow-sm">
                      <AlertTriangle size={20} className="text-amber-600 shrink-0" />
                      <div>
                        <p className="text-sm font-bold text-amber-900">Review Your Submission</p>
                        <p className="text-xs text-amber-700 mt-1">There is no going back once submitted. Please make sure all details below are correct. Editing these fields will only affect this specific application.</p>
                      </div>
                    </div>

                    <div className="space-y-6">
                      
                      {/* Personal Info & Core Details */}
                      <section className="bg-slate-50 border border-slate-200 p-5 rounded-2xl">
                        <h4 className="font-bold text-sm text-slate-800 mb-4 border-b border-slate-200 pb-2">Core Profile Information</h4>
                        <div className="space-y-4">
                          <div><label className="text-[11px] uppercase font-bold text-slate-500 mb-1 block">Role Title</label><input value={reviewData.jobRole} onChange={(e) => updateField("jobRole", e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-sm outline-none font-semibold focus:border-blue-500"/></div>
                          <div><label className="text-[11px] uppercase font-bold text-slate-500 mb-1 block">Portfolio URL</label><input type="url" value={reviewData.portfolioUrl} onChange={(e) => updateField("portfolioUrl", e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-sm outline-none text-blue-600 focus:border-blue-500"/></div>
                          <div><label className="text-[11px] uppercase font-bold text-slate-500 mb-1 block">Personal Statement</label><textarea value={reviewData.personalStatement} onChange={(e) => updateField("personalStatement", e.target.value)} rows={3} className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-sm outline-none resize-none focus:border-blue-500"/></div>
                        </div>
                      </section>

                      {/* Cover Letter */}
                      <section className="bg-slate-50 border border-slate-200 p-5 rounded-2xl">
                         <h4 className="font-bold text-sm text-slate-800 mb-4 border-b border-slate-200 pb-2">Cover Letter / Note</h4>
                         <textarea value={reviewData.coverLetter} onChange={(e) => updateField("coverLetter", e.target.value)} rows={5} className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm outline-none resize-none focus:border-blue-500"/>
                      </section>

                      {/* Skills */}
                      <section className="bg-slate-50 border border-slate-200 p-5 rounded-2xl">
                        <div className="flex items-center justify-between mb-4 border-b border-slate-200 pb-2">
                          <h4 className="font-bold text-sm text-slate-800">Targeted Skills</h4>
                          <button onClick={() => setReviewData(prev => ({...prev, skills: [...prev.skills, { skillName: "", level: "Beginner" }]}))} className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"><Plus size={14}/> Add Skill</button>
                        </div>
                        <div className="space-y-3">
                          {reviewData.skills.length === 0 && <p className="text-xs text-slate-400">No skills attached.</p>}
                          {reviewData.skills.map((skill, idx) => (
                            <div key={idx} className="flex gap-2 items-center bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
                              <input placeholder="Skill Name" value={skill.skillName} onChange={e => updateArray("skills", idx, "skillName", e.target.value)} className="border-0 px-2 py-1 text-sm flex-1 outline-none font-semibold focus:text-blue-600"/>
                              <select value={skill.level} onChange={e => updateArray("skills", idx, "level", e.target.value)} className="border-l border-slate-200 pl-2 py-1 text-sm outline-none bg-transparent text-slate-600">
                                <option>Beginner</option><option>Intermediate</option><option>Expert</option>
                              </select>
                              <button onClick={() => removeArrayItem("skills", idx)} className="text-slate-400 hover:text-red-500 px-2 border-l border-slate-200"><Trash2 size={16}/></button>
                            </div>
                          ))}
                        </div>
                      </section>

                      {/* Experience */}
                      <section className="bg-slate-50 border border-slate-200 p-5 rounded-2xl">
                        <div className="flex items-center justify-between mb-4 border-b border-slate-200 pb-2">
                          <h4 className="font-bold text-sm text-slate-800">Included Experience</h4>
                          <button onClick={() => setReviewData(prev => ({...prev, experience: [...prev.experience, { companyName: "", roleDescription: "", startDate: "" }]}))} className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"><Plus size={14}/> Add Experience</button>
                        </div>
                        <div className="space-y-4">
                          {reviewData.experience.length === 0 && <p className="text-xs text-slate-400">No experience attached.</p>}
                          {reviewData.experience.map((exp, idx) => (
                            <div key={idx} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative group">
                              <button onClick={() => removeArrayItem("experience", idx)} className="absolute top-4 right-4 text-slate-300 hover:text-red-500"><Trash2 size={16}/></button>
                              <div className="grid grid-cols-2 gap-3 pr-8">
                                <div><label className="text-[10px] uppercase font-bold text-slate-400">Company</label><input value={exp.companyName || ""} onChange={e => updateArray("experience", idx, "companyName", e.target.value)} className="w-full border-b border-slate-200 py-1 text-sm outline-none font-semibold focus:border-blue-500"/></div>
                                <div><label className="text-[10px] uppercase font-bold text-slate-400">Start Date</label><input type="date" value={exp.startDate || ""} onChange={e => updateArray("experience", idx, "startDate", e.target.value)} className="w-full border-b border-slate-200 py-1 text-sm outline-none text-slate-600 focus:border-blue-500"/></div>
                                <div className="col-span-2"><label className="text-[10px] uppercase font-bold text-slate-400">Role / Title</label><input value={exp.roleDescription || ""} onChange={e => updateArray("experience", idx, "roleDescription", e.target.value)} className="w-full border-b border-slate-200 py-1 text-sm outline-none font-semibold focus:border-blue-500"/></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </section>

                      {/* Final Confirm Button */}
                      <button 
                        onClick={handleConfirmSubmit} 
                        disabled={isApplying}
                        className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-4 rounded-xl font-extrabold shadow-lg transition-all active:scale-95 disabled:opacity-70 mt-6"
                      >
                        {isApplying ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
                        {isApplying ? "Committing Application..." : "Confirm & Submit Application"}
                      </button>

                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="hidden lg:flex flex-[2] bg-slate-50 border border-slate-200 border-dashed rounded-[2rem] items-center justify-center flex-col text-slate-400">
              <Briefcase size={48} className="mb-4 opacity-50" />
              <p className="font-bold">Select a job to view details & apply</p>
            </div>
          )}
        </div>
      )}

      {/* --- TAB 2: MY APPLICATIONS --- */}
      {activeTab === "my-applications" && (
         <div className="flex-1 overflow-y-auto pb-10 animate-in fade-in">
           <div className="grid grid-cols-1 gap-4 mb-6 sm:grid-cols-3">
            {stats.map(({ label, value }) => (
              <div key={label} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
                <p className="text-sm font-medium text-slate-500 mb-1">{label}</p>
                <p className="text-3xl font-extrabold text-slate-900">{value}</p>
              </div>
            ))}
          </div>

          <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div className="relative w-full sm:w-auto">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input value={appSearchQuery} onChange={(e) => setAppSearchQuery(e.target.value)} placeholder="Search your applications..." className="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl bg-white outline-none focus:ring-1 focus:ring-blue-500 w-full sm:w-64" />
              </div>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="relative w-full sm:w-auto">
                  <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="appearance-none w-full pl-3 pr-8 py-2 text-sm font-semibold border border-slate-200 rounded-xl bg-white text-slate-700 outline-none cursor-pointer">
                    {["All", ...Object.keys(statusConfig)].map((s) => <option key={s}>{s}</option>)}
                  </select>
                  <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="text-left px-6 py-3 text-[11px] font-bold text-slate-400 uppercase">Role / Company</th>
                    <th className="text-left px-4 py-3 text-[11px] font-bold text-slate-400 uppercase">Status</th>
                    <th className="text-left px-4 py-3 text-[11px] font-bold text-slate-400 uppercase">Applied Date</th>
                    <th className="text-left px-4 py-3 text-[11px] font-bold text-slate-400 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredApps.length === 0 ? (
                    <tr><td colSpan={4} className="px-6 py-12 text-center text-slate-500">No applications found.</td></tr>
                  ) : (
                    filteredApps.map((a) => (
                      <tr key={a.id} className="hover:bg-blue-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-bold text-slate-900">{cleanString(a.role)}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{cleanString(a.company)} · {a.location || "Remote"}</p>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`inline-flex rounded-md px-2.5 py-1 text-[11px] uppercase tracking-wider font-extrabold ${statusConfig[a.status]?.bg || 'bg-slate-100'} ${statusConfig[a.status]?.text || 'text-slate-600'}`}>
                            {statusConfig[a.status]?.label || a.status}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-xs font-semibold text-slate-600">{a.date}</td>
                        <td className="px-4 py-4">
                          <Link href={`/applications/${a.id}`} className="text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg">View Details</Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
         </div>
      )}
    </div>
  );
}
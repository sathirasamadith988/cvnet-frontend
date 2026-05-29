"use client";

import Link from "next/link";
import { useMemo, useState, useEffect, useRef } from "react";
import {
  Award, BookOpen, Briefcase, Download, Eye, FileText, GraduationCap,
  Globe, Languages, Link2, Plus, Upload, Users, Loader2, RefreshCw, Trash2, CheckCircle2, Copy
} from "lucide-react";
import axios from "axios";
import { auth } from "@/lib/firebaseConfig";

type SectionName =
  | "All" | "Personal Info" | "Experience" | "Education" | "Skills"
  | "Certifications" | "Languages" | "Projects" | "Publications"
  | "Teaching" | "Research" | "Awards" | "Volunteer" | "Memberships" | "Social Links";

const toSnakeCase = (obj: any) => {
  const snakeObj: any = {};
  for (const key in obj) {
    const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    snakeObj[snakeKey] = obj[key];
  }
  return snakeObj;
};

const SaveControls = ({ isDirty, onSave, onDiscard, isSaving }: { isDirty: boolean, onSave: () => void, onDiscard: () => void, isSaving: boolean }) => {
  if (!isDirty) return null;
  return (
    <div className="flex gap-3 mt-5 pt-5 border-t border-slate-100">
      <button onClick={onSave} disabled={isSaving} className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white px-5 py-2 rounded-xl text-sm font-bold transition-colors flex items-center gap-2">
        {isSaving ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />} Save Changes
      </button>
      <button onClick={onDiscard} disabled={isSaving} className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-5 py-2 rounded-xl text-sm font-bold transition-colors">
        Discard
      </button>
    </div>
  );
};

export default function CVPage() {
  const [activeSection, setActiveSection] = useState<SectionName>("All");
  
  const [initialProfile, setInitialProfile] = useState<any>({});
  const [profile, setProfile] = useState<any>({});
  
  const [availableProfiles, setAvailableProfiles] = useState<any[]>([]);
  const [activeProfileId, setActiveProfileId] = useState<string>("");
  const [masterProfileId, setMasterProfileId] = useState<string>(""); // ✅ Added to track Master CV

  const [isSaving, setIsSaving] = useState(false);
  const [isCloning, setIsCloning] = useState(false); // ✅ Added Clone Loading State
  const [isUploading, setIsUploading] = useState(false);
  const [isSyncingLinkedIn, setIsSyncingLinkedIn] = useState(false);
  const [linkedInUrl, setLinkedInUrl] = useState("");

  const sectionRefs: Record<string, any> = {
    "Personal Info": useRef<HTMLDivElement>(null), "Experience": useRef<HTMLDivElement>(null),
    "Education": useRef<HTMLDivElement>(null), "Skills": useRef<HTMLDivElement>(null),
    "Certifications": useRef<HTMLDivElement>(null), "Languages": useRef<HTMLDivElement>(null),
    "Projects": useRef<HTMLDivElement>(null), "Publications": useRef<HTMLDivElement>(null),
    "Teaching": useRef<HTMLDivElement>(null), "Research": useRef<HTMLDivElement>(null),
    "Awards": useRef<HTMLDivElement>(null), "Volunteer": useRef<HTMLDivElement>(null),
    "Memberships": useRef<HTMLDivElement>(null), "Social Links": useRef<HTMLDivElement>(null)
  };

  const API_BASE = "http://localhost:5167/api/UserProfile";

  const fetchCVData = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;
      const token = await user.getIdToken();
      const res = await axios.get(`${API_BASE}/full-profile?userId=${user.uid}`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.data) {
        setActiveProfileId(res.data.activeProfileId || "");
        setMasterProfileId(res.data.masterProfileId || "");
        setAvailableProfiles(res.data.availableProfiles || []);
        
        const mappedData = {
          fullName: res.data.fullName || user.displayName || "",
          email: res.data.email || user.email || "",
          phone: res.data.phone || "",
          address: res.data.address || "",
          gpa: res.data.gpa?.toString() || "",
          employmentStatus: res.data.employmentStatus || "Unemployed",
          ...res.data
        };
        setInitialProfile(JSON.parse(JSON.stringify(mappedData))); 
        setProfile(JSON.parse(JSON.stringify(mappedData)));
      }
    } catch (err) { console.error("Data Fetch Error:", err); }
  };

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(user => { if (user) fetchCVData(); });
    return () => unsub();
  }, []);

  // --- PROFILE MANAGEMENT ---
  const handleProfileSwitch = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newProfileId = e.target.value;
    setActiveProfileId(newProfileId);
    try {
      const user = auth.currentUser;
      const token = await user?.getIdToken();
      await axios.post(`${API_BASE}/switch-profile`, { userId: user?.uid, profileId: newProfileId }, { headers: { Authorization: `Bearer ${token}` } });
      await fetchCVData();
    } catch (err) { console.error(err); }
  };

  // ✅ NEW: CLONE FROM MASTER
  const handleCloneProfile = async () => {
    if(!masterProfileId || !activeProfileId) return;
    setIsCloning(true);
    try {
        const token = await auth.currentUser?.getIdToken();
        await axios.post(`${API_BASE}/clone-profile`, { MasterProfileId: masterProfileId, TargetProfileId: activeProfileId }, { headers: { Authorization: `Bearer ${token}` } });
        await fetchCVData();
    } catch (err) {
        console.error("Clone Failed:", err);
    } finally {
        setIsCloning(false);
    }
  };

  const handleFieldChange = (field: string, value: string) => setProfile((p: any) => ({ ...p, [field]: value }));
  const handleArrayChange = (collectionKey: string, index: number, field: string, value: string) => {
    setProfile((p: any) => {
      const newArr = [...(p[collectionKey] || [])];
      newArr[index] = { ...newArr[index], [field]: value };
      return { ...p, [collectionKey]: newArr };
    });
  };
  const addArrayItem = (collectionKey: string, defaultItem: any) => {
    setProfile((p: any) => ({ ...p, [collectionKey]: [...(p[collectionKey] || []), { id: `temp-${Date.now()}-${Math.random()}`, ...defaultItem }] }));
  };
  const removeArrayItem = (collectionKey: string, index: number) => {
    setProfile((p: any) => {
      const newArr = [...(p[collectionKey] || [])];
      newArr.splice(index, 1);
      return { ...p, [collectionKey]: newArr };
    });
  };

  // --- SAVE ACTIONS ---
  const isPersonalInfoDirty = () => {
    const fields = ["fullName", "phone", "address", "gpa", "portfolioUrl", "currentOrg", "currentPosition", "personalStatement", "aboutMe"];
    return fields.some(f => profile[f] !== initialProfile[f]);
  };

  const savePersonalInfo = async () => {
    setIsSaving(true);
    try {
      const user = auth.currentUser;
      if (!user) return;
      const token = await user.getIdToken();
      const fields = ["fullName", "phone", "address", "gpa", "portfolioUrl", "currentOrg", "currentPosition", "personalStatement", "aboutMe"];
      const promises = [];
      for (const f of fields) {
        if (profile[f] !== initialProfile[f]) {
          promises.push(axios.put(`${API_BASE}/profile-update`, { userId: user.uid, profileId: activeProfileId, field: f, value: profile[f] }, { headers: { Authorization: `Bearer ${token}` } }));
        }
      }
      await Promise.all(promises);
      await fetchCVData();
    } catch (err) { console.error(err); } finally { setIsSaving(false); }
  };

  const isCollectionDirty = (collectionKey: string) => {
    const orig = initialProfile[collectionKey] || [];
    const curr = profile[collectionKey] || [];
    return JSON.stringify(orig) !== JSON.stringify(curr);
  };

  const saveCollectionSection = async (tableName: string, collectionKey: string) => {
    if (!activeProfileId) return;
    setIsSaving(true);
    const origItems = initialProfile[collectionKey] || [];
    const currItems = profile[collectionKey] || [];
    const toDeleteIds: string[] = [];
    const toAdd: any[] = [];

    for (const orig of origItems) {
      const curr = currItems.find((i: any) => i.id === orig.id);
      if (!curr) { toDeleteIds.push(orig.id); } 
      else {
        const { id: origId, ...origRest } = orig;
        const { id: currId, ...currRest } = curr;
        if (JSON.stringify(origRest) !== JSON.stringify(currRest)) {
          toDeleteIds.push(orig.id); toAdd.push(curr); 
        }
      }
    }
    for (const curr of currItems) { if (String(curr.id).startsWith("temp-")) toAdd.push(curr); }

    try {
      const token = await auth.currentUser?.getIdToken();
      for (const id of toDeleteIds) { await axios.delete(`${API_BASE}/collection/${tableName}/${id}`, { headers: { Authorization: `Bearer ${token}` } }); }
      for (const item of toAdd) {
        const { id, profileId, profile_id, created_at, updated_at, ...rest } = item;
        await axios.post(`${API_BASE}/collection/${tableName}`, { profileId: activeProfileId, ...toSnakeCase(rest) }, { headers: { Authorization: `Bearer ${token}` } });
      }
      await fetchCVData();
    } catch (err: any) { 
      console.error(err); 
      if(err.response?.data) alert(err.response.data);
    } finally { setIsSaving(false); }
  };

  // --- AUTOMATED SYNC ACTIONS ---
  const handlePDFUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    const formData = new FormData(); formData.append("file", file);
    try {
      const user = auth.currentUser;
      const token = await user?.getIdToken();
      const uploadRes = await axios.post("http://localhost:5167/api/CV/upload-cloudinary", formData, { headers: { Authorization: `Bearer ${token}` } });
      await axios.post("http://localhost:8000/process-pdf", { userId: user?.uid, cvUrl: uploadRes.data.url });
      await fetchCVData();
    } catch (err) { console.error(err); } finally { setIsUploading(false); }
  };

  const handleLinkedInSync = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkedInUrl.trim()) return;
    setIsSyncingLinkedIn(true);
    try {
      const user = auth.currentUser;
      const formData = new FormData();
      formData.append("user_id", user?.uid || "");
      formData.append("profile_url", linkedInUrl);
      await axios.post("http://localhost:8000/sync-linkedin", formData, { headers: { "Content-Type": "multipart/form-data" } });
      await fetchCVData();
      setLinkedInUrl("");
    } catch (err) { console.error(err); } finally { setIsSyncingLinkedIn(false); }
  };

  const completionPercentage = useMemo(() => {
    let filled = 0;
    if (profile.phone || profile.address || profile.gpa || profile.fullName) filled++;
    if (profile.portfolioUrl || profile.currentOrg || profile.currentPosition || profile.personalStatement || profile.aboutMe) filled++;
    const arrs = [profile.skills, profile.experience, profile.education, profile.projects, profile.publications, profile.certifications, profile.memberships, profile.languages, profile.teachingExperience, profile.researchExperience, profile.awards, profile.volunteer];
    arrs.forEach(a => { if (a && a.length > 0) filled++; });
    return Math.round((filled / 14) * 100);
  }, [profile]);

  const showSection = (s: SectionName) => activeSection === "All" || activeSection === s;

  // Determine if active profile is empty (to show Clone button)
  // Determine if we are on a targeted role (to show Clone button)
const canCloneFromMaster = activeProfileId !== masterProfileId;

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto">
      
      {/* HEADER WITH JOB ROLE TRACK SELECTOR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">My CV Workspace</h1>
          <p className="text-slate-500 text-sm mt-0.5">Edit your Master CV or select a targeted Job Role track to customize.</p>
        </div>
        
        {/* ✅ CLUSTERED ROLE SELECTOR UI */}
        <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 p-2 rounded-xl">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-2">Editing Track:</span>
          <select 
            value={activeProfileId} 
            onChange={handleProfileSwitch} 
            className="border-none bg-white py-1.5 px-3 rounded-lg text-sm font-bold text-blue-700 shadow-sm outline-none cursor-pointer min-w-[200px]"
          >
            <optgroup label="Master Profile">
                {availableProfiles.filter(p => p.isMaster).map(p => (
                    <option key={p.id} value={p.id}>👑 {p.jobRole}</option>
                ))}
            </optgroup>
            <optgroup label="Targeted Roles">
                {availableProfiles.filter(p => !p.isMaster).map(p => (
                    <option key={p.id} value={p.id}>{p.jobRole}</option>
                ))}
            </optgroup>
          </select>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">

          {/* ✅ CLONE FROM MASTER BANNER */}
          {canCloneFromMaster && (
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 flex items-center justify-between gap-4 shadow-sm">
                <div>
                    <h3 className="font-bold text-blue-800 text-sm flex items-center gap-1.5"><Copy size={16}/> Sync from Master CV</h3>
                    <p className="text-xs text-blue-600 mt-1">Pull missing data from your General Profile. This safely merges data without overwriting your existing entries.</p>
                </div>
                <button onClick={handleCloneProfile} disabled={isCloning} className="shrink-0 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-colors flex items-center gap-2">
                    {isCloning ? <Loader2 className="animate-spin" size={14}/> : <Plus size={14}/>} Clone Missing Data
                </button>
            </div>
          )}

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            
            <div className="flex gap-2 mb-6 flex-wrap">
              {(["All", "Personal Info", "Experience", "Education", "Skills", "Certifications", "Languages", "Projects", "Publications", "Teaching", "Research", "Awards", "Volunteer", "Memberships", "Social Links"] as SectionName[]).map(section => (
                <button key={section} onClick={() => setActiveSection(section)} className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-colors ${activeSection === section ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"}`}>
                  {section}
                </button>
              ))}
            </div>

            {/* 1. PERSONAL INFO */}
            {showSection("Personal Info") && (
              <div ref={sectionRefs["Personal Info"]} className="mb-8 p-5 bg-slate-50/50 border border-slate-100 rounded-2xl space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100"><Briefcase className="text-blue-600" size={18}/><h3 className="font-bold text-sm text-slate-800">Personal Info</h3></div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div><label className="text-xs font-medium text-slate-500 block mb-1">Full Name</label><input type="text" value={profile.fullName || ""} onChange={e => handleFieldChange("fullName", e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-sm outline-none font-semibold focus:border-blue-500"/></div>
                  <div><label className="text-xs font-medium text-slate-500 block mb-1">Email (Read Only)</label><input type="text" value={profile.email || ""} readOnly className="w-full bg-slate-100 border border-slate-200 rounded-xl p-2.5 text-sm font-semibold text-slate-400 outline-none cursor-not-allowed"/></div>
                  <div><label className="text-xs font-medium text-slate-500 block mb-1">Phone</label><input type="text" value={profile.phone || ""} onChange={e => handleFieldChange("phone", e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-sm outline-none font-semibold focus:border-blue-500"/></div>
                  <div><label className="text-xs font-medium text-slate-500 block mb-1">Address</label><input type="text" value={profile.address || ""} onChange={e => handleFieldChange("address", e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-sm outline-none font-semibold focus:border-blue-500"/></div>
                  <div><label className="text-xs font-medium text-slate-500 block mb-1">Portfolio Link</label><input type="text" value={profile.portfolioUrl || ""} onChange={e => handleFieldChange("portfolioUrl", e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-sm outline-none font-semibold focus:border-blue-500"/></div>
                  <div><label className="text-xs font-medium text-slate-500 block mb-1">GPA</label><input type="text" value={profile.gpa || ""} onChange={e => handleFieldChange("gpa", e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-sm outline-none font-semibold focus:border-blue-500"/></div>
                  <div><label className="text-xs font-medium text-slate-500 block mb-1">Current Organization</label><input type="text" value={profile.currentOrg || ""} onChange={e => handleFieldChange("currentOrg", e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-sm outline-none font-semibold focus:border-blue-500"/></div>
                  <div><label className="text-xs font-medium text-slate-500 block mb-1">Current Position</label><input type="text" value={profile.currentPosition || ""} onChange={e => handleFieldChange("currentPosition", e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-sm outline-none font-semibold focus:border-blue-500"/></div>
                </div>
                <div><label className="text-xs font-medium text-slate-500 block mb-1">Personal Statement</label><textarea value={profile.personalStatement || ""} onChange={e => handleFieldChange("personalStatement", e.target.value)} rows={2} className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-sm outline-none font-semibold focus:border-blue-500 resize-none"/></div>
                <div><label className="text-xs font-medium text-slate-500 block mb-1">About Me</label><textarea value={profile.aboutMe || ""} onChange={e => handleFieldChange("aboutMe", e.target.value)} rows={2} className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-sm outline-none font-semibold focus:border-blue-500 resize-none"/></div>
                
                <SaveControls isDirty={isPersonalInfoDirty()} isSaving={isSaving} onSave={savePersonalInfo} onDiscard={() => setProfile((p:any) => ({...p, ...JSON.parse(JSON.stringify(initialProfile))}))} />
              </div>
            )}

            {/* 2. SKILLS */}
            {showSection("Skills") && (
              <div ref={sectionRefs["Skills"]} className="mb-8 p-5 bg-slate-50/50 border border-slate-100 rounded-2xl">
                <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-2"><Globe className="text-blue-600" size={18}/><h4 className="font-bold text-sm text-slate-800">Skills</h4></div>
                  <button onClick={() => addArrayItem("skills", { skillName: "", level: "Beginner" })} className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"><Plus size={14}/> Add Skill</button>
                </div>
                <div className="space-y-3">
                  {profile.skills?.length === 0 && <p className="text-xs text-slate-400 italic">No items added. Click '+ Add Skill' to create one.</p>}
                  {profile.skills?.map((s: any, idx: number) => (
                    <div key={s.id} className="flex gap-2 items-center bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
                      <input type="text" placeholder="Skill Name" value={s.skillName || ""} onChange={e => handleArrayChange("skills", idx, "skillName", e.target.value)} className="border-0 px-2 py-1 text-sm flex-1 outline-none font-semibold focus:text-blue-600"/>
                      <select value={s.level || "Beginner"} onChange={e => handleArrayChange("skills", idx, "level", e.target.value)} className="border-l border-slate-200 pl-2 py-1 text-sm outline-none bg-transparent text-slate-600">
                        <option>Beginner</option><option>Intermediate</option><option>Expert</option>
                      </select>
                      <button onClick={() => removeArrayItem("skills", idx)} className="text-slate-400 hover:text-red-500 px-2 border-l border-slate-200"><Trash2 size={16}/></button>
                    </div>
                  ))}
                </div>
                <SaveControls isDirty={isCollectionDirty("skills")} isSaving={isSaving} onSave={() => saveCollectionSection("skill", "skills")} onDiscard={() => setProfile((p:any) => ({...p, skills: JSON.parse(JSON.stringify(initialProfile.skills || []))}))} />
              </div>
            )}

            {/* 3. EXPERIENCE */}
            {showSection("Experience") && (
              <div ref={sectionRefs["Experience"]} className="mb-8 p-5 bg-slate-50/50 border border-slate-100 rounded-2xl">
                <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-2"><Briefcase className="text-blue-600" size={18}/><h4 className="font-bold text-sm text-slate-800">Experience</h4></div>
                  <button onClick={() => addArrayItem("experience", { companyName: "", roleDescription: "", startDate: "", endDate: "" })} className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"><Plus size={14}/> Add Experience</button>
                </div>
                <div className="space-y-4">
                  {profile.experience?.length === 0 && <p className="text-xs text-slate-400 italic">No items added. Click '+ Add Experience' to create one.</p>}
                  {profile.experience?.map((exp: any, idx: number) => (
                    <div key={exp.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative group">
                      <button onClick={() => removeArrayItem("experience", idx)} className="absolute top-4 right-4 text-slate-300 hover:text-red-500"><Trash2 size={16}/></button>
                      <div className="grid grid-cols-2 gap-3 pr-8">
                        <div><label className="text-[10px] uppercase font-bold text-slate-400">Company Name</label><input type="text" placeholder="e.g. Google" value={exp.companyName || ""} onChange={e => handleArrayChange("experience", idx, "companyName", e.target.value)} className="w-full border-b border-slate-200 py-1 text-sm outline-none font-semibold focus:border-blue-500"/></div>
                        <div><label className="text-[10px] uppercase font-bold text-slate-400">Role / Title</label><input type="text" placeholder="e.g. Engineer" value={exp.roleDescription || ""} onChange={e => handleArrayChange("experience", idx, "roleDescription", e.target.value)} className="w-full border-b border-slate-200 py-1 text-sm outline-none font-semibold focus:border-blue-500"/></div>
                        <div><label className="text-[10px] uppercase font-bold text-slate-400">Start Date</label><input type="date" value={exp.startDate || ""} onChange={e => handleArrayChange("experience", idx, "startDate", e.target.value)} className="w-full border-b border-slate-200 py-1 text-sm outline-none text-slate-600 focus:border-blue-500"/></div>
                        <div><label className="text-[10px] uppercase font-bold text-slate-400">End Date</label><input type="date" value={exp.endDate || ""} onChange={e => handleArrayChange("experience", idx, "endDate", e.target.value)} className="w-full border-b border-slate-200 py-1 text-sm outline-none text-slate-600 focus:border-blue-500"/></div>
                      </div>
                    </div>
                  ))}
                </div>
                <SaveControls isDirty={isCollectionDirty("experience")} isSaving={isSaving} onSave={() => saveCollectionSection("experience", "experience")} onDiscard={() => setProfile((p:any) => ({...p, experience: JSON.parse(JSON.stringify(initialProfile.experience || []))}))} />
              </div>
            )}

            {/* 4. EDUCATION */}
            {showSection("Education") && (
              <div ref={sectionRefs["Education"]} className="mb-8 p-5 bg-slate-50/50 border border-slate-100 rounded-2xl">
                <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-2"><GraduationCap className="text-blue-600" size={18}/><h4 className="font-bold text-sm text-slate-800">Education</h4></div>
                  <button onClick={() => addArrayItem("education", { degreeTitle: "", fieldOfStudy: "", organization: "", startDate: "", endDate: "", honors: "", thesisTitle: "" })} className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"><Plus size={14}/> Add Education</button>
                </div>
                <div className="space-y-4">
                  {profile.education?.length === 0 && <p className="text-xs text-slate-400 italic">No items added. Click '+ Add Education' to create one.</p>}
                  {profile.education?.map((edu: any, idx: number) => (
                    <div key={edu.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative">
                      <button onClick={() => removeArrayItem("education", idx)} className="absolute top-4 right-4 text-slate-300 hover:text-red-500"><Trash2 size={16}/></button>
                      <div className="grid grid-cols-2 gap-3 pr-8">
                        <div><label className="text-[10px] uppercase font-bold text-slate-400">Degree Title</label><input type="text" value={edu.degreeTitle || ""} onChange={e => handleArrayChange("education", idx, "degreeTitle", e.target.value)} className="w-full border-b border-slate-200 py-1 text-sm outline-none font-semibold focus:border-blue-500"/></div>
                        <div><label className="text-[10px] uppercase font-bold text-slate-400">University / Org</label><input type="text" value={edu.organization || ""} onChange={e => handleArrayChange("education", idx, "organization", e.target.value)} className="w-full border-b border-slate-200 py-1 text-sm outline-none font-semibold focus:border-blue-500"/></div>
                        <div><label className="text-[10px] uppercase font-bold text-slate-400">Field of Study</label><input type="text" value={edu.fieldOfStudy || ""} onChange={e => handleArrayChange("education", idx, "fieldOfStudy", e.target.value)} className="w-full border-b border-slate-200 py-1 text-sm outline-none font-semibold focus:border-blue-500"/></div>
                        <div><label className="text-[10px] uppercase font-bold text-slate-400">Honors</label><input type="text" value={edu.honors || ""} onChange={e => handleArrayChange("education", idx, "honors", e.target.value)} className="w-full border-b border-slate-200 py-1 text-sm outline-none font-semibold focus:border-blue-500"/></div>
                        <div><label className="text-[10px] uppercase font-bold text-slate-400">Start Date</label><input type="date" value={edu.startDate || ""} onChange={e => handleArrayChange("education", idx, "startDate", e.target.value)} className="w-full border-b border-slate-200 py-1 text-sm outline-none text-slate-600 focus:border-blue-500"/></div>
                        <div><label className="text-[10px] uppercase font-bold text-slate-400">End Date</label><input type="date" value={edu.endDate || ""} onChange={e => handleArrayChange("education", idx, "endDate", e.target.value)} className="w-full border-b border-slate-200 py-1 text-sm outline-none text-slate-600 focus:border-blue-500"/></div>
                        <div className="col-span-2"><label className="text-[10px] uppercase font-bold text-slate-400">Thesis Title</label><input type="text" value={edu.thesisTitle || ""} onChange={e => handleArrayChange("education", idx, "thesisTitle", e.target.value)} className="w-full border-b border-slate-200 py-1 text-sm outline-none font-semibold focus:border-blue-500"/></div>
                      </div>
                    </div>
                  ))}
                </div>
                <SaveControls isDirty={isCollectionDirty("education")} isSaving={isSaving} onSave={() => saveCollectionSection("education", "education")} onDiscard={() => setProfile((p:any) => ({...p, education: JSON.parse(JSON.stringify(initialProfile.education || []))}))} />
              </div>
            )}

            {/* 5. PROJECTS */}
            {showSection("Projects") && (
              <div ref={sectionRefs["Projects"]} className="mb-8 p-5 bg-slate-50/50 border border-slate-100 rounded-2xl">
                <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-2"><FileText className="text-blue-600" size={18}/><h4 className="font-bold text-sm text-slate-800">Projects</h4></div>
                  <button onClick={() => addArrayItem("projects", { name: "", role: "", organization: "", timePeriod: "", sourceLink: "", description: "" })} className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"><Plus size={14}/> Add Project</button>
                </div>
                <div className="space-y-4">
                  {profile.projects?.length === 0 && <p className="text-xs text-slate-400 italic">No items added. Click '+ Add Project' to create one.</p>}
                  {profile.projects?.map((proj: any, idx: number) => (
                    <div key={proj.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative">
                      <button onClick={() => removeArrayItem("projects", idx)} className="absolute top-4 right-4 text-slate-300 hover:text-red-500"><Trash2 size={16}/></button>
                      <div className="grid grid-cols-2 gap-3 pr-8">
                        <div><label className="text-[10px] uppercase font-bold text-slate-400">Project Name</label><input type="text" value={proj.name || ""} onChange={e => handleArrayChange("projects", idx, "name", e.target.value)} className="w-full border-b border-slate-200 py-1 text-sm outline-none font-semibold focus:border-blue-500"/></div>
                        <div><label className="text-[10px] uppercase font-bold text-slate-400">Role</label><input type="text" value={proj.role || ""} onChange={e => handleArrayChange("projects", idx, "role", e.target.value)} className="w-full border-b border-slate-200 py-1 text-sm outline-none font-semibold focus:border-blue-500"/></div>
                        <div><label className="text-[10px] uppercase font-bold text-slate-400">Organization</label><input type="text" value={proj.organization || ""} onChange={e => handleArrayChange("projects", idx, "organization", e.target.value)} className="w-full border-b border-slate-200 py-1 text-sm outline-none font-semibold focus:border-blue-500"/></div>
                        <div><label className="text-[10px] uppercase font-bold text-slate-400">Time Period</label><input type="text" value={proj.timePeriod || ""} onChange={e => handleArrayChange("projects", idx, "timePeriod", e.target.value)} className="w-full border-b border-slate-200 py-1 text-sm outline-none font-semibold focus:border-blue-500"/></div>
                        <div className="col-span-2"><label className="text-[10px] uppercase font-bold text-slate-400">Source Link</label><input type="url" value={proj.sourceLink || ""} onChange={e => handleArrayChange("projects", idx, "sourceLink", e.target.value)} className="w-full border-b border-slate-200 py-1 text-sm outline-none text-blue-600 focus:border-blue-500"/></div>
                        <div className="col-span-2"><label className="text-[10px] uppercase font-bold text-slate-400">Description</label><textarea value={proj.description || ""} onChange={e => handleArrayChange("projects", idx, "description", e.target.value)} className="w-full border-b border-slate-200 py-1 text-sm outline-none resize-none focus:border-blue-500" rows={2}/></div>
                      </div>
                    </div>
                  ))}
                </div>
                <SaveControls isDirty={isCollectionDirty("projects")} isSaving={isSaving} onSave={() => saveCollectionSection("project", "projects")} onDiscard={() => setProfile((p:any) => ({...p, projects: JSON.parse(JSON.stringify(initialProfile.projects || []))}))} />
              </div>
            )}

            {/* 6. CERTIFICATIONS */}
            {showSection("Certifications") && (
              <div ref={sectionRefs["Certifications"]} className="mb-8 p-5 bg-slate-50/50 border border-slate-100 rounded-2xl">
                <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-2"><Award className="text-blue-600" size={18}/><h4 className="font-bold text-sm text-slate-800">Certifications</h4></div>
                  <button onClick={() => addArrayItem("certifications", { field: "", organization: "", issueDate: "" })} className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"><Plus size={14}/> Add Cert</button>
                </div>
                <div className="space-y-3">
                  {profile.certifications?.length === 0 && <p className="text-xs text-slate-400 italic">No items added.</p>}
                  {profile.certifications?.map((cert: any, idx: number) => (
                    <div key={cert.id} className="flex gap-2 items-center bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
                      <input type="text" placeholder="Field/Title" value={cert.field || ""} onChange={e => handleArrayChange("certifications", idx, "field", e.target.value)} className="border-0 px-2 py-1 text-sm flex-1 outline-none font-semibold focus:text-blue-600"/>
                      <input type="text" placeholder="Organization" value={cert.organization || ""} onChange={e => handleArrayChange("certifications", idx, "organization", e.target.value)} className="border-l border-slate-200 px-2 py-1 text-sm flex-1 outline-none"/>
                      <input type="date" value={cert.issueDate || ""} onChange={e => handleArrayChange("certifications", idx, "issueDate", e.target.value)} className="border-l border-slate-200 px-2 py-1 text-sm outline-none text-slate-600"/>
                      <button onClick={() => removeArrayItem("certifications", idx)} className="text-slate-400 hover:text-red-500 px-2 border-l border-slate-200"><Trash2 size={16}/></button>
                    </div>
                  ))}
                </div>
                <SaveControls isDirty={isCollectionDirty("certifications")} isSaving={isSaving} onSave={() => saveCollectionSection("certification", "certifications")} onDiscard={() => setProfile((p:any) => ({...p, certifications: JSON.parse(JSON.stringify(initialProfile.certifications || []))}))} />
              </div>
            )}

            {/* 7. LANGUAGES */}
            {showSection("Languages") && (
              <div ref={sectionRefs["Languages"]} className="mb-8 p-5 bg-slate-50/50 border border-slate-100 rounded-2xl">
                <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-2"><Languages className="text-blue-600" size={18}/><h4 className="font-bold text-sm text-slate-800">Languages</h4></div>
                  <button onClick={() => addArrayItem("languages", { languageName: "", proficiency: "Beginner" })} className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"><Plus size={14}/> Add Language</button>
                </div>
                <div className="space-y-3">
                  {profile.languages?.length === 0 && <p className="text-xs text-slate-400 italic">No items added.</p>}
                  {profile.languages?.map((lang: any, idx: number) => (
                    <div key={lang.id} className="flex gap-2 items-center bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
                      <input type="text" placeholder="Language" value={lang.languageName || ""} onChange={e => handleArrayChange("languages", idx, "languageName", e.target.value)} className="border-0 px-2 py-1 text-sm flex-1 outline-none font-semibold focus:text-blue-600"/>
                      <select value={lang.proficiency || "Beginner"} onChange={e => handleArrayChange("languages", idx, "proficiency", e.target.value)} className="border-l border-slate-200 pl-2 py-1 text-sm outline-none bg-transparent text-slate-600">
                        <option>Beginner</option><option>Intermediate</option><option>Expert</option><option>Native</option>
                      </select>
                      <button onClick={() => removeArrayItem("languages", idx)} className="text-slate-400 hover:text-red-500 px-2 border-l border-slate-200"><Trash2 size={16}/></button>
                    </div>
                  ))}
                </div>
                <SaveControls isDirty={isCollectionDirty("languages")} isSaving={isSaving} onSave={() => saveCollectionSection("language", "languages")} onDiscard={() => setProfile((p:any) => ({...p, languages: JSON.parse(JSON.stringify(initialProfile.languages || []))}))} />
              </div>
            )}

            {/* 8. PUBLICATIONS */}
            {showSection("Publications") && (
              <div ref={sectionRefs["Publications"]} className="mb-8 p-5 bg-slate-50/50 border border-slate-100 rounded-2xl">
                <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-2"><BookOpen className="text-blue-600" size={18}/><h4 className="font-bold text-sm text-slate-800">Publications</h4></div>
                  <button onClick={() => addArrayItem("publications", { title: "", organization: "", year: "", sourceLink: "", description: "" })} className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"><Plus size={14}/> Add Publication</button>
                </div>
                <div className="space-y-4">
                  {profile.publications?.length === 0 && <p className="text-xs text-slate-400 italic">No items added.</p>}
                  {profile.publications?.map((pub: any, idx: number) => (
                    <div key={pub.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative">
                      <button onClick={() => removeArrayItem("publications", idx)} className="absolute top-4 right-4 text-slate-300 hover:text-red-500"><Trash2 size={16}/></button>
                      <div className="grid grid-cols-2 gap-3 pr-8">
                        <div className="col-span-2"><label className="text-[10px] uppercase font-bold text-slate-400">Title</label><input type="text" value={pub.title || ""} onChange={e => handleArrayChange("publications", idx, "title", e.target.value)} className="w-full border-b border-slate-200 py-1 text-sm outline-none font-semibold focus:border-blue-500"/></div>
                        <div><label className="text-[10px] uppercase font-bold text-slate-400">Organization / Publisher</label><input type="text" value={pub.organization || ""} onChange={e => handleArrayChange("publications", idx, "organization", e.target.value)} className="w-full border-b border-slate-200 py-1 text-sm outline-none focus:border-blue-500"/></div>
                        <div><label className="text-[10px] uppercase font-bold text-slate-400">Year</label><input type="number" value={pub.year || ""} onChange={e => handleArrayChange("publications", idx, "year", e.target.value)} className="w-full border-b border-slate-200 py-1 text-sm outline-none focus:border-blue-500"/></div>
                        <div className="col-span-2"><label className="text-[10px] uppercase font-bold text-slate-400">Link</label><input type="url" value={pub.sourceLink || ""} onChange={e => handleArrayChange("publications", idx, "sourceLink", e.target.value)} className="w-full border-b border-slate-200 py-1 text-sm outline-none text-blue-600 focus:border-blue-500"/></div>
                        <div className="col-span-2"><label className="text-[10px] uppercase font-bold text-slate-400">Description</label><textarea value={pub.description || ""} onChange={e => handleArrayChange("publications", idx, "description", e.target.value)} className="w-full border-b border-slate-200 py-1 text-sm outline-none resize-none focus:border-blue-500" rows={2}/></div>
                      </div>
                    </div>
                  ))}
                </div>
                <SaveControls isDirty={isCollectionDirty("publications")} isSaving={isSaving} onSave={() => saveCollectionSection("publication", "publications")} onDiscard={() => setProfile((p:any) => ({...p, publications: JSON.parse(JSON.stringify(initialProfile.publications || []))}))} />
              </div>
            )}

            {/* 9. TEACHING */}
            {showSection("Teaching") && (
              <div ref={sectionRefs["Teaching"]} className="mb-8 p-5 bg-slate-50/50 border border-slate-100 rounded-2xl">
                <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-2"><Users className="text-blue-600" size={18}/><h4 className="font-bold text-sm text-slate-800">Teaching Experience</h4></div>
                  <button onClick={() => addArrayItem("teachingExperience", { coursesTaught: "", organization: "", timePeriod: "", curriculumDescription: "" })} className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"><Plus size={14}/> Add Teaching</button>
                </div>
                <div className="space-y-4">
                  {profile.teachingExperience?.length === 0 && <p className="text-xs text-slate-400 italic">No items added.</p>}
                  {profile.teachingExperience?.map((teach: any, idx: number) => (
                    <div key={teach.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative">
                      <button onClick={() => removeArrayItem("teachingExperience", idx)} className="absolute top-4 right-4 text-slate-300 hover:text-red-500"><Trash2 size={16}/></button>
                      <div className="grid grid-cols-2 gap-3 pr-8">
                        <div className="col-span-2"><label className="text-[10px] uppercase font-bold text-slate-400">Courses Taught</label><input type="text" value={teach.coursesTaught || ""} onChange={e => handleArrayChange("teachingExperience", idx, "coursesTaught", e.target.value)} className="w-full border-b border-slate-200 py-1 text-sm outline-none font-semibold focus:border-blue-500"/></div>
                        <div><label className="text-[10px] uppercase font-bold text-slate-400">Organization</label><input type="text" value={teach.organization || ""} onChange={e => handleArrayChange("teachingExperience", idx, "organization", e.target.value)} className="w-full border-b border-slate-200 py-1 text-sm outline-none focus:border-blue-500"/></div>
                        <div><label className="text-[10px] uppercase font-bold text-slate-400">Time Period</label><input type="text" value={teach.timePeriod || ""} onChange={e => handleArrayChange("teachingExperience", idx, "timePeriod", e.target.value)} className="w-full border-b border-slate-200 py-1 text-sm outline-none focus:border-blue-500"/></div>
                        <div className="col-span-2"><label className="text-[10px] uppercase font-bold text-slate-400">Curriculum Description</label><textarea value={teach.curriculumDescription || ""} onChange={e => handleArrayChange("teachingExperience", idx, "curriculumDescription", e.target.value)} className="w-full border-b border-slate-200 py-1 text-sm outline-none resize-none focus:border-blue-500" rows={2}/></div>
                      </div>
                    </div>
                  ))}
                </div>
                <SaveControls isDirty={isCollectionDirty("teachingExperience")} isSaving={isSaving} onSave={() => saveCollectionSection("teaching_experience", "teachingExperience")} onDiscard={() => setProfile((p:any) => ({...p, teachingExperience: JSON.parse(JSON.stringify(initialProfile.teachingExperience || []))}))} />
              </div>
            )}

            {/* 10. RESEARCH */}
            {showSection("Research") && (
              <div ref={sectionRefs["Research"]} className="mb-8 p-5 bg-slate-50/50 border border-slate-100 rounded-2xl">
                <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-2"><BookOpen className="text-blue-600" size={18}/><h4 className="font-bold text-sm text-slate-800">Research Experience</h4></div>
                  <button onClick={() => addArrayItem("researchExperience", { projectName: "", organization: "", labOrFieldWork: "", resultsDescription: "" })} className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"><Plus size={14}/> Add Research</button>
                </div>
                <div className="space-y-4">
                  {profile.researchExperience?.length === 0 && <p className="text-xs text-slate-400 italic">No items added.</p>}
                  {profile.researchExperience?.map((res: any, idx: number) => (
                    <div key={res.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative">
                      <button onClick={() => removeArrayItem("researchExperience", idx)} className="absolute top-4 right-4 text-slate-300 hover:text-red-500"><Trash2 size={16}/></button>
                      <div className="grid grid-cols-2 gap-3 pr-8">
                        <div className="col-span-2"><label className="text-[10px] uppercase font-bold text-slate-400">Project Name</label><input type="text" value={res.projectName || ""} onChange={e => handleArrayChange("researchExperience", idx, "projectName", e.target.value)} className="w-full border-b border-slate-200 py-1 text-sm outline-none font-semibold focus:border-blue-500"/></div>
                        <div><label className="text-[10px] uppercase font-bold text-slate-400">Organization</label><input type="text" value={res.organization || ""} onChange={e => handleArrayChange("researchExperience", idx, "organization", e.target.value)} className="w-full border-b border-slate-200 py-1 text-sm outline-none focus:border-blue-500"/></div>
                        <div><label className="text-[10px] uppercase font-bold text-slate-400">Lab/Field Work</label><input type="text" value={res.labOrFieldWork || ""} onChange={e => handleArrayChange("researchExperience", idx, "labOrFieldWork", e.target.value)} className="w-full border-b border-slate-200 py-1 text-sm outline-none focus:border-blue-500"/></div>
                        <div className="col-span-2"><label className="text-[10px] uppercase font-bold text-slate-400">Results Description</label><textarea value={res.resultsDescription || ""} onChange={e => handleArrayChange("researchExperience", idx, "resultsDescription", e.target.value)} className="w-full border-b border-slate-200 py-1 text-sm outline-none resize-none focus:border-blue-500" rows={2}/></div>
                      </div>
                    </div>
                  ))}
                </div>
                <SaveControls isDirty={isCollectionDirty("researchExperience")} isSaving={isSaving} onSave={() => saveCollectionSection("research_experience", "researchExperience")} onDiscard={() => setProfile((p:any) => ({...p, researchExperience: JSON.parse(JSON.stringify(initialProfile.researchExperience || []))}))} />
              </div>
            )}

            {/* 11. AWARDS */}
            {showSection("Awards") && (
              <div ref={sectionRefs["Awards"]} className="mb-8 p-5 bg-slate-50/50 border border-slate-100 rounded-2xl">
                <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-2"><Award className="text-blue-600" size={18}/><h4 className="font-bold text-sm text-slate-800">Awards</h4></div>
                  <button onClick={() => addArrayItem("awards", { awardName: "", organization: "", description: "" })} className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"><Plus size={14}/> Add Award</button>
                </div>
                <div className="space-y-4">
                  {profile.awards?.length === 0 && <p className="text-xs text-slate-400 italic">No items added.</p>}
                  {profile.awards?.map((awd: any, idx: number) => (
                    <div key={awd.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative">
                      <button onClick={() => removeArrayItem("awards", idx)} className="absolute top-4 right-4 text-slate-300 hover:text-red-500"><Trash2 size={16}/></button>
                      <div className="grid grid-cols-2 gap-3 pr-8">
                        <div><label className="text-[10px] uppercase font-bold text-slate-400">Award Name</label><input type="text" value={awd.awardName || ""} onChange={e => handleArrayChange("awards", idx, "awardName", e.target.value)} className="w-full border-b border-slate-200 py-1 text-sm outline-none font-semibold focus:border-blue-500"/></div>
                        <div><label className="text-[10px] uppercase font-bold text-slate-400">Organization</label><input type="text" value={awd.organization || ""} onChange={e => handleArrayChange("awards", idx, "organization", e.target.value)} className="w-full border-b border-slate-200 py-1 text-sm outline-none focus:border-blue-500"/></div>
                        <div className="col-span-2"><label className="text-[10px] uppercase font-bold text-slate-400">Description</label><textarea value={awd.description || ""} onChange={e => handleArrayChange("awards", idx, "description", e.target.value)} className="w-full border-b border-slate-200 py-1 text-sm outline-none resize-none focus:border-blue-500" rows={2}/></div>
                      </div>
                    </div>
                  ))}
                </div>
                <SaveControls isDirty={isCollectionDirty("awards")} isSaving={isSaving} onSave={() => saveCollectionSection("award", "awards")} onDiscard={() => setProfile((p:any) => ({...p, awards: JSON.parse(JSON.stringify(initialProfile.awards || []))}))} />
              </div>
            )}

            {/* 12. VOLUNTEER */}
            {showSection("Volunteer") && (
              <div ref={sectionRefs["Volunteer"]} className="mb-8 p-5 bg-slate-50/50 border border-slate-100 rounded-2xl">
                <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-2"><Users className="text-blue-600" size={18}/><h4 className="font-bold text-sm text-slate-800">Volunteer Work</h4></div>
                  <button onClick={() => addArrayItem("volunteer", { role: "", organization: "", description: "" })} className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"><Plus size={14}/> Add Volunteer</button>
                </div>
                <div className="space-y-4">
                  {profile.volunteer?.length === 0 && <p className="text-xs text-slate-400 italic">No items added.</p>}
                  {profile.volunteer?.map((vol: any, idx: number) => (
                    <div key={vol.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative">
                      <button onClick={() => removeArrayItem("volunteer", idx)} className="absolute top-4 right-4 text-slate-300 hover:text-red-500"><Trash2 size={16}/></button>
                      <div className="grid grid-cols-2 gap-3 pr-8">
                        <div><label className="text-[10px] uppercase font-bold text-slate-400">Role</label><input type="text" value={vol.role || ""} onChange={e => handleArrayChange("volunteer", idx, "role", e.target.value)} className="w-full border-b border-slate-200 py-1 text-sm outline-none font-semibold focus:border-blue-500"/></div>
                        <div><label className="text-[10px] uppercase font-bold text-slate-400">Organization</label><input type="text" value={vol.organization || ""} onChange={e => handleArrayChange("volunteer", idx, "organization", e.target.value)} className="w-full border-b border-slate-200 py-1 text-sm outline-none focus:border-blue-500"/></div>
                        <div className="col-span-2"><label className="text-[10px] uppercase font-bold text-slate-400">Description</label><textarea value={vol.description || ""} onChange={e => handleArrayChange("volunteer", idx, "description", e.target.value)} className="w-full border-b border-slate-200 py-1 text-sm outline-none resize-none focus:border-blue-500" rows={2}/></div>
                      </div>
                    </div>
                  ))}
                </div>
                <SaveControls isDirty={isCollectionDirty("volunteer")} isSaving={isSaving} onSave={() => saveCollectionSection("volunteer", "volunteer")} onDiscard={() => setProfile((p:any) => ({...p, volunteer: JSON.parse(JSON.stringify(initialProfile.volunteer || []))}))} />
              </div>
            )}

            {/* 13. MEMBERSHIPS */}
            {showSection("Memberships") && (
              <div ref={sectionRefs["Memberships"]} className="mb-8 p-5 bg-slate-50/50 border border-slate-100 rounded-2xl">
                <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-2"><Users className="text-blue-600" size={18}/><h4 className="font-bold text-sm text-slate-800">Memberships</h4></div>
                  <button onClick={() => addArrayItem("memberships", { organizationName: "" })} className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"><Plus size={14}/> Add Membership</button>
                </div>
                <div className="space-y-3">
                  {profile.memberships?.length === 0 && <p className="text-xs text-slate-400 italic">No items added.</p>}
                  {profile.memberships?.map((mem: any, idx: number) => (
                    <div key={mem.id} className="flex gap-2 items-center bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
                      <input type="text" placeholder="Organization Name" value={mem.organizationName || ""} onChange={e => handleArrayChange("memberships", idx, "organizationName", e.target.value)} className="border-0 px-2 py-1 text-sm flex-1 outline-none font-semibold focus:text-blue-600"/>
                      <button onClick={() => removeArrayItem("memberships", idx)} className="text-slate-400 hover:text-red-500 px-2 border-l border-slate-200"><Trash2 size={16}/></button>
                    </div>
                  ))}
                </div>
                <SaveControls isDirty={isCollectionDirty("memberships")} isSaving={isSaving} onSave={() => saveCollectionSection("membership", "memberships")} onDiscard={() => setProfile((p:any) => ({...p, memberships: JSON.parse(JSON.stringify(initialProfile.memberships || []))}))} />
              </div>
            )}

            {/* 14. SOCIAL LINKS */}
            {showSection("Social Links") && (
              <div ref={sectionRefs["Social Links"]} className="mb-8 p-5 bg-slate-50/50 border border-slate-100 rounded-2xl">
                <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-2"><Link2 className="text-blue-600" size={18}/><h4 className="font-bold text-sm text-slate-800">Social Links</h4></div>
                  <button onClick={() => addArrayItem("socialLinks", { platformName: "LinkedIn", profileUrl: "" })} className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"><Plus size={14}/> Add Link</button>
                </div>
                <div className="space-y-3">
                  {profile.socialLinks?.length === 0 && <p className="text-xs text-slate-400 italic">No items added.</p>}
                  {profile.socialLinks?.map((soc: any, idx: number) => (
                    <div key={soc.id} className="flex gap-2 items-center bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
                      <select value={soc.platformName || "LinkedIn"} onChange={e => handleArrayChange("socialLinks", idx, "platformName", e.target.value)} className="border-0 pl-2 py-1 text-sm outline-none bg-transparent text-slate-800 font-bold">
                        <option>LinkedIn</option><option>GitHub</option><option>Twitter</option><option>Portfolio</option><option>Other</option>
                      </select>
                      <input type="url" placeholder="https://..." value={soc.profileUrl || ""} onChange={e => handleArrayChange("socialLinks", idx, "profileUrl", e.target.value)} className="border-l border-slate-200 px-2 py-1 text-sm flex-1 outline-none text-blue-600"/>
                      <button onClick={() => removeArrayItem("socialLinks", idx)} className="text-slate-400 hover:text-red-500 px-2 border-l border-slate-200"><Trash2 size={16}/></button>
                    </div>
                  ))}
                </div>
                <SaveControls isDirty={isCollectionDirty("socialLinks")} isSaving={isSaving} onSave={() => saveCollectionSection("social_link", "socialLinks")} onDiscard={() => setProfile((p:any) => ({...p, socialLinks: JSON.parse(JSON.stringify(initialProfile.socialLinks || []))}))} />
              </div>
            )}

          </div>
        </div>

        {/* RIGHT COLUMN: AI SYNC & LINKEDIN */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-2 flex items-center gap-2"><FileText size={18} className="text-blue-600"/> Parse Resume PDF</h3>
            <p className="text-xs text-slate-400 mb-4">Upload your raw document. Our AI pipeline will automatically extract structures.</p>
            <label className="flex flex-col items-center gap-3 border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-xl py-6 cursor-pointer">
              {isUploading ? (
                <div className="text-center py-2"><Loader2 className="animate-spin text-blue-600 mx-auto mb-2"/><p className="text-xs font-semibold">Processing PDF...</p></div>
              ) : (
                <><div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center"><Upload size={18} className="text-blue-600" /></div><p className="text-xs font-bold text-slate-700">Drop resume file</p></>
              )}
              <input type="file" onChange={handlePDFUpload} disabled={isUploading} className="hidden" accept=".pdf,.docx" />
            </label>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-2 flex items-center gap-2"><Link2 size={18} className="text-indigo-600"/> Synchronize LinkedIn</h3>
            <p className="text-xs text-slate-400 mb-3">Supply your public profile URL to extract missing historical records automatically.</p>
            <form onSubmit={handleLinkedInSync} className="space-y-2">
              <input type="url" required value={linkedInUrl} onChange={e => setLinkedInUrl(e.target.value)} placeholder="https://www.linkedin.com/in/username" className="w-full border rounded-xl p-2.5 text-xs outline-none"/>
              <button type="submit" disabled={isSyncingLinkedIn || !linkedInUrl} className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-100 disabled:text-slate-400 text-white font-bold py-2 rounded-xl text-xs flex justify-center gap-2">
                {isSyncingLinkedIn ? <Loader2 size={14} className="animate-spin"/> : <RefreshCw size={14}/>} Sync Workspace
              </button>
            </form>
          </div>

          <div className="bg-slate-900 text-slate-200 rounded-2xl p-4 shadow-sm">
            <p className="text-[11px] font-bold text-amber-400 uppercase mb-1">Smart Merge Engine</p>
            <p className="text-xs text-slate-400">You can fill data using these tools. The engine will ensure it <strong>only fills empty spaces</strong> and appends new arrays without wiping your entries.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
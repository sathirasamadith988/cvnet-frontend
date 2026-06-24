"use client";

import Link from "next/link";
import { useMemo, useState, useEffect, useRef } from "react";
import {
  Award, BookOpen, Briefcase, Eye, FileText, GraduationCap,
  Globe, Languages, Link2, Plus, Upload, Users, Loader2, RefreshCw,
  Trash2, CheckCircle2, Copy, Sparkles, ChevronRight, Crown,
  ChevronDown, X
} from "lucide-react";
import axios from "axios";
import { auth } from "@/lib/firebaseConfig";

// ─── Types ────────────────────────────────────────────────────────────────────

type SectionName =
  | "All" | "Personal Info" | "Experience" | "Education" | "Skills"
  | "Certifications" | "Languages" | "Projects" | "Publications"
  | "Teaching" | "Research" | "Awards" | "Volunteer" | "Memberships" | "Social Links";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const toSnakeCase = (obj: any) => {
  const out: any = {};
  for (const key in obj) {
    out[key.replace(/[A-Z]/g, l => `_${l.toLowerCase()}`)] = obj[key];
  }
  return out;
};

// ─── Shared field primitives ──────────────────────────────────────────────────

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
      {children}
    </label>
  );
}

function TextInput({ readOnly, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      readOnly={readOnly}
      {...props}
      className={`w-full px-3.5 py-2.5 text-sm border rounded-xl transition-all focus:outline-none ${readOnly
          ? "bg-slate-50 border-slate-100 text-slate-400 cursor-not-allowed"
          : "bg-white border-slate-200 text-slate-800 placeholder:text-slate-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
        } ${props.className ?? ""}`}
    />
  );
}

function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl bg-white text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all resize-none ${props.className ?? ""}`}
    />
  );
}

function SelectInput({ children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all cursor-pointer ${props.className ?? ""}`}
    >
      {children}
    </select>
  );
}

function Divider() { return <div className="h-px bg-slate-100" />; }

// ─── Section card shell ───────────────────────────────────────────────────────

function SectionCard({
  icon: Icon, title, onAdd, addLabel, children
}: {
  icon: React.ElementType; title: string; onAdd?: () => void; addLabel?: string; children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-50">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
            <Icon size={14} className="text-blue-600" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">{title}</h3>
        </div>
        {onAdd && (
          <button
            type="button" onClick={onAdd}
            className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
          >
            <Plus size={12} /> {addLabel ?? "Add"}
          </button>
        )}
      </div>
      <div className="p-4 sm:p-5 space-y-4">{children}</div>
    </div>
  );
}

// ─── Entry card (for array items) ────────────────────────────────────────────

function EntryCard({ onRemove, children }: { onRemove: () => void; children: React.ReactNode }) {
  return (
    <div className="relative bg-slate-50 rounded-xl border border-slate-100 p-4">
      <button
        type="button" onClick={onRemove}
        className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors"
      >
        <Trash2 size={13} />
      </button>
      <div className="pr-8 space-y-3">{children}</div>
    </div>
  );
}

// ─── Inline entry (for simple single-line items) ──────────────────────────────

function InlineEntry({ onRemove, children }: { onRemove: () => void; children: React.ReactNode }) {
  return (
    <div className="flex items-center bg-slate-50 border border-slate-100 rounded-xl pl-1 pr-3.5 py-1">
      <div className="flex-1 flex flex-col sm:flex-row sm:items-center min-w-0">{children}</div>
      <button type="button" onClick={onRemove}
        className="shrink-0 w-8 h-8 flex items-center justify-center rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors sm:border-l border-slate-200 ml-2">
        <Trash2 size={14} />
      </button>
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ label }: { label: string }) {
  return (
    <p className="text-xs text-slate-400 italic py-2">{label}</p>
  );
}

// ─── Save controls ────────────────────────────────────────────────────────────

function SaveControls({ isDirty, onSave, onDiscard, isSaving }: {
  isDirty: boolean; onSave: () => void; onDiscard: () => void; isSaving: boolean;
}) {
  if (!isDirty) return null;
  return (
    <>
      <Divider />
      <div className="flex gap-2 pt-1">
        <button
          type="button" onClick={onSave} disabled={isSaving}
          className="inline-flex items-center gap-1.5 text-xs font-semibold bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white px-4 py-2.5 rounded-xl transition-colors"
        >
          {isSaving ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle2 size={13} />}
          Save changes
        </button>
        <button
          type="button" onClick={onDiscard} disabled={isSaving}
          className="text-xs font-semibold text-slate-500 border border-slate-200 bg-white hover:bg-slate-50 px-4 py-2.5 rounded-xl transition-colors"
        >
          Discard
        </button>
      </div>
    </>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Skeleton() {
  return (
    <div className="animate-pulse space-y-5">
      {/* Clone banner skeleton */}
      <div className="bg-slate-200/40 rounded-2xl h-[76px]" />
      <div className="grid lg:grid-cols-3 gap-5 lg:gap-6 items-start">
        {/* Left Form Area Skeleton */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-wrap gap-1.5">
            {[1, 2, 3, 4, 5, 6, 7].map(i => (
              <div key={i} className="h-8 w-24 bg-slate-200/50 rounded-xl" />
            ))}
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 h-[600px]" />
        </div>
        {/* Right Sidebar Skeleton */}
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-slate-100 h-56" />
          <div className="bg-white rounded-2xl border border-slate-100 h-56" />
        </div>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function CVPage() {
  const [activeSection, setActiveSection] = useState<SectionName>("All");
  const [showMobileNav, setShowMobileNav] = useState(false);

  const [initialProfile, setInitialProfile] = useState<any>({});
  const [profile, setProfile] = useState<any>({});

  const [availableProfiles, setAvailableProfiles] = useState<any[]>([]);
  const [activeProfileId, setActiveProfileId] = useState("");
  const [masterProfileId, setMasterProfileId] = useState("");

  const [isLoading, setIsLoading] = useState(true);

  const [isSaving, setIsSaving] = useState(false);
  const [isCloning, setIsCloning] = useState(false);
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
    "Memberships": useRef<HTMLDivElement>(null), "Social Links": useRef<HTMLDivElement>(null),
  };

  const API_BASE = "http://localhost:5167/api/UserProfile";

  // ── Fetch ──

  const fetchCVData = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;
      const token = await user.getIdToken();
      const res = await axios.get(`${API_BASE}/full-profile?userId=${user.uid}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data) {
        setActiveProfileId(res.data.activeProfileId || "");
        setMasterProfileId(res.data.masterProfileId || "");
        setAvailableProfiles(res.data.availableProfiles || []);
        const mapped = {
          fullName: res.data.fullName || user.displayName || "",
          email: res.data.email || user.email || "",
          phone: res.data.phone || "",
          address: res.data.address || "",
          gpa: res.data.gpa?.toString() || "",
          employmentStatus: res.data.employmentStatus || "Unemployed",
          ...res.data,
        };
        setInitialProfile(JSON.parse(JSON.stringify(mapped)));
        setProfile(JSON.parse(JSON.stringify(mapped)));
      }
    } catch (err: any) {
      console.error("CV fetch error:", err.response?.data?.details || err.response?.data?.error || err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(user => {
      if (user) fetchCVData();
      else setIsLoading(false);
    });
    return () => unsub();
  }, []);

  // ── Actions ──

  const handleProfileSwitch = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newId = e.target.value;
    setActiveProfileId(newId);
    setIsLoading(true);
    try {
      const user = auth.currentUser;
      const token = await user?.getIdToken();
      await axios.post(`${API_BASE}/switch-profile`, { userId: user?.uid, profileId: newId }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchCVData();
    } catch (err) { console.error(err); }
  };

  const handleCloneProfile = async () => {
    if (!masterProfileId || !activeProfileId) return;
    setIsCloning(true);
    try {
      const token = await auth.currentUser?.getIdToken();
      await axios.post(`${API_BASE}/clone-profile`,
        { MasterProfileId: masterProfileId, TargetProfileId: activeProfileId },
        { headers: { Authorization: `Bearer ${token}` } });
      await fetchCVData();
    } catch (err) { console.error("Clone failed:", err); }
    finally { setIsCloning(false); }
  };

  const handleFieldChange = (field: string, value: string) =>
    setProfile((p: any) => ({ ...p, [field]: value }));

  const handleArrayChange = (collectionKey: string, index: number, field: string, value: string) =>
    setProfile((p: any) => {
      const arr = [...(p[collectionKey] || [])];
      arr[index] = { ...arr[index], [field]: value };
      return { ...p, [collectionKey]: arr };
    });

  const addArrayItem = (collectionKey: string, defaultItem: any) =>
    setProfile((p: any) => ({
      ...p,
      [collectionKey]: [...(p[collectionKey] || []), { id: `temp-${Date.now()}-${Math.random()}`, ...defaultItem }],
    }));

  const removeArrayItem = (collectionKey: string, index: number) =>
    setProfile((p: any) => {
      const arr = [...(p[collectionKey] || [])];
      arr.splice(index, 1);
      return { ...p, [collectionKey]: arr };
    });

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
          promises.push(axios.put(`${API_BASE}/profile-update`,
            { userId: user.uid, profileId: activeProfileId, field: f, value: profile[f] },
            { headers: { Authorization: `Bearer ${token}` } }));
        }
      }
      await Promise.all(promises);
      await fetchCVData();
    } catch (err) { console.error(err); }
    finally { setIsSaving(false); }
  };

  const isCollectionDirty = (collectionKey: string) =>
    JSON.stringify(initialProfile[collectionKey] || []) !== JSON.stringify(profile[collectionKey] || []);

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
        const { id: _oi, ...origRest } = orig;
        const { id: _ci, ...currRest } = curr;
        if (JSON.stringify(origRest) !== JSON.stringify(currRest)) { toDeleteIds.push(orig.id); toAdd.push(curr); }
      }
    }
    for (const curr of currItems) { if (String(curr.id).startsWith("temp-")) toAdd.push(curr); }
    try {
      const token = await auth.currentUser?.getIdToken();
      for (const id of toDeleteIds) {
        await axios.delete(`${API_BASE}/collection/${tableName}/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      }
      for (const item of toAdd) {
        const { id, profileId, profile_id, created_at, updated_at, ...rest } = item;
        await axios.post(`${API_BASE}/collection/${tableName}`,
          { profileId: activeProfileId, ...toSnakeCase(rest) },
          { headers: { Authorization: `Bearer ${token}` } });
      }
      await fetchCVData();
    } catch (err: any) {
      console.error(err);
      if (err.response?.data) alert(err.response.data);
    } finally { setIsSaving(false); }
  };

  const handlePDFUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    const fd = new FormData(); fd.append("file", file);
    try {
      const user = auth.currentUser;
      const token = await user?.getIdToken();
      const uploadRes = await axios.post("http://localhost:5167/api/CV/upload-cloudinary", fd, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await axios.post("http://localhost:8000/process-pdf", { userId: user?.uid, cvUrl: uploadRes.data.url });
      await fetchCVData();
    } catch (err) { console.error(err); }
    finally { setIsUploading(false); }
  };

  const handleLinkedInSync = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkedInUrl.trim()) return;
    setIsSyncingLinkedIn(true);
    try {
      const user = auth.currentUser;
      const fd = new FormData();
      fd.append("user_id", user?.uid || "");
      fd.append("profile_url", linkedInUrl);
      await axios.post("http://localhost:8000/sync-linkedin", fd, { headers: { "Content-Type": "multipart/form-data" } });
      await fetchCVData();
      setLinkedInUrl("");
    } catch (err) { console.error(err); }
    finally { setIsSyncingLinkedIn(false); }
  };

  const showSection = (s: SectionName) => activeSection === "All" || activeSection === s;
  const canCloneFromMaster = activeProfileId !== masterProfileId;

  const ALL_SECTIONS: SectionName[] = [
    "All", "Personal Info", "Experience", "Education", "Skills",
    "Certifications", "Languages", "Projects", "Publications",
    "Teaching", "Research", "Awards", "Volunteer", "Memberships", "Social Links",
  ];

  const activeSectionLabel = activeSection === "All" ? "All sections" : activeSection;

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── Top bar ── */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-sm font-semibold text-slate-900 hidden sm:block">CVNet</span>
            <ChevronRight size={14} className="text-slate-300 hidden sm:block" />
            <span className="text-sm font-semibold text-slate-400 hidden sm:block">CV Workspace</span>
          </div>

          {/* Track selector — top bar */}
          <div className="flex items-center gap-2 flex-1 max-w-xs">
            <select
              value={activeProfileId}
              onChange={handleProfileSwitch}
              className="flex-1 px-3 py-2 text-xs font-semibold border border-slate-200 rounded-xl bg-white text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
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
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-5 sm:py-8">

        {/* ── Page heading ── */}
        <div className="mb-5">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">CV Workspace</h1>
          <p className="text-sm text-slate-500 mt-0.5">Edit your master CV or customize a targeted role track.</p>
        </div>

        {isLoading ? <Skeleton /> : (
          <>
            {/* ── Clone from master banner ── */}
            {canCloneFromMaster && (
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
              <Copy size={15} className="text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-blue-800">Sync from master CV</p>
              <p className="text-xs text-blue-600 mt-0.5 leading-relaxed">
                Pull missing data from your General Profile. Safely merges without overwriting existing entries.
              </p>
            </div>
            <button
              type="button" onClick={handleCloneProfile} disabled={isCloning}
              className="shrink-0 w-full sm:w-auto inline-flex items-center justify-center gap-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white px-4 py-2.5 rounded-xl transition-colors"
            >
              {isCloning ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />}
              Clone missing data
            </button>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-5 lg:gap-6 items-start">

          {/* ── Left: Form area ── */}
          <div className="lg:col-span-2 space-y-4">

            {/* Section nav — mobile dropdown */}
            <div className="lg:hidden">
              <button
                type="button"
                onClick={() => setShowMobileNav(v => !v)}
                className="w-full flex items-center justify-between px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700"
              >
                <span>{activeSectionLabel}</span>
                <ChevronDown size={15} className={`text-slate-400 transition-transform ${showMobileNav ? "rotate-180" : ""}`} />
              </button>
              {showMobileNav && (
                <div className="mt-1 bg-white border border-slate-100 rounded-2xl p-2 shadow-lg grid grid-cols-2 gap-1">
                  {ALL_SECTIONS.map(s => (
                    <button
                      key={s} type="button"
                      onClick={() => { setActiveSection(s); setShowMobileNav(false); }}
                      className={`px-3 py-2.5 text-xs font-semibold rounded-xl text-left transition-colors ${activeSection === s ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-50"
                        }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Section nav — desktop scrollable pills */}
            <div className="hidden lg:flex flex-wrap gap-1.5">
              {ALL_SECTIONS.map(s => (
                <button
                  key={s} type="button" onClick={() => setActiveSection(s)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all ${activeSection === s
                      ? "bg-slate-900 text-white border-slate-900"
                      : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:text-slate-800"
                    }`}
                >
                  {s}
                </button>
              ))}
            </div>

            {/* ── 1. Personal Info ── */}
            {showSection("Personal Info") && (
              <div ref={sectionRefs["Personal Info"]}>
                <SectionCard icon={Briefcase} title="Personal info">
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div><FieldLabel>Full name</FieldLabel><TextInput value={profile.fullName || ""} onChange={e => handleFieldChange("fullName", e.target.value)} placeholder="Your full name" /></div>
                    <div><FieldLabel>Email (read only)</FieldLabel><TextInput value={profile.email || ""} readOnly /></div>
                    <div><FieldLabel>Phone</FieldLabel><TextInput value={profile.phone || ""} onChange={e => handleFieldChange("phone", e.target.value)} placeholder="+1 555 000 0000" /></div>
                    <div><FieldLabel>Address</FieldLabel><TextInput value={profile.address || ""} onChange={e => handleFieldChange("address", e.target.value)} placeholder="City, Country" /></div>
                    <div><FieldLabel>Portfolio URL</FieldLabel><TextInput value={profile.portfolioUrl || ""} onChange={e => handleFieldChange("portfolioUrl", e.target.value)} placeholder="https://yoursite.com" /></div>
                    <div><FieldLabel>GPA</FieldLabel><TextInput value={profile.gpa || ""} onChange={e => handleFieldChange("gpa", e.target.value)} placeholder="3.8" /></div>
                    <div><FieldLabel>Current organisation</FieldLabel><TextInput value={profile.currentOrg || ""} onChange={e => handleFieldChange("currentOrg", e.target.value)} placeholder="Company name" /></div>
                    <div><FieldLabel>Current position</FieldLabel><TextInput value={profile.currentPosition || ""} onChange={e => handleFieldChange("currentPosition", e.target.value)} placeholder="Job title" /></div>
                  </div>
                  <div><FieldLabel>Personal statement</FieldLabel><TextArea value={profile.personalStatement || ""} onChange={e => handleFieldChange("personalStatement", e.target.value)} rows={3} placeholder="A brief professional statement…" /></div>
                  <div><FieldLabel>About me</FieldLabel><TextArea value={profile.aboutMe || ""} onChange={e => handleFieldChange("aboutMe", e.target.value)} rows={3} placeholder="A short bio…" /></div>
                  <SaveControls isDirty={isPersonalInfoDirty()} isSaving={isSaving} onSave={savePersonalInfo} onDiscard={() => setProfile((p: any) => ({ ...p, ...JSON.parse(JSON.stringify(initialProfile)) }))} />
                </SectionCard>
              </div>
            )}

            {/* ── 2. Skills ── */}
            {showSection("Skills") && (
              <div ref={sectionRefs["Skills"]}>
                <SectionCard icon={Globe} title="Skills" onAdd={() => addArrayItem("skills", { skillName: "", level: "Beginner" })} addLabel="Add skill">
                  {(!profile.skills?.length) ? <EmptyState label="No skills added yet. Click 'Add skill' to begin." /> : (
                    <div className="space-y-2">
                      {profile.skills.map((s: any, idx: number) => (
                        <InlineEntry key={s.id} onRemove={() => removeArrayItem("skills", idx)}>
                          <TextInput value={s.skillName || ""} onChange={e => handleArrayChange("skills", idx, "skillName", e.target.value)} placeholder="Skill name" className="w-full border-0 p-0 focus:ring-0 bg-transparent font-semibold" />
                          <SelectInput value={s.level || "Beginner"} onChange={e => handleArrayChange("skills", idx, "level", e.target.value)} className="border-0 border-l border-slate-200 rounded-none bg-transparent text-slate-500 w-32 focus:ring-0">
                            <option>Beginner</option><option>Intermediate</option><option>Expert</option>
                          </SelectInput>
                        </InlineEntry>
                      ))}
                    </div>
                  )}
                  <SaveControls isDirty={isCollectionDirty("skills")} isSaving={isSaving} onSave={() => saveCollectionSection("skill", "skills")} onDiscard={() => setProfile((p: any) => ({ ...p, skills: JSON.parse(JSON.stringify(initialProfile.skills || [])) }))} />
                </SectionCard>
              </div>
            )}

            {/* ── 3. Experience ── */}
            {showSection("Experience") && (
              <div ref={sectionRefs["Experience"]}>
                <SectionCard icon={Briefcase} title="Experience" onAdd={() => addArrayItem("experience", { companyName: "", roleDescription: "", startDate: "", endDate: "" })} addLabel="Add experience">
                  {(!profile.experience?.length) ? <EmptyState label="No experience added yet." /> : (
                    <div className="space-y-3">
                      {profile.experience.map((exp: any, idx: number) => (
                        <EntryCard key={exp.id} onRemove={() => removeArrayItem("experience", idx)}>
                          <div className="grid sm:grid-cols-2 gap-3">
                            <div><FieldLabel>Company name</FieldLabel><TextInput value={exp.companyName || ""} onChange={e => handleArrayChange("experience", idx, "companyName", e.target.value)} placeholder="e.g. Google" /></div>
                            <div><FieldLabel>Role / title</FieldLabel><TextInput value={exp.roleDescription || ""} onChange={e => handleArrayChange("experience", idx, "roleDescription", e.target.value)} placeholder="e.g. Engineer" /></div>
                            <div><FieldLabel>Start date</FieldLabel><TextInput type="date" value={exp.startDate || ""} onChange={e => handleArrayChange("experience", idx, "startDate", e.target.value)} /></div>
                            <div><FieldLabel>End date</FieldLabel><TextInput type="date" value={exp.endDate || ""} onChange={e => handleArrayChange("experience", idx, "endDate", e.target.value)} /></div>
                          </div>
                        </EntryCard>
                      ))}
                    </div>
                  )}
                  <SaveControls isDirty={isCollectionDirty("experience")} isSaving={isSaving} onSave={() => saveCollectionSection("experience", "experience")} onDiscard={() => setProfile((p: any) => ({ ...p, experience: JSON.parse(JSON.stringify(initialProfile.experience || [])) }))} />
                </SectionCard>
              </div>
            )}

            {/* ── 4. Education ── */}
            {showSection("Education") && (
              <div ref={sectionRefs["Education"]}>
                <SectionCard icon={GraduationCap} title="Education" onAdd={() => addArrayItem("education", { degreeTitle: "", fieldOfStudy: "", organization: "", startDate: "", endDate: "", honors: "", thesisTitle: "" })} addLabel="Add education">
                  {(!profile.education?.length) ? <EmptyState label="No education entries yet." /> : (
                    <div className="space-y-3">
                      {profile.education.map((edu: any, idx: number) => (
                        <EntryCard key={edu.id} onRemove={() => removeArrayItem("education", idx)}>
                          <div className="grid sm:grid-cols-2 gap-3">
                            <div><FieldLabel>Degree title</FieldLabel><TextInput value={edu.degreeTitle || ""} onChange={e => handleArrayChange("education", idx, "degreeTitle", e.target.value)} placeholder="BSc Hons" /></div>
                            <div><FieldLabel>University / org</FieldLabel><TextInput value={edu.organization || ""} onChange={e => handleArrayChange("education", idx, "organization", e.target.value)} placeholder="MIT" /></div>
                            <div><FieldLabel>Field of study</FieldLabel><TextInput value={edu.fieldOfStudy || ""} onChange={e => handleArrayChange("education", idx, "fieldOfStudy", e.target.value)} placeholder="Computer Science" /></div>
                            <div><FieldLabel>Honors</FieldLabel><TextInput value={edu.honors || ""} onChange={e => handleArrayChange("education", idx, "honors", e.target.value)} placeholder="First Class" /></div>
                            <div><FieldLabel>Start date</FieldLabel><TextInput type="date" value={edu.startDate || ""} onChange={e => handleArrayChange("education", idx, "startDate", e.target.value)} /></div>
                            <div><FieldLabel>End date</FieldLabel><TextInput type="date" value={edu.endDate || ""} onChange={e => handleArrayChange("education", idx, "endDate", e.target.value)} /></div>
                            <div className="sm:col-span-2"><FieldLabel>Thesis title</FieldLabel><TextInput value={edu.thesisTitle || ""} onChange={e => handleArrayChange("education", idx, "thesisTitle", e.target.value)} placeholder="Thesis title (optional)" /></div>
                          </div>
                        </EntryCard>
                      ))}
                    </div>
                  )}
                  <SaveControls isDirty={isCollectionDirty("education")} isSaving={isSaving} onSave={() => saveCollectionSection("education", "education")} onDiscard={() => setProfile((p: any) => ({ ...p, education: JSON.parse(JSON.stringify(initialProfile.education || [])) }))} />
                </SectionCard>
              </div>
            )}

            {/* ── 5. Projects ── */}
            {showSection("Projects") && (
              <div ref={sectionRefs["Projects"]}>
                <SectionCard icon={FileText} title="Projects" onAdd={() => addArrayItem("projects", { name: "", role: "", organization: "", timePeriod: "", sourceLink: "", description: "" })} addLabel="Add project">
                  {(!profile.projects?.length) ? <EmptyState label="No projects added yet." /> : (
                    <div className="space-y-3">
                      {profile.projects.map((proj: any, idx: number) => (
                        <EntryCard key={proj.id} onRemove={() => removeArrayItem("projects", idx)}>
                          <div className="grid sm:grid-cols-2 gap-3">
                            <div><FieldLabel>Project name</FieldLabel><TextInput value={proj.name || ""} onChange={e => handleArrayChange("projects", idx, "name", e.target.value)} placeholder="Project name" /></div>
                            <div><FieldLabel>Role</FieldLabel><TextInput value={proj.role || ""} onChange={e => handleArrayChange("projects", idx, "role", e.target.value)} placeholder="Lead developer" /></div>
                            <div><FieldLabel>Organisation</FieldLabel><TextInput value={proj.organization || ""} onChange={e => handleArrayChange("projects", idx, "organization", e.target.value)} placeholder="Company / university" /></div>
                            <div><FieldLabel>Time period</FieldLabel><TextInput value={proj.timePeriod || ""} onChange={e => handleArrayChange("projects", idx, "timePeriod", e.target.value)} placeholder="Jan 2023 – Mar 2023" /></div>
                            <div className="sm:col-span-2"><FieldLabel>Source link</FieldLabel><TextInput type="url" value={proj.sourceLink || ""} onChange={e => handleArrayChange("projects", idx, "sourceLink", e.target.value)} placeholder="https://github.com/…" /></div>
                            <div className="sm:col-span-2"><FieldLabel>Description</FieldLabel><TextArea value={proj.description || ""} onChange={e => handleArrayChange("projects", idx, "description", e.target.value)} rows={2} placeholder="What the project does…" /></div>
                          </div>
                        </EntryCard>
                      ))}
                    </div>
                  )}
                  <SaveControls isDirty={isCollectionDirty("projects")} isSaving={isSaving} onSave={() => saveCollectionSection("project", "projects")} onDiscard={() => setProfile((p: any) => ({ ...p, projects: JSON.parse(JSON.stringify(initialProfile.projects || [])) }))} />
                </SectionCard>
              </div>
            )}

            {/* ── 6. Certifications ── */}
            {showSection("Certifications") && (
              <div ref={sectionRefs["Certifications"]}>
                <SectionCard icon={Award} title="Certifications" onAdd={() => addArrayItem("certifications", { field: "", organization: "", issueDate: "" })} addLabel="Add cert">
                  {(!profile.certifications?.length) ? <EmptyState label="No certifications added yet." /> : (
                    <div className="space-y-2">
                      {profile.certifications.map((cert: any, idx: number) => (
                        <InlineEntry key={cert.id} onRemove={() => removeArrayItem("certifications", idx)}>
                          <TextInput value={cert.field || ""} onChange={e => handleArrayChange("certifications", idx, "field", e.target.value)} placeholder="Certification title" className="flex-1 border-0 p-0 focus:ring-0 bg-transparent font-semibold text-xs" />
                          <TextInput value={cert.organization || ""} onChange={e => handleArrayChange("certifications", idx, "organization", e.target.value)} placeholder="Issuer" className="w-28 border-0 border-l border-slate-200 pl-2 focus:ring-0 bg-transparent text-xs" />
                          <TextInput type="date" value={cert.issueDate || ""} onChange={e => handleArrayChange("certifications", idx, "issueDate", e.target.value)} className="w-32 border-0 border-l border-slate-200 pl-2 focus:ring-0 bg-transparent text-xs" />
                        </InlineEntry>
                      ))}
                    </div>
                  )}
                  <SaveControls isDirty={isCollectionDirty("certifications")} isSaving={isSaving} onSave={() => saveCollectionSection("certification", "certifications")} onDiscard={() => setProfile((p: any) => ({ ...p, certifications: JSON.parse(JSON.stringify(initialProfile.certifications || [])) }))} />
                </SectionCard>
              </div>
            )}

            {/* ── 7. Languages ── */}
            {showSection("Languages") && (
              <div ref={sectionRefs["Languages"]}>
                <SectionCard icon={Languages} title="Languages" onAdd={() => addArrayItem("languages", { languageName: "", proficiency: "Beginner" })} addLabel="Add language">
                  {(!profile.languages?.length) ? <EmptyState label="No languages added yet." /> : (
                    <div className="space-y-2">
                      {profile.languages.map((lang: any, idx: number) => (
                        <InlineEntry key={lang.id} onRemove={() => removeArrayItem("languages", idx)}>
                          <TextInput value={lang.languageName || ""} onChange={e => handleArrayChange("languages", idx, "languageName", e.target.value)} placeholder="Language" className="flex-1 border-0 p-0 focus:ring-0 bg-transparent font-semibold" />
                          <SelectInput value={lang.proficiency || "Beginner"} onChange={e => handleArrayChange("languages", idx, "proficiency", e.target.value)} className="border-0 border-l border-slate-200 rounded-none bg-transparent text-slate-500 w-32 focus:ring-0">
                            <option>Beginner</option><option>Intermediate</option><option>Expert</option><option>Native</option>
                          </SelectInput>
                        </InlineEntry>
                      ))}
                    </div>
                  )}
                  <SaveControls isDirty={isCollectionDirty("languages")} isSaving={isSaving} onSave={() => saveCollectionSection("language", "languages")} onDiscard={() => setProfile((p: any) => ({ ...p, languages: JSON.parse(JSON.stringify(initialProfile.languages || [])) }))} />
                </SectionCard>
              </div>
            )}

            {/* ── 8. Publications ── */}
            {showSection("Publications") && (
              <div ref={sectionRefs["Publications"]}>
                <SectionCard icon={BookOpen} title="Publications" onAdd={() => addArrayItem("publications", { title: "", organization: "", year: "", sourceLink: "", description: "" })} addLabel="Add publication">
                  {(!profile.publications?.length) ? <EmptyState label="No publications added yet." /> : (
                    <div className="space-y-3">
                      {profile.publications.map((pub: any, idx: number) => (
                        <EntryCard key={pub.id} onRemove={() => removeArrayItem("publications", idx)}>
                          <div className="grid sm:grid-cols-2 gap-3">
                            <div className="sm:col-span-2"><FieldLabel>Title</FieldLabel><TextInput value={pub.title || ""} onChange={e => handleArrayChange("publications", idx, "title", e.target.value)} placeholder="Publication title" /></div>
                            <div><FieldLabel>Publisher / org</FieldLabel><TextInput value={pub.organization || ""} onChange={e => handleArrayChange("publications", idx, "organization", e.target.value)} placeholder="Publisher name" /></div>
                            <div><FieldLabel>Year</FieldLabel><TextInput type="number" value={pub.year || ""} onChange={e => handleArrayChange("publications", idx, "year", e.target.value)} placeholder="2023" /></div>
                            <div className="sm:col-span-2"><FieldLabel>Link</FieldLabel><TextInput type="url" value={pub.sourceLink || ""} onChange={e => handleArrayChange("publications", idx, "sourceLink", e.target.value)} placeholder="https://doi.org/…" /></div>
                            <div className="sm:col-span-2"><FieldLabel>Description</FieldLabel><TextArea value={pub.description || ""} onChange={e => handleArrayChange("publications", idx, "description", e.target.value)} rows={2} placeholder="Abstract or summary…" /></div>
                          </div>
                        </EntryCard>
                      ))}
                    </div>
                  )}
                  <SaveControls isDirty={isCollectionDirty("publications")} isSaving={isSaving} onSave={() => saveCollectionSection("publication", "publications")} onDiscard={() => setProfile((p: any) => ({ ...p, publications: JSON.parse(JSON.stringify(initialProfile.publications || [])) }))} />
                </SectionCard>
              </div>
            )}

            {/* ── 9. Teaching ── */}
            {showSection("Teaching") && (
              <div ref={sectionRefs["Teaching"]}>
                <SectionCard icon={Users} title="Teaching experience" onAdd={() => addArrayItem("teachingExperience", { coursesTaught: "", organization: "", timePeriod: "", curriculumDescription: "" })} addLabel="Add teaching">
                  {(!profile.teachingExperience?.length) ? <EmptyState label="No teaching experience added yet." /> : (
                    <div className="space-y-3">
                      {profile.teachingExperience.map((teach: any, idx: number) => (
                        <EntryCard key={teach.id} onRemove={() => removeArrayItem("teachingExperience", idx)}>
                          <div className="grid sm:grid-cols-2 gap-3">
                            <div className="sm:col-span-2"><FieldLabel>Courses taught</FieldLabel><TextInput value={teach.coursesTaught || ""} onChange={e => handleArrayChange("teachingExperience", idx, "coursesTaught", e.target.value)} placeholder="e.g. Algorithms, Data Structures" /></div>
                            <div><FieldLabel>Organisation</FieldLabel><TextInput value={teach.organization || ""} onChange={e => handleArrayChange("teachingExperience", idx, "organization", e.target.value)} placeholder="University / institute" /></div>
                            <div><FieldLabel>Time period</FieldLabel><TextInput value={teach.timePeriod || ""} onChange={e => handleArrayChange("teachingExperience", idx, "timePeriod", e.target.value)} placeholder="Sep 2022 – Dec 2022" /></div>
                            <div className="sm:col-span-2"><FieldLabel>Curriculum description</FieldLabel><TextArea value={teach.curriculumDescription || ""} onChange={e => handleArrayChange("teachingExperience", idx, "curriculumDescription", e.target.value)} rows={2} placeholder="What you taught and how…" /></div>
                          </div>
                        </EntryCard>
                      ))}
                    </div>
                  )}
                  <SaveControls isDirty={isCollectionDirty("teachingExperience")} isSaving={isSaving} onSave={() => saveCollectionSection("teaching_experience", "teachingExperience")} onDiscard={() => setProfile((p: any) => ({ ...p, teachingExperience: JSON.parse(JSON.stringify(initialProfile.teachingExperience || [])) }))} />
                </SectionCard>
              </div>
            )}

            {/* ── 10. Research ── */}
            {showSection("Research") && (
              <div ref={sectionRefs["Research"]}>
                <SectionCard icon={BookOpen} title="Research experience" onAdd={() => addArrayItem("researchExperience", { projectName: "", organization: "", labOrFieldWork: "", resultsDescription: "" })} addLabel="Add research">
                  {(!profile.researchExperience?.length) ? <EmptyState label="No research experience added yet." /> : (
                    <div className="space-y-3">
                      {profile.researchExperience.map((res: any, idx: number) => (
                        <EntryCard key={res.id} onRemove={() => removeArrayItem("researchExperience", idx)}>
                          <div className="grid sm:grid-cols-2 gap-3">
                            <div className="sm:col-span-2"><FieldLabel>Project name</FieldLabel><TextInput value={res.projectName || ""} onChange={e => handleArrayChange("researchExperience", idx, "projectName", e.target.value)} placeholder="Research project title" /></div>
                            <div><FieldLabel>Organisation</FieldLabel><TextInput value={res.organization || ""} onChange={e => handleArrayChange("researchExperience", idx, "organization", e.target.value)} placeholder="Lab / university" /></div>
                            <div><FieldLabel>Lab / field work</FieldLabel><TextInput value={res.labOrFieldWork || ""} onChange={e => handleArrayChange("researchExperience", idx, "labOrFieldWork", e.target.value)} placeholder="Methodology" /></div>
                            <div className="sm:col-span-2"><FieldLabel>Results description</FieldLabel><TextArea value={res.resultsDescription || ""} onChange={e => handleArrayChange("researchExperience", idx, "resultsDescription", e.target.value)} rows={2} placeholder="Key findings and outcomes…" /></div>
                          </div>
                        </EntryCard>
                      ))}
                    </div>
                  )}
                  <SaveControls isDirty={isCollectionDirty("researchExperience")} isSaving={isSaving} onSave={() => saveCollectionSection("research_experience", "researchExperience")} onDiscard={() => setProfile((p: any) => ({ ...p, researchExperience: JSON.parse(JSON.stringify(initialProfile.researchExperience || [])) }))} />
                </SectionCard>
              </div>
            )}

            {/* ── 11. Awards ── */}
            {showSection("Awards") && (
              <div ref={sectionRefs["Awards"]}>
                <SectionCard icon={Award} title="Awards" onAdd={() => addArrayItem("awards", { awardName: "", organization: "", description: "" })} addLabel="Add award">
                  {(!profile.awards?.length) ? <EmptyState label="No awards added yet." /> : (
                    <div className="space-y-3">
                      {profile.awards.map((awd: any, idx: number) => (
                        <EntryCard key={awd.id} onRemove={() => removeArrayItem("awards", idx)}>
                          <div className="grid sm:grid-cols-2 gap-3">
                            <div><FieldLabel>Award name</FieldLabel><TextInput value={awd.awardName || ""} onChange={e => handleArrayChange("awards", idx, "awardName", e.target.value)} placeholder="Award title" /></div>
                            <div><FieldLabel>Organisation</FieldLabel><TextInput value={awd.organization || ""} onChange={e => handleArrayChange("awards", idx, "organization", e.target.value)} placeholder="Awarding body" /></div>
                            <div className="sm:col-span-2"><FieldLabel>Description</FieldLabel><TextArea value={awd.description || ""} onChange={e => handleArrayChange("awards", idx, "description", e.target.value)} rows={2} placeholder="Context and significance…" /></div>
                          </div>
                        </EntryCard>
                      ))}
                    </div>
                  )}
                  <SaveControls isDirty={isCollectionDirty("awards")} isSaving={isSaving} onSave={() => saveCollectionSection("award", "awards")} onDiscard={() => setProfile((p: any) => ({ ...p, awards: JSON.parse(JSON.stringify(initialProfile.awards || [])) }))} />
                </SectionCard>
              </div>
            )}

            {/* ── 12. Volunteer ── */}
            {showSection("Volunteer") && (
              <div ref={sectionRefs["Volunteer"]}>
                <SectionCard icon={Users} title="Volunteer work" onAdd={() => addArrayItem("volunteer", { role: "", organization: "", description: "" })} addLabel="Add volunteer">
                  {(!profile.volunteer?.length) ? <EmptyState label="No volunteer entries added yet." /> : (
                    <div className="space-y-3">
                      {profile.volunteer.map((vol: any, idx: number) => (
                        <EntryCard key={vol.id} onRemove={() => removeArrayItem("volunteer", idx)}>
                          <div className="grid sm:grid-cols-2 gap-3">
                            <div><FieldLabel>Role</FieldLabel><TextInput value={vol.role || ""} onChange={e => handleArrayChange("volunteer", idx, "role", e.target.value)} placeholder="Volunteer role" /></div>
                            <div><FieldLabel>Organisation</FieldLabel><TextInput value={vol.organization || ""} onChange={e => handleArrayChange("volunteer", idx, "organization", e.target.value)} placeholder="Organisation name" /></div>
                            <div className="sm:col-span-2"><FieldLabel>Description</FieldLabel><TextArea value={vol.description || ""} onChange={e => handleArrayChange("volunteer", idx, "description", e.target.value)} rows={2} placeholder="What you did…" /></div>
                          </div>
                        </EntryCard>
                      ))}
                    </div>
                  )}
                  <SaveControls isDirty={isCollectionDirty("volunteer")} isSaving={isSaving} onSave={() => saveCollectionSection("volunteer", "volunteer")} onDiscard={() => setProfile((p: any) => ({ ...p, volunteer: JSON.parse(JSON.stringify(initialProfile.volunteer || [])) }))} />
                </SectionCard>
              </div>
            )}

            {/* ── 13. Memberships ── */}
            {showSection("Memberships") && (
              <div ref={sectionRefs["Memberships"]}>
                <SectionCard icon={Users} title="Memberships" onAdd={() => addArrayItem("memberships", { organizationName: "" })} addLabel="Add membership">
                  {(!profile.memberships?.length) ? <EmptyState label="No memberships added yet." /> : (
                    <div className="space-y-2">
                      {profile.memberships.map((mem: any, idx: number) => (
                        <InlineEntry key={mem.id} onRemove={() => removeArrayItem("memberships", idx)}>
                          <TextInput value={mem.organizationName || ""} onChange={e => handleArrayChange("memberships", idx, "organizationName", e.target.value)} placeholder="Organisation name" className="flex-1 border-0 p-0 focus:ring-0 bg-transparent font-semibold" />
                        </InlineEntry>
                      ))}
                    </div>
                  )}
                  <SaveControls isDirty={isCollectionDirty("memberships")} isSaving={isSaving} onSave={() => saveCollectionSection("membership", "memberships")} onDiscard={() => setProfile((p: any) => ({ ...p, memberships: JSON.parse(JSON.stringify(initialProfile.memberships || [])) }))} />
                </SectionCard>
              </div>
            )}

            {/* ── 14. Social Links ── */}
            {showSection("Social Links") && (
              <div ref={sectionRefs["Social Links"]}>
                <SectionCard icon={Link2} title="Social links" onAdd={() => addArrayItem("socialLinks", { platformName: "LinkedIn", profileUrl: "" })} addLabel="Add link">
                  {(!profile.socialLinks?.length) ? <EmptyState label="No social links added yet." /> : (
                    <div className="space-y-2">
                      {profile.socialLinks.map((soc: any, idx: number) => (
                        <InlineEntry key={soc.id} onRemove={() => removeArrayItem("socialLinks", idx)}>
                          <SelectInput value={soc.platformName || "LinkedIn"} onChange={e => handleArrayChange("socialLinks", idx, "platformName", e.target.value)} className="border-0 bg-transparent w-28 text-xs font-bold focus:ring-0 p-0 text-slate-700">
                            <option>LinkedIn</option><option>GitHub</option><option>Twitter</option><option>Portfolio</option><option>Other</option>
                          </SelectInput>
                          <TextInput type="url" value={soc.profileUrl || ""} onChange={e => handleArrayChange("socialLinks", idx, "profileUrl", e.target.value)} placeholder="https://…" className="flex-1 border-0 border-l border-slate-200 pl-3 focus:ring-0 bg-transparent text-blue-600 text-xs" />
                        </InlineEntry>
                      ))}
                    </div>
                  )}
                  <SaveControls isDirty={isCollectionDirty("socialLinks")} isSaving={isSaving} onSave={() => saveCollectionSection("social_link", "socialLinks")} onDiscard={() => setProfile((p: any) => ({ ...p, socialLinks: JSON.parse(JSON.stringify(initialProfile.socialLinks || [])) }))} />
                </SectionCard>
              </div>
            )}

          </div>

          {/* ── Right: Tools sidebar ── */}
          <div className="space-y-4">

            {/* PDF upload */}
            <div className="bg-white rounded-2xl border border-slate-100 p-5 space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
                  <FileText size={14} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">Parse resume PDF</p>
                  <p className="text-xs text-slate-400 mt-0.5">AI extracts structured data automatically.</p>
                </div>
              </div>

              <label className="flex flex-col items-center gap-3 border-2 border-dashed border-slate-200 hover:border-blue-300 rounded-xl py-6 cursor-pointer transition-colors">
                {isUploading ? (
                  <div className="text-center py-1">
                    <Loader2 className="animate-spin text-blue-600 mx-auto mb-2" size={22} />
                    <p className="text-xs font-semibold text-slate-600">Processing…</p>
                  </div>
                ) : (
                  <>
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                      <Upload size={18} className="text-blue-600" />
                    </div>
                    <div className="text-center">
                      <p className="text-xs font-bold text-slate-700">Drop resume file</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">PDF or DOCX</p>
                    </div>
                  </>
                )}
                <input type="file" onChange={handlePDFUpload} disabled={isUploading} className="hidden" accept=".pdf,.docx" />
              </label>

              <div className="pt-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Current document</p>
                {profile.cvUrl ? (
                  <a
                    href={profile.cvUrl} target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full text-xs font-semibold text-blue-600 border border-blue-100 bg-blue-50 hover:bg-blue-100 py-2.5 rounded-xl transition-colors"
                  >
                    <Eye size={13} /> View uploaded PDF
                  </a>
                ) : (
                  <div className="text-center py-3 bg-slate-50 border border-dashed border-slate-200 rounded-xl">
                    <p className="text-xs text-slate-400">No PDF uploaded yet.</p>
                  </div>
                )}
              </div>
            </div>

            {/* LinkedIn sync */}
            <div className="bg-white rounded-2xl border border-slate-100 p-5 space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center">
                  <Link2 size={14} className="text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">Sync LinkedIn</p>
                  <p className="text-xs text-slate-400 mt-0.5">Extract missing data from your public profile.</p>
                </div>
              </div>

              <div className="space-y-2">
                <TextInput
                  type="url"
                  value={linkedInUrl}
                  onChange={e => setLinkedInUrl(e.target.value)}
                  placeholder="https://linkedin.com/in/username"
                />
                <button
                  type="button"
                  onClick={handleLinkedInSync}
                  disabled={isSyncingLinkedIn || !linkedInUrl}
                  className="w-full inline-flex items-center justify-center gap-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white py-2.5 rounded-xl transition-colors"
                >
                  {isSyncingLinkedIn ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />}
                  Sync workspace
                </button>
              </div>
            </div>

            {/* Smart merge notice */}
            <div className="bg-slate-900 rounded-2xl p-4">
              <p className="text-[10px] font-bold text-amber-400 uppercase tracking-wider mb-1.5">Smart merge engine</p>
              <p className="text-xs text-slate-400 leading-relaxed">
                These tools only fill <span className="text-slate-300 font-semibold">empty spaces</span> and append new entries — your existing data is never overwritten.
              </p>
            </div>

          </div>
        </div>
          </>
        )}
      </main>
    </div>
  );
}
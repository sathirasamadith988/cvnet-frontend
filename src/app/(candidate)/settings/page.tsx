"use client";

import { useState, useEffect } from "react";
import { onAuthStateChanged, updatePassword, updateProfile, updateEmail, User as FirebaseUser } from "firebase/auth";
import { auth } from "@/lib/firebaseConfig";
import axios from "axios";
import {
  Camera,
  Shield,
  Bell,
  AlertTriangle,
  Eye,
  EyeOff,
  Save,
  AlertCircle,
  CheckCircle2,
  Lock,
  Globe
} from "lucide-react";

export default function SettingsPage() {
  // Auth & Profile States
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const [isEmailUser, setIsEmailUser] = useState(true); // Guards password management visibility

  // Security UI Input States
  const [currentPassword, setCurrentPassword] = useState(""); // Kept for interface consistency
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Structural Processing States
  const [activeTab, setActiveTab] = useState<"profile" | "security" | "notifications">("profile");
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string | null }>({
    type: "success",
    text: null,
  });

  // Load and Map Authentic State Contexts upon Component Setup
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
        setFullName(user.displayName || "");
        setEmail(user.email || "");
        setProfileImageUrl(user.photoURL || null);

        // Verify if provider channel is standard credentials or social sign-on
        const provider = user.providerData.some((p) => p.providerId === "password");
        setIsEmailUser(provider);
      }
    });
    return () => unsubscribe();
  }, []);

  // Compute initials for profile placeholder avatar
  const getInitials = (name: string) => {
    if (!name) return "CV";
    return name
      .trim()
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  /**
   * 1. Profile Core Field Update Operation
   * Synchronizes Name and Email changes with Firebase Auth and the system infrastructure.
   */
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    setIsLoading(true);
    setStatusMessage({ type: "success", text: null });

    try {
      // Synchronize Identity Data inside Firebase Context Engine
      if (fullName !== currentUser.displayName) {
        await updateProfile(currentUser, { displayName: fullName });
      }

      if (email !== currentUser.email) {
        await updateEmail(currentUser, email);
      }

      setStatusMessage({ type: "success", text: "Profile base information updated successfully!" });
    } catch (error: any) {
      if (error.code === "auth/requires-recent-login") {
        setStatusMessage({
          type: "error",
          text: "Security sensitive operation. Please log out and log back in to renew your security context.",
        });
      } else {
        setStatusMessage({ type: "error", text: error.message || "Failed to finalize profile modifications." });
      }
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 2. Multpart Form Image Core Binary Upload Relay
   * Pipes selected binary stream into your .NET ProfileController to trigger Cloudinary AI transforms.
   */
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser) return;

    // Structural enforcement checks matching .NET pipeline logic validations
    if (file.size > 5 * 1024 * 1024) {
      setStatusMessage({ type: "error", text: "File size threshold breached. Maximum file size allowed is 5MB." });
      return;
    }

    setIsLoading(true);
    setStatusMessage({ type: "success", text: null });

    // Assemble Form Payload boundaries matching [FromForm] schema requirements
    const multipartForm = new FormData();
    multipartForm.append("userId", currentUser.uid);
    multipartForm.append("file", file);

    try {
      const idToken = await currentUser.getIdToken();
      const response = await axios.post("http://localhost:5167/api/Profile/upload-image", multipartForm, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${idToken}`, // Secure Authorization tunnel
        },
      });

      if (response.data.status === "success") {
        const structuralCloudinaryUrl = response.data.imageUrl;
        
        // Finalize local state context view
        await updateProfile(currentUser, { photoURL: structuralCloudinaryUrl });
        setProfileImageUrl(structuralCloudinaryUrl);
        setStatusMessage({ type: "success", text: "Professional profile avatar uploaded and synchronized successfully!" });
      }
    } catch (error: any) {
      setStatusMessage({
        type: "error",
        text: error.response?.data?.message || error.message || "Failed to complete data pipeline asset upload.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 3. Identity Credential Rotation Routine
   * Validates structure constraints and commits new password values inside Firebase.
   */
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    if (newPassword !== confirmPassword) {
      setStatusMessage({ type: "error", text: "Password mismatch error. Confirm value must match exactly." });
      return;
    }

    if (newPassword.length < 6) {
      setStatusMessage({ type: "error", text: "Password complexity minimum threshold unmet (Min 6 characters)." });
      return;
    }

    setIsLoading(true);
    setStatusMessage({ type: "success", text: null });

    try {
      await updatePassword(currentUser, newPassword);
      setStatusMessage({ type: "success", text: "Account credentials rotated successfully!" });
      setNewPassword("");
      setConfirmPassword("");
      setCurrentPassword("");
    } catch (error: any) {
      if (error.code === "auth/requires-recent-login") {
        setStatusMessage({
          type: "error",
          text: "Security verification context expired. Please re-authenticate by logging in again.",
        });
      } else {
        setStatusMessage({ type: "error", text: error.message || "Failed to complete password shift operations." });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 sm:p-8 max-w-4xl">
      {/* Header Context Bar */}
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-slate-900">Account Settings</h1>
        <p className="text-slate-500 text-sm mt-0.5">
          Manage your account information, security settings, and communication preferences.
        </p>
      </div>

      {/* Global Realtime System Operations Feedback Banner */}
      {statusMessage.text && (
        <div
          className={`flex items-start gap-2.5 border rounded-xl p-4 text-sm mb-6 transition-all animate-in fade-in-50 duration-200 ${
            statusMessage.type === "success"
              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
              : "bg-rose-50 text-rose-700 border-rose-200"
          }`}
        >
          {statusMessage.type === "success" ? <CheckCircle2 size={18} className="mt-0.5 flex-shrink-0" /> : <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />}
          <div className="font-medium">{statusMessage.text}</div>
        </div>
      )}

      {/* Dynamic User Summary Badge Context */}
      <div className="flex items-center gap-4 p-4 bg-white border border-slate-100 rounded-2xl shadow-sm mb-6">
        {profileImageUrl ? (
          <img src={profileImageUrl} alt="Avatar" className="w-12 h-12 rounded-full object-cover flex-shrink-0 border border-slate-200" />
        ) : (
          <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
            {getInitials(fullName)}
          </div>
        )}
        <div>
          <p className="font-bold text-slate-900">{fullName || "CVNet User"}</p>
          <p className="text-xs text-slate-400">Candidate Account</p>
        </div>
      </div>

      {/* Component Core Segment Tab Navigation Controllers */}
      <div className="flex gap-1 mb-6 bg-slate-100 p-1 rounded-xl w-fit flex-wrap">
        {[
          { key: "profile", label: "Profile Information" },
          { key: "security", label: "Security Gateway" },
          { key: "notifications", label: "System Alerts" },
        ].map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setActiveTab(key as any)}
            className={`px-4 py-1.5 text-sm font-semibold rounded-lg transition-colors whitespace-nowrap ${
              activeTab === key ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="space-y-6">
        {/* TAB LAYER 1: Core Profile Handling Form */}
        {activeTab === "profile" && (
          <form onSubmit={handleSaveProfile} className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-5">
              <Camera size={18} className="text-blue-600" />
              <h2 className="font-bold text-slate-900">Profile Information</h2>
            </div>
            <p className="text-sm text-slate-400 mb-5">Update your personal details and how others see you.</p>

            {/* Profile Avatar Binary Pipeline Trigger Component */}
            <div className="flex items-center gap-5 mb-6 pb-6 border-b border-slate-100">
              <div className="relative">
                {profileImageUrl ? (
                  <img src={profileImageUrl} alt="Avatar" className="w-20 h-20 rounded-full object-cover border" />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-2xl">
                    {getInitials(fullName)}
                  </div>
                )}
                <label className="absolute -bottom-1 -right-1 w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center shadow-md border-2 border-white hover:bg-blue-700 transition-colors cursor-pointer">
                  <Camera size={13} className="text-white" />
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={isLoading} />
                </label>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-700 mb-1">Profile Picture</p>
                <p className="text-xs text-slate-400 mb-3">JPG, GIF or PNG. Recommended size 400x400px.</p>
                <div className="flex gap-2">
                  <label className="px-3 py-1.5 text-xs font-semibold bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors border border-blue-200 cursor-pointer">
                    Upload New
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={isLoading} />
                  </label>
                </div>
              </div>
            </div>

            {/* Editable Form Inputs Block */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Full Name</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="mt-5 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors shadow-sm disabled:opacity-50"
            >
              <Save size={15} /> {isLoading ? "Processing..." : "Save Changes"}
            </button>
          </form>
        )}

        {/* TAB LAYER 2: Advanced Identity Security Gateway */}
        {activeTab === "security" && (
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-5">
              <Shield size={18} className="text-blue-600" />
              <h2 className="font-bold text-slate-900">Security</h2>
            </div>
            <p className="text-sm text-slate-400 mb-5">Secure your account with a strong password.</p>

            {isEmailUser ? (
              /* Enforce Standard Email Context Modification Forms */
              <form onSubmit={handleUpdatePassword}>
                <h3 className="text-sm font-bold text-slate-800 mb-4">Change Password</h3>
                <div className="space-y-3 mb-5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? "text" : "password"}
                        placeholder="Enter new password"
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full px-4 pr-12 py-3 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      placeholder="Confirm new password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors mb-6 disabled:opacity-50"
                >
                  <Lock size={15} /> {isLoading ? "Rotating..." : "Update Password"}
                </button>
              </form>
            ) : (
              /* High-Professional Alternative Visual State Block for Social SSO Entries */
              <div className="flex flex-col items-center justify-center border border-dashed border-slate-200 bg-slate-50 rounded-2xl p-8 text-center max-w-xl mx-auto my-4">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4">
                  <Globe size={24} />
                </div>
                <h4 className="font-bold text-slate-900 text-base mb-1">Single Sign-On (SSO) Account</h4>
                <p className="text-sm text-slate-500 max-w-sm leading-relaxed">
                  You are securely logged into CVNet using your **Google identity provider channel**. Internal password rotation is managed externally within your primary Google Account management dashboard.
                </p>
              </div>
            )}
          </div>
        )}

        {/* TAB LAYER 3: System Notifications & Alerts Shell (Plain text context layout placeholder) */}
        {activeTab === "notifications" && (
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-5">
              <Bell size={18} className="text-blue-600" />
              <h2 className="font-bold text-slate-900">Notifications & Preferences</h2>
            </div>
            <p className="text-sm text-slate-400 mb-5">
              Choose how you want to be notified about job opportunities and application updates.
            </p>
            <div className="border border-dashed border-slate-200 rounded-xl p-8 text-center text-slate-400 text-sm font-medium">
              Notification synchronization configuration interface handles will hook into system sockets during next phase development cycles.
            </div>
          </div>
        )}

        {/* System Safety Border: Danger Zone (Kept as high fidelity raw plain layout placeholder) */}
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={18} className="text-red-600" />
            <h2 className="font-bold text-red-800">Deactivate Account</h2>
          </div>
          <p className="text-sm text-red-600 mb-4">
            Once you deactivate your account, your profile and application history will be hidden from recruiters.
          </p>
          <button type="button" className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors">
            <AlertTriangle size={15} /> Deactivate
          </button>
        </div>
      </div>
    </div>
  );
}
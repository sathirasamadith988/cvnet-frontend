"use client";

import { useState } from "react";
import {
  Camera,
  Shield,
  Bell,
  AlertTriangle,
  Eye,
  EyeOff,
  Save,
} from "lucide-react";

export default function SettingsPage() {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [notifications, setNotifications] = useState({
    jobAlerts: true,
    applicationUpdates: true,
  });
  const [activeTab, setActiveTab] = useState<
    "profile" | "security" | "notifications"
  >("profile");

  const showProfileSection = activeTab === "profile";
  const showSecuritySection = activeTab === "security";
  const showNotificationsSection = activeTab === "notifications";

  return (
    <div className="p-6 sm:p-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-slate-900">
          Account Settings
        </h1>
        <p className="text-slate-500 text-sm mt-0.5">
          Manage your account information, security settings, and communication
          preferences.
        </p>
      </div>

      {/* User Badge */}
      <div className="flex items-center gap-4 p-4 bg-white border border-slate-100 rounded-2xl shadow-sm mb-6">
        <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
          AJ
        </div>
        <div>
          <p className="font-bold text-slate-900">Alex Johnson</p>
          <p className="text-xs text-slate-400">Candidate Account</p>
        </div>
      </div>

      {/* Tab navigation */}
      <div className="flex gap-1 mb-6 bg-slate-100 p-1 rounded-xl w-fit flex-wrap">
        {[
          { key: "profile", label: "Profile & Security" },
          { key: "security", label: "Security" },
          { key: "notifications", label: "Notifications" },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key as typeof activeTab)}
            className={`px-4 py-1.5 text-sm font-semibold rounded-lg transition-colors whitespace-nowrap ${activeTab === key ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="space-y-6">
        {/* Profile Information */}
        {showProfileSection && (
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-5">
              <Camera size={18} className="text-blue-600" />
              <h2 className="font-bold text-slate-900">Profile Information</h2>
            </div>
            <p className="text-sm text-slate-400 mb-5">
              Update your personal details and how others see you.
            </p>

            {/* Profile Picture */}
            <div className="flex items-center gap-5 mb-6 pb-6 border-b border-slate-100">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-2xl">
                  AJ
                </div>
                <button className="absolute -bottom-1 -right-1 w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center shadow-md border-2 border-white hover:bg-blue-700 transition-colors">
                  <Camera size={13} className="text-white" />
                </button>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-700 mb-1">
                  Profile Picture
                </p>
                <p className="text-xs text-slate-400 mb-3">
                  JPG, GIF or PNG. Recommended size 400x400px.
                </p>
                <div className="flex gap-2">
                  <button className="px-3 py-1.5 text-xs font-semibold bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors border border-blue-200">
                    Upload New
                  </button>
                  <button className="px-3 py-1.5 text-xs font-semibold text-slate-500 rounded-lg hover:bg-slate-50 transition-colors border border-slate-200">
                    Remove
                  </button>
                </div>
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Full Name
                </label>
                <input
                  defaultValue="Alex Johnson"
                  className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Email Address
                </label>
                <input
                  defaultValue="alex.johnson@example.com"
                  type="email"
                  className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>
            </div>

            <button className="mt-5 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors shadow-sm">
              <Save size={15} /> Save Changes
            </button>
          </div>
        )}

        {/* Security */}
        {showSecuritySection && (
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-5">
              <Shield size={18} className="text-blue-600" />
              <h2 className="font-bold text-slate-900">Security</h2>
            </div>
            <p className="text-sm text-slate-400 mb-5">
              Secure your account with a strong password.
            </p>

            <h3 className="text-sm font-bold text-slate-800 mb-4">
              Change Password
            </h3>
            <div className="space-y-3 mb-5">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    placeholder="Enter current password"
                    className="w-full px-4 pr-12 py-3 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showCurrentPassword ? (
                      <EyeOff size={16} />
                    ) : (
                      <Eye size={16} />
                    )}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    placeholder="Enter new password"
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
                  className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>
            </div>
            <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors mb-6">
              Update Password
            </button>

            {/* Two-factor Authentication removed */}
          </div>
        )}

        {/* Notifications */}
        {showNotificationsSection && (
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-5">
              <Bell size={18} className="text-blue-600" />
              <h2 className="font-bold text-slate-900">
                Notifications & Preferences
              </h2>
            </div>
            <p className="text-sm text-slate-400 mb-5">
              Choose how you want to be notified about job opportunities and
              application updates.
            </p>

            <div className="space-y-5 divide-y divide-slate-100">
              {[
                {
                  key: "jobAlerts" as const,
                  label: "Job Alerts",
                  desc: "Get notified when new jobs matching your profile are posted.",
                },
                {
                  key: "applicationUpdates" as const,
                  label: "Application Status Updates",
                  desc: "Real-time alerts when recruiters view or update your status.",
                },
              ].map(({ key, label, desc }) => (
                <div
                  key={key}
                  className="flex items-center justify-between pt-5 first:pt-0"
                >
                  <div className="pr-6">
                    <p className="font-semibold text-slate-900 text-sm">
                      {label}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">{desc}</p>
                  </div>
                  <button
                    onClick={() =>
                      setNotifications((n) => ({ ...n, [key]: !n[key] }))
                    }
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0 ${notifications[key] ? "bg-blue-600" : "bg-slate-200"}`}
                  >
                    <span
                      className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${notifications[key] ? "translate-x-6" : "translate-x-1"}`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Danger Zone */}
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={18} className="text-red-600" />
            <h2 className="font-bold text-red-800">Deactivate Account</h2>
          </div>
          <p className="text-sm text-red-600 mb-4">
            Once you deactivate your account, your profile and application
            history will be hidden from recruiters.
          </p>
          <button className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors">
            <AlertTriangle size={15} /> Deactivate
          </button>
        </div>
      </div>
    </div>
  );
}

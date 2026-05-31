"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  BarChart2,
  Briefcase,
  Settings,
  LogOut,
} from "lucide-react";
import { auth } from "@/lib/firebaseConfig";
import { onAuthStateChanged, signOut, User as FirebaseUser } from "firebase/auth";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/cv", label: "My CV", icon: FileText },
  { href: "/skill-gap", label: "Skill Gap", icon: BarChart2 },
  { href: "/applications", label: "Applications", icon: Briefcase, badge: 3 },
];

export default function CandidateSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);

  // Sync the sidebar with the real Firebase User
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  // Compute initials cleanly
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

  const displayName = currentUser?.displayName || "CVNet User";
  const profileImageUrl = currentUser?.photoURL;

  // ✅ LOGOUT ROUTINE
  const handleLogout = async () => {
    try {
      // 1. Terminate Firebase Client Session
      await signOut(auth);

      // 2. Destroy the middleware authentication cookie by setting it to a past expiration date
      document.cookie = "cvnet_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";

      // 3. Redirect back to the login page
      router.push("/login");
    } catch (error) {
      console.error("Failed to log out cleanly:", error);
    }
  };

  return (
    <aside
      className="fixed left-0 top-0 h-screen w-64 flex flex-col z-30"
      style={{ backgroundColor: "#0F172A" }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-700">
        <Image
          src="/logo.jpeg"
          alt="CVNet Logo"
          width={36}
          height={36}
          className="rounded-lg object-cover"
        />
        <div>
          <p className="text-white font-bold text-base leading-tight">CVNet</p>
          <p className="text-slate-400 text-xs">HR Tech Platform</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <ul className="space-y-1">
          {navItems.map(({ href, label, icon: Icon, badge }) => {
            const isActive = pathname === href;
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : "text-slate-300 hover:bg-slate-700 hover:text-white"
                  }`}
                >
                  <Icon size={18} />
                  <span className="flex-1">{label}</span>
                  {badge !== undefined && (
                    <span className="bg-blue-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                      {badge}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Settings + User */}
      <div className="border-t border-slate-700">
        <Link
          href="/settings"
          className={`flex items-center gap-3 px-6 py-3 text-sm font-medium transition-colors ${
            pathname === "/settings"
              ? "text-blue-400"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Settings size={16} />
          Settings
        </Link>
        
        {/* ✅ CHANGED FROM LINK TO FUNCTIONAL BUTTON */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-6 py-3 text-sm font-medium text-slate-400 hover:text-white transition-colors"
        >
          <LogOut size={16} />
          Logout
        </button>

        {/* ✅ DYNAMIC USER PROFILE BLOCK */}
        <div className="flex items-center gap-3 px-5 py-4 border-t border-slate-700">
          {profileImageUrl ? (
            <img 
              src={profileImageUrl} 
              alt="Avatar" 
              className="w-9 h-9 rounded-full object-cover flex-shrink-0"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {getInitials(displayName)}
            </div>
          )}
          <div className="min-w-0">
            <p className="text-white text-sm font-semibold truncate">
              {displayName}
            </p>
            <p className="text-slate-400 text-xs truncate">Candidate Account</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
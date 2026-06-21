"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  LayoutDashboard,
  Users,
  Briefcase,
  BarChart2,
  Calendar,
  Settings,
  Menu,
  X,
  LogOut,
} from "lucide-react";
import { auth } from "@/lib/firebaseConfig";
import { onAuthStateChanged, signOut } from "firebase/auth";

const navItems = [
  { href: "/recruiter/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/recruiter/jobs", label: "Jobs", icon: Briefcase },
  { href: "/recruiter/candidates", label: "Candidates", icon: Users },
  { href: "/recruiter/interviews", label: "Interviews", icon: Calendar },
];

export default function RecruiterSidebar() {
  const pathname = usePathname();
  const router = useRouter(); // ✅ Added router for logout redirect
  const [isOpen, setIsOpen] = useState(false);
  
  // Dynamic User State
  const [userName, setUserName] = useState("CVNet Enterprise"); 
  const [userPhoto, setUserPhoto] = useState<string | null>(null);

  useEffect(() => {
    // Listen for Firebase Auth updates to instantly sync the profile image and name
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        if (user.displayName) setUserName(user.displayName);
        if (user.photoURL) setUserPhoto(user.photoURL);
      }
    });
    return () => unsubscribe();
  }, []);

  const toggleSidebar = () => setIsOpen(!isOpen);

  // Helper to generate initials (e.g., "Niranga Kumara" -> "NK")
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  // ✅ SECURE LOGOUT ROUTINE
  const handleLogout = async () => {
    try {
      // 1. Terminate Firebase Client Session
      await signOut(auth);

      // 2. Destroy the middleware authentication cookie
      document.cookie = "cvnet_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";

      // 3. Redirect back to the login page
      router.push("/login");
    } catch (error) {
      console.error("Failed to log out cleanly:", error);
    }
  };

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4 z-40 shadow-lg">
        <div className="flex items-center gap-3">
          <Image
            src="/logo.jpeg"
            alt="CVNet Logo"
            width={32}
            height={32}
            className="rounded-lg object-cover"
          />
          <span className="text-white font-bold text-sm tracking-tight">CVNet</span>
        </div>
        <button 
          onClick={toggleSidebar}
          aria-label="Toggle menu"
          className="p-2 text-slate-300 hover:text-white transition-colors"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Backdrop for mobile */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen w-64 flex flex-col z-50 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ backgroundColor: "#0F172A" }}
      >
        {/* Logo (Desktop only) */}
        <div className="hidden lg:flex items-center gap-3 px-6 py-6 border-b border-slate-800">
          <Image
            src="/logo.jpeg"
            alt="CVNet Logo"
            width={40}
            height={40}
            className="rounded-xl object-cover shadow-lg"
          />
          <div>
            <p className="text-white font-black text-lg leading-tight tracking-tight">CVNet</p>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Recruiter</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-6 overflow-y-auto">
          <ul className="space-y-2">
            {navItems.map(({ href, label, icon: Icon }) => {
              const isActive = pathname === href;
              return (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-bold transition-all ${
                      isActive
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20"
                        : "text-slate-400 hover:bg-slate-800 hover:text-white"
                    }`}
                  >
                    <Icon size={18} />
                    <span className="flex-1">{label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Bottom Section */}
        <div className="mt-auto border-t border-slate-800 p-4 space-y-2">
          
          <Link
            href="/recruiter/settings"
            onClick={() => setIsOpen(false)}
            className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-bold transition-all ${
              pathname === "/recruiter/settings"
                ? "bg-slate-800 text-blue-400"
                : "text-slate-400 hover:bg-slate-800 hover:text-white"
            }`}
          >
            <Settings size={18} />
            Settings
          </Link>

          {/* ✅ LOGOUT BUTTON */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-bold text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 transition-all mb-2"
          >
            <LogOut size={18} />
            Logout
          </button>

          {/* DYNAMIC USER PROFILE */}
          <div className="flex items-center gap-3 px-2 py-3 bg-slate-800/50 rounded-2xl border border-slate-800 mt-2">
            {userPhoto ? (
              <img 
                src={userPhoto} 
                alt={userName} 
                className="w-10 h-10 rounded-xl object-cover shadow-inner border border-slate-700"
              />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-sm shadow-inner">
                {getInitials(userName)}
              </div>
            )}
            <div className="min-w-0">
              <p className="text-white text-xs font-black truncate leading-tight">{userName}</p>
              <p className="text-slate-500 text-[10px] font-bold uppercase truncate">Company</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
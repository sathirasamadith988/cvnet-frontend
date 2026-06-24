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
  Menu,
  X,
} from "lucide-react";
import { auth } from "@/lib/firebaseConfig";
import { onAuthStateChanged, signOut, User as FirebaseUser } from "firebase/auth";
import axios from "axios";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/cv", label: "My CV", icon: FileText },
  { href: "/skill-gap", label: "Skill Gap", icon: BarChart2 },
  { href: "/applications", label: "Applications", icon: Briefcase },
];

export default function CandidateSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  
  // State to hold the name strictly from the PostgreSQL database
  const [dbFullName, setDbFullName] = useState<string>("Niranga Nayanajith"); 

  // Sync the sidebar with the real Firebase User AND PostgreSQL
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        try {
          const token = await user.getIdToken();
          
          // Fetch the SQL profile row using your existing UserProfileController
          const res = await axios.get(`http://localhost:5167/api/UserProfile/full-profile?userId=${user.uid}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          // Override the default name with the actual Postgres full_name
          if (res.data && res.data.fullName && res.data.fullName.trim() !== "") {
            setDbFullName(res.data.fullName);
          } else if (user.displayName) {
             // Safe fallback to Firebase if Postgres is empty
            setDbFullName(user.displayName);
          }
        } catch (error) {
          console.error("Failed to fetch user details from PostgreSQL:", error);
          if (user.displayName) setDbFullName(user.displayName);
        }
      }
    });
    
    return () => unsubscribe();
  }, []);

  const toggleSidebar = () => setIsOpen(!isOpen);

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
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 z-40 shadow-sm">
        <div className="flex items-center gap-3">
          <Image
            src="/logo.jpeg"
            alt="CVNet Logo"
            width={32}
            height={32}
            className="rounded-lg object-cover"
          />
          <span className="text-slate-900 font-bold text-sm tracking-tight">CVNet</span>
        </div>
        <button type="button" 
          onClick={toggleSidebar}
          aria-label="Toggle menu"
          className="p-2 text-slate-600 hover:text-slate-900 transition-colors"
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
        className={`fixed left-0 top-0 h-screen w-64 flex flex-col z-50 bg-white border-r border-slate-200 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo (Desktop only) */}
        <div className="hidden lg:flex items-center gap-3 px-6 py-6 border-b border-slate-200">
          <Image
            src="/logo.jpeg"
            alt="CVNet Logo"
            width={40}
            height={40}
            className="rounded-xl object-cover shadow-sm"
          />
          <div>
            <p className="text-slate-900 font-black text-lg leading-tight tracking-tight">CVNet</p>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Candidate</p>
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
                        ? "bg-blue-50 text-blue-700"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
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
        <div className="mt-auto border-t border-slate-200 p-4 space-y-2 bg-slate-50/50">
          
          <Link
            href="/settings"
            onClick={() => setIsOpen(false)}
            className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-bold transition-all ${
              pathname === "/settings"
                ? "bg-slate-100 text-blue-600"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            <Settings size={18} />
            Settings
          </Link>

          {/* ✅ LOGOUT BUTTON */}
          <button type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-bold text-slate-600 hover:bg-rose-50 hover:text-rose-600 transition-all mb-2"
          >
            <LogOut size={18} />
            Logout
          </button>

          {/* DYNAMIC USER PROFILE */}
          <div className="flex items-center gap-3 px-2 py-3 bg-white rounded-2xl border border-slate-200 mt-2 shadow-sm">
            {profileImageUrl ? (
              <img 
                src={profileImageUrl} 
                alt="Avatar" 
                className="w-10 h-10 rounded-xl object-cover shadow-inner border border-slate-100"
              />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-sm shadow-inner">
                {getInitials(dbFullName)}
              </div>
            )}
            <div className="min-w-0">
              <p className="text-slate-900 text-xs font-black truncate leading-tight">{dbFullName}</p>
              <p className="text-slate-500 text-[10px] font-bold uppercase truncate">Candidate Account</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
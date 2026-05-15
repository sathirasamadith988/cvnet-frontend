"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
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
} from "lucide-react";

const navItems = [
  { href: "/recruiter/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/recruiter/jobs", label: "Jobs", icon: Briefcase },
  { href: "/recruiter/candidates", label: "Candidates", icon: Users },
  { href: "/recruiter/analytics", label: "Analytics", icon: BarChart2 },
  { href: "/recruiter/interviews", label: "Interviews", icon: Calendar },
];

export default function RecruiterSidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => setIsOpen(!isOpen);

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

        {/* Home link */}
        <div className="px-3 py-4 border-b border-slate-800 lg:mt-0 mt-20">
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-slate-400 hover:bg-slate-800 hover:text-white transition-all group"
          >
            <div className="p-2 rounded-lg bg-slate-800 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Home size={18} />
            </div>
            Home Portal
          </Link>
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
        <div className="mt-auto border-t border-slate-800 p-4 space-y-4">
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

          <div className="flex items-center gap-3 px-2 py-3 bg-slate-800/50 rounded-2xl border border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-sm shadow-inner">
              AM
            </div>
            <div className="min-w-0">
              <p className="text-white text-xs font-black truncate leading-tight">Alex Morgan</p>
              <p className="text-slate-500 text-[10px] font-bold uppercase truncate">Admin</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  BarChart2,
  Briefcase,
  Settings,
  Zap,
  ChevronRight,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/cv", label: "My CV", icon: FileText },
  { href: "/skill-gap", label: "Skill Gap", icon: BarChart2 },
  { href: "/applications", label: "Applications", icon: Briefcase, badge: 3 },
];

export default function CandidateSidebar() {
  const pathname = usePathname();

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

        {/* Pro plan banner removed */}
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
        <div className="flex items-center gap-3 px-5 py-4 border-t border-slate-700">
          <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            AJ
          </div>
          <div className="min-w-0">
            <p className="text-white text-sm font-semibold truncate">
              Alex Johnson
            </p>
            <p className="text-slate-400 text-xs truncate">Candidate Account</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

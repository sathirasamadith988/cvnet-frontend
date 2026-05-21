"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Briefcase,
  CalendarDays,
  CheckCircle2,
  Mail,
  MapPin,
  Phone,
  Globe,
  FileText,
  User,
  ClipboardList,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  ApplicationRecord,
  getApplicationsFromStorage,
  statusConfig,
} from "@/lib/applications";

type ApplicationDetailsPageProps = {
  params: {
    id: string;
  };
};

export default function ApplicationDetailsPage({
  params,
}: ApplicationDetailsPageProps) {
  const [application, setApplication] = useState<ApplicationRecord | null>(
    null,
  );
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const allApplications = getApplicationsFromStorage();
    setApplication(
      allApplications.find((record) => record.id === params.id) ?? null,
    );
    setLoaded(true);
  }, [params.id]);

  if (!loaded) {
    return (
      <div className="p-6 sm:p-8 max-w-5xl mx-auto">
        <div className="rounded-3xl border border-slate-100 bg-white p-8 shadow-sm">
          <p className="text-sm font-semibold text-slate-500">
            Loading application details...
          </p>
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="p-6 sm:p-8 max-w-5xl mx-auto">
        <div className="mb-6">
          <Link
            href="/applications"
            className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700"
          >
            <ArrowLeft size={16} /> Back to My Applications
          </Link>
        </div>
        <div className="rounded-3xl border border-slate-100 bg-white p-8 shadow-sm">
          <p className="text-sm font-semibold text-slate-500">
            Application not found.
          </p>
        </div>
      </div>
    );
  }

  const status = statusConfig[application.status];

  return (
    <div className="p-6 sm:p-8 max-w-6xl mx-auto">
      <div className="mb-6 flex items-center justify-between gap-4">
        <Link
          href="/applications"
          className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700"
        >
          <ArrowLeft size={16} /> Back to My Applications
        </Link>
        <span
          className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold ${status.bg} ${status.text}`}
        >
          {status.label}
        </span>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-100 bg-white p-7 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Application details
                </p>
                <h1 className="mt-2 text-3xl font-extrabold text-slate-900">
                  {application.role}
                </h1>
                <p className="mt-1 text-sm text-slate-500">
                  {application.company} · {application.location}
                </p>
              </div>
              <div className="rounded-2xl bg-slate-50 px-4 py-3 text-right">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Applied on
                </p>
                <p className="mt-1 text-sm font-bold text-slate-900">
                  {application.date}
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Match score
                </p>
                <p className="mt-2 text-3xl font-extrabold text-slate-900">
                  {application.match}%
                </p>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Current status
                </p>
                <p className="mt-2 text-lg font-bold text-slate-900">
                  {status.label}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Application ID
                </p>
                <p className="mt-2 wrap-break-word text-sm font-semibold text-slate-900">
                  {application.id}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-100 bg-white p-7 shadow-sm">
            <div className="flex items-center gap-3 mb-5">
              <User size={18} className="text-blue-600" />
              <h2 className="text-lg font-bold text-slate-900">
                Applied Form Details
              </h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <DetailCard
                icon={User}
                label="Full Name"
                value={application.details.fullName}
              />
              <DetailCard
                icon={Mail}
                label="Email Address"
                value={application.details.email}
              />
              <DetailCard
                icon={Phone}
                label="Phone"
                value={application.details.phone}
              />
              <DetailCard
                icon={MapPin}
                label="Location"
                value={application.details.location}
              />
              <DetailCard
                icon={Briefcase}
                label="Current Role"
                value={application.details.currentRole}
              />
              <DetailCard
                icon={CalendarDays}
                label="Availability"
                value={application.details.availability}
              />
              <DetailCard
                icon={FileText}
                label="CV File"
                value={application.details.cvFileName}
              />
              <DetailCard
                icon={Globe}
                label="Portfolio / LinkedIn"
                value={application.details.portfolio}
              />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl bg-slate-900 p-7 text-white shadow-sm">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">
              <CheckCircle2 size={14} className="text-emerald-400" /> Submitted
              note
            </div>
            <p className="mt-4 text-lg font-bold">Cover Note</p>
            <p className="mt-3 text-sm leading-7 text-slate-300">
              {application.details.coverLetter}
            </p>
          </div>

          <div className="rounded-3xl border border-slate-100 bg-white p-7 shadow-sm">
            <div className="flex items-center gap-3 mb-5">
              <ClipboardList size={18} className="text-blue-600" />
              <h2 className="text-lg font-bold text-slate-900">Summary</h2>
            </div>
            <p className="text-sm leading-7 text-slate-600">
              {application.details.summary}
            </p>
          </div>

          <div className="rounded-3xl border border-slate-100 bg-white p-7 shadow-sm">
            <div className="flex items-center gap-3 mb-5">
              <Briefcase size={18} className="text-blue-600" />
              <h2 className="text-lg font-bold text-slate-900">
                Role Snapshot
              </h2>
            </div>
            <div className="space-y-3 text-sm text-slate-600">
              <div className="flex items-start justify-between gap-4">
                <span className="font-semibold text-slate-500">Role</span>
                <span className="text-right font-medium text-slate-900">
                  {application.role}
                </span>
              </div>
              <div className="flex items-start justify-between gap-4">
                <span className="font-semibold text-slate-500">Company</span>
                <span className="text-right font-medium text-slate-900">
                  {application.company}
                </span>
              </div>
              <div className="flex items-start justify-between gap-4">
                <span className="font-semibold text-slate-500">Location</span>
                <span className="text-right font-medium text-slate-900">
                  {application.location}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

type DetailCardProps = {
  icon: LucideIcon;
  label: string;
  value: string;
};

function DetailCard({ icon: Icon, label, value }: DetailCardProps) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
        <Icon size={14} className="text-blue-600" />
        {label}
      </div>
      <p className="mt-2 wrap-break-word text-sm font-semibold text-slate-900">
        {value}
      </p>
    </div>
  );
}

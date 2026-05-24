"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { ArrowLeft, Compass, Home, Search, Sparkles } from "lucide-react";

const quickLinks = [
  { href: "/", label: "Home" },
  { href: "/login", label: "Login" },
  { href: "/signup", label: "Sign up" },
  { href: "/cv/preview", label: "CV Preview" },
];

const statusMessages = [
  "This route is off the map.",
  "The page signal dropped somewhere in transit.",
  "No matching screen was found for this URL.",
  "You’ve reached a blank corridor in the app.",
];

export default function NotFound() {
  const router = useRouter();
  const [pointer, setPointer] = useState({ x: 50, y: 35 });
  const [scanActive, setScanActive] = useState(false);
  const [messageIndex, setMessageIndex] = useState(0);

  const glowStyle = useMemo(
    () => ({
      background: `radial-gradient(circle at ${pointer.x}% ${pointer.y}%, rgba(37, 99, 235, 0.28), transparent 30%), radial-gradient(circle at 20% 20%, rgba(56, 189, 248, 0.18), transparent 22%), radial-gradient(circle at 80% 0%, rgba(99, 102, 241, 0.16), transparent 24%)`,
    }),
    [pointer.x, pointer.y],
  );

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width) * 100;
    const y = ((event.clientY - bounds.top) / bounds.height) * 100;

    setPointer({
      x: Math.max(0, Math.min(100, x)),
      y: Math.max(0, Math.min(100, y)),
    });
  };

  const triggerScan = () => {
    setScanActive(true);
    setMessageIndex((current) => (current + 1) % statusMessages.length);
    window.setTimeout(() => setScanActive(false), 1800);
  };

  return (
    <main
      className="relative min-h-screen overflow-hidden bg-slate-950 text-white"
      onPointerMove={handlePointerMove}
    >
      <div className="absolute inset-0 opacity-90" style={glowStyle} />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.08)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(circle_at_center,black,transparent_85%)]" />

      <section className="relative mx-auto flex min-h-screen max-w-6xl items-center px-6 py-16 sm:px-10 lg:px-12">
        <div className="grid w-full items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="max-w-2xl">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.35em] text-sky-200/70">
              Error 404
            </p>
            <h1 className="max-w-xl text-5xl font-black leading-none tracking-tight text-white sm:text-6xl lg:text-7xl">
              This page drifted out of range.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-300">
              {statusMessages[messageIndex]}
              <span className="ml-2 text-sky-200">
                Move your cursor to shift the beacon glow.
              </span>
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={triggerScan}
                className="inline-flex items-center gap-2 rounded-xl bg-sky-400 px-5 py-3 font-semibold text-slate-950 transition hover:bg-sky-300"
              >
                <Search size={16} />
                {scanActive ? "Scanning..." : "Scan for a route"}
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-5 py-3 font-semibold text-white transition hover:bg-white/10"
              >
                <ArrowLeft size={16} />
                Go back
              </button>
              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-transparent px-5 py-3 font-semibold text-white transition hover:bg-white/10"
              >
                <Home size={16} />
                Return home
              </Link>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {quickLinks.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="group flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm text-slate-200 backdrop-blur transition hover:border-sky-300/40 hover:bg-white/10"
                >
                  <span>{label}</span>
                  <Compass
                    size={16}
                    className="text-sky-300 transition-transform group-hover:translate-x-1 group-hover:-translate-y-0.5"
                  />
                </Link>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 rounded-[2rem] bg-sky-400/10 blur-3xl" />
            <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-slate-900/70 p-6 shadow-2xl shadow-sky-950/30 backdrop-blur-xl sm:p-8">
              <div className="flex items-center justify-between text-sm text-slate-300">
                <span>Route beacon</span>
                <span
                  className={scanActive ? "text-sky-300" : "text-emerald-300"}
                >
                  {scanActive ? "Searching" : "Online"}
                </span>
              </div>

              <div className="mt-6 rounded-3xl border border-white/10 bg-black/20 p-5">
                <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-slate-400">
                  <span>Signal</span>
                  <span>{scanActive ? "Re-routing" : "Idle"}</span>
                </div>
                <div className="mt-4 h-48 overflow-hidden rounded-2xl border border-white/10 bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.24),transparent_55%),linear-gradient(180deg,rgba(15,23,42,0.85),rgba(15,23,42,0.98))]">
                  <div
                    className={`relative h-full w-full transition-transform duration-700 ${
                      scanActive ? "scale-105" : "scale-100"
                    }`}
                  >
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.1)_1px,transparent_1px)] bg-[size:32px_32px] opacity-60" />
                    <div
                      className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full bg-sky-300 shadow-[0_0_40px_rgba(125,211,252,0.95)] transition-all duration-300"
                      style={{
                        left: `${pointer.x}%`,
                        top: `${pointer.y}%`,
                        width: scanActive ? 22 : 16,
                        height: scanActive ? 22 : 16,
                      }}
                    />
                    <div className="absolute inset-0">
                      <div
                        className={`absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full border border-sky-300/20 transition-transform duration-700 ${
                          scanActive ? "scale-125" : "scale-100"
                        }`}
                      />
                      <div
                        className={`absolute left-1/2 top-1/2 h-28 w-28 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10 transition-transform duration-700 ${
                          scanActive ? "scale-110" : "scale-100"
                        }`}
                      />
                      <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between text-xs text-slate-300">
                        <span>Tracing path to destination...</span>
                        <span className="text-sky-300">CVNet</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {[
                  ["Home", "Landing"],
                  ["Login", "Access"],
                  ["Signup", "Create"],
                ].map(([label, hint]) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() =>
                      setMessageIndex(
                        (current) => (current + 1) % statusMessages.length,
                      )
                    }
                    className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-left transition hover:border-sky-300/30 hover:bg-white/10"
                  >
                    <div className="text-sm font-semibold text-white">
                      {label}
                    </div>
                    <div className="mt-1 text-xs text-slate-400">{hint}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

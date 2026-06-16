// src/app/board/layout.tsx
export default function BoardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-slate-50 min-h-screen">
      {/* ZERO SIDEBARS, ZERO NAVIGATION */}
      {children}
    </div>
  );
}
import CandidateSidebar from '@/components/CandidateSidebar';

export default function CandidateLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <CandidateSidebar />
      <main className="flex-1 lg:ml-64 min-h-screen pt-16 lg:pt-0 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}

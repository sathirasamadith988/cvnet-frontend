import Link from "next/link";
import Image from "next/image";
import MarketingNav from "@/components/MarketingNav";
import {
  Brain,
  Target,
  LayoutDashboard,
  TrendingUp,
  Upload,
  Cpu,
  CheckCircle2,
  ArrowRight,
  Star,
} from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "Skill Gap Analysis",
    description:
      "Identify missing competencies instantly with our AI engine that scans thousands of data points.",
  },
  {
    icon: Target,
    title: "Readiness Score",
    description:
      "Get a quantified score of a candidate's fit for any role, reducing bias and improving quality of hire.",
  },
  {
    icon: LayoutDashboard,
    title: "Recruiter Dashboard",
    description:
      "Centralize your hiring pipeline and analytics in one view. Track progress from application to offer.",
  },
  {
    icon: TrendingUp,
    title: "Market Trends",
    description:
      "Stay ahead with real-time insights into industry skill demands and compensation benchmarks.",
  },
];

const steps = [
  {
    number: "1",
    icon: Upload,
    title: "Upload Requirements",
    description:
      "Input your job description or simply paste the link to your job posting.",
  },
  {
    number: "2",
    icon: Cpu,
    title: "AI Analysis",
    description:
      "Our AI engine maps skills, identifies gaps, and scores candidates against your benchmarks.",
  },
  {
    number: "3",
    icon: CheckCircle2,
    title: "Hire Smart",
    description:
      "Review ranked profiles, get interview questions tailored to gaps, and hire the best fit.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <MarketingNav />

      {/* Hero */}
      <section className="pt-24 pb-20 px-4 sm:px-6 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
                <Star size={12} className="fill-blue-600 text-blue-600" />
                v2.0 is now live with enhanced AI parsing
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 leading-tight mb-6">
                Bridge the Skill Gap with{" "}
                <span className="text-blue-600">AI-Driven</span> Recruitment
              </h1>
              <p className="text-lg text-slate-600 max-w-xl mx-auto lg:mx-0 mb-8 leading-relaxed">
                CVNet empowers enterprises to bridge the gap between candidate
                potential and role requirements with AI-driven analytics. Hire
                smarter, faster, and without bias.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-7 py-3.5 rounded-xl transition-colors shadow-md hover:shadow-lg"
                >
                  Get Started Free
                  <ArrowRight size={16} />
                </Link>
                <Link
                  href="/recruiter/dashboard"
                  className="inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-800 font-semibold px-7 py-3.5 rounded-xl transition-colors border border-slate-200 shadow-sm"
                >
                  For Recruiters
                </Link>
              </div>
              <p className="text-sm text-slate-400 mt-4">
                No credit card required. 14-day free trial.
              </p>
            </div>
            <div className="flex-1 flex flex-col items-center lg:items-end gap-4">
              <div className="bg-white rounded-2xl shadow-xl p-6 w-72 border border-slate-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <Target size={18} className="text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Candidate Match</p>
                      <p className="text-2xl font-extrabold text-blue-600">
                        94%
                      </p>
                    </div>
                  </div>
                  <span className="text-xs bg-green-100 text-green-700 font-semibold px-2 py-1 rounded-full">
                    Strong Fit
                  </span>
                </div>
                <div className="space-y-2">
                  {["React.js", "TypeScript", "System Design"].map(
                    (skill, i) => (
                      <div key={skill} className="flex items-center gap-2">
                        <span className="text-xs text-slate-600 w-24 truncate">
                          {skill}
                        </span>
                        <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-blue-500 h-full rounded-full"
                            style={{ width: `${[94, 82, 71][i]}%` }}
                          />
                        </div>
                        <span className="text-xs text-slate-500 w-7">
                          {[94, 82, 71][i]}%
                        </span>
                      </div>
                    ),
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-slate-100 rounded-xl px-4 py-3 shadow-sm">
                <div className="flex -space-x-2">
                  {["SJ", "MC", "DR"].map((init, i) => (
                    <div
                      key={i}
                      className={`w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold ${["bg-blue-500", "bg-violet-500", "bg-emerald-500"][i]}`}
                    >
                      {init}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-slate-600 font-medium">
                  Trusted by <strong>2,000+</strong> HR Teams
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-4 sm:px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4">
              Comprehensive Recruitment Intelligence
            </h2>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto">
              Our platform provides the tools you need to make data-backed
              hiring decisions and optimize your workforce strategy.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="group bg-slate-50 hover:bg-blue-50 border border-slate-100 hover:border-blue-200 rounded-2xl p-6 transition-all duration-200"
              >
                <div className="w-12 h-12 rounded-xl bg-blue-100 group-hover:bg-blue-200 flex items-center justify-center mb-4 transition-colors">
                  <Icon size={22} className="text-blue-600" />
                </div>
                <h3 className="font-bold text-slate-900 mb-2">{title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4">
              Streamlined Recruitment in 3 Steps
            </h2>
            <p className="text-lg text-slate-500 max-w-xl mx-auto">
              From raw data to actionable hiring insights in three simple steps.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map(({ number, icon: Icon, title, description }) => (
              <div
                key={title}
                className="relative flex flex-col items-center text-center"
              >
                <div className="relative mb-6">
                  <div className="w-20 h-20 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg">
                    <Icon size={32} className="text-white" />
                  </div>
                  <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-slate-900 text-white text-sm font-extrabold flex items-center justify-center">
                    {number}
                  </div>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  {title}
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 sm:px-6 bg-blue-600">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
            Ready to optimize your hiring?
          </h2>
          <p className="text-blue-100 text-lg mb-8">
            Join thousands of recruiters who are saving time and hiring better
            talent with CVNet.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup"
              className="bg-white text-blue-600 font-bold px-8 py-3.5 rounded-xl hover:bg-blue-50 transition-colors shadow-md"
            >
              Start Free Trial
            </Link>
            <Link
              href="/recruiter/dashboard"
              className="border-2 border-white text-white font-bold px-8 py-3.5 rounded-xl hover:bg-blue-700 transition-colors"
            >
              Book Demo
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 py-14 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Image
                src="/logo.jpeg"
                alt="CVNet"
                width={28}
                height={28}
                className="rounded-md object-cover"
              />
              <span className="font-bold text-white text-lg">CVNet</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Empowering the world&apos;s best HR teams with data-driven
              recruitment intelligence and skill analysis.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-sm">
              {["Features", "Integrations", "Changelog"].map((i) => (
                <li key={i}>
                  <Link
                    href="#"
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    {i}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Resources</h4>
            <ul className="space-y-2 text-sm">
              {["Documentation", "API Reference", "Blog", "Community"].map(
                (i) => (
                  <li key={i}>
                    <Link
                      href="#"
                      className="text-slate-400 hover:text-white transition-colors"
                    >
                      {i}
                    </Link>
                  </li>
                ),
              )}
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm">
              {["About", "Careers", "Legal", "Contact"].map((i) => (
                <li key={i}>
                  <Link
                    href="#"
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    {i}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-10 pt-6 border-t border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-500">
          <p>&copy; 2024 CVNet Inc. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="#" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="#" className="hover:text-white transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

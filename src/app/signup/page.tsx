'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, User, AlertCircle } from 'lucide-react';

/* Signup Backend part */
import { authService } from '@/services/authService';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
  const [formData, setFormData] = useState({ fullName: '', email: '', password: '' });
  const [isAgreed, setIsAgreed] = useState(false); 
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null); // Dynamic error mapping state
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null); // Clear previous errors
    
    if (!isAgreed) {
      setErrorMessage("Please agree to the Terms of Service and Privacy Policy first.");
      return;
    }
    
    setIsLoading(true);
    try {
      const nameParts = formData.fullName.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      await authService.signUp(
        firstName, 
        lastName, 
        formData.email, 
        formData.password, 
        'candidate', 
        "Agreed"
      );
      router.push("/dashboard"); 
    } catch (err: any) {
      // Professionally extracts custom exception string or server message
      const finalMsg = err.response?.data?.error || err.message || "An unexpected registration failure occurred.";
      setErrorMessage(finalMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setErrorMessage(null);
    if (!isAgreed) {
      setErrorMessage("Please agree to the Terms of Service and Privacy Policy first.");
      return;
    }
    try {
      await authService.loginWithGoogle("Agreed");
      router.push("/dashboard");
    } catch (err) {
      setErrorMessage("Google account linkage failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel – Promo */}
      <div className="hidden lg:flex flex-1 flex-col items-center justify-center px-12 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #2563eb 100%)' }}>
        <div className="relative z-10 text-center max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-6">
            <Image src="/logo.jpeg" alt="CVNet" width={40} height={40} className="rounded-xl object-cover" />
          </div>
          <h2 className="text-3xl font-extrabold text-white mb-4">Join 2,000+ HR Teams</h2>
          <p className="text-blue-100 text-base leading-relaxed mb-8">
            Start your free 14-day trial. No credit card required. Hire smarter, faster, and without bias.
          </p>
          <div className="space-y-3 text-left">
            {[
              'AI-powered skill gap analysis',
              'Candidate readiness scoring',
              'Real-time market trend insights',
              'Recruiter pipeline dashboard',
              'Interview question generation',
            ].map(feature => (
              <div key={feature} className="flex items-center gap-3 text-sm text-blue-100">
                <div className="w-5 h-5 rounded-full bg-green-400 flex items-center justify-center flex-shrink-0">
                  <svg viewBox="0 0 12 12" fill="none" className="w-3 h-3">
                    <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                {feature}
              </div>
            ))}
          </div>
        </div>
        <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-blue-500/20 -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-56 h-56 rounded-full bg-indigo-900/40 translate-y-1/2 -translate-x-1/2" />
      </div>

      {/* Right Panel – Form */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-12 bg-white overflow-y-auto">
        <div className="w-full max-w-md">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 mb-8">
            <Image src="/logo.jpeg" alt="CVNet" width={36} height={36} className="rounded-lg object-cover" />
            <span className="text-xl font-bold text-slate-900">CVNet</span>
          </Link>

          <h1 className="text-2xl font-extrabold text-slate-900 mb-1">Create your account</h1>
          <p className="text-slate-500 text-sm mb-6">Start your free trial. No credit card required.</p>

          {/* Social Login */}
          <div className="flex flex-col gap-3 mb-5">
            <button 
              type="button" 
              onClick={handleGoogleSignup} 
              className="flex items-center justify-center gap-3 border border-slate-200 hover:bg-slate-50 rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 transition-colors"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
                <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
                <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>
          </div>

          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 border-t border-slate-200" />
            <span className="text-xs text-slate-400 font-medium">Or continue with email</span>
            <div className="flex-1 border-t border-slate-200" />
          </div>

          {/* High-Professional Inline Error Warning Block */}
          {errorMessage && (
            <div className="flex items-start gap-2.5 bg-red-50 text-red-600 border border-red-200 rounded-xl p-3.5 text-sm mb-5 transition-all animate-in fade-in-50 duration-200">
              <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />
              <div className="font-medium">{errorMessage}</div>
            </div>
          )}

          {/* Form */}
          <form className="space-y-4" onSubmit={handleSignup}>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Full Name</label>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="Alex Johnson" 
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="email" 
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="name@company.com" 
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Create a strong password"
                  className="w-full pl-10 pr-12 py-3 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <label className="flex items-start gap-2 cursor-pointer">
              <input 
                type="checkbox" 
                required
                checked={isAgreed}
                onChange={(e) => setIsAgreed(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" 
              />
              <span className="text-xs text-slate-500">
                I agree to CVNet&apos;s{' '}
                <Link href="#" className="text-blue-600 hover:underline">Terms of Service</Link>
                {' '}and{' '}
                <Link href="#" className="text-blue-600 hover:underline">Privacy Policy</Link>
              </span>
            </label>

            <button
              type="submit"
              disabled={isLoading || !isAgreed}
              className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl text-center transition-colors shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-sm text-slate-500 text-center mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-blue-600 font-semibold hover:text-blue-700">Log In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Eye, EyeOff, Mail, Lock, AlertCircle } from "lucide-react";
import { authService } from "@/services/authService";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebaseConfig"; // Added db
import { doc, getDoc } from "firebase/firestore"; // Added Firestore methods

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();

  const getFriendlyMessage = (errorStr: string): string => {
    const cleanErr = errorStr.toLowerCase();
    if (cleanErr.includes("invalid-credential") || cleanErr.includes("user-not-found") || cleanErr.includes("wrong-password")) {
      return "The email address or password you entered is incorrect. Please check your credentials and try again.";
    }
    if (cleanErr.includes("too-many-requests")) {
      return "This account has been temporarily locked. Please reset your password or try again later.";
    }
    return errorStr || "An unexpected error occurred during authentication. Please try again.";
  };

  // ✅ NEW: Read Firestore Role and route dynamically
  const routeUserBasedOnRole = async (uid: string) => {
    try {
      const userDocRef = doc(db, "users", uid);
      const userDocSnap = await getDoc(userDocRef);
      
      const role = userDocSnap.exists() ? userDocSnap.data().role : "candidate";

      if (role === "admin") {
        window.location.href = "/admin/users"; 
      } else if (role === "company") {
        window.location.href = "/recruiter/dashboard"; 
      } else {
        window.location.href = "/dashboard"; 
      }
    } catch (error) {
      console.error("Failed to fetch role, defaulting:", error);
      window.location.href = "/dashboard";
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      await authService.login(email, password);
      // Wait for Firebase to register the user context, then route
      if (auth.currentUser) {
        await routeUserBasedOnRole(auth.currentUser.uid);
      } else {
        window.location.href = "/dashboard";
      }
    } catch (error: any) {
      if (auth.currentUser || document.cookie.includes("cvnet_token")) {
        if (auth.currentUser) await routeUserBasedOnRole(auth.currentUser.uid);
        else window.location.href = "/dashboard";
        return;
      }
      const rawMessage = error.response?.data?.error || error.message;
      setErrorMessage(getFriendlyMessage(rawMessage));
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      await authService.loginWithGoogle();
      if (auth.currentUser) {
        await routeUserBasedOnRole(auth.currentUser.uid);
      } else {
        window.location.href = "/dashboard";
      }
    } catch (error: any) {
      if (auth.currentUser || document.cookie.includes("cvnet_token")) {
        if (auth.currentUser) await routeUserBasedOnRole(auth.currentUser.uid);
        else window.location.href = "/dashboard";
        return;
      }
      const rawMessage = error.response?.data?.error || error.message;
      setErrorMessage(getFriendlyMessage(rawMessage || "Google Auth Failed"));
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel – Form */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-12 bg-white">
        <div className="w-full max-w-md">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 mb-10">
            <Image
              src="/logo.jpeg"
              alt="CVNet"
              width={36}
              height={36}
              className="rounded-lg object-cover"
            />
            <span className="text-xl font-bold text-slate-900">CVNet</span>
          </Link>

          <h1 className="text-2xl font-extrabold text-slate-900 mb-1">Welcome Back</h1>
          <p className="text-slate-500 text-sm mb-8">Log in to access your dashboard.</p>

          <div className="flex flex-col gap-3 mb-6">
            <button 
              type="button"
              disabled={isLoading}
              onClick={handleGoogleLogin}
              className="flex items-center justify-center gap-3 border border-slate-200 hover:bg-slate-50 rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 transition-colors disabled:opacity-50 w-full"> 
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
                <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
                <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
              </svg>
              Sign in with Google
            </button>
          </div>

          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 border-t border-slate-200" />
            <span className="text-xs text-slate-400 font-medium">Or continue with</span>
            <div className="flex-1 border-t border-slate-200" />
          </div>

          {errorMessage && (
            <div className="flex items-start gap-2.5 bg-red-50 text-red-600 border border-red-200 rounded-xl p-3.5 text-sm mb-6 transition-all">
              <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />
              <div className="font-medium leading-relaxed">{errorMessage}</div>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleLogin}>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@company.com" className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type={showPassword ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full pl-10 pr-12 py-3 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                <span className="text-sm text-slate-600 select-none">Remember Me</span>
              </label>
              <Link href="#" className="text-sm font-semibold text-blue-600 hover:text-blue-700">Forgot password?</Link>
            </div>

            <button type="submit" disabled={isLoading} className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl text-center transition-colors shadow-sm disabled:opacity-50 mt-4">
              {isLoading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="text-sm text-slate-500 text-center mt-6">
            Don&apos;t have an account? <Link href="/signup" className="text-blue-600 font-semibold hover:text-blue-700">Sign Up</Link>
          </p>
        </div>
      </div>

      <div className="hidden lg:flex flex-1 flex-col items-center justify-center px-12 relative overflow-hidden" style={{ background: "linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #3b82f6 100%)" }}>
        <div className="relative z-10 text-center max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-6">
            <Image src="/logo.jpeg" alt="CVNet" width={40} height={40} className="rounded-xl object-cover" />
          </div>
          <h2 className="text-3xl font-extrabold text-white mb-4">Unlock Your Data Potential</h2>
          <p className="text-blue-100 text-base leading-relaxed mb-8">Join CVNet to access powerful analytics, real-time insights, and advanced dashboarding tools tailored for your business needs.</p>
        </div>
        <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-blue-400/20 -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-56 h-56 rounded-full bg-indigo-900/40 translate-y-1/2 -translate-x-1/2" />
      </div>
    </div>
  );
}
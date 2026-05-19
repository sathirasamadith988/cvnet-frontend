"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User, signOut } from "firebase/auth";
import { auth } from "@/lib/firebaseConfig";
import { useRouter, usePathname } from "next/navigation";

const AuthContext = createContext<{ user: User | null; loading: boolean }>({
  user: null,
  loading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        const token = await currentUser.getIdToken();
        // Set secure session cookie
        document.cookie = `cvnet_token=${token}; path=/; max-age=3600; SameSite=Strict; Secure`;
      } else {
        // Clear cookie cleanly
        document.cookie = "cvnet_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  /**
   * FIX 1: PROACTIVE TOKEN REFRESH INTERVAL (For continuous 1-hour working)
   * This runs in the background and fetches a fresh JWT token every 10 minutes,
   * keeping the cookie alive indefinitely while the user is actively working.
   */
  useEffect(() => {
    const handleRefresh = async () => {
      if (auth.currentUser) {
        console.log("🔄 Background refresh: Extending authorization cookie lifespan...");
        const freshToken = await auth.currentUser.getIdToken(true); // true forces token refresh
        document.cookie = `cvnet_token=${freshToken}; path=/; max-age=3600; SameSite=Strict; Secure`;
      }
    };

    // Refresh every 10 minutes (600,000 ms)
    const interval = setInterval(handleRefresh, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, [user]);

  /**
   * FIX 2: IDLE AUTO-REFRESH & FIREBASE CLEANUP RE-LOGIN FIX
   * If the user is on a protected route and the cookie disappears due to idleness,
   * we force an explicit Firebase logout and snap them to the login page.
   * This completely avoids the stuck UI/no-login bug.
   */
  useEffect(() => {
    // Define your public paths
    const publicRoutes = ["/login", "/signup", "/"];
    const isPublicRoute = publicRoutes.includes(pathname);

    if (!isPublicRoute) {
      const checkCookieInterval = setInterval(async () => {
        const hasTokenCookie = document.cookie.split("; ").some((row) => row.startsWith("cvnet_token="));

        // If cookie has vanished but Firebase still thinks we're logged in
        if (!hasTokenCookie && auth.currentUser) {
          console.log("🚨 Session Cookie Expired via Idleness! Executing explicit cleanup...");
          clearInterval(checkCookieInterval);
          
          // Force a full Firebase clean sign-out to unlock the login UI state
          await signOut(auth);
          
          // Push them back to the login screen seamlessly
          router.push("/login");
        }
      }, 5000); // Scans cookie presence every 5 seconds

      return () => clearInterval(checkCookieInterval);
    }
  }, [pathname, router]);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
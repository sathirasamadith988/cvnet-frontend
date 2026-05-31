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

  // 1. Core Authentication Listener Configuration
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        const token = await currentUser.getIdToken();
        document.cookie = `cvnet_token=${token}; path=/; max-age=3600; SameSite=Strict; Secure`;
      } else {
        document.cookie = "cvnet_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Strict; Secure";
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 2. Proactive Background Token Refresher
  useEffect(() => {
    if (!user) return; // Only run if a user session is active

    const handleRefresh = async () => {
      if (auth.currentUser) {
        try {
          console.log("🔄 Background refresh: Extending authorization cookie lifespan...");
          const freshToken = await auth.currentUser.getIdToken(true);
          document.cookie = `cvnet_token=${freshToken}; path=/; max-age=3600; SameSite=Strict; Secure`;
        } catch (err: any) {
          console.error("Failed to silently rotate security token context", err);
          
          // ✅ FIX: Catch expired/revoked token states explicitly and force-clear the broken state
          if (err.code === "auth/user-token-expired" || err.message?.includes("expired")) {
            console.warn("🚨 Stale session token detected in background check. Redirecting to login...");
            
            // 1. Clear cookie instantly
            document.cookie = "cvnet_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict; Secure";
            
            // 2. Wipe client session state
            setUser(null);
            await signOut(auth);
            
            // 3. Force clean route change
            router.push("/login");
          }
        }
      }
    };

    const interval = setInterval(handleRefresh, 10 * 60 * 1000); // 10 Minutes
    return () => clearInterval(interval); 
  }, [user, router]);

  // 3. Memory-Safe Idle Cookie Scanner Loop
  useEffect(() => {
    const publicRoutes = ["/login", "/signup", "/"];
    const isPublicRoute = publicRoutes.includes(pathname);

    if (isPublicRoute) return;

    const checkCookieInterval = setInterval(async () => {
      const hasTokenCookie = document.cookie.split("; ").some((row) => row.startsWith("cvnet_token="));

      if (!hasTokenCookie && auth.currentUser) {
        console.log("🚨 Session Cookie Expired via Idleness! Executing memory cleanup...");
        
        clearInterval(checkCookieInterval);
        setUser(null);
        await signOut(auth);
        router.push("/login");
      }
    }, 5000); // Scan interval safely every 5 seconds

    return () => clearInterval(checkCookieInterval);
  }, [pathname, user, router]); 

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
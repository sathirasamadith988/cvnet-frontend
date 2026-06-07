"use client";

import { useEffect, useState } from "react";
import { Loader2, ShieldAlert, Briefcase, LogOut } from "lucide-react"; // ✅ Added LogOut icon
import axios from "axios";
import { auth } from "@/lib/firebaseConfig";
import { signOut } from "firebase/auth"; // ✅ Added Firebase signOut

type UserRecord = {
  uid: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingUid, setProcessingUid] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await axios.get("http://localhost:5167/api/Admin/users", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(res.data);
    } catch (error) {
      console.error("Failed to fetch users", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const unsub = auth.onAuthStateChanged((user) => { if (user) fetchUsers(); });
    return () => unsub();
  }, []);

  const handleMakeCompany = async (user: UserRecord) => {
    if (user.role === "company") return;

    const confirm = window.confirm(`WARNING: Changing ${user.firstName} to a Company will permanently wipe their Candidate CV, Skills, and Job Applications. Proceed?`);
    if (!confirm) return;

    setProcessingUid(user.uid);
    try {
      const token = await auth.currentUser?.getIdToken();
      await axios.post("http://localhost:5167/api/Admin/make-company", {
        uid: user.uid,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      }, { headers: { Authorization: `Bearer ${token}` } });
      
      await fetchUsers(); // Refresh list after success
    } catch (error) {
      console.error("Failed to change role", error);
      alert("Role update failed.");
    } finally {
      setProcessingUid(null);
    }
  };

  // ✅ NEW: Logout Handler
  const handleLogout = async () => {
    try {
      await signOut(auth);
      window.location.href = "/login"; // Redirect to login page
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  if (isLoading) return <div className="flex justify-center mt-20"><Loader2 className="animate-spin text-blue-600" size={40} /></div>;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      
      {/* ✅ UPDATED: Header area now includes the Log Out button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-slate-900 text-white rounded-xl flex items-center justify-center">
            <ShieldAlert size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900">Admin Command Center</h1>
            <p className="text-sm font-medium text-slate-500">Manage user roles and platform access.</p>
          </div>
        </div>

        {/* Log Out Button */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 bg-white border border-slate-200 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 text-slate-600 px-4 py-2.5 rounded-xl text-sm font-bold transition-colors shadow-sm"
        >
          <LogOut size={16} />
          Log Out
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-left">
              <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">User Details</th>
              <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Current Role</th>
              <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((u) => (
              <tr key={u.uid} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <p className="font-bold text-slate-900">{u.firstName} {u.lastName}</p>
                  <p className="text-xs text-slate-500">{u.email}</p>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${
                    u.role === "company" ? "bg-indigo-100 text-indigo-700" : u.role === "admin" ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"
                  }`}>
                    {u.role || "candidate"}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  {u.role === "candidate" && (
                    <button
                      onClick={() => handleMakeCompany(u)}
                      disabled={processingUid === u.uid}
                      className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white px-4 py-2 rounded-lg text-xs font-bold transition-colors"
                    >
                      {processingUid === u.uid ? <Loader2 size={14} className="animate-spin" /> : <Briefcase size={14} />}
                      Convert to Company
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

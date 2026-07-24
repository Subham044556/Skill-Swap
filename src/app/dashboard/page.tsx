"use client";

import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import {
  LayoutDashboard,
  User,
  Settings,
  LogOut,
  Bell,
  Search,
  ExternalLink,
  ShieldCheck,
  Zap,
  Activity,
  Menu,
  X,
  FileText,
  Code2,
  FolderKanban,
} from "lucide-react";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-slate-600 font-medium">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const userAvatar = session.user?.image || "/default-avatar.png";
  const userName = session.user?.name || "User";
  const userEmail = session.user?.email || "No email provided";

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-800">
      {/* Mobile Sidebar Backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 flex flex-col justify-between transform transition-transform duration-200 ease-in-out ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div>
          {/* Brand Header */}
          <div className="h-16 flex items-center justify-between px-6 border-b border-slate-100">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-md shadow-indigo-200">
                sX
              </div>
              <span className="font-bold text-slate-900 text-lg tracking-tight">
                SkiiLLX
              </span>
            </div>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1">
            <a
              href="#"
              className="flex items-center gap-3 px-3.5 py-2.5 text-sm font-semibold text-indigo-600 bg-indigo-50/80 rounded-xl transition-colors"
            >
              <LayoutDashboard className="w-4 h-4 text-indigo-600" />
              Overview
            </a>
            <a
              href="/profile"
              className="flex items-center gap-3 px-3.5 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 rounded-xl transition-colors"
            >
              <User className="w-4 h-4 text-slate-400" />
              Profile Settings
            </a>
            <a
              href="#"
              className="flex items-center gap-3 px-3.5 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 rounded-xl transition-colors"
            >
              <Settings className="w-4 h-4 text-slate-400" />
              Preferences
            </a>
          </nav>
        </div>

        {/* Sidebar Footer User Info & Sign Out */}
        <div className="p-4 border-t border-slate-100 space-y-3">
          <div className="flex items-center gap-3 px-2 py-1.5">
            <div className="relative w-9 h-9 rounded-full overflow-hidden border border-slate-200 shrink-0">
              <Image
                src={userAvatar}
                alt={userName}
                fill
                className="object-cover"
              />
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-slate-900 truncate">{userName}</p>
              <p className="text-xs text-slate-400 truncate">{userEmail}</p>
            </div>
          </div>

          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100/80 rounded-lg transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-8 flex items-center justify-between gap-4 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 lg:hidden"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="relative hidden sm:block w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search resources..."
                className="w-full pl-9 pr-4 py-1.5 bg-slate-100 border border-transparent rounded-lg text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button 
              aria-label="Notifications" 
              className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 relative transition-colors"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-600 rounded-full" />
            </button>
            <div className="h-6 w-px bg-slate-200" />
            <div className="flex items-center gap-2.5">
              <div className="relative w-8 h-8 rounded-full overflow-hidden border border-slate-200">
                <Image
                  src={userAvatar}
                  alt={userName}
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Body */}
        <main className="p-4 sm:p-8 space-y-8 max-w-7xl mx-auto w-full">
          {/* Welcome Banner */}
          <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-700 rounded-2xl p-6 sm:p-8 text-white shadow-xl shadow-indigo-600/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 backdrop-blur-md border border-white/10 text-indigo-100">
                <Zap className="w-3.5 h-3.5 text-amber-300" /> Account Active
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                Welcome back, {userName}!
              </h1>
              <p className="text-indigo-100/90 text-sm max-w-lg">
                Manage your account credentials, keep your profile details up to date, and explore your integrated tools.
              </p>
            </div>

            <a
              href="/profile"
              className="shrink-0 bg-white hover:bg-indigo-50 text-indigo-700 font-semibold text-sm px-4 py-2.5 rounded-xl shadow-sm flex items-center gap-2 transition-all duration-150 active:scale-95"
            >
              <span>Edit Profile</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>

          

          {/* Quick Actions / Shortcuts Section */}
          <div>
            <h2 className="text-lg font-bold text-slate-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <a
                href="/profile"
                className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <User className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                  Edit Public Profile
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Update your bio, college, location, and social links.
                </p>
              </a>

              <a
                href="/portfolio"
                className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center mb-4 group-hover:bg-violet-600 group-hover:text-white transition-colors">
                  <FolderKanban className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                  Projects & Portfolio
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Manage featured repositories and showcased work.
                </p>
              </a>

              <a
                href="/accountPreferences"
                className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center mb-4 group-hover:bg-slate-800 group-hover:text-white transition-colors">
                  <Settings className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                  Account Preferences
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Configure notification triggers and security settings.
                </p>
              </a>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
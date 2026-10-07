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
  Zap,
  Menu,
  X,
  Sparkles,
  RefreshCw,
} from "lucide-react";

// Partner suggestion interface returned from /api/suggestions
interface PartnerSuggestion {
  id: string;
  partnerName: string;
  partnerImage: string | null;
  skillOffered: string;
  category: string;
  matchScore: string;
  description: string;
  available: boolean;
}

// Mock user object for development bypass (no need to sign in every time during dev)
const DEV_MOCK_USER = {
  name: "Admin Developer",
  email: "admin@skillswap.com",
  image: "https://lh3.googleusercontent.com/a/default-user", // Or a local SVG path like "/default-avatar.png"
};

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Suggestions state typed correctly with PartnerSuggestion
  const [suggestions, setSuggestions] = useState<PartnerSuggestion[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [sentRequests, setSentRequests] = useState<Record<string, boolean>>({});
  const [suggestionMode, setSuggestionMode] = useState<"matched" | "random">("random");

  const isDev = process.env.NODE_ENV === "development";

  // Priority: Real NextAuth session > Development Mock User fallback
  const activeUser = session?.user || (isDev ? DEV_MOCK_USER : null);

  useEffect(() => {
    // Only redirect if NOT in development mode AND unauthenticated
    if (!isDev && status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, router, isDev]);

  // Function to fetch real backend suggestions
  const handleGenerateSuggestions = async () => {
    setIsLoadingSuggestions(true);
    setShowSuggestions(true);

    try {
      const res = await fetch("/api/suggestions");
      const data = await res.json();

      if (res.ok) {
        setSuggestions(data.suggestions || []);
      } else {
        console.error(data.error);
      }
    } catch (err) {
      console.error("Failed to load suggestions", err);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  // Function to fetch suggestions based on selected mode
  const handleFetchSuggestions = async (mode: "matched" | "random") => {
    setIsLoadingSuggestions(true);
    setShowSuggestions(true);
    setSuggestionMode(mode);

    try {
      const res = await fetch(`/api/suggestions?mode=${mode}&t=${Date.now()}`, {
        cache: "no-store",
      });
      const data = await res.json();

      if (res.ok) {
        setSuggestions(data.suggestions || []);
      } else {
        console.error(data.error);
      }
    } catch (err) {
      console.error("Failed to load suggestions", err);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  // Function to send a real swap request
  const handleSendRequest = async (receiverId: string) => {
    try {
      const res = await fetch("/api/swap-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiverId }),
      });

      const data = await res.json();

      if (res.ok) {
        setSentRequests((prev) => ({ ...prev, [receiverId]: true }));
      } else {
        alert(data.message || data.error || "Failed to send request");
      }
    } catch (err) {
      console.error("Failed to send request", err);
    }
  };

  if (!isDev && status === "loading") {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-slate-600 font-medium">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  if (!activeUser) {
    return null;
  }

  const userAvatar = activeUser.image || "/default-avatar.png";
  const userName = activeUser.name || "Admin Swapper";
  const userEmail = activeUser.email || "admin@skillswap.com";

  return (
    <div className="min-h-screen bg-[#EDDFEF] flex font-sans text-slate-800">
      {/* Mobile Sidebar Backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 flex flex-col justify-between transform transition-transform duration-200 ease-in-out ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
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
              href="/accountPreferences"
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
          <div className="bg-gradient-to-r from-[#4C2719] to-[#3E6990] rounded-2xl p-6 sm:p-8 text-white shadow-xl shadow-indigo-600/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 backdrop-blur-md border border-white/10 text-indigo-100">
                <Zap className="w-3.5 h-3.5 text-amber-300" /> Account Active
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                Welcome back, {userName}!
              </h1>
              <p className="text-indigo-100/90 text-sm max-w-lg">
                What would you like to do today? Explore new skills, manage your profile, or check out your preferences.
              </p>
            </div>

            {/* Action Button */}
            <button
              onClick={handleGenerateSuggestions}
              disabled={isLoadingSuggestions}
              className="shrink-0 bg-[#FCAB64] hover:bg-[#fca254] text-[#4C2719] font-bold text-sm px-5 py-3 rounded-xl shadow-md flex items-center gap-2 transition-all duration-150 active:scale-95 disabled:opacity-75"
            >
              {isLoadingSuggestions ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-[#791E94]" />
                  <span>Generate Suggestions</span>
                </>
              )}
            </button>

            {/* BUTTON 1: Match Database Interests */}
            <button
              onClick={() => handleFetchSuggestions("matched")}
              disabled={isLoadingSuggestions}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm px-4 py-3 rounded-xl shadow-md flex items-center gap-2 transition-all duration-150 active:scale-95 disabled:opacity-75"
            >
              {isLoadingSuggestions && suggestionMode === "matched" ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <User className="w-4 h-4 text-indigo-200" />
              )}
              <span>Find Interest Matches</span>
            </button>

            {/* BUTTON 2: Generate Random Skills */}
            <button
              onClick={() => handleFetchSuggestions("random")}
              disabled={isLoadingSuggestions}
              className="bg-[#FCAB64] hover:bg-[#fca254] text-[#4C2719] font-bold text-sm px-4 py-3 rounded-xl shadow-md flex items-center gap-2 transition-all duration-150 active:scale-95 disabled:opacity-75"
            >
              {isLoadingSuggestions && suggestionMode === "random" ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4 text-[#791E94]" />
              )}
              <span>Explore Random Skills</span>
            </button>

          </div>

          {/* Dynamic Suggestions Section */}
          {showSuggestions && (
            <section className="space-y-4 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-600" />
                  <h2 className="text-xl font-bold text-slate-900">
                    {suggestionMode === "matched" ? "Direct Swapper Matches" : "Explore Random Skills"}
                  </h2>
                </div>
                <span className="text-xs font-medium text-slate-500 bg-white/60 px-2.5 py-1 rounded-full border border-slate-200">
                  {suggestionMode === "matched" ? "Based on your Wanted Skills" : "Discover New Topics"}
                </span>
              </div>

              {isLoadingSuggestions ? (
                /* Skeleton Loading */
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="bg-white/70 border border-slate-200/80 rounded-2xl p-5 h-48 animate-pulse flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        <div className="h-4 bg-slate-200 rounded w-1/3" />
                        <div className="h-5 bg-slate-200 rounded w-3/4" />
                        <div className="h-3 bg-slate-200 rounded w-full" />
                      </div>
                      <div className="h-8 bg-slate-200 rounded-lg w-full" />
                    </div>
                  ))}
                </div>
              ) : suggestions.length === 0 ? (
                <div className="p-8 bg-white rounded-2xl border border-slate-200 text-center">
                  <p className="text-sm text-slate-600">
                    {suggestionMode === "matched"
                      ? "No matching swappers found. Try adding more wanted skills in Preferences!"
                      : "No suggestions generated yet."}
                  </p>
                </div>
              ) : (
                /* Real Suggestions Grid */
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {suggestions.map((item: any) => {
                    // --- CARD TYPE 1: RANDOM SKILL TOPIC ---
                    if (item.isTopic || suggestionMode === "random") {
                      return (
                        <div
                          key={item.id}
                          className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between gap-4"
                        >
                          <div className="space-y-3">
                            {/* Category Header & Available Badge */}
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-600">
                                {item.category}
                              </span>
                              <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-600">
                                Available Now
                              </span>
                            </div>

                            {/* Skill Title */}
                            <h3 className="font-bold text-slate-900 text-base leading-snug">
                              {item.skillName || item.skillOffered}
                            </h3>

                            {/* Skill Description */}
                            <p className="text-xs text-slate-600 leading-relaxed">
                              {item.description}
                            </p>
                          </div>

                          {/* Skill Topic Action Button */}
                          <button
                            onClick={() => router.push("/accountPreferences")}
                            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-xs font-semibold rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition-colors"
                          >
                            <span>Add to Wanted Skills +</span>
                          </button>
                        </div>
                      );
                    }

                    // --- CARD TYPE 2: USER INTEREST MATCH ---
                    return (
                      <div
                        key={item.id}
                        className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between gap-4"
                      >
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-600">
                              {item.category}
                            </span>
                            <span
                              className={`text-xs font-bold px-2 py-0.5 rounded-md ${item.available
                                  ? "bg-emerald-50 text-emerald-600"
                                  : "bg-slate-100 text-slate-500"
                                }`}
                            >
                              {item.available ? "Available Now" : "Busy"}
                            </span>
                          </div>

                          {/* Partner Profile Info */}
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden relative border border-slate-100 shrink-0">
                              {item.partnerImage ? (
                                <Image
                                  src={item.partnerImage}
                                  alt={item.partnerName}
                                  fill
                                  className="object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center font-bold text-slate-500 text-sm">
                                  {item.partnerName[0]}
                                </div>
                              )}
                            </div>
                            <div>
                              <h3 className="font-bold text-slate-900 text-sm">
                                {item.partnerName}
                              </h3>
                              <p className="text-xs text-indigo-600 font-medium">
                                Teaches: {item.skillOffered}
                              </p>
                            </div>
                          </div>

                          <p className="text-xs text-slate-600 leading-relaxed">
                            {item.description}
                          </p>
                        </div>

                        {/* Direct Swap Action Button */}
                        <button
                          onClick={() => handleSendRequest(item.id)}
                          disabled={sentRequests[item.id]}
                          className={`w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold rounded-xl transition-colors ${sentRequests[item.id]
                              ? "bg-emerald-50 text-emerald-600 border border-emerald-200 cursor-default"
                              : "bg-indigo-600 text-white hover:bg-indigo-700"
                            }`}
                        >
                          {sentRequests[item.id] ? "Request Sent ✓" : "Send Swap Request"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          )}
        </main>
      </div>
    </div>
  );
}
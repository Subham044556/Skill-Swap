"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import Sidebar from "@/components/Sidebar";

import {
  Bell,
  Search,
  Zap,
  Menu,
  X,
  Sparkles,
  RefreshCw,
  User,
  BookOpen,
} from "lucide-react";

// Partner suggestion interface returned from /api/suggestions
interface PartnerSuggestion {
  id: string;
  partnerName?: string;
  partnerImage?: string | null;
  skillName?: string;
  skillOffered?: string;
  category: string;
  matchScore: string;
  description: string;
  available: boolean;
  isTopic?: boolean;
}

interface WantedSkillItem {
  id: string;
  name: string;
  category: string;
}

// Mock user object for development bypass
const DEV_MOCK_USER = {
  name: "Admin Developer",
  email: "admin@skillswap.com",
  image: "https://lh3.googleusercontent.com/a/default-user",
  createdAt: new Date().toISOString(),
};

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [welcomeMessage, setWelcomeMessage] = useState<string | null>(null);

  // Suggestions state
  const [suggestions, setSuggestions] = useState<PartnerSuggestion[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [sentRequests, setSentRequests] = useState<Record<string, boolean>>({});
  const [suggestionMode, setSuggestionMode] = useState<"matched" | "random">("random");

  // Wanted skills state
  const [myWantedSkills, setMyWantedSkills] = useState<WantedSkillItem[]>([]);
  const [addingSkillName, setAddingSkillName] = useState<string | null>(null);
  
  const [isSavingPreferences, setIsSavingPreferences] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const isDev = process.env.NODE_ENV === "development";

  // Resolve active user (NextAuth session or dev mock)
  const activeUser = session?.user || (isDev ? DEV_MOCK_USER : null);

  useEffect(() => {
    // Only redirect if NOT in development mode AND unauthenticated
    if (!isDev && status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, router, isDev]);

  // Load welcome message
  useEffect(() => {
    const loadWelcomeMessage = async () => {
      try {
        const res = await fetch("/api/user/welcome", {
          cache: "no-store",
        });

        if (!res.ok) {
          setWelcomeMessage("Welcome to SkillX!");
          return;
        }

        const data = await res.json();
        setWelcomeMessage(data.message);
      } catch (error) {
        console.error("Failed to load welcome message:", error);
        setWelcomeMessage("Welcome to SkillX!");
      }
    };

    if (activeUser) {
      loadWelcomeMessage();
    }
  }, [activeUser?.email]);

  // Load user's wanted skills on mount
  useEffect(() => {
    async function loadWantedSkills() {
      try {
        const res = await fetch("/api/skillPreferences");
        if (res.ok) {
          const data = await res.json();
          setMyWantedSkills(data.wantedSkills || []);
        }
      } catch (err) {
        console.error("Failed to load wanted skills:", err);
      }
    }

    if (activeUser) {
      loadWantedSkills();
    }
  }, [activeUser?.email]);

  // Function to add a skill directly from the random suggestions card
  const handleAddWantedSkill = async (skillName: string, category: string) => {
    if (!skillName) return;

    // Prevent duplicate additions in UI
    const alreadyExists = myWantedSkills.some(
      (s) => s.name.toLowerCase() === skillName.toLowerCase()
    );
    if (alreadyExists) return;

    setAddingSkillName(skillName);

    // Optimistic UI update
    const tempId = `temp-${Date.now()}`;
    const newSkillItem: WantedSkillItem = { id: tempId, name: skillName, category };
    setMyWantedSkills((prev) => [...prev, newSkillItem]);

    try {
      const res = await fetch("/api/skillPreferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skillName, category }),
      });

      if (!res.ok) {
        // Rollback on server failure
        setMyWantedSkills((prev) => prev.filter((s) => s.id !== tempId));
      }
    } catch (err) {
      console.error("Failed to save wanted skill:", err);
      setMyWantedSkills((prev) => prev.filter((s) => s.id !== tempId));
    } finally {
      setAddingSkillName(null);
    }
  };

  // Function to remove a wanted skill
  const handleRemoveWantedSkill = async (skillName: string) => {
    setMyWantedSkills((prev) => prev.filter((s) => s.name !== skillName));
    try {
      await fetch("/api/skillPreferences", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skillName }),
      });
    } catch (err) {
      console.error("Failed to delete wanted skill:", err);
    }
  };

  // Function to fetch suggestions based on mode
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
      console.error("Failed to load suggestions:", err);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  // Function to sync all currently tracked wanted skills directly to preferences
const handleSaveAllWantedSkills = async () => {
  if (myWantedSkills.length === 0) return;

  setIsSavingPreferences(true);
  setSaveSuccess(false);

  try {
    const res = await fetch("/api/skillPreferences", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        // Hits Case 1 in your route (batch array save)
        skills: myWantedSkills.map((s) => ({
          name: s.name,
          category: s.category || "General",
        })),
      }),
    });

    if (res.ok) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } else {
      const err = await res.json().catch(() => ({}));
      alert(err.error || "Failed to sync preferences");
    }
  } catch (error) {
    console.error("Failed to save preferences:", error);
    alert("An error occurred while saving.");
  } finally {
    setIsSavingPreferences(false);
  }
};

  // Function to send a swap request
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
      console.error("Failed to send request:", err);
    }
  };

  if (!isDev && status === "loading") {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-slate-600 font-medium">
            Loading dashboard...
          </span>
        </div>
      </div>
    );
  }

  if (!activeUser) {
    return null;
  }

  const userAvatar = activeUser.image || "/default-avatar.png";
  const userName = activeUser.name || "Admin Swapper";

  return (
    <div className="min-h-screen bg-[#EDDFEF] flex font-sans text-slate-800">
      {/* Reusable Sidebar Component */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

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
                  unoptimized
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
                <Zap className="w-3.5 h-3.5 text-amber-300" />
                {welcomeMessage?.startsWith("Welcome back")
                  ? "Welcome Back"
                  : "Account Active"}
              </span>

              {/* Dynamic Heading */}
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                {welcomeMessage || "Welcome to SkillX!"}
              </h1>

              {/* Dynamic Subtitle */}
              <p className="text-indigo-100/90 text-sm max-w-lg leading-relaxed">
                {welcomeMessage?.startsWith("Welcome back")
                  ? "Ready for another swap? Explore trending skills, check your requests, or discover new partners."
                  : "We're glad to have you! Jumpstart your journey by exploring topics below or setting your wanted and offered skills in preferences."}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 shrink-0">
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
                <span>Find Interest Suggestions</span>
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
          </div>

          {/* My Wanted Skills Shelf Section */}
          <section className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
  {/* Header with Title and Save Button */}
  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
    <div className="flex items-center gap-2">
      <BookOpen className="w-5 h-5 text-indigo-600" />
      <h2 className="text-base sm:text-lg font-bold text-slate-900">
        My Wanted Skills
      </h2>
      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600">
        {myWantedSkills.length}
      </span>
      <span className="text-xs text-slate-400 hidden sm:inline ml-2">
        • Skills you are looking to learn
      </span>
    </div>

    {/* Save Action Area */}
    <div className="flex items-center gap-3 self-end sm:self-auto">
      {saveSuccess && (
        <span className="text-xs font-semibold text-emerald-600 animate-pulse">
          Saved to Preferences ✓
        </span>
      )}
      <button
        type="button"
        onClick={handleSaveAllWantedSkills}
        disabled={isSavingPreferences || myWantedSkills.length === 0}
        className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold text-xs rounded-xl shadow-sm transition-all duration-150 flex items-center gap-1.5 active:scale-95 disabled:cursor-not-allowed"
      >
        {isSavingPreferences ? (
          <>
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            <span>Saving...</span>
          </>
        ) : (
          <span>Save to Preferences</span>
        )}
      </button>
    </div>
  </div>

  {/* Empty State or Skills List */}
  {myWantedSkills.length === 0 ? (
    <div className="p-6 border border-dashed border-slate-200 rounded-xl text-center">
      <p className="text-xs sm:text-sm text-slate-500">
        You haven&apos;t added any wanted skills yet. Click{" "}
        <span className="font-semibold text-slate-700">
          &quot;Add to Wanted Skills +&quot;
        </span>{" "}
        on any card below to track it here!
      </p>
    </div>
  ) : (
    <div className="flex flex-wrap gap-2.5">
      {myWantedSkills.map((skill) => (
        <div
          key={skill.id}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-indigo-100 bg-indigo-50/70 hover:bg-indigo-50 hover:border-indigo-200 transition-colors"
        >
          <span className="text-xs font-semibold text-indigo-950">
            {skill.name}
          </span>
          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-white text-indigo-600 border border-indigo-100">
            {skill.category}
          </span>
          <button
            type="button"
            onClick={() => handleRemoveWantedSkill(skill.name)}
            title="Remove skill"
            className="text-indigo-400 hover:text-rose-600 transition-colors p-0.5 rounded"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  )}
</section>

          {/* Dynamic Suggestions Section */}
          {showSuggestions && (
            <section className="space-y-4 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-600" />
                  <h2 className="text-xl font-bold text-slate-900">
                    {suggestionMode === "matched"
                      ? "Direct Swapper Matches"
                      : "Explore Random Skills"}
                  </h2>
                </div>
                <span className="text-xs font-medium text-slate-500 bg-white/60 px-2.5 py-1 rounded-full border border-slate-200">
                  {suggestionMode === "matched"
                    ? "Based on your Wanted Skills"
                    : "Discover New Topics"}
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
                    const skillTitle = item.skillName || item.skillOffered || item.name || item.title || "";
                    const isAlreadyWanted = myWantedSkills.some(
                      (s) => s.name.toLowerCase() === skillTitle?.toLowerCase()
                    );
                    const isAddingThis = addingSkillName === skillTitle;

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

                            <h3 className="font-bold text-slate-900 text-base leading-snug">
                              {skillTitle}
                            </h3>

                            <p className="text-xs text-slate-600 leading-relaxed">
                              {item.description}
                            </p>
                          </div>

                          <button
                            onClick={() =>
                              handleAddWantedSkill(skillTitle, item.category)
                            }
                            disabled={isAlreadyWanted || isAddingThis}
                            className={`w-full flex items-center justify-center gap-2 px-3 py-2.5 text-xs font-semibold rounded-xl transition-all duration-150 active:scale-95 ${
                              isAlreadyWanted
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default"
                                : "bg-slate-900 text-white hover:bg-slate-800"
                            }`}
                          >
                            {isAlreadyWanted ? (
                              <span>Added to Wanted Skills ✓</span>
                            ) : isAddingThis ? (
                              <>
                                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                <span>Adding...</span>
                              </>
                            ) : (
                              <span>Add to Wanted Skills +</span>
                            )}
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
                              className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                                item.available
                                  ? "bg-emerald-50 text-emerald-600"
                                  : "bg-slate-100 text-slate-500"
                              }`}
                            >
                              {item.available ? "Available Now" : "Busy"}
                            </span>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden relative border border-slate-100 shrink-0">
                              {item.partnerImage ? (
                                <Image
                                  src={item.partnerImage}
                                  alt={item.partnerName || "User"}
                                  fill
                                  className="object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center font-bold text-slate-500 text-sm">
                                  {(item.partnerName || "U")[0]}
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

                        <button
                          onClick={() => handleSendRequest(item.id)}
                          disabled={sentRequests[item.id]}
                          className={`w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold rounded-xl transition-colors ${
                            sentRequests[item.id]
                              ? "bg-emerald-50 text-emerald-600 border border-emerald-200 cursor-default"
                              : "bg-indigo-600 text-white hover:bg-indigo-700"
                          }`}
                        >
                          {sentRequests[item.id]
                            ? "Request Sent ✓"
                            : "Send Swap Request"}
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
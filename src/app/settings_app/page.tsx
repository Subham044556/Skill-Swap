"use client";

import React, { useState } from "react";
import Sidebar from "@/components/Sidebar";
import {
  Settings,
  Bell,
  Shield,
  KeyRound,
  Globe,
  Save,
  Trash2,
  AlertTriangle,
  Menu,
} from "lucide-react";

export default function SettingsPage() {
  // State controlling mobile sidebar drawer visibility
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Form states
  const [generalSettings, setGeneralSettings] = useState({
    language: "en",
    timezone: "Asia/Kolkata",
    theme: "light",
  });

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "general" | "notifications" | "security"
  >("general");

  const [emailNotifications, setEmailNotifications] = useState(true);

  // 1. Fetch saved system settings on load
  React.useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch("/api/settings_app");
        if (res.ok) {
          const data = await res.json();
          if (data) {
            setGeneralSettings({
              language: data.language || "en",
              timezone: data.timezone || "Asia/Kolkata",
              theme: data.theme || "light",
            });

            // Apply loaded theme to the DOM
            document.documentElement.classList.remove("light", "dark");
            if (data.theme === "dark") {
              document.documentElement.classList.add("dark");
            } else {
              document.documentElement.classList.add("light");
            }
          }
        }
      } catch (err) {
        console.error("Failed to load settings:", err);
      }
    }

    loadSettings();
  }, []);

  const handleGeneralSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);

    try {
      // 2. Persist to /api/settings_app
      const res = await fetch("/api/settings_app", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(generalSettings),
      });

      if (!res.ok) {
        throw new Error("Failed to save settings");
      }

      // Apply theme change locally
      document.documentElement.classList.remove("light", "dark");
      if (generalSettings.theme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.add("light");
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error("Error saving settings:", error);
      alert("Failed to save settings. Please try again.");
    } finally {
      setSaving(false);
    }
  };
  return (
    <div className="min-h-screen bg-[#EDDFEF] flex font-sans text-slate-800">
      {/* 1. Reusable Sidebar (Desktop permanent, Mobile drawer) */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* 2. Main content area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header Bar (Only visible on screens smaller than lg) */}
        <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-8 flex items-center justify-between lg:hidden sticky top-0 z-30">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-bold text-slate-900 text-base">
            System Settings
          </span>
          <div className="w-9" /> {/* Spacer to keep title centered */}
        </header>

        {/* Content Body */}
        <main className="p-4 sm:p-8 max-w-5xl mx-auto w-full space-y-6">
          {/* Header Card */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
              <Settings className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                System Settings
              </h1>
              <p className="text-sm text-slate-500">
                Configure your display interface, notifications, and security
                options.
              </p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
            <button
              onClick={() => setActiveTab("general")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === "general"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              <Globe className="w-4 h-4" />
              <span>General & Localization</span>
            </button>

            <button
              onClick={() => setActiveTab("notifications")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === "notifications"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              <Bell className="w-4 h-4" />
              <span>Notifications</span>
            </button>

            <button
              onClick={() => setActiveTab("security")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === "security"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>Security & Privacy</span>
            </button>
          </div>

          {/* Form Content */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
            {activeTab === "general" && (
              <form onSubmit={handleGeneralSave} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                      Interface Language
                    </label>
                    <select
                      value={generalSettings.language}
                      onChange={(e) =>
                        setGeneralSettings({
                          ...generalSettings,
                          language: e.target.value,
                        })
                      }
                      className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:border-indigo-600"
                    >
                      <option value="en">English (United States)</option>
                      <option value="en-gb">English (United Kingdom)</option>
                      <option value="hi">Hindi (हिन्दी)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                      Time Zone
                    </label>
                    <select
                      value={generalSettings.timezone}
                      onChange={(e) =>
                        setGeneralSettings({
                          ...generalSettings,
                          timezone: e.target.value,
                        })
                      }
                      className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:border-indigo-600"
                    >
                      <option value="Asia/Kolkata">(GMT+05:30) IST</option>
                      <option value="UTC">(GMT+00:00) UTC</option>
                      <option value="America/New_York">(GMT-05:00) EST</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                    Theme
                  </label>
                  <div className="grid grid-cols-3 gap-4 max-w-sm">
                    {["light", "dark", "system"].map((themeOption) => (
                      <button
                        key={themeOption}
                        type="button"
                        onClick={() =>
                          setGeneralSettings({
                            ...generalSettings,
                            theme: themeOption,
                          })
                        }
                        className={`py-2 px-3 rounded-xl border text-xs font-bold capitalize transition-colors ${
                          generalSettings.theme === themeOption
                            ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                            : "border-slate-200 text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        {themeOption}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-end">
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm px-5 py-2.5 rounded-xl shadow-md transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    <span>
                      {saving
                        ? "Saving..."
                        : saved
                          ? "Saved ✓"
                          : "Save Changes"}
                    </span>
                  </button>
                </div>
              </form>
            )}

            {activeTab === "notifications" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      Email Updates
                    </p>
                    <p className="text-xs text-slate-500">
                      Receive notifications when someone sends you a swap
                      request.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEmailNotifications(!emailNotifications)}
                    className={`relative inline-flex h-6 w-11 rounded-full transition-colors ${
                      emailNotifications ? "bg-indigo-600" : "bg-slate-200"
                    }`}
                  >
                    <span
                      className={`inline-block h-5 w-5 rounded-full bg-white transition transform ${
                        emailNotifications ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              </div>
            )}

            {activeTab === "security" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 mb-2">
                    Change Password
                  </h3>
                  <div className="space-y-3 max-w-md">
                    <input
                      type="password"
                      placeholder="Current Password"
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm"
                    />
                    <input
                      type="password"
                      placeholder="New Password"
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm"
                    />
                    <button className="bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs px-4 py-2.5 rounded-xl">
                      Update Password
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

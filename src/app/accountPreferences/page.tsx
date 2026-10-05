"use client";

import React, { useState } from "react";
import {
  Settings,
  Bell,
  Shield,
  KeyRound,
  User,
  Globe,
  Check,
  Save,
  Trash2,
  AlertTriangle,
  Smartphone,
  Eye,
  EyeOff,
} from "lucide-react";

export default function AccountPreferencesPage() {
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

  // Notifications State
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);
  const [securityAlerts, setSecurityAlerts] = useState(true);

  // Security Password Visibility
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const handleGeneralSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setSaving(true);
    setSaved(false);

    try {
      const res = await fetch("/api/preferences", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(generalSettings),
      });

      if (!res.ok) {
        throw new Error("Failed to save preferences");
      }

      const updatedPreferences = await res.json();

      // Remove existing theme classes
      document.documentElement.classList.remove("light", "dark");

      // Apply selected theme immediately
      if (updatedPreferences.theme === "dark") {
        document.documentElement.classList.add("dark");
      } else if (updatedPreferences.theme === "light") {
        document.documentElement.classList.add("light");
      } else {
        // System Theme
        if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.add("light");
        }
      }

      setSaved(true);
    } catch (error) {
      console.error("Error saving preferences:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background font-sans text-foreground p-4 sm:p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Page Header */}
        <div className="bg-background p-6 sm:p-8 rounded-2xl border border-border/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-indigo-600 text-xs font-bold uppercase tracking-wider">
              <Settings className="w-4 h-4" />
              <span>System Settings</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
              Account Preferences
            </h1>
            <p className="text-sm text-muted-FOREGROUND">
              Manage your display settings, notification channels, and account
              security.
            </p>
          </div>
        </div>

        {/* Tabbed Navigation */}
        <div className="flex items-center gap-2 border-b border-border pb-2 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab("general")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === "general"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                : "bg-background text-muted-FOREGROUND border border-border hover:bg-muted"
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
                : "bg-background text-muted-FOREGROUND border border-border hover:bg-muted"
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
                : "bg-background text-muted-FOREGROUND border border-border hover:bg-muted"
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Security & Privacy</span>
          </button>
        </div>

        {/* Tab Content Panels */}
        <div className="bg-background rounded-2xl border border-border/80 shadow-sm overflow-hidden">
          {/* 1. GENERAL TAB */}
          {activeTab === "general" && (
            <div className="p-6 sm:p-8 space-y-6">
              <div className="border-b border-border pb-4">
                <h2 className="text-lg font-bold text-foreground">
                  General Preferences
                </h2>
                <p className="text-xs text-muted-FOREGROUND mt-1">
                  Configure your language, time zone, and system interface
                  options.
                </p>
              </div>

              <form onSubmit={handleGeneralSave} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label
                      htmlFor="language"
                      className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-2"
                    >
                      Interface Language
                    </label>
                    <select
                      id="language"
                      value={generalSettings.language}
                      onChange={(e) =>
                        setGeneralSettings({
                          ...generalSettings,
                          language: e.target.value,
                        })
                      }
                      className="w-full rounded-xl border border-border px-3.5 py-3 text-sm text-foreground bg-background focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition duration-200"
                    >
                      <option value="en">English (United States)</option>
                      <option value="en-gb">English (United Kingdom)</option>
                      <option value="hi">Hindi (हिन्दी)</option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="timezone"
                      className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-2"
                    >
                      Time Zone
                    </label>
                    <select
                      id="timezone"
                      value={generalSettings.timezone}
                      onChange={(e) =>
                        setGeneralSettings({
                          ...generalSettings,
                          timezone: e.target.value,
                        })
                      }
                      className="w-full rounded-xl border border-border px-3.5 py-3 text-sm text-foreground bg-background focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition duration-200"
                    >
                      <option value="Asia/Kolkata">
                        (GMT+05:30) India Standard Time
                      </option>
                      <option value="UTC">(GMT+00:00) UTC</option>
                      <option value="America/New_York">
                        (GMT-05:00) Eastern Time
                      </option>
                    </select>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="theme"
                    className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-2"
                  >
                    Appearance Theme
                  </label>

                  <div className="grid grid-cols-3 gap-4 max-w-md">
                    {/* Light */}
                    <label
                      className={`cursor-pointer rounded-xl p-3.5 text-center flex flex-col items-center gap-1.5 text-xs font-bold border transition ${
                        generalSettings.theme === "light"
                          ? "border-indigo-600 bg-indigo-50/50 text-indigo-700"
                          : "border-border hover:border-foreground text-muted-FOREGROUND"
                      }`}
                    >
                      <input
                        type="radio"
                        name="theme"
                        value="light"
                        checked={generalSettings.theme === "light"}
                        onChange={(e) =>
                          setGeneralSettings({
                            ...generalSettings,
                            theme: e.target.value,
                          })
                        }
                        className="sr-only"
                      />
                      <span>Light</span>
                    </label>

                    {/* Dark */}
                    <label
                      className={`cursor-pointer rounded-xl p-3.5 text-center flex flex-col items-center gap-1.5 text-xs font-bold border transition ${
                        generalSettings.theme === "dark"
                          ? "border-indigo-600 bg-indigo-50/50 text-indigo-700"
                          : "border-border hover:border-foreground text-muted-FOREGROUND"
                      }`}
                    >
                      <input
                        type="radio"
                        name="theme"
                        value="dark"
                        checked={generalSettings.theme === "dark"}
                        onChange={(e) =>
                          setGeneralSettings({
                            ...generalSettings,
                            theme: e.target.value,
                          })
                        }
                        className="sr-only"
                      />
                      <span>Dark</span>
                    </label>

                    {/* System */}
                    <label
                      className={`cursor-pointer rounded-xl p-3.5 text-center flex flex-col items-center gap-1.5 text-xs font-bold border transition ${
                        generalSettings.theme === "system"
                          ? "border-indigo-600 bg-indigo-50/50 text-indigo-700"
                          : "border-border hover:border-foreground text-muted-FOREGROUND"
                      }`}
                    >
                      <input
                        type="radio"
                        name="theme"
                        value="system"
                        checked={generalSettings.theme === "system"}
                        onChange={(e) =>
                          setGeneralSettings({
                            ...generalSettings,
                            theme: e.target.value,
                          })
                        }
                        className="sr-only"
                      />
                      <span>System</span>
                    </label>
                  </div>
                </div>

                <div className="pt-4 border-t border-border flex justify-end">
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm px-5 py-2.5 rounded-xl shadow-lg shadow-indigo-600/20 transition duration-150"
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
            </div>
          )}

          {/* 2. NOTIFICATIONS TAB */}
          {activeTab === "notifications" && (
            <div className="p-6 sm:p-8 space-y-6">
              <div className="border-b border-border pb-4">
                <h2 className="text-lg font-bold text-foreground">
                  Notification Preferences
                </h2>
                <p className="text-xs text-muted-FOREGROUND mt-1">
                  Control how and when you receive automated system messages.
                </p>
              </div>

              <div className="space-y-6">
                {/* Switch Item 1 */}
                <div className="flex items-center justify-between gap-4 py-2">
                  <div className="space-y-0.5">
                    <p className="text-sm font-semibold text-foreground">
                      Email Updates & Digests
                    </p>
                    <p className="text-xs text-muted-FOREGROUND">
                      Receive periodic summary digests for portfolio
                      interactions and project feedback.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEmailNotifications(!emailNotifications)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      emailNotifications ? "bg-indigo-600" : "bg-slate-200"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-background shadow ring-0 transition duration-200 ease-in-out ${
                        emailNotifications ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                <hr className="border-border" />

                {/* Switch Item 2 */}
                <div className="flex items-center justify-between gap-4 py-2">
                  <div className="space-y-0.5">
                    <p className="text-sm font-semibold text-foreground">
                      Security & Login Alerts
                    </p>
                    <p className="text-xs text-muted-FOREGROUND">
                      Get immediate alerts when a new device signs into your
                      NextAuth profile session.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSecurityAlerts(!securityAlerts)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      securityAlerts ? "bg-indigo-600" : "bg-slate-200"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-background shadow ring-0 transition duration-200 ease-in-out ${
                        securityAlerts ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                <hr className="border-border" />

                {/* Switch Item 3 */}
                <div className="flex items-center justify-between gap-4 py-2">
                  <div className="space-y-0.5">
                    <p className="text-sm font-semibold text-foreground">
                      Product News & Marketing
                    </p>
                    <p className="text-xs text-muted-FOREGROUND">
                      Receive news about feature updates and upcoming
                      development tools.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMarketingEmails(!marketingEmails)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      marketingEmails ? "bg-indigo-600" : "bg-slate-200"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-background shadow ring-0 transition duration-200 ease-in-out ${
                        marketingEmails ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 3. SECURITY TAB */}
          {activeTab === "security" && (
            <div className="p-6 sm:p-8 space-y-8">
              <div className="border-b border-border pb-4">
                <h2 className="text-lg font-bold text-foreground">
                  Password & Security
                </h2>
                <p className="text-xs text-muted-FOREGROUND mt-1">
                  Manage your access key pairs, multi-factor authentication, and
                  active sessions.
                </p>
              </div>

              {/* Password Reset Form */}
              <form
                onSubmit={(e) => e.preventDefault()}
                className="space-y-5 max-w-xl"
              >
                <div>
                  <label
                    htmlFor="current-pass"
                    className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-2"
                  >
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      id="current-pass"
                      type={showCurrentPassword ? "text" : "password"}
                      placeholder="••••••••••••"
                      className="w-full rounded-xl border border-border px-3.5 py-3 pr-10 text-sm text-foreground focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition duration-200"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowCurrentPassword(!showCurrentPassword)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-muted-FOREGROUND"
                    >
                      {showCurrentPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="new-pass"
                    className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-2"
                  >
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      id="new-pass"
                      type={showNewPassword ? "text" : "password"}
                      placeholder="At least 8 characters..."
                      className="w-full rounded-xl border border-border px-3.5 py-3 pr-10 text-sm text-foreground focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition duration-200"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-muted-FOREGROUND"
                    >
                      {showNewPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs px-4 py-3 rounded-xl transition duration-150 inline-flex items-center gap-2"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>Update Password</span>
                </button>
              </form>

              {/* Danger Zone */}
              <div className="pt-6 border-t border-border space-y-4">
                <div className="flex items-center gap-2 text-rose-600 text-xs font-bold uppercase tracking-wider">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Danger Zone</span>
                </div>
                <div className="bg-rose-500/10 border border-rose-100 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-bold text-foreground">
                      Delete Account & Data
                    </p>
                    <p className="text-xs text-muted-FOREGROUND mt-0.5">
                      Permanently remove your account, profile details, and
                      project references.
                    </p>
                  </div>
                  <button
                    type="button"
                    className="bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition duration-150 shrink-0 inline-flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Account</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

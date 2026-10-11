"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import {
  SlidersHorizontal,
  Plus,
  X,
  BookOpen,
  GraduationCap,
  Menu,
  Check,
} from "lucide-react";

interface SkillItem {
  id: string;
  name: string;
  category: string;
  type: "OFFERED" | "WANTED";
}

export default function AccountPreferencesPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [skills, setSkills] = useState<SkillItem[]>([]);
  const [newSkillName, setNewSkillName] = useState("");
  const [newSkillCategory, setNewSkillCategory] = useState("Tech");
  const [newSkillType, setNewSkillType] = useState<"OFFERED" | "WANTED">("WANTED");
  const [loading, setLoading] = useState(false);

  // Fetch user skills from database
  useEffect(() => {
    async function loadSkills() {
      try {
        const res = await fetch("/api/preferences");
        if (res.ok) {
          const data = await res.json();
          setSkills(data.skills || []);
        }
      } catch (err) {
        console.error("Failed to load skills", err);
      }
    }
    loadSkills();
  }, []);

  // Add skill handler
  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          skillName: newSkillName.trim(),
          category: newSkillCategory,
          type: newSkillType,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.skill) {
          setSkills((prev) => [...prev, data.skill]);
        }
        setNewSkillName("");
      }
    } catch (err) {
      console.error("Failed to add skill", err);
    } finally {
      setLoading(false);
    }
  };

  // Remove skill handler
  const handleRemoveSkill = async (id: string, name: string, type: string) => {
    setSkills((prev) => prev.filter((s) => s.id !== id));
    try {
      await fetch("/api/preferences", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skillName: name, type }),
      });
    } catch (err) {
      console.error("Failed to remove skill", err);
    }
  };

  const offeredSkills = skills.filter((s) => s.type === "OFFERED");
  const wantedSkills = skills.filter((s) => s.type === "WANTED");

  return (
    <div className="min-h-screen bg-[#EDDFEF] flex font-sans text-slate-800">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-8 flex items-center justify-between lg:hidden sticky top-0 z-30">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 rounded-lg text-slate-500 hover:bg-slate-100"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-bold text-slate-900">Skill Preferences</span>
          <div className="w-8" />
        </header>

        {/* Content */}
        <main className="p-4 sm:p-8 max-w-5xl mx-auto w-full space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
              <SlidersHorizontal className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Skill Preferences</h1>
              <p className="text-sm text-slate-500">
                Manage what you teach and what you want to learn to get accurate swap recommendations.
              </p>
            </div>
          </div>

          {/* Add Skill Form */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 mb-4">Add a Skill</h2>
            <form onSubmit={handleAddSkill} className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder="e.g. Next.js, Guitar, Yoga..."
                value={newSkillName}
                onChange={(e) => setNewSkillName(e.target.value)}
                className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-600 focus:bg-white"
              />
              <select
                value={newSkillCategory}
                onChange={(e) => setNewSkillCategory(e.target.value)}
                className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-600"
              >
                <option value="Tech">Tech</option>
                <option value="Design">Design</option>
                <option value="Fitness">Fitness</option>
                <option value="Music">Music</option>
                <option value="Language">Language</option>
                <option value="General">General</option>
              </select>
              <select
                value={newSkillType}
                onChange={(e) => setNewSkillType(e.target.value as "OFFERED" | "WANTED")}
                className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-600 font-semibold"
              >
                <option value="WANTED">I want to learn</option>
                <option value="OFFERED">I can teach</option>
              </select>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm flex items-center justify-center gap-2 shadow-md transition"
              >
                <Plus className="w-4 h-4" />
                <span>{loading ? "Adding..." : "Add"}</span>
              </button>
            </form>
          </div>

          {/* Two-Column Grid: Wanted Skills & Offered Skills */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Wanted Skills */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <BookOpen className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900">Skills I Want to Learn</h3>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 ml-auto">
                  {wantedSkills.length}
                </span>
              </div>

              {wantedSkills.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">
                  No wanted skills added yet. Add one above or explore random skills on your dashboard!
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {wantedSkills.map((s) => (
                    <span
                      key={s.id}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-50 text-indigo-900 border border-indigo-100"
                    >
                      {s.name}
                      <button
                        onClick={() => handleRemoveSkill(s.id, s.name, s.type)}
                        className="text-indigo-400 hover:text-rose-600 transition"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Offered Skills */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <GraduationCap className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-slate-900">Skills I Can Teach</h3>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 ml-auto">
                  {offeredSkills.length}
                </span>
              </div>

              {offeredSkills.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">
                  No offered skills listed. Add the skills you can share with others!
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {offeredSkills.map((s) => (
                    <span
                      key={s.id}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-900 border border-emerald-100"
                    >
                      {s.name}
                      <button
                        onClick={() => handleRemoveSkill(s.id, s.name, s.type)}
                        className="text-emerald-400 hover:text-rose-600 transition"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
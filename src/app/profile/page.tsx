"use client";

import React, { useEffect, useState } from "react";
import { User, GraduationCap, MapPin, Camera, ArrowRight } from "lucide-react";

// 2. Use these inline SVG components in your layout:
const Github = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
  </svg>
);

const Linkedin = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

// 1. Local state for form inputs

export default function ProfilePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [editing, setEditing] = useState(true);
  const [profile, setProfile] = useState<any>(null);

  const [formData, setFormData] = useState({
    bio: "",
    college: "",
    location: "",
    github: "",
    linkedin: "",
    theme:"light",
  });

  useEffect(() => {
    async function loadProfile() {
      const res = await fetch("/api/profile");

      if (res.ok) {
        const data = await res.json();

        setProfile(data);

        if (
          data.bio ||
          data.college ||
          data.location ||
          data.github ||
          data.linkedin
        ) {
          setEditing(false);
        }

        if (data) {
          setFormData({
            bio: data.bio || "",
            college: data.college || "",
            location: data.location || "",
            github: data.github || "",
            linkedin: data.linkedin || "",
            theme: data.theme || "light",
          });
        }
      }
    }

    loadProfile();
  }, []);

  // 2. Handle input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  // 3. Handle submit event
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsLoading(true);
    setIsSaved(false);

    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        throw new Error("Failed to save profile");
      }

      // Get the updated user returned by the API
      const updatedUser = await res.json();

      setProfile(updatedUser);

      setFormData({
        bio: updatedUser.bio || "",
        college: updatedUser.college || "",
        location: updatedUser.location || "",
        github: updatedUser.github || "",
        linkedin: updatedUser.linkedin || "",
        theme: updatedUser.theme || "light",
      });

      setEditing(false);
      setIsSaved(true);

      // Optional: hide the success message after 3 seconds
      setTimeout(() => {
        setIsSaved(false);
      }, 3000);
    } catch (error) {
      console.error("Failed to save profile:", error);
      alert("Something went wrong while saving your profile.");
    } finally {
      setIsLoading(false);
    }
  };

  if (profile && !editing) {
    return (
      <main className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-xl">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-full bg-indigo-100 flex items-center justify-center">
              <User className="w-10 h-10 text-indigo-600" />
            </div>

            <div>
              <h1 className="text-3xl  text-black font-bold">{profile.name}</h1>

              <p className="text-black">{profile.email}</p>
            </div>
          </div>

          <div className="mt-8 space-y-4 text-black">
            <div>
              <h3 className="font-semibold">Bio</h3>
              <p className="text-black">{profile.bio || "-"}</p>
            </div>

            <div>
              <h3 className="font-semibold">College</h3>
              <p className="text-black">{profile.college || "-"}</p>
            </div>

            <div>
              <h3 className="font-semibold">Location</h3>
              <p className="text-black">{profile.location || "-"}</p>
            </div>

            <div>
              <h3 className=" text-black font-bold">Github</h3>
              <p className="text-black">{profile.github || "-"}</p>
            </div>

            <div>
              <h3 className="font-bold text-blue-800">LinkedIn</h3>
              <p className="text-black">{profile.linkedin || "-"}</p>
            </div>
          </div>

          <button
            onClick={() => setEditing(true)}
            className="mt-8 w-full rounded-xl bg-indigo-600 py-3 text-white hover:bg-indigo-700"
          >
            Edit Profile
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6 font-sans">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-100 overflow-hidden">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 h-28 relative">
          <div className="absolute -bottom-10 left-8">
            <div className="relative group">
              <div className="w-20 h-20 rounded-full bg-slate-100 border-4 border-white shadow-md flex items-center justify-center text-slate-400 overflow-hidden">
                <User className="w-10 h-10" />
              </div>
              <button
                type="button"
                aria-label="Upload photo"
                className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-white"
              >
                <Camera className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <div className="pt-14 p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-900">
              Complete Your Profile
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Set up your public details so peers and recruiters can get to know
              you.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Bio Field */}
            <div>
              <label
                htmlFor="bio"
                className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2"
              >
                Bio
              </label>
              <textarea
                id="bio"
                rows={3}
                value={formData.bio}
                onChange={handleChange}
                placeholder="Tell us a bit about yourself, your tech stack, or what you're working on..."
                className="w-full rounded-xl border border-slate-200 p-3.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition duration-200 resize-none"
              />
            </div>

            {/* College & Location Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="college"
                  className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2"
                >
                  College / University
                </label>
                <div className="relative">
                  <GraduationCap className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    id="college"
                    type="text"
                    value={formData.college}
                    onChange={handleChange}
                    placeholder="e.g. NIT Rourkela"
                    className="w-full rounded-xl border border-slate-200 pl-11 pr-3.5 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition duration-200"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="location"
                  className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2"
                >
                  Location
                </label>
                <div className="relative">
                  <MapPin className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    id="location"
                    type="text"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="e.g. Bangalore, India"
                    className="w-full rounded-xl border border-slate-200 pl-11 pr-3.5 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition duration-200"
                  />
                </div>
              </div>
            </div>

            {/* GitHub Field */}
            <div>
              <label
                htmlFor="github"
                className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2"
              >
                GitHub Profile
              </label>
              <div className="relative flex rounded-xl border border-slate-200 focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10 transition duration-200 overflow-hidden">
                <div className="bg-slate-50 border-r border-slate-200 px-3.5 flex items-center gap-2 text-slate-500 text-sm font-medium">
                  <Github className="w-4 h-4 text-slate-700" />
                  <span>github.com/</span>
                </div>
                <input
                  id="github"
                  type="text"
                  value={formData.github}
                  onChange={handleChange}
                  placeholder="username"
                  className="w-full px-3.5 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none"
                />
              </div>
            </div>

            {/* LinkedIn Field */}
            <div>
              <label
                htmlFor="linkedin"
                className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2"
              >
                LinkedIn Profile
              </label>
              <div className="relative flex rounded-xl border border-slate-200 focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10 transition duration-200 overflow-hidden">
                <div className="bg-slate-50 border-r border-slate-200 px-3.5 flex items-center gap-2 text-slate-500 text-sm font-medium">
                  <Linkedin className="w-4 h-4 text-blue-600" />
                  <span>linkedin.com/in/</span>
                </div>
                <input
                  id="linkedin"
                  type="text"
                  value={formData.linkedin}
                  onChange={handleChange}
                  placeholder="username"
                  className="w-full px-3.5 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-medium rounded-xl py-3.5 px-4 shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 transition duration-200"
              >
                {isLoading ? (
                  <span>Saving...</span>
                ) : (
                  <>
                    <span>Save Profile</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
              {isSaved && (
                <p className="mt-4 text-center text-green-600 font-medium">
                  ✅ Profile saved successfully!
                </p>
              )}
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}

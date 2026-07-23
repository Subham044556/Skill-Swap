"use client";

import { useSession } from "next-auth/react";

export default function ProfilePage() {
  const { data: session } = useSession();

  return (
    <main className="max-w-3xl mx-auto py-10">
      <h1 className="text-4xl font-bold mb-8">
        My Profile
      </h1>

      <div className="space-y-5">

        <input
          defaultValue={session?.user?.name ?? ""}
          placeholder="Name"
          className="border p-3 rounded w-full"
        />

        <textarea
          placeholder="Bio"
          className="border p-3 rounded w-full"
        />

        <input
          placeholder="Location"
          className="border p-3 rounded w-full"
        />

        <input
          placeholder="University"
          className="border p-3 rounded w-full"
        />

        <input
          placeholder="GitHub"
          className="border p-3 rounded w-full"
        />

        <input
          placeholder="LinkedIn"
          className="border p-3 rounded w-full"
        />

        <button
          className="bg-blue-600 text-white px-5 py-3 rounded"
        >
          Save Profile
        </button>

      </div>
    </main>
  );
}
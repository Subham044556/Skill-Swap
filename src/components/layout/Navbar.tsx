"use client";

import Link from "next/link";
import { signIn, useSession } from "next-auth/react";

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="w-full border-b border-gray-200">
      <div className="max-w-7xl mx-auto flex justify-between items-center h-16 px-6">
        <Link
          href="/"
          className="text-2xl font-bold tracking-tight text-indigo-600"
        >
          SkillX
        </Link>

        {!session ? (
          <button
            onClick={() => signIn("google")}
            className="bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-700 transition"
          >
            Continue with Google
          </button>
        ) : (
          <Link
            href="/dashboard"
            className="bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-700 transition"
          >
            Dashboard
          </Link>
        )}
      </div>
    </nav>
  );
}
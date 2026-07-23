"use client";

import { signIn } from "next-auth/react";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="rounded-xl border p-10 shadow-lg">
        <h1 className="text-3xl font-bold mb-8">
          Welcome to SkillX
        </h1>

        <button
          onClick={() =>
            signIn("google", {
              callbackUrl: "/dashboard",
            })
          }
          className="rounded-lg bg-blue-600 px-6 py-3 text-white"
        >
          Continue with Google
        </button>
      </div>
    </main>
  );
}
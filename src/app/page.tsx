"use client";

import { signIn, signOut, useSession } from "next-auth/react";

export default function DashboardPage() {
  const { data: session } = useSession();

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl mb-4">You are not signed in</h1>
        <button
          onClick={() => signIn("google")}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Sign in with Google
        </button>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
      <p>Welcome, {session.user?.name}</p>
      <button
        onClick={() => signOut()}
        className="px-4 py-2 bg-red-500 text-white rounded mt-4"
      >
        Sign Out
      </button>
    </div>
  );
}

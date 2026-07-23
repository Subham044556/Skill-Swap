"use client";

import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Image from "next/image";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return <p className="p-10">Loading...</p>;
  }

  if (!session) {
    return null;
  }

  return (
    <main className="p-10">
      <h1 className="text-4xl font-bold">Welcome, {session.user?.name}</h1>

      <p>{session.user?.email}</p>

      <Image
        src={session.user?.image ?? "/default-avatar.png"}
        alt="Profile"
        width={80}
        height={80}
        className="rounded-full mt-5"
      />

      <button
        onClick={() => signOut({ callbackUrl: "/login" })}
        className="mt-8 rounded bg-red-500 px-5 py-2 text-white"
      >
        Sign Out
      </button>
    </main>
  );
}

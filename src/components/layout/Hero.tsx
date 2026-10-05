"use client";

import { signIn } from "next-auth/react";

export default function Hero() {
  return (
    <section className="flex flex-col items-center justify-center text-center py-28 px-6">
      <span className="bg-indigo-100 text-indigo-700 px-4 py-1 rounded-full text-sm font-medium">
        Learn • Teach • Connect
      </span>

      <h1 className="text-6xl font-bold mt-8 max-w-4xl leading-tight">
        Exchange Skills.
        <br />
        Grow Together.
      </h1>

      <p className="text-gray-600 mt-8 max-w-2xl text-lg">
        SkillX connects people who want to learn with people who love to teach.
        Share your expertise, discover new skills, and build meaningful
        connections.
      </p>

      <button
        onClick={() => signIn("google")}
        className="mt-10 bg-indigo-600 text-white px-8 py-4 rounded-xl hover:bg-indigo-700 transition text-lg"
      >
        Get Started
      </button>
    </section>
  );
}
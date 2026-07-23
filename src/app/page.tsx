import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="text-5xl font-bold mb-6">
        SkillX
      </h1>

      <p className="text-lg text-gray-500 mb-8">
        Learn. Teach. Grow Together.
      </p>

      <Link
        href="/login"
        className="rounded-lg bg-blue-600 px-6 py-3 text-white"
      >
        Get Started
      </Link>
    </main>
  );
}
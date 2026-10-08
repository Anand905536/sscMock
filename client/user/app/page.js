"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { LogOut } from "lucide-react";

const englishTopics = [
  "Vocabulary",
  "Spot the Error",
  "Para Jumbles",
  "Fill in the Blanks",
  "Grammar",
  "Synonyms",
  "Antonyms",
  "Idioms & Phrases",
  "One Word Substitution",
  "Active & Passive Voice",
  "Reading Comprehension",
  "Cloze Test",
  "Sentence Improvement",
  "Direct & Indirect Speech",
  "Spelling",
];

const gsTopics = [
  "Ancient History",
  "Medieval History",
  "Modern History",
  "Indian Geography",
  "World Geography",
  "Indian Polity",
  "Indian Economy",
  "General Science",
  "Physics",
  "Chemistry",
  "Biology",
  "Current Affairs",
  "Static GK",
  "Environment",
  "Art & Culture",
];

export default function HomePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem("token"));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setIsLoggedIn(false);
    window.location.href = "/";
  };

  return (
    <main className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6">
        <Link
          href="/"
          className="text-xl font-bold tracking-tight text-black"
        >
          Subject Wise
        </Link>

        {isLoggedIn ? (
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        ) : (
          <Link
            href="/login"
            className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white"
          >
            Sign in
          </Link>
        )}
      </nav>

      <div className="mx-auto max-w-7xl px-6 py-14">
        {/* English */}
        <section>
          <h1 className="text-left text-3xl font-bold tracking-tight text-black">
            English
          </h1>

          <div className="mt-8">
            <div className="relative">
              {/* Connecting line */}
              {/* <div className="absolute left-0 right-0 top-1/2 hidden h-px bg-gray-200 lg:block" /> */}

              <div className="relative grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {englishTopics.map((topic) => (
                  <Link
                    key={topic}
                    href={`/subjects/english/${encodeURIComponent(
                      topic.toLowerCase().replaceAll(" ", "-")
                    )}`}
                    className="relative z-10 rounded-xl border border-gray-200 bg-white p-5 text-center shadow-sm"
                  >
                    <h2 className="text-sm font-semibold text-black">
                      {topic}
                    </h2>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* General Studies */}
        <section className="mt-20">
          <h1 className="text-left text-3xl font-bold tracking-tight text-black">
            General Studies
          </h1>

          <div className="mt-8">
            <div className="relative">
              {/* Connecting line */}
              {/* <div className="absolute left-0 right-0 top-1/2 hidden h-px bg-gray-200 lg:block" /> */}

              <div className="relative grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {gsTopics.map((topic) => (
                  <Link
                    key={topic}
                    href={`/subjects/general-studies/${encodeURIComponent(
                      topic.toLowerCase().replaceAll(" ", "-")
                    )}`}
                    className="relative z-10 rounded-xl border border-gray-200 bg-white p-5 text-center shadow-sm"
                  >
                    <h2 className="text-sm font-semibold text-black">
                      {topic}
                    </h2>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
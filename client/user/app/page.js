"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { BookOpen, GraduationCap, Zap, ChevronRight } from "lucide-react";

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
  const pathname = usePathname();

  const [isMounted, setIsMounted] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isTestsOpen, setIsTestsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);

    const savedUser = localStorage.getItem("user");

    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem("user");
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setIsLoggedIn(false);
    setCurrentUser(null);
    window.location.href = "/";
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50/50 to-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-12">
        
        {/* Thin Glowing Special Test Bar Link */}
        <Link 
          href="/tests/exam/ssc/ssc-cgl-memory-based" 
          className="group relative flex items-center justify-between overflow-hidden rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-emerald-900 via-teal-900 to-emerald-950 px-5 py-3 text-white shadow-md transition-all duration-300 hover:border-emerald-400 hover:shadow-emerald-900/20 hover:shadow-lg"
        >
          {/* Subtle Glowing Pulse Background Effect */}
          <div className="absolute right-1/4 top-0 h-full w-24 bg-emerald-400/10 blur-xl animate-pulse pointer-events-none" />

          <div className="flex items-center gap-3 text-sm font-medium">
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-semibold uppercase text-emerald-300 border border-emerald-400/30 backdrop-blur-sm animate-pulse">
              <Zap className="w-3 h-3 text-yellow-300 fill-yellow-300" /> Live Test
            </span>
            <span className="text-emerald-100 group-hover:text-white transition-colors">
              Attempt the <strong className="font-semibold text-white">Memory-Based Test for CGL Exams</strong>
            </span>
          </div>

          <div className="flex items-center gap-1 text-xs font-semibold text-emerald-300 group-hover:text-emerald-200 transition-colors">
            <span className="hidden sm:inline">Attempt Now</span>
            <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </div>
        </Link>

        {/* English Section */}
        <section className="space-y-6">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-gray-900">
                  English Language
                </h2>
                <p className="text-sm text-gray-500">Grammar, vocabulary, and comprehension topics</p>
              </div>
            </div>
            <span className="hidden sm:inline-block rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
              {englishTopics.length} Topics
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {englishTopics.map((topic) => (
              <Link
                key={topic}
                href={`/subjects/english/${encodeURIComponent(
                  topic.toLowerCase().replaceAll(" ", "-")
                )}`}
                className="group relative z-10 flex flex-col justify-between rounded-2xl border border-gray-200/80 bg-white p-5 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-emerald-400 hover:bg-emerald-50/50 hover:shadow-md"
              >
                <h3 className="text-sm font-semibold text-gray-800 group-hover:text-emerald-700 transition-colors">
                  {topic}
                </h3>
                <span className="mt-3 text-xs font-medium text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity">
                  Explore &rarr;
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* General Studies Section */}
        <section className="space-y-6 pt-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-teal-50 p-2.5 text-teal-600">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-gray-900">
                  General Studies
                </h2>
                <p className="text-sm text-gray-500">History, geography, polity, science, and GK</p>
              </div>
            </div>
            <span className="hidden sm:inline-block rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
              {gsTopics.length} Topics
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {gsTopics.map((topic) => (
              <Link
                key={topic}
                href={`/subjects/general-studies/${encodeURIComponent(
                  topic.toLowerCase().replaceAll(" ", "-")
                )}`}
                className="group relative z-10 flex flex-col justify-between rounded-2xl border border-gray-200/80 bg-white p-5 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-teal-400 hover:bg-teal-50/50 hover:shadow-md"
              >
                <h3 className="text-sm font-semibold text-gray-800 group-hover:text-teal-700 transition-colors">
                  {topic}
                </h3>
                <span className="mt-3 text-xs font-medium text-teal-600 opacity-0 group-hover:opacity-100 transition-opacity">
                  Explore &rarr;
                </span>
              </Link>
            ))}
          </div>
        </section>

      </div>
    </main>
  );
}
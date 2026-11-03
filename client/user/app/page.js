"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useTheme } from "@/context/ThemeContext";
import {
  BookOpen,
  GraduationCap,
  ShieldCheck,
  FileText,
  Info,
  ArrowRight,
  Sparkles,
  TrendingUp
} from "lucide-react";

const englishTopics = [
  "Synonyms",
  "Spot the Error",
  "Para Jumbles",
  "Fill in the Blanks",
  "Homonyms",
  "Antonyms",
  "Idioms",
  "One Word Substitution",
  "Active & Passive Voice",
  "Cloze Test",
  "Sentence Improvement",
  "Narration",
  "Spelling check",
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
  const { darkMode, isThemeReady } = useTheme();

  // Sync theme on mount & listen to change

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setIsLoggedIn(false);
    setCurrentUser(null);
    window.location.href = "/";
  };

  if (!isThemeReady) {
    return <main className="theme-loading" />;
  }

  return (
    <main className={`${!isThemeReady ? "invisible" : "visible"} min-h-screen flex flex-col justify-between transition-colors duration-300 ${darkMode
      ? "bg-zinc-950 text-zinc-100"
      : "bg-gradient-to-b from-slate-50 via-gray-50/50 to-white text-gray-900"
      }`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-16 w-full">

        {/* English Section */}
        <section className="space-y-6">
          <div className={`flex items-center justify-between pb-4 ${darkMode ? "border-b border-zinc-800" : "border-b border-gray-200/60"}`}>
            <div className="flex items-center gap-3.5">
              <div className={`rounded-2xl p-3 shadow-sm ${darkMode ? "bg-emerald-500/15 text-emerald-400" : "bg-emerald-100/80 text-emerald-700"}`}>
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <h2 className={`text-xl sm:text-2xl font-bold tracking-tight ${darkMode ? "text-white" : "text-slate-900"}`}>
                  English Language
                </h2>
                <p className={`text-xs sm:text-sm font-medium ${darkMode ? "text-zinc-400" : "text-slate-500"}`}>Grammar, vocabulary, and comprehension topics</p>
              </div>
            </div>
            <span className={`hidden sm:inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-semibold ${darkMode ? "bg-emerald-500/10 text-emerald-400" : "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
              }`}>
              <Sparkles className="w-3.5 h-3.5" /> {englishTopics.length} Topics Available
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {englishTopics.map((topic) => (
              <Link
                key={topic}
                href={`/subjects/english/${encodeURIComponent(
                  topic.toLowerCase().replaceAll(" ", "-")
                )}`}
                className={`group relative z-10 flex flex-col justify-between rounded-2xl p-5 text-center shadow-xs transition-all duration-300 hover:-translate-y-1.5 ${darkMode
                  ? "bg-zinc-900 text-zinc-200 hover:bg-zinc-800/80 hover:text-white shadow-zinc-950/40"
                  : "border border-slate-200/80 bg-white text-slate-800 hover:border-emerald-400 hover:bg-gradient-to-b hover:from-emerald-50/40 hover:to-white hover:shadow-xl hover:shadow-emerald-950/5"
                  }`}
              >
                <div className={`mx-auto mb-2 w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${darkMode ? "bg-zinc-800 text-zinc-300 group-hover:bg-emerald-500/20 group-hover:text-emerald-400" : "bg-slate-50 text-slate-600 group-hover:bg-emerald-100 group-hover:text-emerald-700"
                  }`}>
                  <BookOpen className="w-4 h-4" />
                </div>
                <h3 className={`text-sm font-semibold transition-colors line-clamp-2 ${darkMode ? "text-zinc-200 group-hover:text-emerald-400" : "text-slate-800 group-hover:text-emerald-700"}`}>
                  {topic}
                </h3>
                <div className="mt-4 flex items-center justify-center gap-1 text-xs font-semibold text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-1 group-hover:translate-y-0">
                  <span>Practice Now</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* General Studies Section */}
        <section className="space-y-6 pt-4">
          <div className={`flex items-center justify-between pb-4 ${darkMode ? "border-b border-zinc-800" : "border-b border-gray-200/60"}`}>
            <div className="flex items-center gap-3.5">
              <div className={`rounded-2xl p-3 shadow-sm ${darkMode ? "bg-teal-500/15 text-teal-400" : "bg-teal-100/80 text-teal-700"}`}>
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <h2 className={`text-xl sm:text-2xl font-bold tracking-tight ${darkMode ? "text-white" : "text-slate-900"}`}>
                  General Studies
                </h2>
                <p className={`text-xs sm:text-sm font-medium ${darkMode ? "text-zinc-400" : "text-slate-500"}`}>History, geography, polity, science, and GK</p>
              </div>
            </div>
            <span className={`hidden sm:inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-semibold ${darkMode ? "bg-teal-500/10 text-teal-400" : "bg-teal-50 text-teal-700 border border-teal-200/60"
              }`}>
              <Sparkles className="w-3.5 h-3.5" /> {gsTopics.length} Topics Available
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {gsTopics.map((topic) => (
              <Link
                key={topic}
                href={`/subjects/general-studies/${encodeURIComponent(
                  topic.toLowerCase().replaceAll(" ", "-")
                )}`}
                className={`group relative z-10 flex flex-col justify-between rounded-2xl p-5 text-center shadow-xs transition-all duration-300 hover:-translate-y-1.5 ${darkMode
                  ? "bg-zinc-900 text-zinc-200 hover:bg-zinc-800/80 hover:text-white shadow-zinc-950/40"
                  : "border border-slate-200/80 bg-white text-slate-800 hover:border-teal-400 hover:bg-gradient-to-b hover:from-teal-50/40 hover:to-white hover:shadow-xl hover:shadow-teal-950/5"
                  }`}
              >
                <div className={`mx-auto mb-2 w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${darkMode ? "bg-zinc-800 text-zinc-300 group-hover:bg-teal-500/20 group-hover:text-teal-400" : "bg-slate-50 text-slate-600 group-hover:bg-teal-100 group-hover:text-teal-700"
                  }`}>
                  <GraduationCap className="w-4 h-4" />
                </div>
                <h3 className={`text-sm font-semibold transition-colors line-clamp-2 ${darkMode ? "text-zinc-200 group-hover:text-teal-400" : "text-slate-800 group-hover:text-teal-700"}`}>
                  {topic}
                </h3>
                <div className="mt-4 flex items-center justify-center gap-1 text-xs font-semibold text-teal-500 opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-1 group-hover:translate-y-0">
                  <span>Practice Now</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </Link>
            ))}
          </div>
        </section>

      </div>

      {/* Professional Footer */}
      <footer className={`pt-16 pb-10 transition-colors duration-300 ${darkMode ? "bg-zinc-950 text-zinc-300" : "bg-slate-950 text-slate-300 border-t border-slate-900 mt-24 shadow-inner"}`}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-10">

          {/* Column 1: Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl bg-emerald-500 flex items-center justify-center text-slate-950 font-black">
                S
              </div>
              <h3 className="text-white text-xl font-extrabold tracking-wide">SubjectWise</h3>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed pr-4">
              Your ultimate destination for SSC CGL, CHSL, MTS, and Railway exam preparation. Master PYQs with structured topic-wise practice.
            </p>
          </div>

          {/* Column 2: Legal & Policies */}
          <div className="space-y-3">
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider text-emerald-400">Legal & Policies</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/about-us" className="hover:text-emerald-400 transition-colors flex items-center gap-2 text-slate-400 hover:translate-x-1 transform duration-200">
                  <Info className="w-4 h-4 text-emerald-500" /> About Us
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="hover:text-emerald-400 transition-colors flex items-center gap-2 text-slate-400 hover:translate-x-1 transform duration-200">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" /> Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms-of-service" className="hover:text-emerald-400 transition-colors flex items-center gap-2 text-slate-400 hover:translate-x-1 transform duration-200">
                  <FileText className="w-4 h-4 text-emerald-500" /> Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Disclaimer */}
          <div className="space-y-3">
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider text-emerald-400">Disclaimer</h4>
            <p className={`text-xs leading-relaxed p-4 rounded-2xl ${darkMode ? "bg-zinc-900/60 text-zinc-400" : "bg-slate-900/60 text-slate-400"}`}>
              Independent student-focused portal compiling exam PYQs for educational practice. Official exam questions belong to their respective boards.
            </p>
          </div>

        </div>

        {/* Bottom Copyright Bar */}
        <div className={`mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-12 pt-6 text-xs flex flex-col sm:flex-row items-center justify-between gap-4 ${darkMode ? "border-t border-zinc-900 text-zinc-500" : "border-t border-slate-900 text-slate-500"}`}>
          <p>© 2026 SubjectWise. All rights reserved.</p>
          <p className="text-slate-400 flex items-center gap-1.5 font-medium">
            Designed for SSC & Railway Aspirants <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
          </p>
        </div>
      </footer>
    </main>
  );
}
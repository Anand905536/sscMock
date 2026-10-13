"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { LogOut, UserCircle, ChevronDown, Menu, X } from "lucide-react";

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
    <main className="min-h-screen bg-white">
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

              <div className=" relative grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {englishTopics.map((topic) => (
                  <Link
                    key={topic}
                    href={`/subjects/english/${encodeURIComponent(
                      topic.toLowerCase().replaceAll(" ", "-")
                    )}`}
                    className=" transition-colors duration-600 hover:bg-green-100 hover relative z-10 rounded-xl border border-gray-200 bg-white p-5 text-center text-gray-600 shadow-md"
                  >
                    <h2 className="text-sm font-semibold">
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
                    className="transition-colors duration-600 text-gray-600 hover:bg-green-100 relative z-10 rounded-xl border border-gray-200 bg-white p-5 text-center shadow-md"
                  >
                    <h2 className="text-sm font-semibold   ">
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
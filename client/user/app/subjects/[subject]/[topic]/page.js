"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { LayoutGrid, Clock, Play, HelpCircle, Sun, Moon } from "lucide-react";
import { ThreeDots } from "react-loader-spinner";
import { apiRequest } from "@/lib/api";
import { useTheme } from "@/context/ThemeContext";
import { ArrowLeft } from 'lucide-react'

const topicMap = {
    english: {
        "homonyms": "Homonyms",
        "spot-the-error": "Spot the Error",
        "para-jumbles": "Para Jumbles",
        "fill-in-the-blanks": "Fill in the Blanks",
        "grammar": "Grammar",
        "synonyms": "Synonyms",
        "antonyms": "Antonyms",
        "idioms": "Idioms",
        "one-word-substitution": "One Word Substitution",
        "active-passive-voice": "Active & Passive Voice",
        "cloze-test": "Cloze Test",
        "sentence-improvement": "Sentence Improvement",
        "narration": "Narration",
        "spelling-check": "Spelling check",
    },

    "general-studies": {
        "ancient-history": "Ancient History",
        "medieval-history": "Medieval History",
        "modern-history": "Modern History",
        "indian-geography": "Indian Geography",
        "world-geography": "World Geography",
        "indian-polity": "Indian Polity",
        "indian-economy": "Indian Economy",
        "general-science": "General Science",
        "physics": "Physics",
        "chemistry": "Chemistry",
        "biology": "Biology",
        "current-affairs": "Current Affairs",
        "static-gk": "Static GK",
        "environment": "Environment",
        "art-&-culture": "Art & Culture",
    },
};

export default function TopicTestsPage() {
    const { subject, topic } = useParams();
    const router = useRouter();

    const [tests, setTests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [activeCategory, setActiveCategory] = useState("all");
    const { darkMode, isThemeReady } = useTheme();

    const subjectKey = subject?.toLowerCase();
    const normalizedTopic = decodeURIComponent(topic || "")
        .toLowerCase()
        .replace(/&/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

    const topicName = topicMap[subjectKey]?.[normalizedTopic];

    useEffect(() => {
        const fetchTests = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    router.push("/login");
                    return;
                }

                console.log("Subject:", subject);
                console.log("Topic slug:", topic);
                console.log("Subject key:", subjectKey);
                console.log("Topic name:", topicName);

                if (!topicName) {
                    setError("Topic not found.");
                    return;
                }



                const params = new URLSearchParams({
                    subject:
                        subjectKey === "general-studies"
                            ? "General Studies"
                            : "English",
                    topic: topicName,
                });

                const data = await apiRequest(
                    `/tests?${params.toString()}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                        cache: "no-store",
                    }
                );

                setTests(data);
            } catch (err) {
                setError(err.message || "Failed to load tests");
            } finally {
                setLoading(false);
            }
        };

        if (subject && topic) {
            fetchTests();
        }
    }, [subject, topic, topicName, subjectKey, router]);

    // Dynamic Category Grouping Logic
    const groupedByCategory = useMemo(() => {
        return tests.reduce((acc, test) => {
            const cat = test.category || "General";
            if (!acc[cat]) {
                acc[cat] = [];
            }
            acc[cat].push(test);
            return acc;
        }, {});
    }, [tests]);

    const categories = Object.keys(groupedByCategory);

    const displayedCategories =
        activeCategory === "all"
            ? categories
            : categories.filter((c) => c === activeCategory);

    const subjectTitle =
        subjectKey === "general-studies"
            ? "General Studies"
            : "English";

    if (!isThemeReady) {
        return <main className="theme-loading" />;
    }

    return (
        <main className={`min-h-screen transition-colors duration-300 pb-16 ${darkMode
            ? "bg-zinc-950 text-zinc-100 selection:bg-emerald-500 selection:text-white"
            : "bg-slate-50/60 text-slate-800 selection:bg-emerald-500 selection:text-white"
            }`}>

            <header className={`sticky top-0 z-40 flex h-16 items-center justify-between px-6 backdrop-blur-md shadow-xs transition-colors duration-300 ${darkMode ? "bg-zinc-900/90 text-white" : "border-b border-gray-200 bg-white/90 text-gray-900"
                }`}>
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={() => router.push("/")}
                        className={`cursor-pointer flex items-center gap-2 text-xs font-bold transition-colors ${darkMode ? "text-zinc-300 hover:text-white" : "text-gray-700 hover:text-gray-900"}`}
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Home</span>
                    </button>
                </div>
            </header>

            {/* Content */}
            <section className="mx-auto max-w-5xl px-4 py-8 sm:px-6">

                {/* Topic Header (Banner removed, only category & title info retained cleanly) */}
                <div className={`mb-8 rounded-2xl p-6 sm:p-8 shadow-sm transition-colors duration-300 ${darkMode ? "bg-zinc-900 text-zinc-100 shadow-zinc-950/40" : "border border-slate-200/80 bg-white text-slate-900"
                    }`}>
                    {/* Dynamic Category Filter Links/Pills */}
                    {!loading && !error && categories.length > 0 && (
                        <div className={`mt-6 flex flex-wrap gap-2 pt-4 ${darkMode ? "border-t border-zinc-800" : "border-t border-slate-100"}`}>
                            <button
                                onClick={() => setActiveCategory("all")}
                                className={`cursor-pointer rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${activeCategory === "all"
                                    ? "bg-emerald-600 text-white shadow-sm"
                                    : darkMode ? "bg-zinc-800 text-zinc-300 hover:bg-zinc-700" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                    }`}
                            >
                                All Categories ({tests.length})
                            </button>

                            {categories.map((catName) => (
                                <button
                                    key={catName}
                                    onClick={() => setActiveCategory(catName)}
                                    className={`cursor-pointer rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${activeCategory === catName
                                        ? "bg-emerald-600 text-white shadow-sm"
                                        : darkMode ? "bg-zinc-800 text-zinc-300 hover:bg-zinc-700" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                        }`}
                                >
                                    {catName} ({groupedByCategory[catName].length})
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {loading && (
                    <div className="flex justify-center py-12">
                        <ThreeDots color={darkMode ? "#10b981" : "#059669"} height={50} width={50} />
                    </div>
                )}

                {error && (
                    <div className={`rounded-2xl p-4 text-sm ${darkMode ? "bg-rose-500/15 text-rose-400" : "border border-rose-200 bg-rose-50/50 text-rose-700"}`}>
                        {error}
                    </div>
                )}

                {!loading && !error && tests.length === 0 && (
                    <div className={`rounded-2xl p-10 text-center shadow-sm ${darkMode ? "bg-zinc-900 text-zinc-300" : "border border-slate-200 bg-white text-slate-800"}`}>
                        <h2 className="text-base font-bold">
                            No tests available
                        </h2>
                        <p className={`mt-1 text-xs ${darkMode ? "text-zinc-500" : "text-slate-500"}`}>
                            Tests for this topic will appear here once they are published.
                        </p>
                    </div>
                )}

                {/* Dynamic Category Section Lists */}
                {!loading && !error && tests.length > 0 && (
                    <div className="space-y-2">
                        {displayedCategories.map((categoryName) => (
                            <div key={categoryName} className="space-y-3">
                                <div className="space-y-3">
                                    {groupedByCategory[categoryName].map((test) => (
                                        <div
                                            key={test._id}
                                            className={`group relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl px-5 py-4 shadow-sm transition-all duration-200 ${darkMode
                                                ? "bg-zinc-900 text-zinc-100 shadow-zinc-950/40 hover:bg-zinc-800/80"
                                                : "border border-slate-200/80 bg-white hover:border-emerald-300 hover:shadow-md"
                                                }`}
                                        >
                                            {/* Left side details */}
                                            <div className="min-w-0 flex-1 space-y-1">
                                                <h2 className={`text-base font-bold transition-colors truncate ${darkMode ? "text-white group-hover:text-emerald-400" : "text-slate-900 group-hover:text-emerald-700"}`}>
                                                    {test.title}
                                                </h2>

                                                {test.description && (
                                                    <p className={`line-clamp-1 text-xs ${darkMode ? "text-zinc-400" : "text-slate-500"}`}>
                                                        {test.description}
                                                    </p>
                                                )}

                                                <div className={`flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-medium pt-0.5 ${darkMode ? "text-zinc-400" : "text-slate-500"}`}>
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="h-3.5 w-3.5 opacity-70" />
                                                        {test.durationMinutes} minutes
                                                    </span>
                                                    {test.totalQuestions && (
                                                        <>
                                                            <span className="opacity-40">•</span>
                                                            <span className="flex items-center gap-1">
                                                                <HelpCircle className="h-3.5 w-3.5 opacity-70" />
                                                                {test.totalQuestions} Questions
                                                            </span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Right side start button */}
                                            <div className="shrink-0 self-end sm:self-center">
                                                <Link
                                                    href={`/tests/${test._id}`}
                                                    className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition-all"
                                                >
                                                    <Play className="h-3.5 w-3.5 fill-white" />
                                                    Start Test
                                                </Link>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </main>
    );
}
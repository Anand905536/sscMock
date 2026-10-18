"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import {
  Search,
  BookOpen,
  ArrowRight,
  GraduationCap,
  Sparkles,
} from "lucide-react";

const examCategories = {
  ssc: {
    title: "SSC Exams",
    subtitle:
      "Prepare for SSC competitive examinations with subject-wise practice and mock tests.",
    description: "Staff Selection Commission",
    exams: [
      { name: "SSC CGL", fullName: "Combined Graduate Level Examination", subjects: "Quantitative Aptitude, Reasoning, English, General Awareness" },
      { name: "SSC CHSL", fullName: "Combined Higher Secondary Level", subjects: "English, Quantitative Aptitude, Reasoning, General Awareness" },
      { name: "SSC MTS", fullName: "Multi-Tasking Staff Examination", subjects: "Numerical Ability, Reasoning, English, General Awareness" },
      { name: "SSC CPO", fullName: "Central Police Organisation", subjects: "Reasoning, Quantitative Aptitude, English, General Knowledge" },
      { name: "SSC GD", fullName: "Constable General Duty", subjects: "Reasoning, Mathematics, English/Hindi, General Knowledge" },
      { name: "SSC Stenographer", fullName: "Stenographer Grade C and D", subjects: "Reasoning, General Awareness, English" },
    ],
  },

  banking: {
    title: "Banking Exams",
    subtitle:
      "Prepare for banking recruitment examinations with focused practice.",
    description: "Bank PO, Clerk and Regional Rural Bank examinations",
    exams: [
      { name: "IBPS PO", fullName: "Probationary Officer", subjects: "Reasoning, Quantitative Aptitude, English, Banking Awareness" },
      { name: "IBPS Clerk", fullName: "Customer Service Associate", subjects: "Reasoning, Numerical Ability, English, General/Financial Awareness" },
      { name: "SBI PO", fullName: "State Bank of India Probationary Officer", subjects: "Reasoning, Data Analysis, English, General/Economy Awareness" },
      { name: "SBI Clerk", fullName: "State Bank of India Junior Associate", subjects: "Reasoning, Quantitative Aptitude, English, General Awareness" },
      { name: "IBPS RRB PO", fullName: "Regional Rural Bank Officer Scale I", subjects: "Reasoning, Quantitative Aptitude, General Awareness, English/Hindi" },
      { name: "IBPS RRB Clerk", fullName: "Regional Rural Bank Office Assistant", subjects: "Reasoning, Numerical Ability, General Awareness, English/Hindi" },
    ],
  },

  railway: {
    title: "Railway Exams",
    subtitle:
      "Explore preparation topics for Railway Recruitment Board examinations.",
    description: "RRB recruitment examinations",
    exams: [
      { name: "RRB NTPC", fullName: "Non-Technical Popular Categories", subjects: "Mathematics, General Intelligence, General Awareness" },
      { name: "RRB Group D", fullName: "Level 1 Posts", subjects: "Mathematics, Reasoning, General Science, General Awareness" },
      { name: "RRB ALP", fullName: "Assistant Loco Pilot", subjects: "Mathematics, Reasoning, General Science, Technical Knowledge" },
      { name: "RRB Technician", fullName: "Technician Recruitment", subjects: "Mathematics, Reasoning, General Science, Technical Subjects" },
      { name: "RPF Constable", fullName: "Railway Protection Force Constable", subjects: "Arithmetic, General Awareness, Reasoning" },
      { name: "RPF SI", fullName: "Railway Protection Force Sub-Inspector", subjects: "Arithmetic, General Awareness, Reasoning" },
    ],
  },

  other: {
    title: "Other Competitive Exams",
    subtitle:
      "Discover preparation categories for other government and competitive examinations.",
    description: "Additional competitive examination categories",
    exams: [
      { name: "UPSC Civil Services", fullName: "Civil Services Examination", subjects: "History, Geography, Polity, Economy, Science, Current Affairs" },
      { name: "State PSC", fullName: "State Public Service Commission examinations", subjects: "General Studies, State GK, Reasoning, Aptitude" },
      { name: "Teaching Exams", fullName: "Teacher eligibility and recruitment examinations", subjects: "Child Development, Pedagogy, Languages, Subject Knowledge" },
      { name: "Defence Exams", fullName: "Defence recruitment examinations", subjects: "Mathematics, Reasoning, English, General Knowledge" },
      { name: "Police Exams", fullName: "State Police recruitment examinations", subjects: "Reasoning, General Knowledge, Mathematics, Language" },
      { name: "Other Government Exams", fullName: "Additional government recruitment examinations", subjects: "General Awareness, Reasoning, Mathematics, English" },
    ],
  },
};

export default function ExamCategoryPage() {
  const params = useParams();
  const category = String(params.category || "").toLowerCase();
  const data = examCategories[category];
  const [search, setSearch] = useState("");

  const filteredExams = useMemo(() => {
    if (!data) return [];

    const query = search.trim().toLowerCase();

    if (!query) return data.exams;

    return data.exams.filter(
      (exam) =>
        exam.name.toLowerCase().includes(query) ||
        exam.fullName.toLowerCase().includes(query) ||
        exam.subjects.toLowerCase().includes(query)
    );
  }, [data, search]);

  if (!data) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-20 flex items-center justify-center">
        <div className="mx-auto max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-extrabold text-slate-900">
            Exam category not found
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Please select an exam category from the navigation menu.
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white shadow-sm hover:bg-emerald-700 transition"
          >
            Back to Dashboard
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50/60 pb-16">
      
      {/* Category Hero Header */}
      <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 py-10 px-4 sm:px-8 text-white shadow-md">
        <div className="mx-auto max-w-7xl space-y-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/30 px-3.5 py-1 text-xs font-semibold tracking-wider uppercase text-emerald-200 border border-emerald-400/30">
            <Sparkles className="w-3.5 h-3.5 text-yellow-300 fill-yellow-300" /> {data.description}
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            {data.title}
          </h1>
          <p className="max-w-2xl text-emerald-100/90 text-sm sm:text-base leading-relaxed">
            {data.subtitle}
          </p>
        </div>
      </div>

      {/* Main Content & Search */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-slate-900">
              Explore Exams
            </h2>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 border border-emerald-200/60">
              {filteredExams.length} available
            </span>
          </div>

          {/* Search Bar */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search exams or subjects..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-xs font-medium text-slate-800 shadow-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition"
            />
          </div>
        </div>

        {filteredExams.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredExams.map((exam) => (
              <article
                key={exam.name}
                className="group flex h-full flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-emerald-300 hover:shadow-md"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="rounded-lg bg-emerald-50 p-2.5 text-emerald-600">
                      <GraduationCap className="w-5 h-5" />
                    </span>
                    <span className="text-[10px] font-bold tracking-wider uppercase text-slate-400 bg-slate-100 px-2.5 py-1 rounded-md">
                      Official Syllabus
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-700 transition-colors pt-2">
                    {exam.name}
                  </h3>

                  <p className="text-xs font-medium text-slate-500">
                    {exam.fullName}
                  </p>

                  <p className="text-xs text-slate-400 line-clamp-2 pt-2 border-t border-slate-100">
                    <strong className="text-slate-600">Subjects:</strong> {exam.subjects}
                  </p>
                </div>

                <div className="pt-6">
                  <Link
                    href={`/tests/exam/${category}/${encodeURIComponent(
                      exam.name.toLowerCase().replaceAll(" ", "-")
                    )}`}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-700 hover:shadow-emerald-900/10"
                  >
                    <span>Explore Exam Series</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-5 py-14 text-center shadow-sm">
            <Search className="mx-auto h-8 w-8 text-slate-400" />
            <h3 className="mt-4 font-bold text-slate-800">
              No exams found
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Try searching with another exam name or subject keyword.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
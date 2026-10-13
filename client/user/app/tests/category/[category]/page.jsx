
"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import {
  Search,
  BookOpen,
  ArrowRight,
  GraduationCap,
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
      <main className="min-h-screen bg-white px-4 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Exam category not found
          </h1>
          <p className="mt-3 text-gray-600">
            Please select an exam category from the Tests menu.
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex rounded-lg bg-green-600 px-5 py-3 text-sm font-semibold text-white hover:bg-green-700"
          >
            Back to Home
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Page heading */}
      {/* <section className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-green-50 text-green-700 sm:h-14 sm:w-14">
              <GraduationCap className="h-7 w-7" />
            </div>

            <div>
              <p className="text-sm font-semibold text-green-700">
                {data.description}
              </p>
              <h1 className="mt-1 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                {data.title}
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-600 sm:text-base">
                {data.subtitle}
              </p>
            </div>
          </div> */}

          {/* Search */}
          {/* <div className="mt-8 max-w-xl">
            <label
              htmlFor="exam-search"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Find your exam
            </label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                id="exam-search"
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search exams or subjects..."
                className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-12 pr-4 text-sm text-gray-900 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
              />
            </div>
          </div>
        </div>
      </section> */}

      {/* Exam cards */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">
            Explore exams
          </h2>
          <span className="rounded-full bg-green-50 px-3 py-1 text-sm font-medium text-green-700">
            {filteredExams.length} exams
          </span>
        </div>

        {filteredExams.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredExams.map((exam) => (
              <article
                key={exam.name}
                className="group flex h-full flex-col rounded-2xl border border-gray-200 bg-white p-5 shadow-md transition duration-200 hover:-translate-y-1 hover:border-green-200 hover:shadow-md sm:p-6"
              >
                {/* <div className="flex items-start justify-between gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green-50 text-green-700">
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                    Exam
                  </span>
                </div> */}

                <h3 className="mt-5 text-lg font-bold text-gray-900">
                  {exam.name}
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  {exam.fullName}
                </p>

                {/* <div className="mt-5 border-t border-gray-100 pt-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Main subjects
                  </p>
                  <p className="mt-2 text-sm leading-6 text-gray-700">
                    {exam.subjects}
                  </p>
                </div> */}

                <div className="mt-auto pt-6">
                  <Link
                    href={`/tests/exam/${category}/${encodeURIComponent(
                      exam.name.toLowerCase().replaceAll(" ", "-")
                    )}`}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-gray-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-gray-700"
                  >
                    Explore exam
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-5 py-14 text-center">
            <Search className="mx-auto h-8 w-8 text-gray-400" />
            <h3 className="mt-4 font-semibold text-gray-900">
              No exams found
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              Try another exam name or subject.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}

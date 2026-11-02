import Link from "next/link";
import { Home, Compass } from "lucide-react";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50/50 to-white flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-md w-full text-center space-y-6 bg-white p-8 sm:p-10 rounded-3xl shadow-xl border border-gray-100">

        {/* Decorative Icon */}
        <div className="mx-auto w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-inner">
          <Compass className="w-8 h-8" />
        </div>

        {/* Heading & Message */}
        <div className="space-y-2">
          <span className="inline-block rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-800">
            Error 404
          </span>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Page Not Found
          </h1>
          <p className="text-sm text-gray-500 leading-relaxed">
            Oops! The topic or test link you are trying to reach doesn't exist or may have been moved.
          </p>
        </div>

        {/* Action Button */}
        <div className="pt-4">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3 text-sm font-semibold shadow-md shadow-emerald-600/20 transition-all"
          >
            <Home className="w-4 h-4" /> Back to Home Topics
          </Link>
        </div>

        {/* Footer helper note */}
        <p className="text-xs text-gray-400 pt-2">
          SubjectWise — SSC & Railway Exam Preparation
        </p>

      </div>
    </main>
  );
}
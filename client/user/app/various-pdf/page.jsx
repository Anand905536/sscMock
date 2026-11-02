
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api";
import { FileText, Download } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

function UserPdfPanel() {
  const [pdfs, setPdfs] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  // Get global theme from ThemeContext
  const { darkMode, isThemeReady } = useTheme();

  // Fetch PDFs
  useEffect(() => {
    const fetchPdfs = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/login");
        return;
      }

      setLoading(true);

      try {
        const data = await apiRequest("/pdfs/get-pdfs", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (data.success) {
          setPdfs(data.data || []);
        } else {
          console.error(data.message || "Unable to fetch PDFs");
          setPdfs([]);
        }
      } catch (err) {
        console.error("Error fetching PDFs:", err);
        setPdfs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPdfs();
  }, [router]);

  // Filter PDFs
  const filteredPdfs = pdfs.filter((pdf) =>
    (pdf.title || "")
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  // Prevent wrong-theme flash during hydration
  if (!isThemeReady) {
    return (
      <main className="min-h-screen bg-zinc-950" />
    );
  }

  return (
    <main
      className={`min-h-screen transition-colors duration-300 pb-16 ${darkMode
          ? "bg-zinc-950 text-zinc-100 selection:bg-emerald-500 selection:text-white"
          : "bg-slate-50 text-slate-900 selection:bg-emerald-500 selection:text-white"
        }`}
    >
      {/* Header */}
      <header
        className={`sticky top-0 z-40 border-b backdrop-blur-md transition-colors duration-300 ${darkMode
            ? "bg-zinc-900/90 border-zinc-800 text-white"
            : "border-gray-200 bg-white/90 text-gray-900"
          }`}
      />

      {/* Main Container */}
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 space-y-6">
        <div
          className={`rounded-2xl p-6 sm:p-8 shadow-sm transition-colors duration-300 ${darkMode
              ? "bg-zinc-900 text-zinc-100 shadow-zinc-950/40"
              : "border border-slate-200 bg-white text-slate-900"
            }`}
        >
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Study Materials &amp; PDFs
          </h2>

          <p
            className={`mt-1 text-xs sm:text-sm ${darkMode ? "text-zinc-400" : "text-slate-500"
              }`}
          >
            Browse and download all available study resources and practice papers.
          </p>

          {/* Search Bar */}
          <div className="mt-6">
            <input
              type="text"
              placeholder="Search any PDF by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full rounded-xl px-4 py-3 text-sm font-medium transition outline-none ${darkMode
                  ? "bg-zinc-950/70 border border-zinc-800 text-white placeholder-zinc-500 focus:border-emerald-500"
                  : "border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 focus:border-emerald-500"
                }`}
            />
          </div>
        </div>

        {/* PDF List */}
        <div className="space-y-3">
          {loading ? (
            <div
              className="flex justify-center items-center py-16 gap-2"
              aria-label="Loading PDFs"
              role="status"
            >
              {[0, 1, 2].map((item) => (
                <span
                  key={item}
                  className="loading-dot"
                  style={{ animationDelay: `${item * 0.2}s` }}
                >
                  ●
                </span>
              ))}

              <style jsx>{`
                .loading-dot {
                  color: #10b981;
                  font-size: 20px;
                  animation: blink 1s infinite ease-in-out;
                }

                @keyframes blink {
                  0%, 80%, 100% {
                    opacity: 0.3;
                    transform: scale(0.8);
                  }
                  40% {
                    opacity: 1;
                    transform: scale(1.2);
                  }
                }
              `}</style>
            </div>
          ) : filteredPdfs.length > 0 ? (
            filteredPdfs.map((pdf) => (
              <div
                key={pdf._id}
                className={`group relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl px-5 py-4 shadow-sm transition-all duration-200 ${darkMode
                    ? "bg-zinc-900 text-zinc-100 shadow-zinc-950/40 hover:bg-zinc-800/80 border-l-4 border-l-emerald-500"
                    : "border border-slate-200 bg-white hover:border-emerald-300 hover:shadow-md border-l-4 border-l-emerald-600"
                  }`}
              >
                <div className="flex items-start gap-3.5 min-w-0 flex-1">
                  <div
                    className={`mt-0.5 rounded-xl p-2.5 shrink-0 ${darkMode
                        ? "bg-emerald-500/15 text-emerald-400"
                        : "bg-emerald-50 text-emerald-600"
                      }`}
                  >
                    <FileText className="w-5 h-5" />
                  </div>

                  <div className="min-w-0 space-y-1">
                    <h4
                      className={`text-base font-bold truncate transition-colors ${darkMode
                          ? "text-white group-hover:text-emerald-400"
                          : "text-slate-900 group-hover:text-emerald-700"
                        }`}
                    >
                      {pdf.title}
                    </h4>

                    <span
                      className={`text-xs font-medium ${darkMode ? "text-zinc-400" : "text-slate-500"
                        }`}
                    >
                      File Size: {pdf.fileSize}
                    </span>
                  </div>
                </div>

                <a
                  href={pdf.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cursor-pointer inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition-all shrink-0 self-end sm:self-center"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </a>
              </div>
            ))
          ) : (
            <div
              className={`rounded-2xl p-10 text-center shadow-sm ${darkMode
                  ? "bg-zinc-900 text-zinc-400"
                  : "border border-slate-200 bg-white text-slate-500"
                }`}
            >
              <p className="text-sm font-semibold">No PDFs found.</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export default UserPdfPanel;

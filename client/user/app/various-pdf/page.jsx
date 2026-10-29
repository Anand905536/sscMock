"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api";

function UserPdfPanel() {
  const [pdfs, setPdfs] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  useEffect(() => {
    const fetchPdfs = async () => {
      setLoading(true);

      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/login");
        return;
      }

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

  const filteredPdfs = pdfs.filter((pdf) =>
    pdf.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div
      style={{
        padding: "20px",
        background: "#0f172a",
        minHeight: "100vh",
        color: "#fff",
      }}
    >
      <h2>Study Materials &amp; PDFs</h2>

      {/* Search Bar */}
      <input
        type="text"
        placeholder="Search any PDF by name..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        style={{
          width: "100%",
          padding: "10px",
          marginBottom: "20px",
          background: "#1e293b",
          border: "1px solid #475569",
          color: "#fff",
          borderRadius: "6px",
        }}
      />

      {/* PDF List */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "10px",
        }}
      >
        {loading ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: "100px",
              gap: "6px",
            }}
            aria-label="Loading PDFs"
            role="status"
          >
            <span className="loading-dot" style={{ animationDelay: "0s" }}>
              ●
            </span>
            <span className="loading-dot" style={{ animationDelay: "0.2s" }}>
              ●
            </span>
            <span className="loading-dot" style={{ animationDelay: "0.4s" }}>
              ●
            </span>

            <style jsx>{`
              .loading-dot {
                color: #f97316;
                font-size: 18px;
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
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: "#1e293b",
                padding: "12px 20px",
                borderRadius: "8px",
                borderLeft: "4px solid #f97316",
                minHeight: "60px",
                gap: "12px",
              }}
            >
              <div>
                <h4 style={{ margin: 0, fontSize: "16px" }}>
                  {pdf.title}
                </h4>
                <span style={{ fontSize: "12px", color: "#94a3b8" }}>
                  Size: {pdf.fileSize}
                </span>
              </div>

              <a
                href={pdf.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  background: "#f97316",
                  color: "#fff",
                  padding: "8px 16px",
                  borderRadius: "6px",
                  textDecoration: "none",
                  fontWeight: "bold",
                  fontSize: "14px",
                  flexShrink: 0,
                }}
              >
                Download PDF
              </a>
            </div>
          ))
        ) : (
          <p style={{ color: "#94a3b8" }}>
            No PDFs found.
          </p>
        )}
      </div>
    </div>
  );
}

export default UserPdfPanel;
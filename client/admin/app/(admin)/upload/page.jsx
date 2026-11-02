
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

function AdminPdfManager() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [pdfs, setPdfs] = useState([]);

  const fetchAdminPdfs = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/login");
        return;
      }

      const res = await fetch(
        "http://localhost:5000/api/pdfs/get-pdfs",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (data.success) {
        setPdfs(data.data);
      }
    } catch (err) {
      console.error("Error fetching PDFs for admin:", err);
    }
  };

  useEffect(() => {
    fetchAdminPdfs();
  }, []);

  // UPLOAD HANDLER
  const handleAdminUpload = async (e) => {
    e.preventDefault();

    if (!file || !title.trim()) {
      alert("Please enter title and select a PDF file!");
      return;
    }

    if (file.type !== "application/pdf") {
      alert("Please select a valid PDF file!");
      return;
    }

    setLoading(true);
    setMessage("Uploading to Cloudinary...");

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/login");
        return;
      }

      const cloudName =
        process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

      const uploadPreset =
        process.env.NEXT_PUBLIC_CLOUDINARY_PRESET;

      if (!cloudName || !uploadPreset) {
        throw new Error(
          "Cloudinary configuration missing. Check your .env.local file."
        );
      }

      const formData = new FormData();

      formData.append("file", file);
      formData.append("upload_preset", uploadPreset);
      formData.append("resource_type", "raw");

      const cloudinaryRes = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/raw/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      const cloudinaryData = await cloudinaryRes.json();

      if (!cloudinaryRes.ok) {
        throw new Error(
          cloudinaryData.error?.message || "Cloudinary upload failed"
        );
      }

      const pdfDownloadUrl = cloudinaryData.secure_url;

      const fileSizeMB =
        (file.size / (1024 * 1024)).toFixed(2) + " MB";

      setMessage("Saving to Database...");

      const dbRes = await fetch(
        "http://localhost:5000/api/pdfs/save-pdf",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title,
            pdfUrl: pdfDownloadUrl,
            fileSize: fileSizeMB,
          }),
        }
      );

      if (dbRes.ok) {
        setMessage("✅ PDF Uploaded Successfully!");

        setTitle("");
        setFile(null);

        const fileInput = document.getElementById("pdfFile");
        if (fileInput) fileInput.value = "";

        fetchAdminPdfs();
      } else {
        throw new Error("Database save failed");
      }
    } catch (err) {
      setMessage("❌ Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // DELETE HANDLER
  const handleDelete = async (id) => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }

    if (
      !window.confirm(
        "Are you sure you want to delete this PDF?"
      )
    ) {
      return;
    }

    try {
      const res = await fetch(
        `http://localhost:5000/api/pdfs/delete-pdf/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.ok) {
        alert("PDF Deleted successfully!");

        setPdfs(
          pdfs.filter((pdf) => pdf._id !== id)
        );
      } else {
        alert("Failed to delete PDF");
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  return (
    <div className="mx-auto my-6 max-w-4xl space-y-8 rounded-2xl border border-zinc-800 bg-zinc-950 p-6 text-zinc-100 shadow-xl md:p-8">

      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white md:text-3xl">
          Admin Dashboard: Manage PDFs
        </h2>
        <p className="mt-2 text-sm text-zinc-400">
          Upload, manage and delete your PDF resources.
        </p>
      </div>

      <form
        onSubmit={handleAdminUpload}
        className="flex flex-col gap-5 rounded-xl border border-zinc-800 bg-zinc-900 p-5"
      >
        <div>
          <h3 className="text-lg font-semibold text-white">
            Upload New PDF
          </h3>
          <p className="mt-1 text-sm text-zinc-400">
            Add a title and select your PDF file.
          </p>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="pdfTitle"
            className="text-sm font-medium text-zinc-300"
          >
            PDF Title
          </label>

          <input
            id="pdfTitle"
            type="text"
            placeholder="PDF Title (e.g. Reasoning Short Tricks)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30"
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="pdfFile"
            className="text-sm font-medium text-zinc-300"
          >
            Select PDF File
          </label>

          <input
            id="pdfFile"
            type="file"
            accept=".pdf,application/pdf"
            onChange={(e) => setFile(e.target.files[0] || null)}
            className="w-full cursor-pointer rounded-lg border border-zinc-700 bg-zinc-950 p-2 text-sm text-zinc-300 file:mr-4 file:cursor-pointer file:rounded-md file:border-0 file:bg-emerald-600 file:px-4 file:py-2 file:font-medium file:text-white hover:file:bg-emerald-700"
          />
        </div>

        {file && (
          <p className="text-sm text-zinc-400">
            Selected file:{" "}
            <span className="text-emerald-400">
              {file.name}
            </span>
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Processing..." : "Upload PDF"}
        </button>

        {message && (
          <p className="rounded-lg border border-zinc-700 bg-zinc-950 p-3 text-sm text-zinc-300">
            {message}
          </p>
        )}
      </form>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">
            All Uploaded PDFs
          </h3>

          <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-sm font-semibold text-emerald-400">
            {pdfs.length} PDFs
          </span>
        </div>

        <div className="flex flex-col gap-3">
          {pdfs.map((pdf) => (
            <div
              key={pdf._id}
              className="flex flex-col justify-between gap-4 rounded-xl border border-zinc-800 border-l-4 border-l-emerald-500 bg-zinc-900 p-4 transition hover:bg-zinc-800/70 sm:flex-row sm:items-center"
            >
              <div className="min-w-0">
                <h4 className="break-words text-sm font-semibold text-zinc-100">
                  {pdf.title}
                </h4>

                <span className="mt-1 block text-xs text-zinc-400">
                  Size: {pdf.fileSize}
                </span>
              </div>

              <div className="flex shrink-0 items-center gap-3">
                <a
                  href={pdf.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-sky-400 transition hover:text-sky-300"
                >
                  View File
                </a>

                <button
                  onClick={() => handleDelete(pdf._id)}
                  className="rounded-md bg-rose-500/10 px-3 py-2 text-xs font-semibold text-rose-400 transition hover:bg-rose-500/20"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}

          {pdfs.length === 0 && (
            <div className="rounded-xl border border-dashed border-zinc-700 bg-zinc-900/50 py-10 text-center">
              <p className="text-sm text-zinc-400">
                No PDFs uploaded yet.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminPdfManager;

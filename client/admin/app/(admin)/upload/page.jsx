"use client"
import React, { useState, useEffect } from 'react'; // React hooks

function AdminPdfManager() {
  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [pdfs, setPdfs] = useState([]); // Admin panel ki apni list ke liye state


  const fetchAdminPdfs = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        router.push("/login");
        return;
      }

      const res = await fetch("http://localhost:5000/api/pdfs/get-pdfs",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
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

  // 2. UPLOAD HANDLER (Cloudinary + MongoDB Save)
  const handleAdminUpload = async (e) => {
    e.preventDefault();
    if (!file || !title) {
      alert("Please enter title and select a PDF file!");
      return;
    }

    setLoading(true);
    setMessage("Uploading to Cloudinary...");

    try {
      const token = localStorage.getItem('token')

      if (!token) {
        router.push("/login");
        return;
      }

      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_PRESET);

      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

      const cloudinaryRes = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      const cloudinaryData = await cloudinaryRes.json();
      if (!cloudinaryRes.ok) throw new Error(cloudinaryData.error?.message || "Upload failed");

      const pdfDownloadUrl = cloudinaryData.secure_url;
      const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2) + " MB";

      setMessage("Saving to Database...");

      // Backend ko bhejo save hone ke liye
      const dbRes = await fetch("http://localhost:5000/api/pdfs/save-pdf", {
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
      });
      if (dbRes.ok) {
        setMessage("✅ PDF Uploaded Successfully!");
        setTitle("");
        setFile(null);
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

  // 3. DELETE HANDLER
  const handleDelete = async (id) => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }
    if (!window.confirm("Are you sure you want to delete this PDF?")) return;

    try {
      const res = await fetch(`http://localhost:5000/api/pdfs/delete-pdf/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        alert("PDF Deleted successfully!");
        // UI se turant filter karke hata do bina page reload kiye
        setPdfs(pdfs.filter((pdf) => pdf._id !== id));
      } else {
        alert("Failed to delete PDF");
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  return (
    <div style={{ maxWidth: "700px", margin: "20px auto", padding: "20px", background: "#0f172a", color: "#fff", fontFamily: "sans-serif", borderRadius: "10px" }}>
      <h2 style={{ color: "#f97316", marginBottom: "20px" }}>Admin Dashboard: Manage PDFs</h2>

      {/* --- UPLOAD SECTION --- */}
      <form onSubmit={handleAdminUpload} style={{ background: "#1e293b", padding: "15px", borderRadius: "8px", marginBottom: "30px", display: "flex", flexDirection: "column", gap: "10px" }}>
        <h3>Upload New PDF</h3>
        <input
          type="text"
          placeholder="PDF Title (e.g. Reasoning Short Tricks)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ padding: "10px", borderRadius: "6px", background: "#0f172a", border: "1px solid #475569", color: "#fff" }}
        />
        <input
          type="file"
          accept=".pdf"
          onChange={(e) => setFile(e.target.files[0])}
          style={{ padding: "8px", background: "#0f172a", borderRadius: "6px", border: "1px solid #475569", color: "#fff" }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{ padding: "10px", background: "#f97316", color: "#fff", border: "none", borderRadius: "6px", fontWeight: "bold", cursor: "pointer" }}
        >
          {loading ? "Processing..." : "Upload PDF"}
        </button>
        {message && <p style={{ fontSize: "14px", margin: "5px 0" }}>{message}</p>}
      </form>

      {/* --- LISTING & DELETE SECTION (GET API) --- */}
      <div>
        <h3>All Uploaded PDFs ({pdfs.length})</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "10px" }}>
          {pdfs.map((pdf) => (
            <div
              key={pdf._id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: "#1e293b",
                padding: "12px 15px",
                borderRadius: "6px",
                borderLeft: "4px solid #f97316",
              }}
            >
              <div>
                <h4 style={{ margin: 0, fontSize: "15px" }}>{pdf.title}</h4>
                <span style={{ fontSize: "12px", color: "#94a3b8" }}>Size: {pdf.fileSize}</span>
              </div>

              <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                <a
                  href={pdf.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "#38bdf8", fontSize: "13px", textDecoration: "none" }}
                >
                  View File
                </a>
                <button
                  onClick={() => handleDelete(pdf._id)}
                  style={{
                    background: "#ef4444",
                    color: "#fff",
                    border: "none",
                    padding: "6px 12px",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontWeight: "bold",
                    fontSize: "12px"
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
          {pdfs.length === 0 && <p style={{ color: "#94a3b8" }}>No PDFs uploaded yet.</p>}
        </div>
      </div>
    </div>
  );
}

export default AdminPdfManager;
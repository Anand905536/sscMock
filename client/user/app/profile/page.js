"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { ThreeDots } from "react-loader-spinner";

export default function ProfilePage() {
    const router = useRouter();
    const fileInputRef = useRef(null);

    const [user, setUser] = useState({
        name: "",
        email: "",
        avatar: "",
    });
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState("");

    const [passwords, setPasswords] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });
    const [loading, setLoading] = useState(true);
    const [savingProfile, setSavingProfile] = useState(false);
    const [savingPassword, setSavingPassword] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });
    const [deleteAccount, setDeleteAccount] = useState(false)

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    router.push("/login");
                    return;
                }

                const response = await fetch("http://localhost:5000/api/profile", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                const data = await response.json();
                if (response.ok) {
                    const userData = data.user || data;
                    const avatarUrl = userData.profilePicture
                        ? userData.profilePicture.startsWith("http")
                            ? userData.profilePicture
                            : `http://localhost:5000${userData.profilePicture}`
                        : "";

                    setUser({
                        name: userData.name || "",
                        email: userData.email || "",
                        avatar: avatarUrl,
                    });

                    setPreviewUrl(avatarUrl);
                } else {
                    alert(data.message || "Failed to load profile");
                }
            } catch (error) {
                console.error("Error fetching profile:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [router]);

    // Handle Image Selection & Local Preview
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            const objectUrl = URL.createObjectURL(file);
            setPreviewUrl(objectUrl);
        }
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setSavingProfile(true);
        setMessage({ type: "", text: "" });

        try {
            const token = localStorage.getItem("token");

            const formData = new FormData();
            formData.append("name", user.name);
            formData.append("email", user.email);
            if (selectedFile) {
                formData.append("avatar", selectedFile);
            }

            const response = await fetch("http://localhost:5000/api/profile", {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            const data = await response.json();
            if (response.ok) {
                setMessage({ type: "success", text: "✨ Profile updated successfully!" });

                const updated = data.user || data;

                if (updated.profilePicture) {
                    const avatarUrl = updated.profilePicture.startsWith("http")
                        ? updated.profilePicture
                        : `http://localhost:5000${updated.profilePicture}`;

                    setPreviewUrl(avatarUrl);
                }

                setSelectedFile(null);

            } else {
                setMessage({ type: "error", text: data.message || "Failed to update profile" });
            }
        } catch (error) {
            console.error(error);
            setMessage({ type: "error", text: "Something went wrong while saving profile" });
        } finally {
            setSavingProfile(false);
        }
    };

    const handlePasswordUpdate = async (e) => {
        e.preventDefault();
        if (passwords.newPassword !== passwords.confirmPassword) {
            setMessage({ type: "error", text: "New passwords do not match!" });
            return;
        }

        setSavingPassword(true);
        setMessage({ type: "", text: "" });

        try {
            const token = localStorage.getItem("token");
            const response = await fetch("http://localhost:5000/api/profile/change-password", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    currentPassword: passwords.currentPassword,
                    newPassword: passwords.newPassword,
                }),
            });

            const data = await response.json();
            if (response.ok) {
                setMessage({ type: "success", text: "🔒 Password updated successfully!" });
                setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
            } else {
                setMessage({ type: "error", text: data.message || "Failed to update password" });
            }
        } catch (error) {
            console.error(error);
            setMessage({ type: "error", text: "Something went wrong" });
        } finally {
            setSavingPassword(false);
        }
    };

    if (loading) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
                <div className="flex flex-col items-center gap-4">
                    <ThreeDots />
                    <p className="text-sm font-medium text-green-600 animate-pulse">Loading your profile...</p>
                </div>
            </main>
        );
    }

    // account deletion
    const handleDelete = async (e) => {
        e.preventDefault();

        const confirmed = window.confirm(
            "Are you sure you want to delete your account? This will delete you account permanently"
        );

        if (!confirmed) return;
        setDeleteAccount(true);
        try {
            const userData = JSON.parse(localStorage.getItem("user") || "{}");
            const userId = userData.id;
            const token = localStorage.getItem("token");

            // console.log("userId from profile delete paeg ", userId, token)
            if (!userId || !token) {
                alert("Please log in again.");
                router.push("/login");
                return;
            }

            const response = await fetch(
                `http://localhost:5000/api/profile/${userId}/visibility`,
                {
                    method: "PATCH",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            const data = await response.json();

            if (!response.ok) {
                alert(data.message || "Failed to delete account.");
                return;
            }

            alert(data.message || "Account hidden successfully.");

            // Clear the session and redirect to login.
            localStorage.removeItem("token");
            localStorage.removeItem("userId");

            router.push("/login");
        } catch (error) {
            console.error("Account deletion failed:", error);
            alert("Unable to connect to the server. Please try again.");
        } finally {
            setDeleteAccount(false);
        }
    };

    return (
        <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 px-4 py-12">
            <div className="mx-auto max-w-2xl rounded-3xl border border-white/60 bg-white/80 p-8 shadow-xl backdrop-blur-xl sm:p-10">

                {/* Header Banner */}
                <div className="mb-8 flex items-center justify-between border-b border-gray-100 pb-6">
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                            My Profile
                        </h1>
                        <p className="mt-1 text-sm text-gray-500">Customize your account persona and security settings</p>
                    </div>
                    <button
                        onClick={() => router.push("/")}
                        className="rounded-full bg-gray-100 px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-200 transition"
                    >
                        ← Back to Home
                    </button>
                </div>

                {message.text && (
                    <div className={`mb-6 p-4 rounded-xl text-sm font-medium shadow-sm transition-all animate-bounce ${message.type === "success"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-rose-50 text-rose-700 border border-rose-200"
                        }`}>
                        {message.text}
                    </div>
                )}

                {/* Profile Information Form */}
                <form onSubmit={handleProfileUpdate} className="space-y-6">

                    {/* Avatar Upload Section */}


                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">Full Name</label>
                        <input
                            type="text"
                            value={user.name}
                            onChange={(e) => setUser({ ...user, name: e.target.value })}
                            required
                            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-black outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 transition"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">Email Address</label>
                        <input
                            type="email"
                            value={user.email}
                            onChange={(e) => setUser({ ...user, email: e.target.value })}
                            required
                            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-black outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 transition"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={savingProfile}
                        className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-200 hover:opacity-95 transition disabled:opacity-50"
                    >
                        {savingProfile ? "Saving Profile..." : "Save Profile Changes"}
                    </button>
                </form>

                <div className="my-10 border-t border-gray-200/80" />

                {/* Password Change Form */}
                <form onSubmit={handlePasswordUpdate} className="space-y-6">
                    <h2 className="text-lg font-extrabold text-gray-800">Security & Password</h2>

                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">Current Password</label>
                        <input
                            type="password"
                            value={passwords.currentPassword}
                            onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                            required
                            placeholder="••••••••"
                            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-black outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 transition"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">New Password</label>
                        <input
                            type="password"
                            value={passwords.newPassword}
                            onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                            required
                            placeholder="••••••••"
                            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-black outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 transition"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">Confirm New Password</label>
                        <input
                            type="password"
                            value={passwords.confirmPassword}
                            onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                            required
                            placeholder="••••••••"
                            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-black outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 transition"
                        />
                    </div>



                    <button
                        type="submit"
                        disabled={savingPassword}
                        className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-200 hover:opacity-95 transition disabled:opacity-50"
                    >
                        {savingPassword ? "Updating Password..." : "Update Password"}
                    </button>


                </form>

                {/* for deleting account */}
                <form onSubmit={handleDelete}>
                    <button
                        type="submit"
                        disabled={deleteAccount}
                        className=" mt-5 cursor-pointer w-full rounded-xl bg-gradient-to-r from-red-600 to-red-600 py-3 
                text-sm font-bold text-white shadow-lg shadow-red-200 hover:opacity-95 transition disabled:opacity-50"
                    >
                        {deleteAccount ? "Deleting..." : "Delete Account "}
                    </button>
                </form>

            </div>


        </main>
    );
}






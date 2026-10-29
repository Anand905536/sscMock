
"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { ThreeDots } from "react-loader-spinner";
import { apiRequest } from "@/lib/api";

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
    const [deleteAccount, setDeleteAccount] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem("token");

                if (!token) {
                    router.push("/login");
                    return;
                }

                const data = await apiRequest("/profile", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    cache: "no-store",
                });

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
            } catch (error) {
                console.error("Error fetching profile:", error);

                setMessage({
                    type: "error",
                    text: error.message || "Failed to load profile",
                });
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [router]);

    // Handle image selection and local preview
    const handleImageChange = (e) => {
        const file = e.target.files?.[0];

        if (file) {
            if (previewUrl.startsWith("blob:")) {
                URL.revokeObjectURL(previewUrl);
            }

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

            if (!token) {
                router.push("/login");
                return;
            }

            const formData = new FormData();
            formData.append("name", user.name);
            formData.append("email", user.email);

            if (selectedFile) {
                formData.append("avatar", selectedFile);
            }

            const data = await apiRequest("/profile", {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            setMessage({
                type: "success",
                text: "✨ Profile updated successfully!",
            });

            const updated = data.user || data;

            if (updated.profilePicture) {
                const avatarUrl = updated.profilePicture.startsWith("http")
                    ? updated.profilePicture
                    : `http://localhost:5000${updated.profilePicture}`;

                setUser((prev) => ({
                    ...prev,
                    avatar: avatarUrl,
                }));

                setPreviewUrl(avatarUrl);
            }

            setSelectedFile(null);
        } catch (error) {
            console.error("Profile update failed:", error);

            setMessage({
                type: "error",
                text: error.message || "Failed to update profile",
            });
        } finally {
            setSavingProfile(false);
        }
    };

    const handlePasswordUpdate = async (e) => {
        e.preventDefault();

        if (passwords.newPassword !== passwords.confirmPassword) {
            setMessage({
                type: "error",
                text: "New passwords do not match!",
            });
            return;
        }

        setSavingPassword(true);
        setMessage({ type: "", text: "" });

        try {
            const token = localStorage.getItem("token");

            if (!token) {
                router.push("/login");
                return;
            }

            await apiRequest("/profile/change-password", {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    currentPassword: passwords.currentPassword,
                    newPassword: passwords.newPassword,
                }),
            });

            setMessage({
                type: "success",
                text: "🔒 Password updated successfully!",
            });

            setPasswords({
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
            });
        } catch (error) {
            console.error("Password update failed:", error);

            setMessage({
                type: "error",
                text: error.message || "Failed to update password",
            });
        } finally {
            setSavingPassword(false);
        }
    };

    const handleDelete = async (e) => {
        e.preventDefault();

        const confirmed = window.confirm(
            "Are you sure you want to delete your account? This action may permanently affect your account."
        );

        if (!confirmed) return;

        setDeleteAccount(true);

        try {
            const userData = JSON.parse(
                localStorage.getItem("user") || "{}"
            );

            const userId = userData.id || userData._id;
            const token = localStorage.getItem("token");

            if (!userId || !token) {
                alert("Please log in again.");
                router.push("/login");
                return;
            }

            const data = await apiRequest(
                `/profile/${userId}/visibility`,
                {
                    method: "PATCH",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            alert(data.message || "Account hidden successfully.");

            localStorage.removeItem("token");
            localStorage.removeItem("user");
            localStorage.removeItem("userId");

            router.push("/login");
        } catch (error) {
            console.error("Account deletion failed:", error);

            alert(error.message || "Unable to update your account. Please try again.");
        } finally {
            setDeleteAccount(false);
        }
    };

    if (loading) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
                <div className="flex flex-col items-center gap-4">
                    <ThreeDots />
                    <p className="animate-pulse text-sm font-medium text-green-600">
                        Loading your profile...
                    </p>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 px-4 py-12">
            <div className="mx-auto max-w-2xl rounded-3xl border border-white/60 bg-white/80 p-8 shadow-xl backdrop-blur-xl sm:p-10">
                {/* Header */}
                <div className="mb-8 flex items-center justify-between border-b border-gray-100 pb-6">
                    <div>
                        <h1 className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-3xl font-extrabold tracking-tight text-transparent">
                            My Profile
                        </h1>
                        <p className="mt-1 text-sm text-gray-500">
                            Customize your account persona and security settings
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => router.push("/")}
                        className="rounded-full bg-gray-100 px-4 py-2 text-xs font-semibold text-gray-600 transition hover:bg-gray-200"
                    >
                        ← Back to Home
                    </button>
                </div>

                {message.text && (
                    <div
                        className={`mb-6 rounded-xl border p-4 text-sm font-medium shadow-sm ${
                            message.type === "success"
                                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                : "border-rose-200 bg-rose-50 text-rose-700"
                        }`}
                    >
                        {message.text}
                    </div>
                )}

                {/* Profile Information */}
                <form onSubmit={handleProfileUpdate} className="space-y-6">
                    <div>
                        <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-600">
                            Full Name
                        </label>
                        <input
                            type="text"
                            value={user.name}
                            onChange={(e) =>
                                setUser({ ...user, name: e.target.value })
                            }
                            required
                            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-black outline-none transition focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-600">
                            Email Address
                        </label>
                        <input
                            type="email"
                            value={user.email}
                            onChange={(e) =>
                                setUser({ ...user, email: e.target.value })
                            }
                            required
                            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-black outline-none transition focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={savingProfile}
                        className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-200 transition hover:opacity-95 disabled:opacity-50"
                    >
                        {savingProfile ? "Saving Profile..." : "Save Profile Changes"}
                    </button>
                </form>

                <div className="my-10 border-t border-gray-200/80" />

                {/* Password Change */}
                <form onSubmit={handlePasswordUpdate} className="space-y-6">
                    <h2 className="text-lg font-extrabold text-gray-800">
                        Security & Password
                    </h2>

                    <div>
                        <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-600">
                            Current Password
                        </label>
                        <input
                            type="password"
                            value={passwords.currentPassword}
                            onChange={(e) =>
                                setPasswords({
                                    ...passwords,
                                    currentPassword: e.target.value,
                                })
                            }
                            required
                            autoComplete="current-password"
                            placeholder="••••••••"
                            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-black outline-none transition focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-600">
                            New Password
                        </label>
                        <input
                            type="password"
                            value={passwords.newPassword}
                            onChange={(e) =>
                                setPasswords({
                                    ...passwords,
                                    newPassword: e.target.value,
                                })
                            }
                            required
                            autoComplete="new-password"
                            placeholder="••••••••"
                            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-black outline-none transition focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-600">
                            Confirm New Password
                        </label>
                        <input
                            type="password"
                            value={passwords.confirmPassword}
                            onChange={(e) =>
                                setPasswords({
                                    ...passwords,
                                    confirmPassword: e.target.value,
                                })
                            }
                            required
                            autoComplete="new-password"
                            placeholder="••••••••"
                            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-black outline-none transition focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={savingPassword}
                        className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-200 transition hover:opacity-95 disabled:opacity-50"
                    >
                        {savingPassword ? "Updating Password..." : "Update Password"}
                    </button>
                </form>

                {/* Account visibility */}
                <form onSubmit={handleDelete}>
                    <button
                        type="submit"
                        disabled={deleteAccount}
                        className="mt-5 w-full cursor-pointer rounded-xl bg-gradient-to-r from-red-600 to-red-600 py-3 text-sm font-bold text-white shadow-lg shadow-red-200 transition hover:opacity-95 disabled:opacity-50"
                    >
                        {deleteAccount ? "Deleting..." : "Delete Account"}
                    </button>
                </form>
            </div>
        </main>
    );
}

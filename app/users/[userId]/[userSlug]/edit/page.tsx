"use client";

import { account } from "@/src/models/client/config";
import { useAuthStore } from "@/src/store/Auth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import slugify from "@/src/utils/slugify";
import React from "react";

const Page = () => {
    const { user, login } = useAuthStore();
    const router = useRouter();

    const [formData, setFormData] = React.useState({
        name: user?.name || "",
    });
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState("");
    const [success, setSuccess] = React.useState("");

    // Redirect if not logged in
    React.useEffect(() => {
        if (!user) {
            router.push("/login");
        }
    }, [user, router]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!formData.name.trim()) {
            setError("Name cannot be empty");
            return;
        }

        setLoading(true);
        setError("");
        setSuccess("");

        try {
            // Update name in Appwrite
            await account.updateName(formData.name);

            // Refresh user in store by re-fetching
            const updatedUser = await account.get();
            useAuthStore.setState({ user: updatedUser as any });

            setSuccess("Profile updated successfully!");

            // Redirect to updated profile
            router.push(`/users/${user?.$id}/${slugify(formData.name)}`);

        } catch (error: any) {
            setError(error?.message || "Failed to update profile");
        }

        setLoading(false);
    };

    if (!user) return null;

    return (
        <div className="container mx-auto space-y-6 px-4 pb-20 pt-32">
            <div className="max-w-lg">
                <h1 className="text-3xl font-bold">Edit Profile</h1>
                <p className="mt-2 text-gray-500">Update your profile information</p>
            </div>

            <form onSubmit={handleSubmit} className="max-w-lg space-y-6">

                {/* Error Message */}
                {error && (
                    <div className="rounded-lg border border-red-500/50 bg-red-500/10 p-4">
                        <p className="text-sm text-red-500">{error}</p>
                    </div>
                )}

                {/* Success Message */}
                {success && (
                    <div className="rounded-lg border border-green-500/50 bg-green-500/10 p-4">
                        <p className="text-sm text-green-500">{success}</p>
                    </div>
                )}

                {/* Name Field */}
                <div className="space-y-2">
                    <Label htmlFor="name">Display Name</Label>
                    <Input
                        id="name"
                        name="name"
                        type="text"
                        placeholder="Your name"
                        value={formData.name}
                        onChange={(e) =>
                            setFormData((prev) => ({ ...prev, name: e.target.value }))
                        }
                    />
                </div>

                {/* Email - Read Only */}
                <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                        id="email"
                        name="email"
                        type="email"
                        value={user.email}
                        disabled
                        className="cursor-not-allowed opacity-50"
                    />
                    <p className="text-xs text-gray-500">Email cannot be changed</p>
                </div>

                {/* Reputation - Read Only */}
                <div className="space-y-2">
                    <Label htmlFor="reputation">Reputation</Label>
                    <Input
                        id="reputation"
                        name="reputation"
                        type="text"
                        value={user.prefs?.reputation ?? 0}
                        disabled
                        className="cursor-not-allowed opacity-50"
                    />
                    <p className="text-xs text-gray-500">
                        Reputation is earned by asking questions and giving answers
                    </p>
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex h-12 w-full animate-shimmer items-center justify-center rounded-md border border-slate-800 bg-[linear-gradient(110deg,#000103,45%,#1e2631,55%,#000103)] bg-[length:200%_100%] px-6 font-medium text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {loading ? "Saving..." : "Save Changes"}
                </button>
            </form>
        </div>
    );
};

export default Page;
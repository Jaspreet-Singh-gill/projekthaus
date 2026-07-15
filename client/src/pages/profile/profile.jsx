import React, { useState, useEffect } from "react";
import useMyDropzone from "../../lib/reactdropzone.js";
import * as z from "zod";
import { toast } from "sonner";
import { authService } from "../../api/index";
import { useNavigate } from "react-router-dom";
import { Loader } from "../../components/skeleton/loader.jsx";
import useAuthStore from "../../store/authStore.js";

const ProfilePage = () => {
    const user = useAuthStore((state) => state.user);
    const setTheUser = useAuthStore((state) => state.setTheUser);
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [gender, setGender] = useState("male");
    const [age, setAge] = useState("");
    const [organization, setOrganization] = useState("");
    const [countryCode, setCountryCode] = useState("+91");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [address, setAddress] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [files, setTheFiles] = useState(null);
    const [filesUrl, setTheFilesUrls] = useState(null);
    const { getRootProps, getInputProps, isDragActive } = useMyDropzone(setTheFiles, setTheFilesUrls);

    useEffect(() => {
        if (user) {
            setName(user.name || "");
            setGender(user.gender || "male");
            setAge(user.age ? String(user.age) : "");
            setOrganization(user.organization || "");
            setCountryCode(user.phoneNumber?.countryCode || "+91");
            setPhoneNumber(user.phoneNumber?.number || "");
            setAddress(user.address || "");
        }
    }, [user]);

    const ProfileSchema = z.object({
        name: z.string().min(1, "Name is required"),
        gender: z.string().min(1, "Gender is required"),
        age: z.preprocess((val) => (val === "" ? undefined : Number(val)), z.number().min(1, "Age must be positive").optional()),
        organization: z.string().optional().or(z.literal("")),
        address: z.string().optional().or(z.literal("")),
        phoneNumber: z.object({
            countryCode: z.string().min(1, "Country code is required"),
            number: z.string().length(10, "Phone number must be exactly 10 digits").optional().or(z.literal(""))
        }).optional()
    });

    const handleUpdateProfile = async (e) => {
        e.preventDefault();

        const payload = {
            name,
            gender,
            age: age === "" ? undefined : Number(age),
            organization,
            address,
            phoneNumber: {
                countryCode,
                number: phoneNumber
            }
        };

        const result = ProfileSchema.safeParse(payload);

        if (!result.success) {
            toast.error(result.error.issues[0].message);
            return;
        }

        const avatarFile = files && files.length > 0 ? files[0] : null;
        if (avatarFile) {
            if (!["image/jpeg", "image/png", "image/jpg"].includes(avatarFile.type)) {
                toast.error("Invalid file type. Only JPEG and PNG are allowed.");
                return;
            }
            if (avatarFile.size > 5 * 1024 * 1024) {
                toast.error("Maximum size is 5MB");
                return;
            }
        }

        try {
            setIsSubmitting(true);
            let updatedUser = user;

            // 1. Update text fields first
            const infoResponse = await authService.updateInfo(result.data);
            if (infoResponse && infoResponse.success) {
                updatedUser = infoResponse.data;
            }

            // 2. Upload avatar if selected
            if (avatarFile) {
                const avatarResponse = await authService.changeAvatar(avatarFile);
                if (avatarResponse && avatarResponse.success) {
                    updatedUser = avatarResponse.data;
                }
            }

            // 3. Update the Zustand store user
            setTheUser(updatedUser);
            setIsSubmitting(false);
            toast.success("Profile updated successfully!");
            setTheFiles(null);
            setTheFilesUrls(null);
        } catch (error) {
            setIsSubmitting(false);
            toast.error(error.response?.data?.message || error.message || "Failed to update profile");
        }
    };

    return isSubmitting ? <Loader /> : (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 relative overflow-y-auto py-12 px-4 font-sans transition-colors duration-200">
            {/* Ambient background glow */}
            <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-violet-600/10 dark:bg-violet-600/10 blur-[140px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-blue-600/10 dark:bg-blue-600/10 blur-[140px] pointer-events-none" />

            <div className="w-full max-w-2xl p-8 bg-white dark:bg-slate-900/40 backdrop-blur-md border border-slate-200 dark:border-slate-800/80 rounded-2xl shadow-2xl relative z-10 m-4 animate-fade-in">
                <div className="flex flex-col items-center mb-8">
                    {/* User profile avatar or logo */}
                    <div className="relative group mb-4">
                        <img
                            src={filesUrl && filesUrl.length > 0 ? filesUrl[0].preview : (user?.avatar?.url || "https://api.dicebear.com/7.x/initials/svg?seed=" + (user?.name || "User"))}
                            alt="Avatar"
                            className="w-24 h-24 rounded-full object-cover border-4 border-violet-500/20 group-hover:border-violet-500 transition-all duration-300 shadow-md"
                        />
                        <div
                            {...getRootProps()}
                            className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity duration-300"
                        >
                            <input {...getInputProps()} />
                            <span className="text-[10px] text-white font-semibold uppercase tracking-wider text-center px-2">Change Photo</span>
                        </div>
                    </div>

                    <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 via-slate-800 to-slate-600 dark:from-white dark:via-slate-200 dark:to-slate-400 bg-clip-text text-transparent tracking-tight">
                        My Profile
                    </h1>
                    <p className="text-sm text-slate-650 dark:text-slate-450 mt-1">
                        Update your account details and profile photo
                    </p>
                </div>

                <form onSubmit={handleUpdateProfile} className="space-y-6">
                    {/* Read-Only Info Block */}
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-850 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <span className="block text-[10px] font-semibold text-slate-500 dark:text-slate-405 uppercase tracking-wider">Username</span>
                            <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{user?.username}</span>
                        </div>
                        <div>
                            <span className="block text-[10px] font-semibold text-slate-500 dark:text-slate-405 uppercase tracking-wider">Email Address</span>
                            <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{user?.email}</span>
                        </div>
                    </div>

                    {/* Drag and drop preview details if a new photo is selected but not saved */}
                    {files && files.length > 0 && (
                        <div className="p-3 rounded-xl bg-violet-500/10 border border-violet-500/20 text-xs text-violet-600 dark:text-violet-400 text-center animate-fade-in">
                            New profile picture selected. Click "Save Changes" to upload and apply.
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Full Name */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2" htmlFor="name">
                                Full Name
                            </label>
                            <input
                                id="name"
                                type="text"
                                placeholder="John Doe"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition duration-200"
                                required
                            />
                        </div>

                        {/* Gender */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2" htmlFor="gender">
                                Gender
                            </label>
                            <select
                                id="gender"
                                value={gender}
                                onChange={(e) => setGender(e.target.value)}
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition duration-200 cursor-pointer"
                                required
                            >
                                <option value="male" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Male</option>
                                <option value="female" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Female</option>
                                <option value="other" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Other</option>
                            </select>
                        </div>

                        {/* Age */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2" htmlFor="age">
                                Age
                            </label>
                            <input
                                id="age"
                                type="number"
                                placeholder="18"
                                value={age}
                                onChange={(e) => setAge(e.target.value)}
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition duration-200"
                            />
                        </div>

                        {/* Organization */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2" htmlFor="organization">
                                Organization
                            </label>
                            <input
                                id="organization"
                                type="text"
                                placeholder="Company / Org Name"
                                value={organization}
                                onChange={(e) => setOrganization(e.target.value)}
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition duration-200"
                            />
                        </div>

                        {/* Phone Number */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2" htmlFor="phoneNumber">
                                Phone Number
                            </label>
                            <div className="flex space-x-2">
                                <input
                                    type="text"
                                    placeholder="+91"
                                    value={countryCode}
                                    onChange={(e) => setCountryCode(e.target.value)}
                                    className="w-20 px-3 py-3 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-center focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition duration-200"
                                />
                                <input
                                    id="phoneNumber"
                                    type="text"
                                    placeholder="10 digit number"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                    className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition duration-200"
                                />
                            </div>
                        </div>

                        {/* Address */}
                        <div className="md:col-span-2">
                            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2" htmlFor="address">
                                Address
                            </label>
                            <textarea
                                id="address"
                                placeholder="Your address details"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                rows={3}
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition duration-200 resize-none font-sans"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full mt-4 py-3 px-4 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white font-semibold rounded-xl shadow-lg shadow-violet-500/20 active:scale-[0.98] transition-all duration-150 cursor-pointer focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-slate-100 dark:focus:ring-offset-slate-900"
                    >
                        Save Changes
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ProfilePage;
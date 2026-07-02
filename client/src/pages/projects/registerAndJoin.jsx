import React, { useState, useEffect } from "react";
import useMyDropzone from "../../lib/reactdropzone.js";
import * as z from "zod";
import { toast } from "sonner";
import { projectService } from "../../api/index";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Loader } from "../../components/skeleton/loader.jsx";

const RegisterAndJoin = () => {
    const { projectId } = useParams();
    const [searchParams] = useSearchParams();
    const invitedEmail = searchParams.get("email") || "";

    const [email, setEmail] = useState(invitedEmail);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [gender, setGender] = useState("male");
    const [age, setAge] = useState("");
    const [organization, setOrganization] = useState("");
    const [countryCode, setCountryCode] = useState("+91");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [files, setTheFiles] = useState(null);
    const [filesUrl, setTheFilesUrls] = useState(null);
    const { getRootProps, getInputProps, isDragActive } = useMyDropzone(setTheFiles, setTheFilesUrls);
    const navigate = useNavigate();

    useEffect(() => {
        if (invitedEmail) {
            setEmail(invitedEmail);
        }
    }, [invitedEmail]);

    const UserSchema = z.object({
        email: z.string().email("Invalid email address"),
        username: z.string().min(4, "Username must be at least 4 characters"),
        password: z.string().min(8, "Password must be at least 8 characters"),
        name: z.string().nullable().or(z.literal("")),
        gender: z.string().min(1, "Gender is required"),
        age: z.number().min(18, "Must be at least 18 years old"),
        organization: z.string().min(1, "Organization is required"),
        phoneNumber: z.object({
            countryCode: z.string().min(1, "Country code is required"),
            number: z.string().length(10, "Phone number must be exactly 10 digits")
        }),
    });

    const handleRegisterAndJoin = async (e) => {
        e.preventDefault();

        const payload = {
            email,
            username,
            password,
            name: name || null,
            gender,
            age: age ? Number(age) : 0,
            organization,
            phoneNumber: {
                countryCode,
                number: phoneNumber
            }
        };

        const result = UserSchema.safeParse(payload);

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
            const data = await projectService.joinProject(projectId, result.data, avatarFile);
            setIsSubmitting(false);
            toast.success(data.message || "Registered and joined project successfully!");
            setTimeout(() => {
                navigate("/login");
            }, 3000);
        } catch (error) {
            setIsSubmitting(false);
            toast.error(error.response?.data?.message || error.message || "Registration and join failed");
        }
    };

    return isSubmitting ? <Loader /> : (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 relative overflow-y-auto py-12 px-4 font-sans transition-colors duration-200">
            {/* Ambient background glow */}
            <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-violet-600/10 dark:bg-violet-600/10 blur-[140px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-blue-600/10 dark:bg-blue-600/10 blur-[140px] pointer-events-none" />

            <div className="w-full max-w-2xl p-8 bg-white dark:bg-slate-900/40 backdrop-blur-md border border-slate-200 dark:border-slate-800/80 rounded-2xl shadow-2xl relative z-10 m-4 animate-fade-in">
                <div className="flex flex-col items-center mb-8">
                    {/* Logo/Icon */}
                    <div className="w-12 h-12 bg-gradient-to-tr from-violet-600 to-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/20 mb-4">
                        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 via-slate-800 to-slate-600 dark:from-white dark:via-slate-200 dark:to-slate-400 bg-clip-text text-transparent tracking-tight">
                        Register & Join Workspace
                    </h1>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                        Create an account to join the project workspace
                    </p>
                </div>

                <form onSubmit={handleRegisterAndJoin} className="space-y-6">
                    {/* Dropzone Avatar Upload */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                            Profile Picture
                        </label>
                        <div
                            {...getRootProps()}
                            className={`border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-all duration-200 ${isDragActive
                                ? "border-violet-500 bg-violet-500/10"
                                : "border-slate-300 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700 bg-slate-50 dark:bg-slate-950/30"
                                }`}
                        >
                            <input {...getInputProps()} />
                            {filesUrl && filesUrl.length > 0 ? (
                                <div className="flex flex-col items-center space-y-2">
                                    <img
                                        src={filesUrl[0].preview}
                                        alt="Avatar Preview"
                                        className="w-16 h-16 rounded-full object-cover border-2 border-violet-500"
                                    />
                                    <span className="text-xs text-slate-600 dark:text-slate-400">{files[0].name}</span>
                                </div>
                            ) : (
                                <div className="text-center">
                                    <svg className="w-8 h-8 text-slate-400 dark:text-slate-500 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <p className="text-xs text-slate-600 dark:text-slate-400">Drag & drop profile image, or click to select</p>
                                    <span className="text-[10px] text-slate-400 dark:text-slate-500">JPG or PNG, up to 5MB</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Username */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2" htmlFor="username">
                                Username
                            </label>
                            <input
                                id="username"
                                type="text"
                                placeholder="johndoe"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition duration-200"
                                required
                            />
                        </div>

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
                            />
                        </div>

                        {/* Email (Read-Only to prevent changing invited email) */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2" htmlFor="email">
                                Email Address (Invited)
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                disabled
                                className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-500 dark:text-slate-400 cursor-not-allowed focus:outline-none transition duration-200 font-semibold"
                                required
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2" htmlFor="password">
                                Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition duration-200"
                                required
                            />
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
                                required
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
                                    required
                                />
                                <input
                                    id="phoneNumber"
                                    type="text"
                                    placeholder="10 digit number"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                    className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition duration-200"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full mt-4 py-3 px-4 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white font-semibold rounded-xl shadow-lg shadow-violet-500/20 active:scale-[0.98] transition-all duration-150 cursor-pointer focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-slate-100 dark:focus:ring-offset-slate-900"
                    >
                        Create Account & Join Project
                    </button>
                </form>
            </div>
        </div>
    );
};

export default RegisterAndJoin;

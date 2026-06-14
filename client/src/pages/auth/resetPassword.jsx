import React, { useState } from "react";
import { authService } from "../../api/index.js";
import { useNavigate, useParams } from "react-router-dom";
import { Loader } from "../../components/skeleton/loader.jsx";
import * as z from "zod";
import { toast } from "sonner";

const Pass = z.object({
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
});

const ResetPasswordPage = () => {
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { token } = useParams();

    const handleSubmit = async (e) => {
        e.preventDefault();

        const validation = Pass.safeParse({ newPassword });
        if (!validation.success) {
            toast.error(validation.error.issues[0].message);
            return;
        }
        if (newPassword !== confirmPassword) {
            toast.error("Confirm password is not equal to new password");
            return;
        }
        try {
            setLoading(true);
            const response = await authService.resetPassword(token, { newPassword });
            toast.success(response.message || "Password reset successfully");
            setLoading(false);
            setTimeout(() => {
                navigate("/login");
            }, 4000);
        } catch (error) {
            toast.error(error.message);
            setLoading(false);
        }
    };

    return isLoading ? <Loader /> : (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 relative overflow-hidden font-sans">
            {/* Ambient background glow */}
            <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-violet-600/10 blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-blue-600/10 blur-[120px] pointer-events-none" />

            <div className="w-full max-w-md p-8 bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-2xl shadow-2xl relative z-10 m-4">
                <div className="flex flex-col items-center mb-8">
                    {/* Logo/Icon */}
                    <div className="w-12 h-12 bg-gradient-to-tr from-violet-600 to-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/20 mb-4">
                        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent tracking-tight text-center">
                        Reset Password
                    </h1>
                    <p className="text-sm text-slate-400 mt-2 text-center">
                        Please enter and confirm your new password below.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2" htmlFor="newPassword">
                            New Password
                        </label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-500">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </span>
                            <input
                                id="newPassword"
                                type="password"
                                placeholder="••••••••"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-slate-950/50 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition duration-200"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2" htmlFor="confirmPassword">
                            Confirm New Password
                        </label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-500">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </span>
                            <input
                                id="confirmPassword"
                                type="password"
                                placeholder="••••••••"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-slate-950/50 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition duration-200"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full py-3 px-4 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white font-semibold rounded-xl shadow-lg shadow-violet-500/20 active:scale-[0.98] transition-all duration-150 cursor-pointer focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-slate-900"
                    >
                        Reset Password
                    </button>
                </form>

                <div className="mt-8 text-center text-sm text-slate-400">
                    Back to{" "}
                    <span
                        onClick={() => navigate("/login")}
                        className="text-violet-400 hover:text-violet-300 font-medium hover:underline transition duration-150 cursor-pointer"
                    >
                        Sign In
                    </span>
                </div>
            </div>
        </div>
    );
};

export default ResetPasswordPage;
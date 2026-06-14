import React, { useState } from "react";
import { authService } from "../../api/index.js";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Loader } from "../../components/skeleton/loader.jsx";

const ForgetPasswordPage = () => {
    const [emailOrUsername, setEmailOrUsername] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!emailOrUsername.trim()) {
            toast.error("Please enter your email or username");
            return;
        }
        try {
            setIsLoading(true);
            const response = await authService.forgetPassword({ email: emailOrUsername, username: emailOrUsername });
            toast.success(response.message || "Reset password link is send successFully");
            setIsLoading(false);
            setTimeout(() => {
                navigate("/login");
            }, 6000);

        }
        catch (error) {
            toast.error(error.message);
            setIsLoading(false);
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
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m-5 4a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent tracking-tight text-center">
                        Forgot Password
                    </h1>
                    <p className="text-sm text-slate-400 mt-2 text-center">
                        Enter your email or username and we'll send you a link to reset your password.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2" htmlFor="identifier">
                            Email Address or Username
                        </label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-500">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                                </svg>
                            </span>
                            <input
                                id="identifier"
                                type="text"
                                placeholder="name@company.com or username"
                                value={emailOrUsername}
                                onChange={(e) => setEmailOrUsername(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-slate-950/50 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition duration-200"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full py-3 px-4 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white font-semibold rounded-xl shadow-lg shadow-violet-500/20 active:scale-[0.98] transition-all duration-150 cursor-pointer focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-slate-900"
                    >
                        Send Reset Link
                    </button>
                </form>

                <div className="mt-8 text-center text-sm text-slate-400">
                    Remember your password?{" "}
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

export default ForgetPasswordPage;


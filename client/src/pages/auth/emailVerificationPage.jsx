import React, { useState, useEffect } from "react";
import { authService } from "../../api/index.js";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Loader } from "../../components/skeleton/loader.jsx";

const waitingPage = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    if (!token) {
        toast.error("EmailVerification Token is missing");
    }
    useEffect(() => {
        async function verify() {

            try {
                setIsLoading(true);
                const res = await authService.verifyEmailAddress(token);
                toast.success(res.message);
                setIsLoading(false);
                setTimeout(() => {
                    navigate("/login");
                }, 5000);
            } catch (err) {
                toast.error(err.response?.data?.message || "Something went wrong");
            }
        }
        verify();
    }, []); // verify when first time it loads
    return isLoading ? <Loader /> : (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 relative overflow-hidden font-sans text-slate-100">
            {/* Ambient background glow */}
            <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-violet-600/10 blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-blue-600/10 blur-[120px] pointer-events-none" />

            <div className="w-full max-w-md p-8 bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-2xl shadow-2xl relative z-10 m-4 text-center">
                <div className="flex flex-col items-center py-6">
                    {/* Success Icon */}
                    <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/10">
                        <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-teal-200 bg-clip-text text-transparent tracking-tight mb-2">
                        Email Verified!
                    </h1>
                    <p className="text-sm text-slate-400 max-w-xs">
                        Your email is verified. You will be redirected to the login page sooner.
                    </p>
                </div>
            </div>
        </div>
    )
}

export default waitingPage;
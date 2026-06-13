import React from "react";

const Loader = () => {
    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-slate-950 relative overflow-hidden font-sans">
            {/* Ambient background glow */}
            <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-violet-600/10 blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-blue-600/10 blur-[120px] pointer-events-none" />

            <div className="relative z-10 flex flex-col items-center justify-center">
                {/* Large animated loading spinner */}
                <div className="relative flex items-center justify-center mb-6">
                    <div className="w-16 h-16 border-4 border-violet-500/20 border-t-violet-500 rounded-full animate-spin"></div>
                    <div className="absolute w-10 h-10 bg-gradient-to-tr from-violet-600/20 to-blue-500/20 rounded-full animate-pulse"></div>
                </div>
                <p className="text-sm text-slate-400 font-medium tracking-wide animate-pulse">
                    Loading, please wait...
                </p>
            </div>
        </div>
    );
};

export { Loader };
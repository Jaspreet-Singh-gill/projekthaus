import React from "react";
import { Link } from "react-router-dom";
import useAuthStore from "../../store/authStore.js";
import { ArrowRight } from "lucide-react";

const Home = () => {
  const { user } = useAuthStore();

  return (
    <div className="flex flex-col items-center justify-center min-h-[75vh] px-4 text-center">
      {/* Title */}
      <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl text-slate-900 dark:text-white">
        Welcome to <span className="text-violet-600 dark:text-violet-400">projektHaus</span>
      </h1>
      
      {/* Description */}
      <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-xl leading-relaxed">
        A simple and collaborative project management application. Organize your projects, assign tasks, and maintain collaborative notes with your team.
      </p>

      {/* Primary Actions */}
      <div className="mt-8 flex flex-col sm:flex-row gap-3">
        {user ? (
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1.5 px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-xl transition-all active:scale-[0.98]"
          >
            <span>Go to Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        ) : (
          <>
            <Link
              to="/register"
              className="px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-xl transition-all active:scale-[0.98] shadow-sm"
            >
              Get Started
            </Link>
            <Link
              to="/login"
              className="px-6 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold rounded-xl transition-all active:scale-[0.98]"
            >
              Sign In
            </Link>
          </>
        )}
      </div>

      {/* Feature Cards Grid (Minimal/Simple) */}
      <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-3xl text-left border-t border-slate-200 dark:border-slate-900 pt-10">
        <div>
          <h3 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
            <span>📁</span> Project Boards
          </h3>
          <p className="mt-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            Create project workspaces and manage team member access and roles.
          </p>
        </div>
        <div>
          <h3 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
            <span>✅</span> Tasks & Subtasks
          </h3>
          <p className="mt-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            Track status, priorities, and attach files to coordinate workflows.
          </p>
        </div>
        <div>
          <h3 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
            <span>📝</span> Notes
          </h3>
          <p className="mt-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            Keep meeting summaries and project specs directly inside the workspace.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;
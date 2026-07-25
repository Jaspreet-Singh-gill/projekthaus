import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] p-4 text-center">
      <div className="space-y-6 max-w-md">
        <div className="space-y-2">
          <h1 className="text-6xl font-bold text-slate-800 dark:text-slate-100">404</h1>
          <h2 className="text-xl font-medium text-slate-600 dark:text-slate-400">
            Page Not Found
          </h2>
        </div>
        
        <p className="text-slate-500 dark:text-slate-500">
          The page or project you're looking for doesn't exist, or you don't have access to it.
        </p>

        <div className="flex justify-center gap-3 pt-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft size={16} />
            Go Back
          </button>
          
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-md hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors"
          >
            <Home size={16} />
            Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;

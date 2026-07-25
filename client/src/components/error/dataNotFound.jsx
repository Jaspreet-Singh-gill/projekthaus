import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileQuestion } from 'lucide-react';

const DataNotFound = ({ 
  entityName = "Item", 
  message = `The ${entityName.toLowerCase()} you are looking for doesn't exist, has been removed, or you don't have access to it.`,
  backUrl,
  backText = "Go Back" 
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (backUrl) {
      navigate(backUrl);
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[60vh] p-4 text-center">
      <div className="space-y-6 max-w-md">
        <div className="flex justify-center text-slate-300 dark:text-slate-700 mb-4">
          <FileQuestion size={80} strokeWidth={1} />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-100">
            {entityName} Not Found
          </h2>
        </div>
        
        <p className="text-slate-500 dark:text-slate-400">
          {message}
        </p>

        <div className="flex justify-center pt-4">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors shadow-sm"
          >
            <ArrowLeft size={16} />
            {backText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DataNotFound;

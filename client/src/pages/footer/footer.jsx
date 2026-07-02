import React from "react";

const Footer = () => {
  return (
    <footer className="bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 font-sans mt-auto transition-colors duration-200 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
        <p>&copy; {new Date().getFullYear()} projektHaus. All rights reserved.</p>
        <div className="flex items-center gap-6">
          <a href="#" className="hover:text-slate-900 dark:hover:text-slate-200 transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-slate-900 dark:hover:text-slate-200 transition-colors">Terms of Service</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

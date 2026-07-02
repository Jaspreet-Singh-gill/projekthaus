import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Header from "./pages/header/hearder.jsx";
import Footer from "./pages/footer/footer.jsx";
import SideBar from "./components/layout/sideBar.jsx";
import { Sheet } from "./components/ui/index.js";
import useAuthStore from "./store/authStore.js";
import useThemeStore from "./store/themeStore.js";


const Layout = () => {
  const { user } = useAuthStore();
  const { initTheme } = useThemeStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    initTheme();
  }, [initTheme]);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <div className="flex flex-1 w-full">
        {/* Desktop Sidebar (visible on md and up) */}
        {user && (
          <aside className="hidden md:block w-64 shrink-0 h-screen sticky top-0">
            <SideBar className="h-full w-full" />
          </aside>
        )}

        {/* Mobile Sidebar Drawer (Sheet) */}
        {user && (
          <Sheet open={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)}>
            <SideBar className="h-full w-full" />
          </Sheet>
        )}

        {/* Main Content Pane */}
        <div className="flex flex-col flex-1 min-w-0">
          <Header onMenuClick={() => setIsMobileMenuOpen(true)} className="w-full" onMenuOpen={isMobileMenuOpen}/>
          <main className="flex-1 overflow-y-auto">
            <Outlet />
          </main>
        </div>
      </div>
      <Footer className="w-full" />
    </div>
  );
};

export default Layout;


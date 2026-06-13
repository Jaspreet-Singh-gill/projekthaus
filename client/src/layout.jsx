import React from "react";
import { Outlet } from "react-router-dom";
import Header from "./pages/header/hearder.jsx";
import Footer from "./pages/footer/footer.jsx";

const Layout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100">
      <Header />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;


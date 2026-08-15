// src/pages/AdminLayout.jsx

import { Outlet } from "react-router-dom";

import { useEffect, useState } from "react";

import { useAuth } from "../context/AuthContext";

import Sidebar from "../components/Sidebar.jsx";
import Topbar from "../components/Topbar.jsx";

export default function AdminLayout() {
  const { user, logout, loading } = useAuth();

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const [isMobile, setIsMobile] = useState(false);

  // =========================================================
  // RESPONSIVE SIDEBAR
  // =========================================================

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;

      setIsMobile(mobile);

      // Desktop -> sidebar open
      // Mobile -> sidebar closed
      setIsSidebarOpen(!mobile);
    };

    handleResize();

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // =========================================================
  // LOADING
  // =========================================================

  if (loading || !user) {
    return (
      <div
        className="
          min-h-screen
          flex
          items-center
          justify-center
          bg-slate-100
        "
      >
        <div className="text-center">
          <div
            className="
              mx-auto
              h-10
              w-10
              animate-spin
              rounded-full
              border-4
              border-slate-300
              border-t-slate-900
            "
          />

          <p className="mt-4 text-sm text-slate-600">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  // =========================================================
  // SIDEBAR TOGGLE
  // =========================================================

  const toggleSidebar = () => {
    setIsSidebarOpen((previous) => !previous);
  };

  // =========================================================
  // CLOSE SIDEBAR
  // =========================================================

  const closeSidebar = () => {
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  };

  // =========================================================
  // ADMIN LAYOUT
  // =========================================================

  return (
    <div className="min-h-screen bg-slate-100">
      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <Sidebar user={user} isOpen={isSidebarOpen} onClose={closeSidebar} onLogout={logout} />

      {/* =====================================================
          MAIN CONTENT AREA
      ===================================================== */}

      <div
        className={`
          min-h-screen
          transition-all
          duration-300

          ${!isMobile && isSidebarOpen ? "lg:ml-72" : ""}
        `}
      >
        {/* ===================================================
            TOPBAR
        =================================================== */}

        <Topbar user={user} toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />

        {/* ===================================================
            PAGE CONTENT
        =================================================== */}

        <main className="min-h-screen pt-16">
          <div
            className="
              p-4
              sm:p-6
              lg:p-8
            "
          >
            <Outlet />
          </div>
        </main>
      </div>

      {/* =====================================================
          MOBILE OVERLAY
      ===================================================== */}

      {isMobile && isSidebarOpen && (
        <div
          className="
            fixed
            inset-0
            z-40
            bg-black/50
          "
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}
    </div>
  );
}

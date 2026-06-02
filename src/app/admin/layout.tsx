"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../../../components/Sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/login");
    } else {
      setAuthorized(true);
      // Close sidebar by default on mobile
      if (typeof window !== 'undefined' && window.innerWidth < 768) {
        setSidebarOpen(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (authorized === null || authorized === false) {
    return <div style={{ background: "#0f0f13", height: "100vh" }} />;
  }

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        background: "#0f0f13",
        overflow: "hidden",
        flexDirection: "row",
        position: "relative",
      }}
    >
      <style>{`
        @media (max-width: 1024px) {
          main {
            padding: 20px 24px !important;
          }
        }
        @media (max-width: 768px) {
          main {
            padding: 60px 16px 16px 16px !important;
          }
        }
        @media (max-width: 640px) {
          main {
            padding: 60px 12px 12px 12px !important;
          }
        }
      `}</style>

      {/* Mobile menu overlay */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.5)",
          zIndex: 998,
          display: "none",
          pointerEvents: sidebarOpen ? "auto" : "none",
        }}
        className="mobile-overlay"
        onClick={() => setSidebarOpen(false)}
      />

      <style>{`
        @media (max-width: 768px) {
          .mobile-overlay {
            display: block;
          }
        }
      `}</style>

      {/* Sidebar */}
      <div
        style={{
          position: "relative",
          zIndex: 999,
          transition: "transform 0.3s ease",
          transform: sidebarOpen ? "translateX(0)" : "translateX(-100%)",
          width: "100%",
          maxWidth: "220px",
          flexShrink: 0,
        }}
        className="sidebar-wrapper"
      >
        <style>{`
          @media (max-width: 768px) {
            .sidebar-wrapper {
              position: fixed;
              top: 0;
              left: 0;
              height: 100vh;
              width: 220px;
            }
          }
        `}</style>
        <Sidebar isSidebarOpen={sidebarOpen} setIsSidebarOpen={setSidebarOpen} />
      </div>

      {/* Page content */}
      <main
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "24px 32px",
          color: "#e8e8f0",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          width: "100%",
        }}
      >
        {/* Mobile menu toggle - visible on mobile only */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          style={{
            display: "none",
            position: "fixed",
            top: 12,
            left: 12,
            background: "#1a1a26",
            border: "1px solid #1e1e2e",
            color: "#e8e8f0",
            fontSize: 24,
            cursor: "pointer",
            zIndex: 1001,
            padding: "8px 10px",
            borderRadius: "8px",
            transition: "all 0.2s ease",
            lineHeight: "1",
          }}
          className="menu-toggle"
          aria-label="Toggle sidebar"
          title="Toggle sidebar"
        >
          ☰
        </button>

        <style>{`
          @media (max-width: 768px) {
            .menu-toggle {
              display: block !important;
            }
            .menu-toggle:active {
              background: #2a2a3a;
            }
          }
        `}</style>

        {children}
      </main>
    </div>
  );
}
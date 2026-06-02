"use client";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import { getApiUrl } from "../lib/getApiUrl";
import fetchWithAuth from "../lib/fetchWithAuth";

interface SidebarProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (value: boolean) => void;
}

const NAV = [
  {
    id: "categories",
    label: "Categories",
    path: "/admin/categories",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
      </svg>
    ),
  },
  {
    id: "subcategories",
    label: "Brands ",
    path: "/admin/subcategory",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
      </svg>
    ),
  },
  {
    id: "products",
    label: "Products",
    path: "/admin/products",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
        <line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" />
      </svg>
    ),
  },
  {
    id: "banners",
    label: "Banners",
    path: "/admin/banners",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M9 21V9" />
      </svg>
    ),
  },
];

export default function Sidebar({ isSidebarOpen, setIsSidebarOpen }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [userEmail, setUserEmail] = useState("admin@clearglass.com");
  const [userImage, setUserImage] = useState<string | null>(null);

  const api = getApiUrl();
  const apiBase = api.replace(/\/api\/?$/, '');

  const resolveImageUrl = (raw?: string | null) => {
    if (!raw) return undefined;
    if (raw.startsWith('data:')) return raw;
    if (raw.startsWith('//')) return `https:${raw}`;
    if (raw.startsWith('http://')) return raw.replace('http://', 'https://');
    if (raw.startsWith('https://')) return raw;
    if (raw.startsWith('/')) return `${apiBase}${raw}`;
    if (raw.includes('.') && !raw.includes(' ')) return `https://${raw}`;
    return raw;
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const email = localStorage.getItem("email");
      if (email) setUserEmail(email);

      // attempt to read profile image from common localStorage keys
      const keys = ["image", "avatar", "profileImage", "photo", "avatarUrl"];
      let img: string | null = null;
      for (const k of keys) {
        const v = localStorage.getItem(k);
        if (v) { img = v; break; }
      }
      // also check serialized user object
      if (!img) {
        const userJson = localStorage.getItem('user');
        if (userJson) {
          try {
            const u = JSON.parse(userJson);
            img = u?.image || u?.avatar || u?.profileImage || u?.photo || u?.avatarUrl || null;
          } catch (e) { /* ignore */ }
        }
      }
      /////////////
      if (img) {
  setUserImage(resolveImageUrl(img) || null);
} else {
  console.log("No local user image");
}

      //////////////////
    }
  }, []);

  const handleNavClick = (path: string) => {
    router.push(path);
    // Close sidebar on mobile after navigation
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    router.replace("/login");
  };

  return (
    <>
      <style>{`
        /* Overlay backdrop */
        .sidebar-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.3s ease-out;
          z-index: 40;
        }

        .sidebar-overlay.active {
          opacity: 1;
          pointer-events: auto;
        }

        /* Sidebar container */
        .sidebar {
          position: fixed;
          left: 0;
          top: 0;
          width: 240px;
          height: 100vh;
          background: #13131a;
          border-right: 1px solid #1e1e2e;
          display: flex;
          flex-direction: column;
          padding: 24px 0;
          transform: translateX(-100%);
          transition: transform 0.3s ease-out;
          z-index: 50;
          pointer-events: auto;
          overflow-y: auto;
          font-family: 'DM Sans', sans-serif;
          box-shadow: 2px 0 15px rgba(0, 0, 0, 0.4);
        }

        .sidebar.open {
          transform: translateX(0);
          pointer-events: auto;
        }

        /* Desktop - sidebar always visible, no positioning needed */
        @media (min-width: 768px) {
          .sidebar {
            position: relative;
            width: 240px;
            height: 100%;
            transform: translateX(0);
            z-index: auto;
            border-right: 1px solid #1e1e2e;
            box-shadow: none;
            flex-shrink: 0;
          }

          .sidebar-overlay {
            display: none !important;
          }

          .sidebar-overlay.active {
            display: none !important;
          }
        }

        /* Sidebar header/logo */
        .sidebar-header {
          padding: 0 24px 24px;
          border-bottom: 1px solid #1e1e2e;
        }

        .sidebar-logo {
          font-family: 'Syne', sans-serif;
          font-size: 20px;
          font-weight: 800;
          letter-spacing: -0.02em;
          color: #e8e8f0;
          margin: 0;
        }

        .sidebar-logo-accent {
          color: var(--brand);
        }

        .sidebar-subtext {
          font-size: 11px;
          color: #44445a;
          margin-top: 2px;
          font-weight: 500;
          letter-spacing: 0.06em;
        }

        /* Navigation section */
        .sidebar-nav {
          margin-top: 20px;
          flex: 1;
          overflow-y: auto;
        }

        .sidebar-nav-label {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.12em;
          color: #33334a;
          padding: 0 24px 10px;
          text-transform: uppercase;
        }

        /* Navigation items */
        .nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 24px;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          font-weight: 500;
          color: #666680;
          border-left: 3px solid transparent;
          transition: all 0.18s ease;
          user-select: none;
          letter-spacing: 0.01em;
          margin: 0 12px;
          border-radius: 0 8px 8px 0;
        }

        .nav-item:hover {
          color: #c4c4e0;
          background: #1a1a26;
          border-left-color: var(--brand);
        }

        .nav-item.active {
          color: var(--brand);
          background: linear-gradient(90deg, rgba(190, 24, 93, 0.1) 0%, transparent 100%);
          border-left-color: var(--brand);
          font-weight: 600;
        }

        .nav-item.active svg {
          color: var(--brand);
        }

        .nav-item svg {
          color: currentColor;
          transition: color 0.18s ease;
          flex-shrink: 0;
        }

        /* Sidebar footer */
        .sidebar-footer {
          padding: 20px 24px;
          border-top: 1px solid #1e1e2e;
          margin-top: auto;
        }

        .user-profile {
          display: flex;
          align-items: center;
          gap: 10px;
          padding-bottom: 12px;
        }

        .user-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--brand), var(--brand-dark));
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          font-weight: 700;
          color: #fff;
          flex-shrink: 0;
        }

        .user-info {
          min-width: 0;
          flex: 1;
        }

        .user-name {
          font-size: 13px;
          font-weight: 600;
          color: #c4c4e0;
          margin: 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .user-email {
          font-size: 11px;
          color: #44445a;
          margin: 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .logout-btn {
          padding: 12px 24px;
          cursor: pointer;
          color: #666680;
          border: none;
          background: transparent;
          border-radius: 8px;
          transition: all 0.2s ease;
          font-size: 14px;
          font-weight: 500;
          width: 100%;
          text-align: left;
          font-family: 'DM Sans', sans-serif;
        }

        .logout-btn:hover {
          color: #ff6666;
          background: rgba(255, 68, 68, 0.05);
        }

        .logout-btn:active {
          background: rgba(255, 68, 68, 0.1);
        }

        /* Mobile adjustments */
        @media (max-width: 767px) {
          .sidebar {
            width: 220px;
          }

          .sidebar-header {
            padding: 20px 24px 24px;
          }

          .nav-item {
            padding: 10px 24px;
            margin: 0;
            border-radius: 0;
            font-size: 13px;
          }

          .sidebar-footer {
            padding: 16px 24px;
          }
        }

        /* Scrollbar styling */
        .sidebar::-webkit-scrollbar {
          width: 4px;
        }

        .sidebar::-webkit-scrollbar-track {
          background: transparent;
        }

        .sidebar::-webkit-scrollbar-thumb {
          background: #2a2a38;
          border-radius: 4px;
        }

        .sidebar::-webkit-scrollbar-thumb:hover {
          background: #3a3a48;
        }
      `}</style>

      {/* Overlay - click to close sidebar on mobile */}
      <div
        className={`sidebar-overlay${isSidebarOpen ? " active" : ""}`}
        onClick={() => setIsSidebarOpen(false)}
        aria-hidden={!isSidebarOpen}
      />

      {/* Sidebar */}
      <aside className={`sidebar${isSidebarOpen ? " open" : ""}`} role="navigation">
        {/* Logo Section */}
        <div className="sidebar-header" style={{ textAlign: 'center', padding: '20px 16px 16px' }}>
          <div style={{
            background: "#ffffff",
            borderRadius: "12px",
            padding: "8px",
            margin: "0 auto 10px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100px",
            height: "100px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
            border: "1px solid #1e1e2e",
          }}>
            <Image
              src="/icon-192x192.png"
              alt="Clear Glass Admin"
              width={84}
              height={84}
              style={{ objectFit: 'contain', width: '100%', height: '100%' }}
              priority
            />
          </div>
          <p className="sidebar-subtext" style={{ marginTop: '4px' }}>CONTROL PANEL</p>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          <div className="sidebar-nav-label">Management</div>
          {NAV.map((item) => (
            <div
              key={item.id}
              className={`nav-item${pathname === item.path ? " active" : ""}`}
              onClick={() => handleNavClick(item.path)}
              role="menuitem"
              tabIndex={0}
            >
              {item.icon}
              <span>{item.label}</span>
            </div>
          ))}
        </nav>

        {/* Footer Section */}
        <div className="sidebar-footer">
          <div className="user-profile">
            <div className="user-avatar">
              {userImage ? (
                <Image
                  src={userImage}
                  alt={userEmail}
                  width={32}
                  height={32}
                  style={{ objectFit: 'cover', borderRadius: '50%' }}
                  unoptimized
                />
              ) : (
                userEmail.charAt(0).toUpperCase()
              )}
            </div>
            <div className="user-info">
              <p className="user-name">Admin</p>
              <p className="user-email">{userEmail}</p>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
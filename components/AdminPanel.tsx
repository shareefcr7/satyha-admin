// "use client";
// import { useState } from "react";
// import Sidebar from "./Sidebar";
// import Categories from "./Categories";
// import Products from "./Products";
// import Banners from "./Banners";

// export default function AdminPanel() {
//   const [isSidebarOpen, setIsSidebarOpen] = useState(false);
//   const [active] = useState("categories");

//   const renderPage = () => {
//     if (active === "categories") return <Categories />;
//     if (active === "products") return <Products />;
//     if (active === "banners") return <Banners />;
//   };

//   return (
//     <>
//       <style>{`
//         @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Syne:wght@600;700;800&display=swap');
        
//         * {
//           box-sizing: border-box;
//           margin: 0;
//           padding: 0;
//         }

//         body, html {
//           margin: 0;
//           padding: 0;
//         }

//         ::-webkit-scrollbar {
//           width: 4px;
//         }

//         ::-webkit-scrollbar-track {
//           background: transparent;
//         }

//         ::-webkit-scrollbar-thumb {
//           background: #2a2a38;
//           border-radius: 10px;
//         }

//         /* Admin layout container */
//         .admin-layout {
//           display: flex;
//           height: 100vh;
//           background: #0f0f13;
//           font-family: 'DM Sans', sans-serif;
//           overflow: hidden;
//         }

//         /* Main content area - takes full width on mobile */
//         .admin-main {
//           flex: 1;
//           display: flex;
//           flex-direction: column;
//           width: 100%;
//           min-width: 0;
//           overflow: hidden;
//         }

//         /* Header with hamburger menu (mobile only) */
//         .admin-header {
//           display: none;
//           align-items: center;
//           gap: 12px;
//           padding: 16px 20px;
//           background: #13131a;
//           border-bottom: 1px solid #1e1e2e;
//           z-index: 40;
//         }

//         /* Hamburger button */
//         .hamburger-btn {
//           display: none;
//           align-items: center;
//           justify-content: center;
//           width: 40px;
//           height: 40px;
//           border: 1px solid #1e1e2e;
//           background: transparent;
//           color: #e8e8f0;
//           cursor: pointer;
//           border-radius: 8px;
//           transition: all 0.2s ease;
//           padding: 0;
//           font-size: 20px;
//         }

//         .hamburger-btn:active {
//           background: #1a1a26;
//         }

//         .hamburger-btn svg {
//           width: 20px;
//           height: 20px;
//           stroke-width: 2;
//         }

//         /* Page title in header */
//         .header-title {
//           font-family: 'Syne', sans-serif;
//           font-size: 16px;
//           font-weight: 700;
//           color: #e8e8f0;
//         }

//         /* Main content scrollable area */
//         .admin-content {
//           flex: 1;
//           overflow-y: auto;
//           padding: 36px 40px;
//           background: #0f0f13;
//           color: #e8e8f0;
//           min-width: 0;
//         }

//         /* Mobile breakpoint - show header and hamburger */
//         @media (max-width: 767px) {
//           .hamburger-btn {
//             display: flex;
//           }

//           .admin-header {
//             display: flex;
//           }

//           .admin-layout {
//             flex-direction: column;
//             height: 100vh;
//           }

//           .admin-main {
//             flex-direction: column;
//             height: 100vh;
//           }

//           .admin-content {
//             padding: 20px 16px;
//           }
//         }

//         /* Desktop breakpoint - hide header */
//         @media (min-width: 768px) {
//           .hamburger-btn {
//             display: none !important;
//           }

//           .admin-header {
//             display: none !important;
//           }

//           .admin-layout {
//             flex-direction: row;
//           }

//           .admin-main {
//             flex-direction: column;
//           }
//         }
//       `}</style>

//       <div className="admin-layout">
//         {/* Sidebar - responsive positioning handled by Sidebar component */}
//         <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

//         {/* Main content area */}
//         <div className="admin-main">
//           {/* Mobile header with hamburger */}
//           <div className="admin-header">
//             <button
//               className="hamburger-btn"
//               onClick={() => setIsSidebarOpen(!isSidebarOpen)}
//               aria-label="Toggle sidebar"
//               aria-expanded={isSidebarOpen}
//             >
//               <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
//                 <line x1="3" y1="6" x2="21" y2="6" />
//                 <line x1="3" y1="12" x2="21" y2="12" />
//                 <line x1="3" y1="18" x2="21" y2="18" />
//               </svg>
//             </button>
//             <h1 className="header-title">Admin Panel</h1>
//           </div>

//           {/* Scrollable content */}
//           <div className="admin-content">
//             {renderPage()}
//           </div>
//         </div>
//       </div>
//     </>
//   );
// }
import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import BackToHome from './BackToHome';
import { Menu } from 'lucide-react';


const Layout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  React.useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/dashboard') return 'Dashboard';
    if (path === '/admin/categories') return 'Category Management';
    if (path === '/admin/activity-types') return 'Activity Type Management';
    if (path === '/admin/emission-factors') return 'Emission Factor Management';
    if (path === '/activity-logs') return 'Activity Logs';
    if (path === '/reports') return 'Reports & Analytics';
    if (path === '/profile') return 'Profile';
    return 'EcoTrack';
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex">
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((v) => !v)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <div className="flex-1 flex flex-col min-h-screen min-w-0">
{/* Top bar with mobile hamburger */}
        <header className="h-14 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden p-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="text-sm sm:text-base font-bold text-white">{getPageTitle()}</h2>
          </div>

          <div className="flex items-center gap-2">
            <BackToHome />
          </div>
        </header>

        <main className="flex-1 px-4 sm:px-6 py-6">{children}</main>
      </div>
    </div>
  );
};

export default Layout;

import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import OfflineBanner from './OfflineBanner';
import InstallPrompt from './InstallPrompt';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Offline Banner - shows at top when offline */}
      <OfflineBanner />

      <Navbar onMenuClick={() => setSidebarOpen(true)} />
      <div className="flex relative">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        <main className="flex-1 p-4 md:p-6 w-full overflow-hidden">
          <Outlet />
        </main>
      </div>

      {/* Install Prompt - shows at bottom right when installable */}
      <InstallPrompt />
    </div>
  );
};

export default Layout;

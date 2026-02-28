import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const DashboardLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="min-h-screen bg-bg-main text-slate-100 font-sans selection:bg-emerald-500/30">
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      
      <div className="lg:pl-64 flex flex-col min-h-screen transition-all duration-300">
        <Navbar toggleSidebar={toggleSidebar} />
        
        <main className="grow p-4 lg:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>

        <footer className="p-6 border-t border-slate-800/30 text-center text-slate-600 text-xs">
          © 2026 AI Learning Assistant. Built with Antigravity.
        </footer>
      </div>
    </div>
  );
};

export default DashboardLayout;

import { useState } from 'react';
import Sidebar from './Sidebar';
import NotificationBell from './NotificationBell';
import { Menu } from 'lucide-react';

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-neutral-100">
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main area */}
      <div className="lg:ml-64">
        
        {/* Mobile header */}
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-neutral-200 bg-white/80 px-4 backdrop-blur-md lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-1.5 text-neutral-600 hover:bg-neutral-100"
          >
            <Menu size={22} />
          </button>
          <span className="text-lg font-bold text-neutral-900">
            The<span className="text-maroon-800">Hub</span>
          </span>
          
          {/* Mobile Bell */}
          <NotificationBell />
        </header>

        {/* Desktop Bell (Floating top-right) */}
        <div className="sticky top-0 z-30 hidden h-0 items-start justify-end px-6 pt-3 lg:flex">
          <NotificationBell />
        </div>

        {/* Page content */}
        <main className="mx-auto max-w-3xl px-4 py-6">{children}</main>
      </div>
    </div>
  );
}
/**
 * DashboardLayout.jsx
 * -----------------------------------------
 * Shell for all authenticated app pages: Sidebar + Navbar + content
 * outlet.
 * BATCH 2 UPDATE (visual only): slightly increased content max-width
 * breathing room and a subtle canvas-to-surface gradient behind main
 * content for depth. Structure (Sidebar, Navbar, Outlet nesting) is
 * unchanged.
 */

import { Outlet } from 'react-router-dom';
import Sidebar from '../ui/organisms/Sidebar';
import Navbar from '../ui/organisms/Navbar';

export default function DashboardLayout() {
  return (
    <div className="flex min-h-screen bg-canvas">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Navbar />
        <main className="flex-1 p-6 lg:p-8">
          <div className="mx-auto max-w-[1440px] animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
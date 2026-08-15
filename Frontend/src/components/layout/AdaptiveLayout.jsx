/**
 * AdaptiveLayout.jsx
 * -----------------------------------------
 * Chooses the correct shell for pages that must remain PUBLICLY
 * accessible but should also feel fully integrated into the
 * authenticated app when the visitor is logged in — Career Explorer,
 * Career Path Detail, Course Explorer, Course Comparison, Course
 * Detail, and Platform Comparison.
 *
 * ROOT CAUSE THIS FIXES: these pages were previously rendered ONLY
 * inside MainLayout (the public marketing shell). Since the
 * authenticated Sidebar links directly to several of them, clicking
 * those links from inside the dashboard caused the user to lose the
 * Sidebar/Navbar entirely, with no consistent way back — and links
 * like "Compare Platforms" or "How it Works" behaved differently
 * depending on which shell happened to be active.
 *
 * This component adds no UI of its own. It decides, from live auth
 * state, whether to mount DashboardLayout (Sidebar + Navbar) or
 * MainLayout (public header). Page content (<Outlet/>) is completely
 * unaffected either way. Guests always see MainLayout, exactly as
 * before — access is never gated by this component, only the
 * surrounding chrome changes.
 */

import { useSelector } from 'react-redux';
import DashboardLayout from './DashboardLayout';
import MainLayout from './MainLayout';
import Spinner from '../ui/atoms/Spinner';

export default function AdaptiveLayout() {
  const { status } = useSelector((state) => state.auth);

  // App.jsx's AuthBootstrap already resolves auth status before
  // AppRouter (and therefore this component) ever renders, so this
  // branch is a defensive fallback rather than an expected runtime
  // path — kept for safety against any future change to that gate.
  if (status === 'idle' || status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas">
        <Spinner size={32} />
      </div>
    );
  }

  return status === 'authenticated' ? <DashboardLayout /> : <MainLayout />;
}
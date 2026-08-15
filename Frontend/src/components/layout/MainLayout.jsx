/**
 * MainLayout.jsx
 * -----------------------------------------
 * Public marketing/browsing shell.
 * BATCH 2 UPDATE (visual only): matched the refined glass-blur/border
 * treatment used by Navbar.jsx for visual consistency across public
 * and authenticated shells, smoother link hover states. ALL logic is
 * byte-identical to the previous batch: isAuthenticated check,
 * Dashboard button vs Log In/Get Started, "How it Works" ->
 * `${ROUTES.LANDING}#how-it-works`, every route destination.
 */

import { Link, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Button from '../ui/atoms/Button';
import { ROUTES } from '../../routes/routeConfig';

export default function MainLayout() {
  const { status } = useSelector((state) => state.auth);
  const isAuthenticated = status === 'authenticated';

  return (
    <div className="min-h-screen bg-canvas">
      <header className="sticky top-0 z-40 border-b border-border-subtle bg-surface/70 backdrop-blur-lg">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-6">
          <Link
            to={isAuthenticated ? ROUTES.DASHBOARD : ROUTES.LANDING}
            className="text-lg font-semibold tracking-tight text-text-primary"
          >
            Career Platform
          </Link>
          <nav className="hidden items-center gap-6 text-sm text-text-secondary md:flex">
            <Link
              to={`${ROUTES.LANDING}#how-it-works`}
              className="transition-colors duration-150 hover:text-text-primary"
            >
              How it Works
            </Link>
            <Link
              to={ROUTES.CAREER_EXPLORER}
              className="transition-colors duration-150 hover:text-text-primary"
            >
              Career Explorer
            </Link>
            <Link
              to={ROUTES.PLATFORM_COMPARISON}
              className="transition-colors duration-150 hover:text-text-primary"
            >
              Compare Platforms
            </Link>
          </nav>
          {isAuthenticated ? (
            <Link to={ROUTES.DASHBOARD}>
              <Button size="sm" variant="secondary">
                Dashboard
              </Button>
            </Link>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to={ROUTES.LOGIN}
                className="text-sm font-medium text-text-secondary transition-colors duration-150 hover:text-text-primary"
              >
                Log In
              </Link>
              <Link to={ROUTES.REGISTER}>
                <Button size="sm">Get Started</Button>
              </Link>
            </div>
          )}
        </div>
      </header>
      <Outlet />
    </div>
  );
}
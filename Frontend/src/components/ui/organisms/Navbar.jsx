/**
 * Navbar.jsx
 * -----------------------------------------
 * Top navigation bar.
 * BATCH 2 UPDATE (visual only): refined glass-blur border, smoother
 * icon-button hover states, dropdown menu now animates in, avatar
 * button gets a subtle ring on hover. ALL logic unchanged: theme
 * toggle, notifications link, avatar-menu open/close (including
 * click-outside handling), logout call, and every destination route.
 */

import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sun, Moon, Bell, ChevronDown, LogOut, User, Settings } from 'lucide-react';
import { useSelector } from 'react-redux';
import { useTheme } from '../../../app/providers/ThemeProvider';
import { useAuth } from '../../../features/auth/hooks/useAuth';
import Avatar from '../atoms/Avatar';
import { ROUTES } from '../../../routes/routeConfig';

export default function Navbar() {
  const { user } = useSelector((state) => state.auth);
  const { theme, toggleTheme } = useTheme();
  const { logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-end gap-1.5 border-b border-border-subtle bg-surface/70 px-6 backdrop-blur-lg">
      <button
        onClick={toggleTheme}
        className="rounded-md p-2 text-text-secondary transition-all duration-150 hover:bg-surface-secondary hover:text-text-primary"
        aria-label="Toggle theme"
      >
        {theme === 'dark' ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
      </button>

      <Link
        to={ROUTES.NOTIFICATIONS}
        className="rounded-md p-2 text-text-secondary transition-all duration-150 hover:bg-surface-secondary hover:text-text-primary"
        aria-label="Notifications"
      >
        <Bell className="h-[18px] w-[18px]" />
      </Link>

      <div className="relative ml-1" ref={menuRef}>
        <button
          onClick={() => setMenuOpen((prev) => !prev)}
          className="flex items-center gap-2 rounded-md p-1.5 transition-all duration-150 hover:bg-surface-secondary"
        >
          <Avatar fullName={user?.fullName} size="sm" />
          <ChevronDown
            className={`h-4 w-4 text-text-tertiary transition-transform duration-150 ${menuOpen ? 'rotate-180' : ''}`}
          />
        </button>

        {menuOpen && (
          <div className="animate-fade-in-up absolute right-0 top-12 w-56 rounded-lg border border-border-subtle bg-surface py-1 shadow-lg">
            <div className="border-b border-border-subtle px-4 py-2.5">
              <p className="truncate text-sm font-medium text-text-primary">{user?.fullName}</p>
              <p className="truncate text-xs text-text-tertiary">{user?.email}</p>
            </div>
            <Link
              to={ROUTES.PROFILE}
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2 px-4 py-2 text-sm text-text-secondary transition-colors duration-150 hover:bg-surface-secondary hover:text-text-primary"
            >
              <User className="h-4 w-4" /> Profile
            </Link>
            <Link
              to={ROUTES.SETTINGS}
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2 px-4 py-2 text-sm text-text-secondary transition-colors duration-150 hover:bg-surface-secondary hover:text-text-primary"
            >
              <Settings className="h-4 w-4" /> Settings
            </Link>
            <button
              onClick={logout}
              className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-danger transition-colors duration-150 hover:bg-danger/10"
            >
              <LogOut className="h-4 w-4" /> Log out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
/**
 * Sidebar.jsx
 * -----------------------------------------
 * Desktop sidebar navigation.
 * BATCH 2 UPDATE (visual only): refined active-state treatment (soft
 * glow + accent bar), smoother hover, better section-label spacing,
 * and a small logo mark. Nav item list, routes, and grouping are
 * byte-identical to the previous batch (including the earlier
 * Compare Courses / Compare Platforms addition).
 */

import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ClipboardList,
  Compass,
  Target,
  Sparkles,
  Route as RouteIcon,
  BookOpen,
  Scale,
  FileText,
  Github,
  Globe,
  MessagesSquare,
  Settings,
  Bell,
} from 'lucide-react';
import { classNames } from '../../../utils';
import { ROUTES } from '../../../routes/routeConfig';

const PRIMARY_NAV = [
  { to: ROUTES.DASHBOARD, label: 'Dashboard', icon: LayoutDashboard },
  { to: ROUTES.SKILL_ASSESSMENT, label: 'Skill Assessment', icon: ClipboardList },
  { to: ROUTES.CAREER_EXPLORER, label: 'Career Explorer', icon: Compass },
  { to: ROUTES.SKILL_GAP, label: 'Skill Gap', icon: Target },
  { to: ROUTES.RECOMMENDATIONS, label: 'Recommendations', icon: Sparkles },
  { to: ROUTES.ROADMAP, label: 'Roadmap', icon: RouteIcon },
  { to: ROUTES.COURSE_EXPLORER, label: 'Courses', icon: BookOpen },
  { to: ROUTES.COURSE_COMPARISON, label: 'Compare Courses', icon: Scale },
  { to: ROUTES.PLATFORM_COMPARISON, label: 'Compare Platforms', icon: Scale },
  { to: ROUTES.INTERVIEW_PREP, label: 'Interview Prep', icon: MessagesSquare },
];

const TOOLS_NAV = [
  { to: ROUTES.RESUME_ANALYZER, label: 'Resume Analyzer', icon: FileText },
  { to: ROUTES.GITHUB_ANALYZER, label: 'GitHub Analyzer', icon: Github },
  { to: ROUTES.PORTFOLIO_ANALYZER, label: 'Portfolio Analyzer', icon: Globe },
];

const SECONDARY_NAV = [
  { to: ROUTES.NOTIFICATIONS, label: 'Notifications', icon: Bell },
  { to: ROUTES.SETTINGS, label: 'Settings', icon: Settings },
];

function NavItem({ to, label, icon: Icon }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        classNames(
          'group relative flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium',
          'transition-all duration-150 ease-out',
          isActive
            ? 'bg-brand-subtle text-brand shadow-[inset_2px_0_0_0_var(--color-brand)]'
            : 'text-text-secondary hover:translate-x-0.5 hover:bg-surface-secondary hover:text-text-primary'
        )
      }
    >
      <Icon className="h-[18px] w-[18px] shrink-0 transition-transform duration-150 group-hover:scale-105" />
      <span className="truncate">{label}</span>
    </NavLink>
  );
}

export default function Sidebar() {
  return (
    <aside className="hidden w-[260px] shrink-0 flex-col border-r border-border-subtle bg-surface md:flex">
      <div className="flex h-16 items-center gap-2.5 px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gradient-to-br from-brand to-accent text-white shadow-sm">
          <RouteIcon className="h-4 w-4" />
        </div>
        <span className="text-[15px] font-semibold tracking-tight text-text-primary">
          Career Platform
        </span>
      </div>

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-3">
        {PRIMARY_NAV.map((item) => (
          <NavItem key={item.to} {...item} />
        ))}

        <div className="my-3 border-t border-border-subtle" />
        <span className="px-3 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-text-tertiary">
          Analyzer Tools
        </span>
        {TOOLS_NAV.map((item) => (
          <NavItem key={item.to} {...item} />
        ))}

        <div className="my-3 border-t border-border-subtle" />
        {SECONDARY_NAV.map((item) => (
          <NavItem key={item.to} {...item} />
        ))}
      </nav>
    </aside>
  );
}
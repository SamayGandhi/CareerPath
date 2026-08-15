/**
 * AuthLayout.jsx
 * -----------------------------------------
 * Split-screen shell for Login/Register/Forgot-Password pages.
 * BATCH 2 UPDATE (visual only): brand panel now uses a richer
 * navy-to-brand gradient with a subtle radial glow accent, refined
 * typography. Structure and content (copy, links, form outlet) are
 * unchanged.
 */

import { Outlet, Link } from 'react-router-dom';
import { ROUTES } from '../../routes/routeConfig';

export default function AuthLayout() {
  return (
    <div className="flex min-h-screen">
      <div className="relative hidden flex-1 flex-col justify-between overflow-hidden bg-gradient-to-br from-[#0d1424] via-brand to-accent p-12 text-white lg:flex">
        <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-16 h-80 w-80 rounded-full bg-accent/30 blur-3xl" />

        <Link to={ROUTES.LANDING} className="relative z-10 text-xl font-semibold tracking-tight">
          Career Platform
        </Link>
        <div className="relative z-10">
          <h2 className="text-3xl font-bold leading-tight">
            Know exactly what to learn next.
          </h2>
          <p className="mt-3 max-w-md text-white/80">
            Personalized skill gap analysis, course recommendations, and a
            roadmap built for your goals — powered by transparent,
            explainable logic.
          </p>
        </div>
        <p className="relative z-10 text-sm text-white/60">© {new Date().getFullYear()} Career Platform</p>
      </div>

      <div className="flex flex-1 items-center justify-center bg-canvas p-6">
        <div className="w-full max-w-md animate-fade-in-up">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
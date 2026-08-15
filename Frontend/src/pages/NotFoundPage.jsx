/**
 * NotFoundPage.jsx
 * -----------------------------------------
 * Catch-all 404 page.
 */

import { Link } from 'react-router-dom';
import Button from '../components/ui/atoms/Button';
import { ROUTES } from '../routes/routeConfig';

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-canvas p-6 text-center">
      <h1 className="text-6xl font-bold text-text-primary">404</h1>
      <p className="text-text-secondary">This page doesn&apos;t exist.</p>
      <Link to={ROUTES.LANDING}>
        <Button>Go Home</Button>
      </Link>
    </div>
  );
}
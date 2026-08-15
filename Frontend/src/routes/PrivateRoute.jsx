/**
 * PrivateRoute.jsx
 * -----------------------------------------
 * Guards routes requiring authentication. Redirects to /login,
 * preserving the attempted location so login can redirect back.
 */

import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Spinner from '../components/ui/atoms/Spinner';
import { ROUTES } from './routeConfig';

export default function PrivateRoute() {
  const { status } = useSelector((state) => state.auth);
  const location = useLocation();

  if (status === 'idle' || status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size={32} />
      </div>
    );
  }

  if (status !== 'authenticated') {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  return <Outlet />;
}
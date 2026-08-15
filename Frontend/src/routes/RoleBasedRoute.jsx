/**
 * RoleBasedRoute.jsx
 * -----------------------------------------
 * Guards routes requiring a specific role (e.g. admin panel). Assumes
 * PrivateRoute has already confirmed authentication above it in the
 * route tree.
 */

import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ROUTES } from './routeConfig';

export default function RoleBasedRoute({ allowedRoles = [] }) {
  const { user } = useSelector((state) => state.auth);

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  return <Outlet />;
}
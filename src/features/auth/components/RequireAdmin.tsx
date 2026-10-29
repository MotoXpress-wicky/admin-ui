import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { selectIsAuthenticated, useAuthStore } from '../stores/authStore';
import { isAdmin } from '../lib/isAdmin';

// Every admin page needs a login AND ROLE_ADMIN. This only decides what to show.
// The real check is in every service, on every admin URL.
export const RequireAdmin = () => {
  const isAuthenticated = useAuthStore(selectIsAuthenticated);
  const user = useAuthStore((s) => s.user);
  const location = useLocation();

  if (!isAuthenticated || !isAdmin(user)) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return <Outlet />;
};

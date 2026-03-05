import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../features/auth/useAuth";
import { Spinner } from "../components";

export function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <Spinner fullPage />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

export function PublicRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <Spinner fullPage />;
  }

  if (isAuthenticated) {
    return <Navigate to="/app/board" replace />;
  }

  return <Outlet />;
}

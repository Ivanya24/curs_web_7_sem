import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
  adminOnly?: boolean;
}

export function ProtectedRoute({ children, adminOnly = false }: Props) {
  // Убедитесь, что ваш AuthContext действительно отдает isAuthenticated!
  // Если там только username, замените на: const { username, isAdmin } = useAuth();
  // и ниже используйте: if (!username) { ... }
  const { isAuthenticated, isAdmin } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    console.log("🚫 Доступ запрещен. Редирект на /login с сохранением пути:", location.pathname);
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
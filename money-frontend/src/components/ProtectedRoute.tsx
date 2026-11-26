import { Navigate, useLocation } from "react-router-dom"; // ← Добавили useLocation
import { useAuth } from "../contexts/AuthContext";
import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
  adminOnly?: boolean;
}

export function ProtectedRoute({ children, adminOnly = false }: Props) {
  const { isAuthenticated, isAdmin } = useAuth();
  const location = useLocation(); // ← Получаем текущий путь

  if (!isAuthenticated) {
    // 🔑 КЛЮЧЕВОЙ МОМЕНТ: передаем путь, куда хотел попасть пользователь
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
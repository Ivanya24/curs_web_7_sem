import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

interface GuestRouteProps {
  children: React.ReactNode;
}

export function GuestRoute({ children }: GuestRouteProps) {
  const { username } = useAuth();
  const location = useLocation();

  // Если пользователь УЖЕ авторизован, перенаправляем его на /my
  // replace: true ЗАМЕНЯЕТ текущую запись в истории, стирая /login или /register
  if (username) {
    return <Navigate to="/my" replace state={{ from: location }} />;
  }

  // Если не авторизован, просто показываем форму (children)
  return <>{children}</>;
}
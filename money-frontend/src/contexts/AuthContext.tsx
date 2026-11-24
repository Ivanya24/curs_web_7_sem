import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

interface AuthState {
  token: string | null;
  username: string | null;
  role: string | null;
  login: (token: string, username: string, role: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem("token")          //
  );
  const [username, setUsername] = useState<string | null>(() =>
    localStorage.getItem("username")
  );
  const [role, setRole] = useState<string | null>(() =>
    localStorage.getItem("role")
  );

  const login = (t: string, u: string, r: string) => {
    localStorage.setItem("token", t);
    localStorage.setItem("username", u);
    localStorage.setItem("role", r);
    setToken(t);
    setUsername(u);
    setRole(r);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("role");
    setToken(null);
    setUsername(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider value={{
      token,
      username,
      role,
      login,
      logout,
      isAuthenticated: !!token,
      isAdmin: role === "Admin",
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
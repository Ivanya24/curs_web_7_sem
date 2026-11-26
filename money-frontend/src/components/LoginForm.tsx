import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { authApi } from "../api/authApi";
import { useAuth } from "../contexts/AuthContext";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const from = (location.state as { from?: { pathname: string } } | null)?.from?.pathname ?? "/my";//////////////////////////////////

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await authApi.login({ email, password });
      
      // Сохраняем данные в контекст
      login(res.token, res.username, res.role);
      
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка входа");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container"> 
      <h1>Вход в систему</h1>
      <form className="auth-form" onSubmit={handleSubmit}>
        <label>
          Email
          <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
          />
        </label>
        <label>
          Пароль
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
          />
        </label>
        
        {error && <div className="auth-error">{error}</div>}
        
        <div className="auth-actions">
          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? "Вход…" : "Войти"}
          </button>
          <Link to="/register" className="auth-link">Нет аккаунта? Зарегистрироваться</Link>
        </div>
      </form>
    </div>
  );
}
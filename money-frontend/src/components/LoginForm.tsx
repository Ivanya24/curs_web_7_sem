import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authApi } from "../api/authApi";
import { useAuth } from "../contexts/AuthContext";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await authApi.login({ email, password });
      login(res.token, res.username, res.role);
      navigate("/my");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка входа");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>Вход</h1>
      <form className="create-form" onSubmit={handleSubmit}>
        <label>
          Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label>
          Пароль
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </label>
        {error && <div className="error">{error}</div>}
        <div className="form-actions">
          <button type="submit" disabled={loading}>
            {loading ? "Вход…" : "Войти"}
          </button>
          <Link to="/register">Регистрация</Link>
        </div>
      </form>
    </div>
  );
}
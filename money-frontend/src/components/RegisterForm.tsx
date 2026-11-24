import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authApi } from "../api/authApi";

export function RegisterForm() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await authApi.register({ email, username, password });
      navigate("/login");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка регистрации");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>Регистрация</h1>
      <form className="create-form" onSubmit={handleSubmit}>
        <label>
          Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label>
          Имя
          <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
        </label>
        <label>
          Пароль
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </label>
        {error && <div className="error">{error}</div>}
        <div className="form-actions">
          <button type="submit" disabled={loading}>
            {loading ? "Регистрация…" : "Зарегистрироваться"}
          </button>
          <Link to="/login">Вход</Link>
        </div>
      </form>
    </div>
  );
}
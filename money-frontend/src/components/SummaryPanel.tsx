import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { accountsApi } from "../api/accountsApi";
import type { AccountsSummaryDto, CreateAccountDto } from "../types/money";
import { CreateAccountForm } from "./CreateAccountForm";
import { useAuth } from "../contexts/AuthContext";

export function SummaryPanel() {
  const [summary, setSummary] = useState<AccountsSummaryDto | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const navigate = useNavigate();
  const { username, isAdmin, logout } = useAuth();

  const load = async () => {
    try {
      setLoading(true);
      const data = await (!isAdmin ? accountsApi.GetMy() : accountsApi.GetAll());
      setSummary(data);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка загрузки");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [isAdmin]);

  const filtered = summary?.accounts.filter((a) =>
    a.name.toLowerCase().includes(search.toLowerCase())
  ) ?? [];

  const handleCreated = async (dto: CreateAccountDto) => {
    await accountsApi.Create(dto);
    setShowCreateForm(false);
    await load();
  };

  const handleDelete = async (id: number, name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(`Удалить счёт ${name}?`)) return;
    try {
      await accountsApi.Delete(id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось удалить");
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  if (loading) return <div className="sp-container">Загрузка…</div>;
  if (error) return <div className="sp-container auth-error">{error}</div>;

  return (
    <div className="sp-container">
      <div className="sp-header">   
        <h1>Мои счета</h1>
        <div className="sp-header-actions">
          <span>Привет, <b>{username}</b></span>
          <button className="sp-btn-danger" onClick={handleLogout}>Выйти</button>
        </div>
      </div>

      <div className="sp-toolbar">
        <input
          type="text"
          placeholder="Поиск по имени…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button className="sp-btn" onClick={() => setShowCreateForm((v) => !v)}>
          {showCreateForm ? "Отмена" : "Создать аккаунт"}
        </button>
      </div>

      {showCreateForm && (
        <CreateAccountForm
          onSubmit={handleCreated}
          onCancel={() => setShowCreateForm(false)}
        />
      )}

      {filtered.length === 0 ? (
        <p style={{ textAlign: "center", color: "#718096", padding: "2rem" }}>Ничего не найдено.</p>
      ) : (
        <ul className="sp-list">
          {filtered.map((v) => (
            <li key={v.id} className="sp-list-item" onClick={() => navigate(`/accounts/${v.id}`)}>
              <div className="sp-item-info">
                <span className="sp-item-name">{v.name}</span>
                <span className="sp-item-type">Тип: {v.type}</span>
              </div>
              <div className="sp-item-actions">
                <button
                  className="sp-btn-danger"
                  onClick={(e) => handleDelete(v.id, v.name, e)}
                >
                  ✕
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
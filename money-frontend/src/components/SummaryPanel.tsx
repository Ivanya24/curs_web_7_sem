import { useEffect, useState } from "react"; //Хуки React (состояние, побочные эффекты)
import { useNavigate } from "react-router-dom"; //Программная навигация (переход на другие страницы)
import { accountsApi } from "../api/accountsApi"; //HTTP-клиент к API Валер
import type { AccountsSummaryDto, CreateAccountDto } from "../types/money"; //TypeScript-типы
import { CreateAccountForm } from "./CreateAccountForm"; //Форма создания
import { useAuth } from "../contexts/AuthContext"; //Контекст авторизации (username, isAdmin, logout)


export function SummaryPanel(){
  const [summary, setSummary] = useState<AccountsSummaryDto | null>(null)
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const navigate = useNavigate();
  const { username, isAdmin, logout } = useAuth();

  const load = async () => {
    try {
      setLoading(true);
      const data = await  (!isAdmin? accountsApi.GetMy(): accountsApi.GetAll());      // ← GET /api/Valera/my
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
  )??[];

  const handleCreated = async (dto: CreateAccountDto) => {
    await accountsApi.Create(dto);
    setShowCreateForm(false);
    await load();
  };

  const handleDelete = async (
    id: number,
    name: string,
    e: React.MouseEvent
  ) => {
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
    navigate("/login");
  };

  if (loading) return <div className="container">Загрузка…</div>;
  if (error) return <div className="container error">{error}</div>;




  return (
    <div className="container">
      <div className="header-row">
        <h1>Аккаунты</h1>
        <div className="header-actions">
          <span>Привет, {username}</span>
          {/* {isAdmin && (
            <button onClick={() => navigate("/all")}>Все Валеры</button>
          )} */}
          <button className="danger" onClick={handleLogout}>
            Выйти
          </button>
        </div>
      </div>

      <div className="toolbar">
        <input
          type="text"
          placeholder="Поиск по имени…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button onClick={() => setShowCreateForm((v) => !v)}>
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
        <p>Ничего не найдено.</p>
      ) : (
        <ul className="valera-list">
          {filtered.map((v) => (
            <li key={v.id} onClick={() => navigate(`/accounts/${v.id}`)}>
              <span className="valera-name">{v.name}</span>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span className="valera-id">тип:{v.type}</span>
                <button
                  className="danger"
                  onClick={(e) => handleDelete(v.id, v.name, e)}
                  style={{ padding: "4px 8px", fontSize: "12px" , marginLeft: "510px" }}
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



import { useEffect, useState } from "react"; //Хуки React (состояние, побочные эффекты)
import { useNavigate , useParams } from "react-router-dom"; //Программная навигация (переход на другие страницы)
import { transactionsApi } from "../api/transactionsApi"; //HTTP-клиент к API Валер
import type { CreateTransactionDto, TransactionDto } from "../types/money"; //TypeScript-типы
import { CreateTransactionForm } from "./CreateTransactionForm"; //Форма создания
import { useAuth } from "../contexts/AuthContext"; //Контекст авторизации (username, isAdmin, logout)

export function AccountCard(){
  const [transaction, setTransactions] = useState<TransactionDto[] >([])
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const navigate = useNavigate();
  const { username, isAdmin, logout } = useAuth();


  const { id } = useParams<{ id: string }>();
  const accountId = Number(id);

  const load = async () => {
    try {
      setLoading(true);
      const data = await (!isAdmin ? transactionsApi.getAll(): transactionsApi.getByAccount(accountId))
    //   const sorted = [...data].sort(
    //     (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    //   );
      setTransactions(data);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка загрузки");
    } finally {
      setLoading(false);
    }
  };

useEffect(() => {
    load();
  }, []);

const filtered = [...transaction]
  .filter((t) => (t.note ?? "").toLowerCase().includes(search.toLowerCase()))
  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());


const handleCreated = async (dto: CreateTransactionDto) => {
    await transactionsApi.Create(dto);
    setShowCreateForm(false);
    await load();
};

const handleDelete = async (
    id: number,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    if (!confirm(`Удалить транзакцию с id:${id}?`)) return;

    try {
      await transactionsApi.Delete(id);
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
        <h1>Транзакции</h1>
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
          {showCreateForm ? "Отмена" : "Создать транзакцию"}
        </button>
      </div>

      {showCreateForm && (
        <CreateTransactionForm
          accountId={accountId} 
          onSubmit={handleCreated}
          onCancel={() => setShowCreateForm(false)}
        />
      )}

      {filtered.length === 0 ? (
        <p>Ничего не найдено.</p>
      ) : (
        <ul className="valera-list">
            {filtered.map((t, index) => (
                <li key={t.id} onClick={() => navigate(`/transactions/${t.id}`)}>
                    <span className="valera-name">{index + 1}</span>   {/* ← порядковый номер */}
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span className="valera-id">тип: {t.note ?? "—"}</span>
                        <button
                            className="danger"
                            onClick={(e) => handleDelete(t.id, e)}
                            style={{ padding: "4px 8px", fontSize: "12px", marginLeft: "auto" }}
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
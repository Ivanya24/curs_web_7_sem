import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { transactionsApi } from "../api/transactionsApi";
import type { CreateTransactionDto, TransactionDto } from "../types/money";
import { CreateTransactionForm } from "./CreateTransactionForm";
import { useAuth } from "../contexts/AuthContext";
import { ExpensePieChart } from "./ExpensePieChart";
import { BalanceLineChart } from "./BalanceLineChart";
import { calculateDashboardStats, type DashboardStats } from "./statsCalculator";

export function AccountCard() {
  const [transactions, setTransactions] = useState<TransactionDto[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  const navigate = useNavigate();
  const { username, logout } = useAuth();
  const { id } = useParams<{ id: string }>();
  const accountId = Number(id);

  const load = async () => {
    try {
      setLoading(true);
      const data = await transactionsApi.getByAccount(accountId);
      
      setTransactions(data);
      const calculatedStats = calculateDashboardStats(data);
      setStats(calculatedStats);
      setError(null);
      
    } catch (e: any) {
      const statusCode = e.status || e.response?.status;
      
      if (statusCode === 404 || statusCode === 403) {
        navigate("/not-found", { replace: true });
        return; 
      }

      setError(e instanceof Error ? e.message : "Ошибка загрузки данных");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [accountId]);//////////////////////////////////

  const filtered = [...transactions]////////////////
      .filter((t) => {
        const searchLower = search.toLowerCase();
        const note = (t.note ?? "").toLowerCase();
        const category = (t.category ?? "").toLowerCase();
        return note.includes(searchLower) || category.includes(searchLower);
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleCreated = async (dto: CreateTransactionDto) => {
    await transactionsApi.Create(dto);
    setShowCreateForm(false);
    await load();
  };

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(`Удалить транзакцию с id:${id}?`)) return;
    try {
      await transactionsApi.Delete(id);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Не удалось удалить");
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  if (loading) return <div className="ac-container">Загрузка…</div>;
  if (error) return <div className="ac-container auth-error">{error}</div>;

  return (
    <div className="ac-container">
      <div className="ac-header">
        {/* Левая часть: кнопка назад и заголовок */}
        <div className="ac-header-left">
          <button className="ac-back-btn" onClick={() => navigate(-1)}>
            ← Назад
          </button>
          <h1>Транзакции счета</h1>
        </div>
        
        {/* Правая часть: приветствие и выход */}
        <div className="sp-header-actions">
          <span>Привет, <b>{username}</b></span>
          <button className="sp-btn-danger" onClick={handleLogout}>Выйти</button>
        </div>
      </div>

      <div className="ac-analytics">
        <h2>Аналитика счета</h2>
        <div className="ac-charts-grid">
          <div className="ac-chart-card">
            <h3>Динамика баланса</h3>
            <BalanceLineChart data={stats?.balanceHistory || []} />
          </div>
          <div className="ac-chart-card">
            <h3>Расходы по категориям</h3>
            <ExpensePieChart data={stats?.expensesByCategory || []} />
          </div>
        </div>
      </div>

      <hr className="ac-divider" />

      <div className="ac-toolbar">
        <input
          type="text"
          placeholder="Поиск по заметке или категории…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button className="sp-btn" onClick={() => setShowCreateForm((v) => !v)}>
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
        <p style={{ textAlign: "center", color: "#718096", padding: "2rem" }}>Ничего не найдено или список пуст.</p>
      ) : (
        <ul className="ac-list">
          {filtered.map((t) => {
            const isExpense = t.kind === 'Expense' || t.amount < 0;
            return (
              <li 
                key={t.id} 
                className={`ac-list-item ${isExpense ? 'ac-item-expense' : 'ac-item-income'}`}
                onClick={() => navigate(`/transactions/${t.id}`)}
              >
                <div className="ac-item-main">
                  <div className="ac-item-header">
                    <span className="ac-item-category">{t.category || t.note || "Без категории"}</span>
                    <span className={`ac-item-amount ${isExpense ? 'expense' : 'income'}`}>
                      {isExpense ? "−" : "+"}{t.amount} ₽
                    </span>
                  </div>
                  <div className="ac-item-details">
                    {new Date(t.date).toLocaleDateString("ru-RU")}
                    {t.note && t.category && ` • ${t.note}`}
                  </div>
                </div>
                <button
                  className="ac-btn-delete"
                  onClick={(e) => handleDelete(t.id, e)}
                >
                  ✕
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
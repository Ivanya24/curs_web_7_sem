import { useEffect, useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { transactionsApi } from "../api/transactionsApi";
import type { CreateTransactionDto, TransactionDto } from "../types/money";
import { CreateTransactionForm } from "./CreateTransactionForm";
import { useAuth } from "../contexts/AuthContext";
import { ExpensePieChart } from "./ExpensePieChart";
import { BalanceLineChart } from "./BalanceLineChart";
import { calculateDashboardStats, type DashboardStats } from "./statsCalculator";


const STORAGE_KEYS = {
  dateFrom: (id: number) => `accountCard_dateFrom_${id}`,
  dateTo: (id: number) => `accountCard_dateTo_${id}`,
  search: (id: number) => `accountCard_search_${id}`,
};

export function AccountCard() {
  const { id } = useParams<{ id: string }>();
  const accountId = Number(id);
  const navigate = useNavigate();
  const { username, isAdmin, logout } = useAuth();


  const [allTransactions, setAllTransactions] = useState<TransactionDto[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);


  const [dateFrom, setDateFrom] = useState<string>(
    () => localStorage.getItem(STORAGE_KEYS.dateFrom(accountId)) || ""
  );
  const [dateTo, setDateTo] = useState<string>(
    () => localStorage.getItem(STORAGE_KEYS.dateTo(accountId)) || ""
  );
  const [search, setSearch] = useState<string>(
    () => localStorage.getItem(STORAGE_KEYS.search(accountId)) || ""
  );


  useEffect(() => { localStorage.setItem(STORAGE_KEYS.dateFrom(accountId), dateFrom); }, [dateFrom, accountId]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.dateTo(accountId), dateTo); }, [dateTo, accountId]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.search(accountId), search); }, [search, accountId]);


  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        const data = await transactionsApi.getByAccount(accountId);
        setAllTransactions(data);
        

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
    loadData();
  }, [accountId, isAdmin]);




  const filteredTransactions = useMemo(() => {
    return [...allTransactions]
      .filter((t) => {

        const searchLower = search.toLowerCase();
        const note = (t.note ?? "").toLowerCase();
        const category = (t.category ?? "").toLowerCase();
        const matchesSearch = note.includes(searchLower) || category.includes(searchLower);


        const tDate = new Date(t.date).setHours(0, 0, 0, 0);
        const matchesDateFrom = dateFrom ? tDate >= new Date(dateFrom).setHours(0, 0, 0, 0) : true;
        const matchesDateTo = dateTo ? tDate <= new Date(dateTo).setHours(23, 59, 59, 999) : true;

        return matchesSearch && matchesDateFrom && matchesDateTo;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [allTransactions, search, dateFrom, dateTo]);


  const handleCreated = async (dto: CreateTransactionDto) => {
    await transactionsApi.Create(dto);
    setShowCreateForm(false);

    const data = await (!isAdmin ? transactionsApi.getAll() : transactionsApi.getByAccount(accountId));
    setAllTransactions(data);
    setStats(calculateDashboardStats(data));
  };

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(`Удалить транзакцию с id:${id}?`)) return;
    try {
      await transactionsApi.Delete(id);
      const data = await (!isAdmin ? transactionsApi.getAll() : transactionsApi.getByAccount(accountId));
      setAllTransactions(data);
      setStats(calculateDashboardStats(data));
    } catch (err: any) {
      if (err.status === 404 || err.status === 403) {
        navigate("/not-found", { replace: true });
        return;
      }
      setError(err instanceof Error ? err.message : "Не удалось удалить");
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const resetFilters = () => {
    setDateFrom("");
    setDateTo("");
    setSearch("");
    localStorage.removeItem(STORAGE_KEYS.dateFrom(accountId));
    localStorage.removeItem(STORAGE_KEYS.dateTo(accountId));
    localStorage.removeItem(STORAGE_KEYS.search(accountId));
  };

  if (loading) return <div className="ac-container">Загрузка…</div>;
  if (error) return <div className="ac-container auth-error">{error}</div>;

  return (
    <div className="ac-container">
      <div className="ac-header">
        <div className="ac-header-left">
          <button className="ac-back-btn" onClick={() => navigate(-1)}>← Назад</button>
          <h1>Транзакции счета</h1>
        </div>
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

      {/* ПАНЕЛЬ ФИЛЬТРОВ (Работает мгновенно, без кнопки "Применить") */}
      <div className="ac-filters">
        <div className="ac-filters-row">
          <div className="ac-filter-group">
            <label>С даты</label>
            <input 
              type="date" 
              value={dateFrom} 
              onChange={(e) => setDateFrom(e.target.value)} 
            />
          </div>
          <div className="ac-filter-group">
            <label>По дату</label>
            <input 
              type="date" 
              value={dateTo} 
              onChange={(e) => setDateTo(e.target.value)} 
            />
          </div>
          <div className="ac-filter-group" style={{ flex: 2 }}>
            <label>Поиск по заметке/категории</label>
            <input
              type="text"
              placeholder="Введите текст…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          {(dateFrom || dateTo || search) && (
            <button 
              className="ac-btn-reset" 
              onClick={resetFilters} 
              style={{ alignSelf: 'flex-end', marginBottom: '2px', height: '42px' }}
            >
              ✕ Сбросить
            </button>
          )}
        </div>
        <div className="ac-filters-info">
          Показано: <b>{filteredTransactions.length}</b> из {allTransactions.length}
        </div>
      </div>

      <button className="ac-btn-primary" onClick={() => setShowCreateForm((v) => !v)}>
        {showCreateForm ? "Отмена" : "+ Создать транзакцию"}
      </button>

      {showCreateForm && (
        <CreateTransactionForm
          accountId={accountId} 
          onSubmit={handleCreated}
          onCancel={() => setShowCreateForm(false)}
        />
      )}

      {filteredTransactions.length === 0 ? (
        <p className="ac-empty">
          {(dateFrom || dateTo || search) 
            ? "По заданным фильтрам ничего не найдено. Попробуйте сбросить фильтры." 
            : "Список транзакций пуст."}
        </p>
      ) : (
        <ul className="ac-list">
          {filteredTransactions.map((t) => {
            const isExpense = t.kind === 'Expense';
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
                      {isExpense ? "−" : "+"}{Math.abs(t.amount)} ₽
                    </span>
                  </div>
                  <div className="ac-item-details">
                    {new Date(t.date).toLocaleDateString("ru-RU")}
                    {t.note && t.category && ` • ${t.note}`}
                  </div>
                </div>
                <button className="ac-btn-delete" onClick={(e) => handleDelete(t.id, e)}>
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

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { transactionsApi } from "../api/transactionsApi";
import type { TransactionDto, CreateTransactionDto } from "../types/money";

export function TransactionRow() {
    const { id } = useParams<{ id: string }>();
    const transactionId = Number(id);
    const navigate = useNavigate();

    const [transaction, setTransaction] = useState<TransactionDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // режим редактирования
    const [isEditing, setIsEditing] = useState(false);
    const [form, setForm] = useState<CreateTransactionDto | null>(null);
    const [saving, setSaving] = useState(false);

    // загрузка
    useEffect(() => {
        if (Number.isNaN(transactionId)) {
            setError("Неверный ID транзакции");
            setLoading(false);
            return;
        }
        (async () => {
            try {
                setLoading(true);
                const data = await transactionsApi.GetById(transactionId);
                setTransaction(data);
                setError(null);
            } catch (e) {
                setError(e instanceof Error ? e.message : "Ошибка загрузки");
            } finally {
                setLoading(false);
            }
        })();
    }, [transactionId]);

    // начать редактирование — копируем в form
    const startEdit = () => {
        if (!transaction) return;
        setForm({
            amount: transaction.amount,
            kind: transaction.kind,
            category: transaction.category,
            note: transaction.note,
            date: transaction.date,
            accountId: transaction.accountId,
        });
        setIsEditing(true);
        setError(null);
    };

    // отмена — выходим, form не трогаем
    const cancelEdit = () => {
        setIsEditing(false);
        setForm(null);
        setError(null);
    };

    // сохранить — PUT
    const handleSave = async () => {
        if (!form) return;
        try {
            setSaving(true);
            const updated = await transactionsApi.Update(transactionId, form);
            setTransaction(updated);   // обновить просмотр
            setIsEditing(false);
            setForm(null);
            setError(null);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Не удалось сохранить");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm("Удалить транзакцию?")) return;
        try {
            await transactionsApi.Delete(transactionId);
            navigate(-1);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Не удалось удалить");
        }
    };

    if (loading) return <div className="container">Загрузка…</div>;
    if (error && !isEditing) return <div className="container error">{error}</div>;
    if (!transaction) return <div className="container">Не найдено</div>;

    // ---------- РЕЖИМ РЕДАКТИРОВАНИЯ ----------
    if (isEditing && form) {
        return (
            <div className="container">
                <button onClick={cancelEdit}>← Отмена</button>
                <h1>Редактировать транзакцию #{transaction.id}</h1>

                <div className="create-form">
                    <label>
                        Сумма
                        <input
                            type="number"
                            value={form.amount}
                            onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })}
                        />
                    </label>
                    <label>
                        Тип
                        <select
                            value={form.kind}
                            onChange={(e) => setForm({ ...form, kind: e.target.value as "Income" | "Expense" })}
                        >
                            <option value="Expense">Расход</option>
                            <option value="Income">Доход</option>
                        </select>
                    </label>
                    <label>
                        Категория
                        <input
                            type="text"
                            value={form.category ?? ""}
                            onChange={(e) => setForm({ ...form, category: e.target.value || null })}
                        />
                    </label>
                    <label>
                        Заметка
                        <input
                            type="text"
                            value={form.note ?? ""}
                            onChange={(e) => setForm({ ...form, note: e.target.value || null })}
                        />
                    </label>
                    <label>
                        Дата
                        <input
                            type="date"
                            value={form.date.slice(0, 10)}
                            onChange={(e) => setForm({ ...form, date: new Date(e.target.value).toISOString() })}
                        />
                    </label>
                    <label>
                        Счёт (ID)
                        <input
                            type="number"
                            value={form.accountId}
                            onChange={(e) => setForm({ ...form, accountId: Number(e.target.value) })}
                        />
                    </label>

                    {error && <div className="error">{error}</div>}

                    <div className="form-actions">
                        <button onClick={handleSave} disabled={saving}>
                            {saving ? "Сохранение…" : "Сохранить"}
                        </button>
                        <button type="button" onClick={cancelEdit}>Отмена</button>
                    </div>
                </div>
            </div>
        );
    }

    // ---------- РЕЖИМ ПРОСМОТРА (как было) ----------
    return (
        <div className="container">
            <button onClick={() => navigate(-1)}>← Назад</button>

            <h1>Транзакция #{transaction.id}</h1>

            <div className="transaction-detail">
                <p><strong>Сумма:</strong> {transaction.amount}</p>
                <p><strong>Тип:</strong> {transaction.kind === "Income" ? "Доход" : "Расход"}</p>
                <p><strong>Категория:</strong> {transaction.category ?? "—"}</p>
                <p><strong>Заметка:</strong> {transaction.note ?? "—"}</p>
                <p><strong>Дата:</strong> {new Date(transaction.date).toLocaleDateString("ru-RU")}</p>
                <p><strong>Счёт:</strong> #{transaction.accountId}</p>
            </div>

            <div className="form-actions" style={{ marginTop: 16 }}>
                <button onClick={startEdit}>Редактировать</button>
                <button className="danger" onClick={handleDelete}>Удалить</button>
                <button onClick={() => navigate(-1)}>Назад</button>
            </div>
        </div>
    );
}
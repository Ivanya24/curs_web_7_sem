import { useState } from "react";
import type { CreateTransactionDto } from "../types/money";
// import { accountsApi } from "../api/accountsApi";

interface Props {
  accountId: number;
  onSubmit: (dto: CreateTransactionDto) => Promise<void>;
  onCancel: () => void;
}

export function CreateTransactionForm({ accountId, onSubmit, onCancel }: Props) {
  const [form, setForm] = useState<Omit<CreateTransactionDto, "accountId">>({
  amount: 1,
  kind: "Expense",
  category: "",
  note: "",
  date: "",
});

const [error, setError] = useState<string | null>(null);

const handleChange = (field: keyof CreateTransactionDto, value: string) => {
  setForm((f) => ({
    ...f,
    [field]: field === "amount" ? Number(value) : value,
  }));
};



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onSubmit({...form, accountId});
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка создания");
    }
  };

  return (
    <form className="create-form" onSubmit={handleSubmit}>
      <h2>Создать Аккаунт</h2>

      <label>
        Сумма
        <input
          type="number"
          value={form.amount}
          onChange={(e) => handleChange("amount", e.target.value)}
        />
      </label>

        <label>
        Тип операции
        <select
            value={form.kind}
            onChange={(e) => handleChange("kind", e.target.value)}
        >
            <option value="Income"> Доход</option>
            <option value="Expense">Расход</option>
        </select>
        </label>

        <label>
        Категория
        <input
          type="text"
          value={form.category ?? ""}
          onChange={(e) => handleChange("category", e.target.value)}
        />
      </label>

    <label>
        Заметка
        <input
          type="text"
          value={form.note ?? ""}
          onChange={(e) => handleChange("note", e.target.value)}
        />
      </label>

<label>
  Дата
  <input
    type="date"
    value={form.date}
    onChange={(e) => handleChange("date", e.target.value)}
  />
</label>



      {error && <div className="error">{error}</div>}

      <div className="form-actions">
        <button type="submit">Создать</button>
        <button type="button" onClick={onCancel}>
          Отмена
        </button>
      </div>
    </form>
  );
}
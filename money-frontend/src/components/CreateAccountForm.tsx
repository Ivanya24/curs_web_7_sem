import { useState } from "react";
import type { CreateAccountDto } from "../types/money";

interface Props {
  onSubmit: (dto: CreateAccountDto) => Promise<void>;
  onCancel: () => void;
}

export function CreateAccountForm({ onSubmit, onCancel }: Props) {
  const [form, setForm] = useState<CreateAccountDto>({
    name: "",
    type: "Cash"
  });
  const [error, setError] = useState<string | null>(null);

    const handleChange = (field: keyof CreateAccountDto, value: string) => {
    setForm((f) => ({
        ...f,
        [field]: field === "name" || field === "type" ? value : Number(value),
    }));
    };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onSubmit(form);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка создания");
    }
  };

  return (
    <form className="create-form" onSubmit={handleSubmit}>
      <h2>Создать Аккаунт</h2>

      <label>
        Название аккаунта
        <input
          type="text"
          value={form.name}
          onChange={(e) => handleChange("name", e.target.value)}
        />
      </label>



        <label>
        Тип аккаунта
        <select
            value={form.type}
            onChange={(e) => handleChange("type", e.target.value)}
        >
            <option value="Cash">Наличные</option>
            <option value="Card">Карта</option>
            <option value="Bank">Банк</option>
        </select>
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
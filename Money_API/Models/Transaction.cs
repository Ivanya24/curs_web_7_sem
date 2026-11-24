namespace Money_API.Models;

public class Transaction
{
    public int Id { get; set; }

    // всегда положительное; знак задаёт Kind
    public decimal Amount { get; set; } //сумма операции

    // "Income" | "Expense"
    public string Kind { get; set; } = "Expense"; //тип операции

    // категория-строка: "Продукты", "Зарплата"
    public string? Category { get; set; } //категории

    public string? Note { get; set; } //заметка

    // когда произошла (можно задним числом)
    public DateTime Date { get; set; } = DateTime.UtcNow;

    // когда записали (аудит, ставит сервер)
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // внешние ключи
    public int UserId { get; set; } // чья транзакция
    public int AccountId { get; set; } // какого акаунта

    // навигация
    public User User { get; set; } = null!;
    public Account Account { get; set; } = null!;
}
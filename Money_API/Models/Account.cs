namespace Money_API.Models;

public class Account
{
    public int Id { get; set; }

    // "Сбер", "ВТБ", "Наличные"
    public string Name { get; set; } = "";

    // "Cash" | "Card" | "Bank" — для иконки на клиенте
    public string Type { get; set; } = "Cash";

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // внешний ключ: чей счёт
    public int UserId { get; set; }
    public User User { get; set; } = null!;

    // один счёт — много транзакций
    public ICollection<Transaction> Transactions { get; set; } = new List<Transaction>();
}
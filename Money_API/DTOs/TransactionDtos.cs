namespace Money_API.DTOs;

// ---------- Счета ----------
public class CreateAccountDto
{
    public string Name { get; set; } = "";      // "Сбер", "ВТБ", "Наличные"
    public string Type { get; set; } = "Cash";  // Cash | Card | Bank
}

public class AccountDto
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public string Type { get; set; } = "";
    public decimal Balance { get; set; }        // считается сервером
}

public class AccountsSummaryDto
{
    public decimal TotalBalance { get; set; }
    public List<AccountDto> Accounts { get; set; } = new();
}

// ---------- Транзакции ----------
public class CreateTransactionDto
{
    public decimal Amount { get; set; }             // всегда > 0
    public string Kind { get; set; } = "Expense";   // "Income" | "Expense"
    public string? Category { get; set; }           // "Продукты"
    public string? Note { get; set; }
    public DateTime Date { get; set; } = DateTime.UtcNow;
    public int AccountId { get; set; }              // с какого счёта
}

public class TransactionDto
{
    public int Id { get; set; }
    public decimal Amount { get; set; }
    public string Kind { get; set; } = "";
    public string? Category { get; set; }
    public string? Note { get; set; }
    public DateTime Date { get; set; }
    public int AccountId { get; set; }              // чтобы клиент знал, к какому счёту
}

// ---------- Сводка ----------
public class SummaryDto
{
    public decimal TotalIncome { get; set; }
    public decimal TotalExpense { get; set; }
    public decimal Balance => TotalIncome - TotalExpense;
}

public class CategorySpentDto
{
    public string Category { get; set; } = "";
    public decimal Spent { get; set; }
}
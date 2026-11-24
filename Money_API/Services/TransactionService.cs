using Microsoft.EntityFrameworkCore;
using Money_API.Data;
using Money_API.DTOs;
using Money_API.Models;

namespace Money_API.Services;

public class TransactionService
{
    private readonly AppDbContext _db;

    public TransactionService(AppDbContext db) => _db = db;

    // ================================================================
    // TODO: реализовать самостоятельно.
    //
    // Шаги:
    // 1. Проверить владельца счёта (защита от IDOR):
    //    var account = await _db.Accounts
    //        .FirstOrDefaultAsync(a => a.Id == dto.AccountId && a.UserId == userId);
    //    if (account is null) return null;   // 400/404
    //
    // 2. Проверить сумму:
    //    if (dto.Amount <= 0) return null;
    //
    // 3. Проверить Kind:
    //    if (dto.Kind != "Income" && dto.Kind != "Expense") return null;
    //
    // 4. Создать:
    //    var tx = new Transaction {
    //        Amount = dto.Amount,
    //        Kind = dto.Kind,
    //        Category = dto.Category,
    //        Note = dto.Note,
    //        Date = dto.Date,
    //        CreatedAt = DateTime.UtcNow,
    //        UserId = userId,       // из JWT, не из dto
    //        AccountId = dto.AccountId
    //    };
    //
    // 5. _db.Transactions.Add(tx);
    //    await _db.SaveChangesAsync();
    //
    // 6. Вернуть TransactionDto (Id, Amount, Kind, Category, Note, Date, AccountId).
    // ================================================================














    // ================================================================
// TODO: реализовать самостоятельно.
//
// ЗАДАЧА: создать транзакцию (доход или расход) на счёте пользователя.
//
// ПРАВИЛА (нарушение любого → вернуть null):
// 1. Счёт (dto.AccountId) должен существовать И принадлежать userId.
//    Это защита от IDOR: клиент не должен записать транзакцию на чужой счёт.
// 2. Сумма (dto.Amount) должна быть > 0. Отрицательных сумм нет —
//    знак задаётся полем Kind, а не Amount.
// 3. Тип (dto.Kind) — только "Income" или "Expense". Любая другая строка
//    (например, "income" с маленькой буквы или "Transfer") — null.
//
// ЧТО ДОЛЖНО ПРОИЗОЙТИ, ЕСЛИ ВСЕ ПРОВЕРКИ ПРОЙДЕНЫ:
// 4. Создать новую Transaction:
//    - Amount, Kind, Category, Note, Date — из dto;
//    - CreatedAt = текущее UTC-время (ставит сервер, не клиент);
//    - UserId = параметр userId (НЕ из dto — его там нет);
//    - AccountId = dto.AccountId (уже проверен на владельца).
//
// 5. Сохранить в БД.
//
// 6. Вернуть TransactionDto:
//    - Id — из созданной Transaction (появится после сохранения);
//    - Amount, Kind, Category, Note, Date, AccountId — из Transaction.
//    (UserId в TransactionDto нет — он и так известен из JWT.)
//
// ПОДСКАЗКИ ПО API (без готового кода):
// - проверка владельца счёта: ищи в _db.Accounts по Id и UserId;
// - проверка суммы: обычное сравнение;
// - проверка Kind: сравнение строк (можно через == или HashSet);
// - создание: new Transaction { ... };
// - сохранение: _db.Transactions.Add(...) + SaveChangesAsync();
// - возврат: new TransactionDto { ... }.
//
// ПОСМОТРИ, КАК СДЕЛАНО В AccountService.CreateAsync — паттерн тот же
// (проверить → создать → сохранить → вернуть DTO). Разница только в проверках.
// ================================================================
    public async Task<TransactionDto?> CreateAsync(int userId, CreateTransactionDto dto)
    {
        var account = await _db.Accounts
            .FirstOrDefaultAsync(a => a.Id == dto.AccountId && a.UserId == userId);
        if (account is null) return null;

        if (dto.Amount <= 0) return null;

        if (dto.Kind != "Income"  && dto.Kind != "Expense") return null;

        var transaction = new Transaction
        {
            Amount = dto.Amount,
            Kind = dto.Kind,
            Category = dto.Category,
            Note = dto.Note,
            Date = dto.Date,
            CreatedAt = DateTime.UtcNow,
            AccountId = dto.AccountId,
            UserId = userId
        };

        _db.Transactions.Add(transaction);
        await _db.SaveChangesAsync();

        return new TransactionDto{
            Id = transaction.Id,
            Amount = transaction.Amount,
            Kind = transaction.Kind,
            Category = transaction.Category,
            Note = transaction.Note,
            Date = transaction.Date,
            AccountId = transaction.AccountId
        };

    }

    // Готово: список транзакций (опционально за период)
    public async Task<List<TransactionDto>> GetAllAsync(int userId, DateTime? from, DateTime? to)
    {
        var q = _db.Transactions.Where(t => t.UserId == userId);
        if (from.HasValue) q = q.Where(t => t.Date >= from.Value);
        if (to.HasValue)   q = q.Where(t => t.Date <= to.Value);

        return await q
            .OrderByDescending(t => t.Date)
            .Select(t => new TransactionDto
            {
                Id = t.Id,
                Amount = t.Amount,
                Kind = t.Kind,
                Category = t.Category,
                Note = t.Note,
                Date = t.Date,
                AccountId = t.AccountId
            })
            .ToListAsync();
    }


    // Новый метод: получить транзакции конкретного счёта (для админа)
    public async Task<List<TransactionDto>> GetByAccountIdAsync(int accountId, DateTime? from, DateTime? to)
    {
        // Фильтруем строго по AccountId
        var q = _db.Transactions.Where(t => t.AccountId == accountId);
        
        if (from.HasValue) q = q.Where(t => t.Date >= from.Value);
        if (to.HasValue)   q = q.Where(t => t.Date <= to.Value);

        return await q
            .OrderByDescending(t => t.Date)
            .Select(t => new TransactionDto
            {
                Id = t.Id,
                Amount = t.Amount,
                Kind = t.Kind,
                Category = t.Category,
                Note = t.Note,
                Date = t.Date,
                AccountId = t.AccountId
            })
            .ToListAsync();
    }

    public async Task<TransactionDto?> GetByTransactionsIdAsync(
        int userId, int transactionId, bool isAdmin)
    {
        var q = await _db.Transactions
            .FirstOrDefaultAsync(x => x.Id == transactionId && (isAdmin || x.UserId == userId));
        if (q is null) return null;

        return new TransactionDto
        {
                Id = q.Id,
                Amount = q.Amount,
                Kind = q.Kind,
                Category = q.Category,
                Note = q.Note,
                Date = q.Date,
                AccountId = q.AccountId
        };


    }



    public async Task<TransactionDto?> UpdateAsync(int userId, int id, bool IsAdmin ,CreateTransactionDto dto)
    {
        // 1. Найти транзакцию (только свою — IDOR)
        var t = await _db.Transactions
            .FirstOrDefaultAsync(x => x.Id == id && (IsAdmin || x.UserId == userId));
        if (t is null) return null;

        // 2. Проверить, что новый счёт принадлежит пользователю
        var ownsAccount = await _db.Accounts
            .AnyAsync(a => a.Id == dto.AccountId && (IsAdmin || a.UserId == userId));
        if (!ownsAccount) return null;

        // 3. Валидация
        if (dto.Amount <= 0) return null;
        if (dto.Kind != "Income" && dto.Kind != "Expense") return null;

        // 4. Обновить поля (кроме Id, UserId, CreatedAt)
        t.Amount = dto.Amount;
        t.Kind = dto.Kind;
        t.Category = dto.Category;
        t.Note = dto.Note;
        t.Date = dto.Date;
        t.AccountId = dto.AccountId;

        await _db.SaveChangesAsync();

        // 5. Вернуть DTO
        return new TransactionDto
        {
            Id = t.Id,
            Amount = t.Amount,
            Kind = t.Kind,
            Category = t.Category,
            Note = t.Note,
            Date = t.Date,
            AccountId = t.AccountId
        };
    }

    // Готово: удалить (только свою)
    public async Task<bool> DeleteAsync(int userId, int id)
    {
        var t = await _db.Transactions
            .FirstOrDefaultAsync(x => x.Id == id && x.UserId == userId);
        if (t is null) return false;

        _db.Transactions.Remove(t);
        await _db.SaveChangesAsync();
        return true;
    }

    // Готово: сводка доход/расход/баланс за период
    public async Task<SummaryDto> GetSummaryAsync(int userId, DateTime? from, DateTime? to)
    {
        var q = _db.Transactions.Where(t => t.UserId == userId);
        if (from.HasValue) q = q.Where(t => t.Date >= from.Value);
        if (to.HasValue)   q = q.Where(t => t.Date <= to.Value);

        var income  = await q.Where(t => t.Kind == "Income").SumAsync(t => t.Amount);
        var expense = await q.Where(t => t.Kind == "Expense").SumAsync(t => t.Amount);

        return new SummaryDto
        {
            TotalIncome = income,
            TotalExpense = expense
        };
    }
}
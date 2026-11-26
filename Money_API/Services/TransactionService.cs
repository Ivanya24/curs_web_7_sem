using Microsoft.EntityFrameworkCore;
using Money_API.Data;
using Money_API.DTOs;
using Money_API.Models;

namespace Money_API.Services;

public class TransactionService
{
    private readonly AppDbContext _db;

    public TransactionService(AppDbContext db) => _db = db;

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


    public async Task<List<TransactionDto>?> GetByAccountIdAsync(
        int accountId, 
        int currentUserId, 
        bool isAdmin, 
        DateTime? from, 
        DateTime? to)
    {
        var account = await _db.Accounts
            .FirstOrDefaultAsync(a => a.Id == accountId && (a.UserId == currentUserId || isAdmin));

        if (account == null)
        {
            return null;
        }

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
        var t = await _db.Transactions
            .FirstOrDefaultAsync(x => x.Id == id && (IsAdmin || x.UserId == userId));
        if (t is null) return null;

        var ownsAccount = await _db.Accounts
            .AnyAsync(a => a.Id == dto.AccountId && (IsAdmin || a.UserId == userId));
        if (!ownsAccount) return null;

        if (dto.Amount <= 0) return null;
        if (dto.Kind != "Income" && dto.Kind != "Expense") return null;

        t.Amount = dto.Amount;
        t.Kind = dto.Kind;
        t.Category = dto.Category;
        t.Note = dto.Note;
        t.Date = dto.Date;
        t.AccountId = dto.AccountId;

        await _db.SaveChangesAsync();

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

    public async Task<bool> DeleteAsync(int userId, int id)
    {
        var t = await _db.Transactions
            .FirstOrDefaultAsync(x => x.Id == id && x.UserId == userId);
        if (t is null) return false;

        _db.Transactions.Remove(t);
        await _db.SaveChangesAsync();
        return true;
    }
    
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
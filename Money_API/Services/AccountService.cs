using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;
using Money_API.Data;
using Money_API.DTOs;
using Money_API.Models;

namespace Money_API.Services;

public class AccountService
{
    private readonly AppDbContext _db;

    public AccountService(AppDbContext db) => _db = db;


    public async Task<AccountDto?> CreateAsync(int userId, CreateAccountDto dto)
    {
        var exists = await _db.Accounts
            .AnyAsync(a => a.UserId == userId && a.Name == dto.Name);
        if (exists) return null;
        var account = new Account
        {
            Name = dto.Name,
            Type = dto.Type,
            UserId = userId,
            CreatedAt = DateTime.UtcNow
        };
        _db.Accounts.Add(account);
        await _db.SaveChangesAsync();

        return new AccountDto
        {Id = account.Id, 
        Name = account.Name,
        Type = account.Type,
        Balance = 0
        };
    }

    public async Task<AccountsSummaryDto> GetSummaryAsync(int userId)
        {
            var rows = await _db.Accounts
                .AsNoTracking()
                .Where(a => a.UserId == userId)
                .OrderBy(a => a.CreatedAt)
                .Select(a => new
                {
                    a.Id,
                    a.Name,
                    a.Type,
                    Amounts = a.Transactions
                        .Select(t => new { t.Kind, t.Amount })
                        .ToList()
                })
                .ToListAsync();

            var accounts = rows.Select(a => new AccountDto
            {
                Id = a.Id,
                Name = a.Name,
                Type = a.Type,
                Balance = a.Amounts.Sum(t => t.Kind == "Income" ? t.Amount : -t.Amount)
            }).ToList();

            return new AccountsSummaryDto
            {
                TotalBalance = accounts.Sum(a => a.Balance),
                Accounts = accounts
            };
        }

    public async Task<AccountsSummaryDto> GetallAsync()
    {
        var rows = await _db.Accounts
            .AsNoTracking()
            .OrderBy(a => a.CreatedAt)
            .Select(a => new
            {
                a.Id,
                a.UserId,
                a.Name,
                a.Type,
                Amounts = a.Transactions
                    .Select(t => new { t.Kind, t.Amount })
                    .ToList()
            })
            .ToListAsync();

        var accounts = rows.Select(a => new AccountDto
        {
            Id = a.Id,
            Name = a.Name,
            Type = a.Type,
            Balance = a.Amounts.Sum(t => t.Kind == "Income" ? t.Amount : -t.Amount)
        }).ToList();

        return new AccountsSummaryDto
        {
            TotalBalance = accounts.Sum(a => a.Balance),
            Accounts = accounts
        };
    }

    public async Task<bool> DeleteAsync(int userId, int accountId)
    {
        var account = await _db.Accounts
            .FirstOrDefaultAsync(a => a.Id == accountId && a.UserId == userId);
        if (account is null) return false;

        _db.Accounts.Remove(account);
        await _db.SaveChangesAsync();
        return true;
    }
}
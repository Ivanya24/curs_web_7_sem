using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Money_API.DTOs;
using Money_API.Services;
using System.Security.Claims;

namespace Money_API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TransactionsController : ControllerBase
{
    private readonly TransactionService _transactions;
    public TransactionsController(TransactionService transactions) => _transactions = transactions;

    private int UserId => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    private bool IsAdmin => User.FindFirstValue(ClaimTypes.Role) == "Admin";


    // POST /api/transactions
    [HttpPost]
    public async Task<ActionResult<TransactionDto>> Create(CreateTransactionDto dto)
    {
        var result = await _transactions.CreateAsync(UserId, dto);
        if (result is null) return BadRequest("Неверный счёт, сумма или тип операции");
        return Ok(result);
    }


    // GET /api/transactions?from=...&to=...
    [HttpGet]
    public async Task<ActionResult<List<TransactionDto>>> GetAll(
        [FromQuery] DateTime? from, [FromQuery] DateTime? to)
        => Ok(await _transactions.GetAllAsync(UserId, from, to));



    // GET /api/transactions/summary?from=...&to=...
    [HttpGet("summary")]
    public async Task<ActionResult<SummaryDto>> Summary(
        [FromQuery] DateTime? from, [FromQuery] DateTime? to)
        => Ok(await _transactions.GetSummaryAsync(UserId, from, to));




    // GET /api/transactions/account/{accountId}?from=...&to=...
    // Доступно ТОЛЬКО для роли Admin
    [HttpGet("account/{accountId:int}")]
    public async Task<ActionResult<List<TransactionDto>>> GetByAccount(
        int accountId, 
        [FromQuery] DateTime? from, 
        [FromQuery] DateTime? to)
    {
        // 1. Извлекаем ID текущего пользователя из JWT-токена
        // ВАЖНО: Убедитесь, что при генерации токена вы используете именно "UserId" или ClaimTypes.NameIdentifier
        var userIdClaim = User.FindFirst("UserId")?.Value ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        
        if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int currentUserId))
        {
            return Unauthorized(new { message = "Не удалось определить пользователя" });
        }

        // 2. Проверяем, является ли пользователь администратором
        bool isAdmin = User.IsInRole("Admin");

        // 3. Передаем currentUserId и isAdmin в сервис для проверки прав
        var result = await _transactions.GetByAccountIdAsync(accountId, currentUserId, isAdmin, from, to);

        // 4. Если сервис вернул null, значит счета не существует или нет прав доступа
        if (result == null)
        {
            // Возвращаем 404 для защиты от перебора ID (ID Enumeration)
            return NotFound(new { message = "Счет не найден или доступ запрещен" });
        }

        return Ok(result);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<TransactionDto>> GetById(int id)
    {
        var result = await _transactions.GetByTransactionsIdAsync(UserId, id, IsAdmin);
        if (result is null) return NotFound();
        return Ok(result);
    }

    // DELETE /api/transactions/{id}
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var ok = await _transactions.DeleteAsync(UserId, id);
        return ok ? NoContent() : NotFound();
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<TransactionDto>> Update(int id, CreateTransactionDto dto)
    {
        var result = await _transactions.UpdateAsync(UserId, id, IsAdmin, dto);
        if (result is null) return NotFound();   // или BadRequest
        return Ok(result);
    }


    
}


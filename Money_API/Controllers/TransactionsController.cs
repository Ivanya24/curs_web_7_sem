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
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<List<TransactionDto>>> GetByAccount(
        int accountId, 
        [FromQuery] DateTime? from, 
        [FromQuery] DateTime? to)
    {
        var result = await _transactions.GetByAccountIdAsync(accountId, from, to);
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
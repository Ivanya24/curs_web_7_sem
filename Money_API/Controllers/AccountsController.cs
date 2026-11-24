using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Money_API.DTOs;
using Money_API.Services;
using System.Security.Claims;

namespace Money_API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AccountsController : ControllerBase
{
    private readonly AccountService _accounts;
    public AccountsController(AccountService accounts) => _accounts = accounts;

    private int UserId => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    // POST /api/accounts — создать счёт (Сбер/ВТБ/Наличные)
    [HttpPost]
    public async Task<ActionResult<AccountDto>> Create(CreateAccountDto dto)
    {
        var result = await _accounts.CreateAsync(UserId, dto);
        if (result is null) return Conflict("Счёт с таким именем уже есть");
        return Ok(result);
    }

    // GET /api/accounts — список счетов + сумма всех (главный экран)
    [HttpGet("my")]
    public async Task<ActionResult<AccountsSummaryDto>> GetMy()
        => Ok(await _accounts.GetSummaryAsync(UserId));


    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<AccountsSummaryDto>> GetAll()
        => Ok(await _accounts.GetallAsync());

    // DELETE /api/accounts/{id}
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var ok = await _accounts.DeleteAsync(UserId, id);
        return ok ? NoContent() : NotFound();
    }
}
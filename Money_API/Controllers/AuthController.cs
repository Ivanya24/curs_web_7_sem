using Microsoft.AspNetCore.Mvc;
using Money_API.DTOs;
using Money_API.Services;

namespace Money_API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AuthService _auth;
    public AuthController(AuthService auth) => _auth = auth;

    [HttpPost("register")]
    public async Task<ActionResult<AuthResponseDto>> Register(RegisterDto dto)
    {
        var result = await _auth.RegisterAsync(dto);
        if (result is null) return Conflict("Email или Username уже заняты");
        return Ok(result);
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponseDto>> Login(LoginDto dto)
    {
        var result = await _auth.LoginAsync(dto);
        if (result is null) return Unauthorized("Неверный email или пароль");
        return Ok(result);
    }
}
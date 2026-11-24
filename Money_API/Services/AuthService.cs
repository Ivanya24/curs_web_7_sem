using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Money_API.Data;
using Money_API.DTOs;
using Money_API.Models;

namespace Money_API.Services;

public class AuthService
{
    private readonly AppDbContext _db;
    private readonly IConfiguration _config;

    public AuthService(AppDbContext db, IConfiguration config)
    {
        _db = db;
        _config = config;
    }

    // Готово: регистрация
    public async Task<AuthResponseDto?> RegisterAsync(RegisterDto dto)
    {
        if (await _db.Users.AnyAsync(u => u.Email == dto.Email)) return null;
        if (await _db.Users.AnyAsync(u => u.Username == dto.Username)) return null;

        var user = new User
        {
            Email = dto.Email,
            Username = dto.Username,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            Role = "User",
            CreatedAt = DateTime.UtcNow
        };
        _db.Users.Add(user);
        await _db.SaveChangesAsync();

        return new AuthResponseDto
        {
            Token = GenerateToken(user),
            UserId = user.Id,
            Username = user.Username,
            Role = user.Role
        };
    }

    // ================================================================
    // TODO: реализовать самостоятельно.
    //
    // Шаги:
    // 1. Найти пользователя по Email:
    //    var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);
    // 2. Если user == null — вернуть null (неверный email).
    // 3. Проверить пароль:
    //    if (!BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash)) return null;
    // 4. Вернуть AuthResponseDto с GenerateToken(user), UserId, Username, Role.
    //
    // Контроллер на null ответит 401 Unauthorized.
    // ================================================================

















    // ================================================================
// TODO: реализовать самостоятельно.
//
// ЗАДАЧА: аутентифицировать пользователя по email и паролю.
// Вернуть AuthResponseDto с токеном, либо null (неверные данные).
//
// ПРАВИЛА (нарушение любого → вернуть null):
// 1. Пользователь с таким email должен существовать.
//    Если нет — null (контроллер ответит 401 Unauthorized).
//    ВАЖНО: не говорим клиенту «email не найден» или «пароль неверный» —
//    это подсказка злоумышленнику, какой из двух параметров неверен.
//    Всегда просто null → 401.
// 2. Пароль должен совпадать с хешем в БД.
//    Пароль в БД хранится как ХЕШ (BCrypt), поэтому сравнивать
//    надо не строки напрямую, а через функцию проверки BCrypt.
//    Если не совпал — null.
//
// ЧТО ДОЛЖНО ПРОИЗОЙТИ, ЕСЛИ ВСЁ ВЕРНО:
// 3. Сгенерировать JWT-токен для пользователя.
//    В этом же классе уже есть приватный метод GenerateToken(user) —
//    используй его. Он кладёт в токен Id, Username, Role.
// 4. Вернуть AuthResponseDto:
//    - Token    = результат GenerateToken(user);
//    - UserId   = user.Id;
//    - Username = user.Username;
//    - Role     = user.Role.
//
// ПОДСКАЗКИ ПО API (без готового кода):
// - поиск пользователя: ищи в _db.Users по Email (FirstOrDefaultAsync);
// - проверка пароля: BCrypt.Net.BCrypt.Verify(введённыйПароль, хешИзБД);
// - генерация токена: GenerateToken(user) — уже есть в этом классе;
// - возврат: new AuthResponseDto { ... }.
//
// ПОСМОТРИ, КАК СДЕЛАНО В RegisterAsync В ЭТОМ ЖЕ ФАЙЛЕ:
// там уже есть и BCrypt.HashPassword, и GenerateToken, и сборка
// AuthResponseDto. Логика логина — зеркальная: не создаём, а ищем
// и проверяем.
// ================================================================
    public async Task<AuthResponseDto?> LoginAsync(LoginDto dto)
    {
        // throw new NotImplementedException(
        //     "Реализуй логин: найди юзера по Email, проверь BCrypt.Verify, верни AuthResponseDto.");
        var user =await _db.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);

        if (user is null) return null;

        if (!BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash)) return null;

        return new AuthResponseDto
        {
            Token = GenerateToken(user),
            UserId = user.Id,
            Username = user.Username,
            Role = user.Role
        };
        

    }

    // Готово: генерация JWT
    private string GenerateToken(User user)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Name, user.Username),
            new Claim(ClaimTypes.Role, user.Role)
        };

        var token = new JwtSecurityToken(
            issuer: _config["Jwt:Issuer"],
            audience: _config["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddDays(7),
            signingCredentials: creds);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
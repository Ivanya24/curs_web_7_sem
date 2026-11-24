namespace Money_API.Models;

public class User
{
    public int Id { get; set; }
    public string Email { get; set; } = "";
    public string Username { get; set; } = "";
    public string PasswordHash { get; set; } = "";
    public string Role { get; set; } = "User";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // один пользователь — много счетов
    public ICollection<Account> Accounts { get; set; } = new List<Account>();
}
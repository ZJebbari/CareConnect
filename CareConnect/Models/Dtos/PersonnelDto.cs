using Microsoft.EntityFrameworkCore;

[Keyless]
public class PersonnelDto
{
    public int UserId { get; set; }

    public string FullName { get; set; }

    public string Email { get; set; }

    public string? Password { get; set; }

    public string Phone { get; set; }

    public int RoleID { get; set; } = 4;
}

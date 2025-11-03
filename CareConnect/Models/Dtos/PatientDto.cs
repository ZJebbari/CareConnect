using System.ComponentModel.DataAnnotations;
using Microsoft.EntityFrameworkCore;

[Keyless]
public class PatientDto
{
    public int PatientId { get; set; }

    public int UserId { get; set; }

    [Range(typeof(DateTime), "1753-01-01", "9999-12-31", ErrorMessage = "Date must be between 1753 and 9999.")]
    public DateTime? DateOfBirth { get; set; }

    [Required]
    public string Address { get; set; }

    [Required]
    public string Gender { get; set; }

    [Required]
    public string FullName { get; set; }

    [Required]
    [EmailAddress]
    public string Email { get; set; }

    [Required]
    public string Phone { get; set; }

    [Required]
    public string Password { get; set; }

    public int RoleID { get; set; } = 1;

    public DateTime? CreatedAt { get; set; }
}

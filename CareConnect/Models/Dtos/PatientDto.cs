using System.ComponentModel.DataAnnotations;
using Microsoft.EntityFrameworkCore;

[Keyless]
public class PatientDto
{

    public int UserId { get; set; }

    [Range(typeof(DateTime), "1753-01-01", "9999-12-31", ErrorMessage = "Date must be between 1753 and 9999.")]
    public DateTime? DateOfBirth { get; set; }

    public string Address { get; set; }

    public string Gender { get; set; }

    public string FullName { get; set; }


    public string Email { get; set; }

    public string Phone { get; set; }
}

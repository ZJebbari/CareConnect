using System.ComponentModel.DataAnnotations;
using Microsoft.EntityFrameworkCore;

[Keyless]
public class PhysicianDto
{
    public int UserId { get; set; }

    public string FullName { get; set; }

    public string Specialty { get; set; }

    public string Email { get; set; }

    public string Phone { get; set; }

    public bool Availability { get; set; }

    public string Bio { get; set; }
}
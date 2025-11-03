using System;
using System.Collections.Generic;

namespace CareConnect.Models.Dtos;

public partial class User
{
    public int UserId { get; set; }

    public string FullName { get; set; } = null!;

    public string Email { get; set; } = null!;

    public string Password { get; set; } = null!;

    public string Phone { get; set; } = null!;

    public int RoleId { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual ICollection<PatientDto> Patients { get; set; } = new List<PatientDto>();

    public virtual ICollection<Personnel> Personnel { get; set; } = new List<Personnel>();

    public virtual ICollection<Physician> Physicians { get; set; } = new List<Physician>();

    public virtual Role Role { get; set; } = null!;
}

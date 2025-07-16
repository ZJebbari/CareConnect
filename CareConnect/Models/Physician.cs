using System;
using System.Collections.Generic;

namespace CareConnect.Models;

public partial class Physician
{
    public int PhysicianId { get; set; }

    public bool? Availability { get; set; }

    public string? Bio { get; set; }

    public int? UserId { get; set; }

    public int? SpecialtyId { get; set; }

    public virtual ICollection<Appointment> Appointments { get; set; } = new List<Appointment>();

    public virtual Specialty? Specialty { get; set; }

    public virtual User? User { get; set; }
}

using System;
using System.Collections.Generic;

namespace CareConnect.Models;

public partial class Specialty
{
    public int SpecialtyId { get; set; }

    public string? Specialty1 { get; set; }

    public virtual ICollection<Physician> Physicians { get; set; } = new List<Physician>();
}

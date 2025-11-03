using System;
using System.Collections.Generic;

namespace CareConnect.Models.Dtos;

public partial class AppointmentType
{
    public int TypeId { get; set; }

    public string TypeName { get; set; } = null!;

    public virtual ICollection<Appointment> Appointments { get; set; } = new List<Appointment>();
}

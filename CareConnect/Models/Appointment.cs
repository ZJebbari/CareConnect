using System;
using System.Collections.Generic;

namespace CareConnect.Models;

public partial class Appointment
{
    public int AppointmentId { get; set; }

    public int? PatientId { get; set; }

    public int? PhysicianId { get; set; }

    public int? TypeId { get; set; }

    public bool? AppointmentStatus { get; set; }

    public DateTime? AppointmentTime { get; set; }

    public DateTime? CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public virtual PatientDto? Patient { get; set; }

    public virtual Physician? Physician { get; set; }

    public virtual AppointmentType? Type { get; set; }
}

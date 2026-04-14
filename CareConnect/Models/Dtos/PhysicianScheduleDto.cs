using Microsoft.EntityFrameworkCore;

namespace CareConnect.Models.Dtos;

[Keyless]
public class PhysicianScheduleDto
{
    public int PhysicianScheduleId { get; set; }

    public int PhysicianId { get; set; }

    public int DayOfWeek { get; set; }

    public TimeSpan StartTime { get; set; }

    public TimeSpan EndTime { get; set; }

    public short SlotDurationMinutes { get; set; }

    public DateTime EffectiveStartDate { get; set; }

    public DateTime? EffectiveEndDate { get; set; }

    public bool IsActive { get; set; } = true;
}
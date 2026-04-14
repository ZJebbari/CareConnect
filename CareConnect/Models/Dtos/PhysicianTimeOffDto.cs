using Microsoft.EntityFrameworkCore;

namespace CareConnect.Models.Dtos;

[Keyless]
public class PhysicianTimeOffDto
{
    public int PhysicianTimeOffId { get; set; }

    public int PhysicianId { get; set; }

    public DateTime StartDateTime { get; set; }

    public DateTime EndDateTime { get; set; }

    public bool IsAllDay { get; set; }

    public string? Reason { get; set; }

    public string? Notes { get; set; }
}
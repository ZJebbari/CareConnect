namespace CareConnect.Models.Database.results
{
    public class PhysicianTimeOffResult
    {
        public int PhysicianTimeOffId { get; set; }
        public int PhysicianId { get; set; }
        public DateTime StartDateTime { get; set; }
        public DateTime EndDateTime { get; set; }
        public bool IsAllDay { get; set; }
        public string? Reason { get; set; }
        public string? Notes { get; set; }
        public DateTime? CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}
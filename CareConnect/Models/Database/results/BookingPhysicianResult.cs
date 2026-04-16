namespace CareConnect.Models.Database.results
{
    public class BookingPhysicianResult
    {
        public int PhysicianId { get; set; }
        public string FullName { get; set; } = null!;
        public int SpecialtyId { get; set; }
        public string SpecialtyName { get; set; } = null!;
        public string Bio { get; set; } = string.Empty;
    }
}
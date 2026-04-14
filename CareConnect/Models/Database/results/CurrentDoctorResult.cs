namespace CareConnect.Models.Database.results
{
    public class CurrentDoctorResult
    {
        public int PhysicianId { get; set; }

        public int UserId { get; set; }

        public bool? Availability { get; set; }

        public int? SpecialtyId { get; set; }

        public string? Bio { get; set; }
    }
}
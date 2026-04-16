namespace CareConnect.Models.Database.results
{
    public class PatientAppointmentResult
    {
        public int AppointmentId { get; set; }
        public int PatientId { get; set; }
        public int PhysicianId { get; set; }
        public string PhysicianName { get; set; } = null!;
        public int? SpecialtyId { get; set; }
        public string? SpecialtyName { get; set; }
        public int TypeId { get; set; }
        public string AppointmentTypeName { get; set; } = null!;
        public int AppointmentStatus { get; set; }
        public DateTime AppointmentTime { get; set; }
        public DateTime? CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}
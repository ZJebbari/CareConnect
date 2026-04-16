namespace CareConnect.Models.Database.results
{
    public class DoctorDayAppointmentResult
    {
        public int AppointmentId { get; set; }
        public string PatientName { get; set; } = null!;
        public DateTime AppointmentTime { get; set; }
        public string AppointmentTypeName { get; set; } = null!;
        public string? SpecialtyName { get; set; }
    }
}

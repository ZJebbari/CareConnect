namespace CareConnect.Models.Database.results
{
    public class PatientBlockingWindowResult
    {
        public int AppointmentID { get; set; }
        public int PatientID { get; set; }
        public int PhysicianID { get; set; }
        public int TypeID { get; set; }
        public int AppointmentStatus { get; set; }
        public DateTime ScheduledStartUtc { get; set; }
        public DateTime ScheduledEndUtcExclusive { get; set; }
        public DateTime BlockWindowStartUtc { get; set; }
        public DateTime BlockWindowEndUtcExclusive { get; set; }
    }
}
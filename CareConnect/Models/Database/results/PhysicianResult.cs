namespace CareConnect.Models.Database.results
{
    public class PhysicianResult
    {
        public int PhysicianId { get; set; }
        public int UserId { get; set; }
        public bool Availability { get; set; }
        public string Bio { get; set; }
        public string Specialty { get; set; }
        public string FullName { get; set; }
        public string Email { get; set; }
        public string Phone { get; set; }
        public int RoleID { get; set; } = 1;
        public DateTime? CreatedAt { get; set; }
    }
}

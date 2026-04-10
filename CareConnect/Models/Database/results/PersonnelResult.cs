namespace CareConnect.Models.Database.results
{
    public class PersonnelResult
    {
        public int PersonnelId { get; set; }
        public int UserId { get; set; }
        public string FullName { get; set; }
        public string Email { get; set; }
        public string Phone { get; set; }
        public int RoleID { get; set; }
        public DateTime? CreatedAt { get; set; }
    }
}

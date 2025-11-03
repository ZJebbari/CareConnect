using System.ComponentModel.DataAnnotations;

namespace CareConnect.Models.Database.results
{
    public class PatientResult
    {
        public int PatientId { get; set; }
        public int UserId { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public string Address { get; set; }
        public string Gender { get; set; }
        public string FullName { get; set; }
        public string Email { get; set; }
        public string Phone { get; set; }
        public string Password { get; set; }
        public int RoleID { get; set; } = 1;
        public DateTime? CreatedAt { get; set; }
    }
}

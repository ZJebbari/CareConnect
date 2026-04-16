namespace CareConnect.Models.Dtos
{
    public class PatientRegistrationDto
    {
        public string FullName { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string Phone { get; set; } = null!;
        public DateTime? DateOfBirth { get; set; }
        public string Address { get; set; } = null!;
        public string Gender { get; set; } = null!;
        public string Password { get; set; } = null!;
    }
}